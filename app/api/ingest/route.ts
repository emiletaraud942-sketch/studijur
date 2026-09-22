import { NextResponse } from "next/server";
import { callModel, extractJson, getAnthropic, currentModel } from "@/lib/anthropic";
import { fallbackCourse, splitSections } from "@/lib/ingest-fallback";
import { checkQuotaBoth, fingerprint, lookupShared, releaseQuotaAll, sharedCourseId, storeShared } from "@/lib/shared-courses";
import { AUTH_REQUIRED_MESSAGE, authRequired, requireUser } from "@/lib/auth-server";
import { isOwner } from "@/lib/owner";
import { CORPUS } from "@/lib/corpus";
import { getAdmin } from "@/lib/supabase-admin";
import { envoyerEmail } from "@/lib/brevo";
import type { Course, Lesson } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const DESTINATAIRE = process.env.FEEDBACK_NOTIFY_EMAIL ?? "emiletaraud942@gmail.com";

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Un cours déposé sur une matière déjà présente dans le corpus ne sert qu'à
// l'élève qui l'a importé (comportement inchangé). Une matière absente est en
// revanche un trou du corpus qu'Émile n'a pas encore couvert : le cours
// devient un candidat à l'ajout, jamais appliqué automatiquement — juste
// signalé, pour qu'il le relise et l'intègre lui-même s'il le juge fiable.
function matiereConnue(title: string): boolean {
  const n = normalise(title);
  if (!n) return false;
  return CORPUS.some((c) => {
    const t = normalise(c.title);
    const s = normalise(c.short);
    return n.includes(t) || t.includes(n) || n.includes(s) || s.includes(n);
  });
}

async function signalerMatiereManquante(course: Course): Promise<void> {
  const sb = getAdmin();
  if (!sb) return;
  try {
    await sb.from("course_submissions").insert({
      fingerprint: course.id.replace(/^cours-/, ""),
      title: course.title,
      course,
    });
  } catch {
    /* best-effort : un cours déposé reste utilisable même si le signalement échoue */
  }
  void envoyerEmail({
    to: DESTINATAIRE,
    subject: `Cours déposé sur une matière absente du corpus : ${course.title}`,
    html: `
      <p>Un élève a déposé un cours sur <strong>${course.title}</strong>, une matière qui ne semble pas encore dans le corpus StudiJur.</p>
      <p>${course.lessons.length} leçon${course.lessons.length > 1 ? "s" : ""} générée${course.lessons.length > 1 ? "s" : ""}, enregistrée${course.lessons.length > 1 ? "s" : ""} pour relecture.</p>
      <p>Rien n'a été ajouté au corpus partagé automatiquement — relis le contenu avant de l'intégrer.</p>
    `,
  });
}

const MAX_CHARS = 200_000;
// Alignée sur le quota quotidien (3) : un seul dépôt de cours peut au pire
// consommer toutes les générations du jour, jamais plus — voir shared-courses.ts.
const MAX_LESSONS = 3;
const SECTION_CHARS = 6000;
const SECTION_MAX_TOKENS = 1400;

const SYSTEM = `Tu es agrégé de droit et tu fabriques des micro-leçons pour des étudiants français de première année de licence de droit.

On te donne un extrait du cours d'un étudiant. Tu produis UNE leçon de révision de 5 minutes, strictement fondée sur cet extrait : tu n'inventes aucune règle, aucune date, aucun arrêt qui n'y figure pas. Si l'extrait est trop pauvre sur un point, reste général plutôt que d'inventer.

Réponds UNIQUEMENT par un objet JSON valide, sans texte autour, à ce format exact :
{
  "title": "titre court de la leçon, 3 à 9 mots",
  "teaser": "une phrase d'accroche de 10 à 20 mots",
  "brief": ["3 à 5 paragraphes de cours, 60 à 110 mots chacun, ton clair et direct, **gras** autorisé pour les termes clés"],
  "keyPoints": ["3 à 4 points à retenir, une ligne chacun"],
  "definitions": [{"term": "le terme", "text": "la définition, 20 à 45 mots", "source": "article ou arrêt SI ET SEULEMENT SI il figure dans l'extrait, sinon omets la clé"}],
  "exam": {
    "kind": "dissertation" | "question de cours" | "cas pratique",
    "question": "une question type examen portant sur cet extrait",
    "concise": "réponse rédigée de 100 à 180 mots, qui répond vraiment à la question",
    "plan": [
      {"title": "I. Titre affirmatif, jamais interrogatif", "children": [{"title": "A. Sous-titre", "points": ["3 idées"]}, {"title": "B. Sous-titre", "points": ["3 idées"]}]},
      {"title": "II. Titre affirmatif", "children": [{"title": "A. Sous-titre", "points": ["3 idées"]}, {"title": "B. Sous-titre", "points": ["3 idées"]}]}
    ],
    "pitfalls": ["1 à 2 pièges classiques sur cette notion"]
  },
  "quiz": [{"q": "question", "choices": ["4 propositions plausibles"], "answer": 0, "why": "explication d'une à deux phrases"}]
}

Contraintes impératives : exactement 5 définitions, exactement 5 questions de quiz, chaque quiz a 4 propositions, "answer" est l'index de la bonne réponse (0 à 3), les distracteurs sont plausibles et non absurdes. Tout est rédigé en français.`;

type Draft = Omit<Lesson, "id" | "courseId" | "order" | "minutes" | "custom">;

function sane(d: Draft): boolean {
  return Boolean(
    d && typeof d.title === "string" && Array.isArray(d.brief) && d.brief.length >= 2 &&
    Array.isArray(d.definitions) && d.definitions.length >= 3 &&
    Array.isArray(d.quiz) && d.quiz.length >= 3 &&
    d.exam && Array.isArray(d.exam.plan) && d.exam.plan.length >= 1,
  );
}

function tidy(d: Draft): Draft {
  const quiz = d.quiz
    .filter((q) => q && Array.isArray(q.choices) && q.choices.length >= 2)
    .map((q) => ({ ...q, answer: Math.max(0, Math.min(q.answer ?? 0, q.choices.length - 1)) }))
    .slice(0, 5);
  return {
    ...d,
    keyPoints: (d.keyPoints ?? []).slice(0, 4),
    definitions: d.definitions.slice(0, 5),
    quiz,
  };
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "inconnu";
}

export async function POST(req: Request) {
  let body: { title?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const title = (body.title ?? "").trim() || "Cours importé";
  const text = (body.text ?? "").trim();

  if (text.length < 500) {
    return NextResponse.json(
      { error: "Le cours est trop court : il faut au moins 500 caractères pour en tirer des leçons." },
      { status: 400 },
    );
  }

  const ip = clientIp(req);
  let quotaKeys = [ip];
  let unlimited = false;
  if (authRequired()) {
    const user = await requireUser(req);
    if (!user) return NextResponse.json({ error: AUTH_REQUIRED_MESSAGE }, { status: 401 });
    quotaKeys = [`user:${user.id}`, ip];
    unlimited = isOwner(user.email);
  }

  const clipped = text.slice(0, MAX_CHARS);
  const fp = fingerprint(clipped);
  const courseId = sharedCourseId(fp);

  // 1. Quelqu'un a-t-il déjà déposé ce document ? La génération est alors gratuite.
  const shared = await lookupShared(fp);
  if (shared) {
    return NextResponse.json({
      course: { ...shared.course, title },
      engine: "partagé",
      origin: shared.origin,
      reused: true,
    });
  }

  const client = getAnthropic();

  if (!client) {
    const course = fallbackCourse(title, clipped, courseId);
    return NextResponse.json({
      course, engine: "local",
      warning: "Généré sans IA : la clé API Claude n'est pas configurée.",
    });
  }

  const sections = splitSections(clipped).slice(0, MAX_LESSONS);
  if (!sections.length) {
    return NextResponse.json({ error: "Impossible de découper ce cours en parties exploitables." }, { status: 400 });
  }

  // Une section = un appel modèle : le quota se consomme sur ce nombre réel
  // d'appels, pas sur la requête HTTP (voir checkQuotaBoth).
  if (!unlimited) {
    const gate = await checkQuotaBoth(quotaKeys, sections.length);
    if (!gate.ok) {
      return NextResponse.json(
        {
          error: `Ce cours se découpe en ${sections.length} parties, mais il ne te reste que ${gate.remaining} génération${gate.remaining > 1 ? "s" : ""} IA aujourd'hui. Réessaie demain, ou dépose un extrait plus court.`,
        },
        { status: 429 },
      );
    }
  }

  const results: (Draft | null)[] = new Array(sections.length).fill(null);
  const queue = sections.map((s, i) => ({ s, i }));
  const CONCURRENCY = 3;

  async function worker() {
    for (;;) {
      const job = queue.shift();
      if (!job) return;
      const { s, i } = job;
      try {
        const raw = await callModel(client!, {
          system: SYSTEM,
          cacheSystem: true,
          maxTokens: SECTION_MAX_TOKENS,
          user: `Matière : ${title}\nPartie du cours : ${s.title}\n\n--- EXTRAIT DU COURS ---\n${s.body.slice(0, SECTION_CHARS)}\n--- FIN DE L'EXTRAIT ---\n\nProduis la leçon JSON.`,
        });
        const draft = extractJson<Draft>(raw);
        if (sane(draft)) results[i] = tidy(draft);
      } catch {
        results[i] = null; // section abandonnée : on garde les autres
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const lessons: Lesson[] = [];
  results.forEach((d) => {
    if (!d) return;
    lessons.push({
      ...d,
      id: `${courseId}-${String(lessons.length + 1).padStart(2, "0")}`,
      courseId,
      order: lessons.length + 1,
      minutes: 5,
      custom: true,
    });
  });

  if (!lessons.length) {
    if (!unlimited) await releaseQuotaAll(quotaKeys, sections.length);
    const course = fallbackCourse(title, clipped, courseId);
    return NextResponse.json({
      course, engine: "local",
      warning: "La génération IA a échoué sur toutes les parties : voici une version produite par l'analyseur local.",
    });
  }

  const course: Course = {
    id: courseId,
    title,
    short: title.slice(0, 22),
    subtitle: `Ton cours — ${lessons.length} leçon${lessons.length > 1 ? "s" : ""} générée${lessons.length > 1 ? "s" : ""}`,
    hue: "rust",
    lessons,
    custom: true,
  };

  // Le résultat profite au prochain élève qui déposera le même document.
  await storeShared(fp, course);

  // Une matière absente du corpus est un trou qu'Émile n'a pas encore
  // couvert : on le signale (base + email), sans jamais rien ajouter tout seul.
  if (!matiereConnue(title)) void signalerMatiereManquante(course);

  return NextResponse.json({
    course,
    engine: "claude",
    model: currentModel(),
    skipped: results.filter((r) => !r).length,
  });
}

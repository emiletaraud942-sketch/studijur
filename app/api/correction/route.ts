import { NextResponse } from "next/server";
import { callModel, extractJson, getAnthropic } from "@/lib/anthropic";
import { checkQuota, releaseQuota } from "@/lib/shared-courses";
import type { EssayFeedback } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `Tu es chargé de TD en droit dans une université française et tu corriges la copie d'un étudiant de première année.

On te donne la question posée (dissertation, question de cours ou cas pratique) et le brouillon rédigé par l'étudiant. Tu notes sur 20, avec la bienveillance et l'exigence d'un chargé de TD : encourageant sur la forme, rigoureux sur le fond. Tu ne réécris jamais la copie à sa place.

Réponds UNIQUEMENT par un objet JSON valide, sans texte autour, à ce format exact :
{
  "note": nombre entre 0 et 20 (peut être décimal, ex 12.5),
  "pointsForts": ["2 à 3 points positifs précis, en s'appuyant sur ce que l'étudiant a réellement écrit"],
  "pointsFaibles": ["2 à 4 lacunes précises : oubli d'une notion, erreur de qualification, plan bancal, absence d'exemple, etc."],
  "conseils": ["2 à 3 conseils concrets et actionnables pour la prochaine copie"],
  "commentaire": "un paragraphe de 40 à 80 mots de synthèse, ton direct et constructif, jamais condescendant"
}

Si le brouillon est trop court ou hors sujet pour être noté sérieusement, mets une note basse et dis-le clairement dans le commentaire, sans inventer de contenu qui n'y figure pas.`;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "inconnu";
}

function sane(f: unknown): f is EssayFeedback {
  const d = f as EssayFeedback;
  return Boolean(
    d && typeof d.note === "number" &&
    Array.isArray(d.pointsForts) && Array.isArray(d.pointsFaibles) && Array.isArray(d.conseils) &&
    typeof d.commentaire === "string",
  );
}

export async function POST(req: Request) {
  let body: { question?: string; kind?: string; brouillon?: string; lessonTitle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  const brouillon = (body.brouillon ?? "").trim();
  const kind = (body.kind ?? "dissertation").trim();
  const lessonTitle = (body.lessonTitle ?? "").trim();

  if (brouillon.split(/\s+/).filter(Boolean).length < 30) {
    return NextResponse.json(
      { error: "Écris au moins une trentaine de mots avant de demander une correction." },
      { status: 400 },
    );
  }
  if (!question) {
    return NextResponse.json({ error: "Question manquante." }, { status: 400 });
  }

  const client = getAnthropic();
  if (!client) {
    return NextResponse.json(
      { error: "La correction automatique n'est pas encore configurée (clé API Claude manquante)." },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  const gate = await checkQuota(ip);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Tu as atteint la limite de corrections pour aujourd'hui. Réessaie demain." },
      { status: 429 },
    );
  }

  try {
    const raw = await callModel(client, {
      system: SYSTEM,
      cacheSystem: true,
      maxTokens: 1400,
      user: `Matière / leçon : ${lessonTitle || "non précisée"}\nType d'exercice : ${kind}\nQuestion posée : ${question}\n\n--- BROUILLON DE L'ÉTUDIANT ---\n${brouillon.slice(0, 6000)}\n--- FIN DU BROUILLON ---\n\nProduis la correction JSON.`,
    });
    const feedback = extractJson<EssayFeedback>(raw);
    if (!sane(feedback)) throw new Error("réponse mal formée");
    feedback.note = Math.max(0, Math.min(20, feedback.note));
    feedback.bareme = 20;
    return NextResponse.json({ feedback });
  } catch {
    await releaseQuota(ip);
    return NextResponse.json({ error: "La correction a échoué. Réessaie dans un instant." }, { status: 502 });
  }
}

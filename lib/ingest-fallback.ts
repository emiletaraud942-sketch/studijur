import type { Course, Lesson } from "./types";

const STOP = new Set(["dans", "pour", "avec", "cette", "sont", "être", "leur", "elle", "plus", "tout", "comme", "mais", "donc", "cela", "ainsi", "entre", "aussi", "lorsque", "celui", "celle", "leurs", "doit", "peut", "lui-même"]);

export function splitSections(text: string): { title: string; body: string }[] {
  const lines = text.split(/\r?\n/);
  const sections: { title: string; body: string[] }[] = [];
  const headingRe = /^\s*(?:#{1,6}\s+|\*\*)?((?:Partie|Titre|Chapitre|Section|Paragraphe|§)\s*\d*\s*[:\-—.]?\s*.{0,90})$/i;

  for (const line of lines) {
    const m = line.trim().match(headingRe);
    if (m && line.trim().length < 120) {
      sections.push({ title: m[1].replace(/\*+/g, "").trim(), body: [] });
    } else if (sections.length) {
      sections[sections.length - 1].body.push(line);
    } else if (line.trim()) {
      sections.push({ title: "Introduction", body: [line] });
    }
  }
  const out = sections
    .map((s) => ({ title: s.title, body: s.body.join("\n").trim() }))
    .filter((s) => s.body.length > 240);

  if (out.length) return out.slice(0, 14);

  // Aucun titre détecté : on découpe en tranches régulières.
  const chunks: { title: string; body: string }[] = [];
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
  const per = Math.max(3, Math.ceil(paras.length / 8));
  for (let i = 0; i < paras.length; i += per) {
    chunks.push({ title: `Partie ${chunks.length + 1}`, body: paras.slice(i, i + per).join("\n\n") });
  }
  return chunks.slice(0, 14);
}

function sentences(body: string): string[] {
  return body
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-ZÀÉÈÊÎÔÛ])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 45 && s.length < 400);
}

// Repère « X est ... », « X désigne ... », « X : ... » — les tournures
// définitionnelles les plus fréquentes dans un cours de droit.
function harvestDefinitions(body: string): { term: string; text: string }[] {
  const found: { term: string; text: string }[] = [];
  const seen = new Set<string>();
  const patterns = [
    /([A-ZÀ-Ü][^.:\n]{3,60}?)\s+(?:est|sont|désigne|se définit comme|consiste en|correspond à)\s+([^.\n]{30,300})\./g,
    /^\s*[-–•*]?\s*\*{0,2}([A-ZÀ-Ü][^:\n*]{3,60})\*{0,2}\s*:\s*([^\n]{30,300})/gm,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) {
      const term = m[1].replace(/\*+/g, "").trim().replace(/^(le|la|les|l'|un|une|des)\s+/i, "");
      const key = term.toLowerCase();
      if (term.length < 4 || seen.has(key) || STOP.has(key)) continue;
      seen.add(key);
      found.push({ term: term.charAt(0).toUpperCase() + term.slice(1), text: m[2].trim() + "." });
      if (found.length >= 12) return found;
    }
  }
  return found;
}

function pad<T>(items: T[], n: number, make: (i: number) => T): T[] {
  const out = items.slice(0, n);
  while (out.length < n) out.push(make(out.length));
  return out;
}

export function fallbackCourse(title: string, text: string, courseId: string): Course {
  const sections = splitSections(text);
  const lessons: Lesson[] = sections.map((s, idx) => {
    const sents = sentences(s.body);
    const defs = harvestDefinitions(s.body);
    const brief = pad(
      sents.slice(0, 5).map((x) => x),
      3,
      (i) => `Cette partie du cours n'a pas pu être découpée automatiquement en paragraphes (bloc ${i + 1}). Ouvre ton polycopié pour la relire, puis reviens faire les définitions et le quiz.`,
    );
    const definitions = pad(defs, 5, (i) => ({
      term: `Notion ${i + 1} à compléter`,
      text: "L'analyseur local n'a pas trouvé de définition explicite dans ce passage. Ajoute la clé API Claude dans les réglages pour une extraction complète.",
    })).slice(0, 5);

    const quizPool = sents.filter((x) => x.length > 70).slice(0, 5);
    const quiz = pad(
      quizPool.map((sentence) => {
        const words = sentence.split(" ");
        const cut = Math.max(4, Math.floor(words.length * 0.6));
        return {
          q: `Complète : « ${words.slice(0, cut).join(" ")} … »`,
          choices: [words.slice(cut).join(" ").slice(0, 120) || "…", "Aucune de ces réponses", "L'inverse de la proposition précédente"],
          answer: 0,
          why: sentence,
        };
      }),
      5,
      () => ({
        q: "Ce passage n'a pas permis de générer une question automatiquement.",
        choices: ["Compris", "À relire", "À demander en TD"],
        answer: 0,
        why: "Ajoute la clé API Claude pour obtenir un vrai quiz sur ce passage.",
      }),
    ).slice(0, 5);

    return {
      id: `${courseId}-${String(idx + 1).padStart(2, "0")}`,
      courseId,
      order: idx + 1,
      title: s.title.slice(0, 90),
      teaser: (sents[0] ?? s.body).slice(0, 130),
      minutes: 5,
      brief,
      keyPoints: pad(sents.slice(0, 3), 3, () => "Point à compléter depuis ton cours."),
      definitions,
      exam: {
        kind: "question de cours",
        question: `Présentez et expliquez : ${s.title.slice(0, 80)}.`,
        concise: sents.slice(0, 3).join(" ") || "Reprends les idées principales de ce passage de ton cours.",
        plan: [
          { title: `I. ${s.title.slice(0, 60)} — les principes`, children: [{ title: "A. La notion", points: pad(sents.slice(0, 2), 2, () => "À compléter depuis ton cours.") }, { title: "B. Le régime", points: pad(sents.slice(2, 4), 2, () => "À compléter depuis ton cours.") }] },
          { title: "II. La portée et les limites", children: [{ title: "A. La portée", points: pad(sents.slice(4, 6), 2, () => "À compléter depuis ton cours.") }, { title: "B. Les limites", points: pad(sents.slice(6, 8), 2, () => "À compléter depuis ton cours.") }] },
        ],
        pitfalls: ["Correction générée sans IA : vérifie-la contre ton polycopié avant de t'en servir en révision."],
      },
      quiz,
      custom: true,
    };
  });

  return {
    id: courseId,
    title,
    short: title.slice(0, 22),
    subtitle: `Cours importé — ${lessons.length} leçons générées`,
    hue: "rust",
    lessons,
    custom: true,
  };
}

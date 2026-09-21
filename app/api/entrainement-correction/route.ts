import { NextResponse } from "next/server";
import { callModel, extractJson, getAnthropic } from "@/lib/anthropic";
import { checkQuota, releaseQuota } from "@/lib/shared-courses";
import type { EntrainementFeedback } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM = `Tu es chargé de TD en droit dans une université française. Un étudiant de première année s'entraîne sur une question courte (vocabulaire de procédure, jurisprudence, question de cours) avant une intero. On te donne la question, la réponse attendue (issue du cours) et ce que l'étudiant a écrit de mémoire.

Compare le fond, pas la forme : l'étudiant n'a pas à retrouver le même style ni les mêmes mots, seulement les idées justes. Sois bienveillant mais honnête, et ne réécris jamais sa réponse à sa place.

Réponds UNIQUEMENT par un objet JSON valide, sans texte autour, à ce format exact :
{
  "verdict": "correct" | "partiel" | "incorrect",
  "commentaire": "2 à 4 phrases : ce qui est juste, ce qui manque ou est faux par rapport à la réponse attendue, sans jamais recopier intégralement celle-ci"
}`;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "inconnu";
}

function sane(f: unknown): f is EntrainementFeedback {
  const d = f as EntrainementFeedback;
  return Boolean(
    d && typeof d.commentaire === "string" &&
    (d.verdict === "correct" || d.verdict === "partiel" || d.verdict === "incorrect"),
  );
}

export async function POST(req: Request) {
  let body: { question?: string; reponseAttendue?: string; reponseEtudiant?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  const reponseAttendue = (body.reponseAttendue ?? "").trim();
  const reponseEtudiant = (body.reponseEtudiant ?? "").trim();

  if (reponseEtudiant.split(/\s+/).filter(Boolean).length < 3) {
    return NextResponse.json({ error: "Écris quelques mots avant de demander une correction." }, { status: 400 });
  }
  if (!question || !reponseAttendue) {
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
      maxTokens: 500,
      user: `Question posée : ${question}\n\nRéponse attendue (cours) : ${reponseAttendue}\n\n--- RÉPONSE DE L'ÉTUDIANT ---\n${reponseEtudiant.slice(0, 2000)}\n--- FIN ---\n\nProduis le retour JSON.`,
    });
    const feedback = extractJson<EntrainementFeedback>(raw);
    if (!sane(feedback)) throw new Error("réponse mal formée");
    return NextResponse.json({ feedback });
  } catch {
    await releaseQuota(ip);
    return NextResponse.json({ error: "La correction a échoué. Réessaie dans un instant." }, { status: 502 });
  }
}

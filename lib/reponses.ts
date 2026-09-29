"use client";

import { getSupabase } from "./supabase";

export type SourceReponse = "actu" | "quiz" | "definition" | "exam" | "methodo";

// Journal d'audit écriture seule (public.reponses_utilisateur) : jamais relu
// par le client, jamais bloquant pour la séance en cours si l'écriture
// échoue (hors ligne, session expirée...) — voir lib/leaderboard.ts pour le
// même principe de synchronisation "best effort".
export async function logReponse(params: {
  notionId: string;
  questionId: string;
  source: SourceReponse;
  correcte: boolean;
  tempsReponseMs?: number;
}): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data } = await sb.auth.getUser();
    if (!data.user) return;
    await sb.from("reponses_utilisateur").insert({
      user_id: data.user.id,
      notion_id: params.notionId,
      question_id: params.questionId,
      source: params.source,
      correcte: params.correcte,
      temps_reponse_ms: params.tempsReponseMs ?? null,
    });
  } catch {
    /* best-effort : l'audit ne doit jamais bloquer la séance de l'élève */
  }
}

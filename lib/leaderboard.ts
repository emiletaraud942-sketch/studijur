"use client";

import { getSupabase } from "./supabase";
import type { LeaderboardRow, ProgressState } from "./types";
import { masteredCount } from "./srs";

// Compte les leçons terminées, toutes matières confondues : c'est la mesure
// la plus lisible pour comparer deux élèves qui n'ont pas suivi les mêmes cours.
function lessonsDoneCount(state: ProgressState): number {
  return Object.values(state.lessons).filter((l) => l.completedAt).length;
}

export type LeaderboardStatus = "non-connecte" | "non-configure" | "ok";

export function leaderboardAvailable(): LeaderboardStatus {
  const sb = getSupabase();
  if (!sb) return "non-configure";
  return "ok";
}

// Met à jour (ou retire) la ligne de l'élève dans le classement. Aucune donnée
// autre que le pseudonyme choisi, la faculté et des compteurs n'est envoyée.
export async function syncLeaderboardEntry(state: ProgressState): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Synchronisation non configurée." };
  const { data } = await sb.auth.getUser();
  if (!data.user) return { ok: false, error: "Connecte-toi pour activer le classement." };

  if (!state.profile.leaderboardOptIn) {
    await sb.from("leaderboard").delete().eq("user_id", data.user.id);
    return { ok: true };
  }

  const pseudonym = (state.profile.pseudonym ?? "").trim().slice(0, 24);
  if (!pseudonym) return { ok: false, error: "Choisis un pseudonyme pour apparaître dans le classement." };

  const { error } = await sb.from("leaderboard").upsert({
    user_id: data.user.id,
    pseudonym,
    university: state.profile.university?.trim().slice(0, 60) || null,
    streak: state.streak.current,
    mastered: masteredCount(state.cards),
    lessons_done: lessonsDoneCount(state),
    updated_at: new Date().toISOString(),
  });
  return error ? { ok: false, error: "La synchronisation a échoué." } : { ok: true };
}

export async function fetchLeaderboard(
  university: string | null,
  myPseudonym: string | null,
): Promise<LeaderboardRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  // On filtre par université (colonne `university` renvoyée par la fonction,
  // via .eq) sans jamais la sélectionner dans la réponse : le classement
  // affiché ne montre que le pseudonyme choisi, jamais l'établissement de
  // chacun — sur une petite promo, pseudo + fac peut suffire à deviner qui
  // c'est. leaderboard_public() est une fonction SECURITY DEFINER (pas une
  // vue) : elle seule doit voir toutes les lignes malgré la RLS de
  // `leaderboard`, qui restreint chaque utilisateur à la sienne.
  let query = sb
    .rpc("leaderboard_public")
    .select("pseudonym, streak, mastered, lessons_done")
    .order("streak", { ascending: false })
    .order("mastered", { ascending: false })
    .limit(50);
  if (university) query = query.eq("university", university);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as Array<{ pseudonym: string; streak: number; mastered: number; lessons_done: number }>).map((r) => ({
    pseudonym: r.pseudonym,
    streak: r.streak,
    mastered: r.mastered,
    lessonsDone: r.lessons_done,
    isMe: myPseudonym ? r.pseudonym === myPseudonym : false,
  }));
}

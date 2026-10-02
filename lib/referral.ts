"use client";

import { getSupabase } from "./supabase";

// Capturé dès qu'un visiteur arrive avec ?parrain=<uuid>, bien avant qu'il
// ne crée un compte — il peut très bien naviguer anonymement un moment
// avant de s'inscrire. L'attribution elle-même n'a lieu qu'à la connexion
// (voir attribuerParrainageSiBesoin), pas ici.
const PARRAIN_EN_ATTENTE_KEY = "studijur.parrain-en-attente";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function lienParrainage(userId: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/?parrain=${userId}`;
}

export function capturerParrainage(): void {
  if (typeof window === "undefined") return;
  const id = new URLSearchParams(window.location.search).get("parrain");
  if (!id || !UUID_RE.test(id)) return;
  try {
    localStorage.setItem(PARRAIN_EN_ATTENTE_KEY, id);
  } catch {
    /* stockage bloqué : tant pis, pas d'attribution pour cette visite */
  }
}

// Appelé une fois à la connexion (voir app/connexion/page.tsx). Best-effort
// comme le reste de la synchronisation : un échec ne doit jamais bloquer la
// connexion elle-même. La contrainte unique sur filleul_id (voir la
// migration) empêche qu'un compte déjà parrainé — ou qui se reconnecte plus
// tard avec un vieux lien encore en localStorage — ne s'attribue un second
// parrain ; l'erreur est simplement ignorée.
export async function attribuerParrainageSiBesoin(userId: string): Promise<void> {
  let parrainId: string | null = null;
  try {
    parrainId = localStorage.getItem(PARRAIN_EN_ATTENTE_KEY);
    localStorage.removeItem(PARRAIN_EN_ATTENTE_KEY);
  } catch {
    return;
  }
  if (!parrainId || parrainId === userId) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from("parrainages").insert({ parrain_id: parrainId, filleul_id: userId });
  } catch {
    /* déjà parrainé, ou parrain invalide : pas grave, best-effort */
  }
}

export async function compterFilleuls(userId: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const { count } = await sb
    .from("parrainages")
    .select("id", { count: "exact", head: true })
    .eq("parrain_id", userId);
  return count ?? 0;
}

// Sert à afficher la réduction de 0,90 € sur /abonnement — l'application
// réelle de la réduction au paiement se fait côté serveur (voir
// /api/checkout), cette fonction n'est qu'un affichage.
export async function estParraine(userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data } = await sb
    .from("parrainages")
    .select("id")
    .eq("filleul_id", userId)
    .maybeSingle();
  return Boolean(data);
}

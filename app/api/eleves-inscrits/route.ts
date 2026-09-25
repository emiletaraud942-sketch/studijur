import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Compte total, public et non filtré : sert uniquement à afficher un chiffre
// de preuve sociale ("X élèves déjà inscrits") sur la page d'accueil, jamais
// une liste ni rien de nominatif. `progress` a une ligne par compte qui a
// sauvegardé au moins une fois sa progression — un meilleur signal
// d'inscription réelle que le seul auth.users, qui compterait aussi les
// comptes créés puis jamais utilisés.
export async function GET() {
  const sb = getAdmin();
  if (!sb) return NextResponse.json({ eleves: null });
  const { count } = await sb.from("progress").select("*", { count: "exact", head: true });
  return NextResponse.json({ eleves: count ?? null });
}

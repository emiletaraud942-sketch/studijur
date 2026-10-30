import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PRIX_PAR_DEFAUT, type Formule } from "@/lib/tarifs";

export const runtime = "nodejs";

// Les montants affichés sur /abonnement doivent être ceux que Stripe va
// réellement débiter : on relit les prix chez lui plutôt que de les recopier
// en dur dans la page. Sans clé ou en cas d'erreur, on retombe sur
// PRIX_PAR_DEFAUT ; `disponibles` ne liste que les formules dont
// l'identifiant de prix est configuré.
let cache: { at: number; body: { prix: Record<Formule, number>; disponibles: Formule[] } } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < 3600_000) return NextResponse.json(cache.body);

  const ids: Record<Formule, string | undefined> = {
    pass: process.env.STRIPE_PRICE_ID_PASS,
    monthly: process.env.STRIPE_PRICE_ID,
    annual: process.env.STRIPE_PRICE_ID_ANNUAL ?? process.env.STRIPE_PRICE_ID,
  };
  const secret = process.env.STRIPE_SECRET_KEY;
  const prix = { ...PRIX_PAR_DEFAUT };
  let echec = false;
  const disponibles = secret ? (Object.keys(ids) as Formule[]).filter((f) => Boolean(ids[f])) : [];
  if (secret) {
    const stripe = new Stripe(secret);
    await Promise.all(disponibles.map(async (f) => {
      try {
        const p = await stripe.prices.retrieve(ids[f]!);
        if (typeof p.unit_amount === "number") prix[f] = p.unit_amount;
      } catch {
        /* prix par défaut : la page reste affichable, sans le mettre en cache */
        echec = true;
      }
    }));
  }
  const body = { prix, disponibles };
  if (!echec) cache = { at: Date.now(), body };
  return NextResponse.json(body);
}

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { idCouponParrainage } from "@/lib/stripe-parrainage";

export const runtime = "nodejs";

async function futParraine(userId: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return false;
  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data } = await sb.from("parrainages").select("id").eq("filleul_id", userId).maybeSingle();
  return Boolean(data);
}

// Un parrain dont au moins un filleul a payé mais qui n'avait pas encore
// d'abonnement actif au moment du webhook (voir crediterParrainSiBesoin dans
// /api/stripe/webhook) a sa réduction en attente — elle s'applique ici, à
// son propre prochain paiement, plutôt qu'à une facture déjà passée.
async function recompenseParrainEnAttente(userId: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return false;
  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data } = await sb.from("parrainages").select("id").eq("parrain_id", userId).eq("parrain_credite", false).limit(1).maybeSingle();
  return Boolean(data);
}

async function idCustomerStripe(stripe: Stripe, email: string): Promise<string> {
  const existants = await stripe.customers.list({ email, limit: 1 });
  if (existants.data[0]) return existants.data[0].id;
  const cree = await stripe.customers.create({ email });
  return cree.id;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  let plan = "monthly";
  let email: string | undefined;
  let userId: string | undefined;
  let clientOrigin: string | undefined;
  let skipTrial = false;
  try {
    const body = (await req.json()) as { plan?: string; email?: string; userId?: string; origin?: string; skipTrial?: boolean };
    if (body?.plan === "annual") plan = "annual";
    if (typeof body?.email === "string" && body.email.includes("@")) email = body.email.trim();
    if (typeof body?.userId === "string" && body.userId) userId = body.userId;
    if (typeof body?.origin === "string") clientOrigin = body.origin;
    if (body?.skipTrial === true) skipTrial = true;
  } catch {
    /* corps vide : on reste sur la formule mensuelle */
  }

  // Sans email, le webhook ne peut relier le paiement à aucun compte : Stripe
  // ne renseigne `customer_email` que si on le lui donne à la création (sinon
  // ce champ reste vide même une fois le paiement fait, contrairement à
  // customer_details.email qui n'est disponible qu'après coup). On exige donc
  // d'être connecté avant de payer — la page /abonnement fait déjà ce contrôle.
  if (!email) {
    return NextResponse.json(
      { error: "Connecte-toi d'abord : l'abonnement doit être lié à ton compte pour rester actif sur tous tes appareils." },
      { status: 401 },
    );
  }
  const price = plan === "annual"
    ? process.env.STRIPE_PRICE_ID_ANNUAL ?? process.env.STRIPE_PRICE_ID
    : process.env.STRIPE_PRICE_ID;

  if (!secret || !price) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré : ajoute STRIPE_SECRET_KEY et STRIPE_PRICE_ID." },
      { status: 503 },
    );
  }

  // La session (lien magique) est stockée par le navigateur pour un domaine
  // précis. Si on renvoie systématiquement vers NEXT_PUBLIC_SITE_URL après
  // paiement alors que l'élève a commencé sur un autre domaine valide de
  // l'app (l'ancienne URL .vercel.app, ou www. au lieu de l'apex), Stripe le
  // ramène sur un domaine où sa session n'existe pas : il paraît déconnecté
  // alors que son compte et son abonnement sont intacts. On respecte donc
  // l'origine réelle du navigateur, tant qu'elle fait partie des domaines
  // connus de l'app (jamais une origine arbitraire, pour éviter une
  // redirection ouverte après paiement).
  const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_SITE_URL,
    "https://studijur.fr",
    "https://www.studijur.fr",
    "https://lexio-roan.vercel.app",
    "http://localhost:3000",
  ].filter(Boolean) as string[];
  const origin = (clientOrigin && ALLOWED_ORIGINS.includes(clientOrigin))
    ? clientOrigin
    : process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const stripe = new Stripe(secret);

  const customerId = await idCustomerStripe(stripe, email);

  // Réduction automatique de 0,90 € : soit ce compte a été parrainé (il
  // paie comme filleul), soit c'est un parrain dont la récompense était en
  // attente faute d'abonnement actif au moment où son filleul a payé (voir
  // /api/stripe/webhook). Stripe interdit de combiner `discounts` et
  // `allow_promotion_codes` sur une même session, donc l'un exclut l'autre.
  const parraine = userId ? await futParraine(userId) : false;
  const recompenseEnAttente = !parraine && userId ? await recompenseParrainEnAttente(userId) : false;
  const discountParams = (parraine || recompenseEnAttente)
    ? { discounts: [{ coupon: await idCouponParrainage(stripe) }] }
    : { allow_promotion_codes: true };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      // Par défaut, 7 jours d'essai avant le premier prélèvement — mais
      // certains savent déjà qu'ils veulent payer tout de suite (essai déjà
      // fait sur l'appareil, ou juste envie d'un accès immédiat) : skipTrial
      // leur évite d'être coincés dans un essai qu'ils ne voulaient pas.
      ...(skipTrial ? {} : { subscription_data: { trial_period_days: 7 } }),
      ...discountParams,
      locale: "fr",
      customer: customerId,
      success_url: `${origin}/?abonnement=ok`,
      cancel_url: `${origin}/abonnement`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Création de la session impossible." },
      { status: 500 },
    );
  }
}

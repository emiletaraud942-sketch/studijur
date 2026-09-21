import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Portail de facturation Stripe : c'est lui qui permet à l'élève de changer de
// carte, de récupérer ses factures et surtout de RÉSILIER lui-même, sans
// passer par le support. Rien de tout cela n'existait avant : un abonné qui
// voulait arrêter n'avait aucun bouton pour le faire dans l'application.
//
// Sécurité : on ne fait jamais confiance à un email envoyé par le client (ce
// serait laisser n'importe qui ouvrir le portail de facturation de n'importe
// quel abonné en devinant son adresse). L'appelant doit transmettre son jeton
// de session Supabase, qu'on vérifie côté serveur pour en extraire l'email
// réellement authentifié.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Le paiement n'est pas configuré sur ce site." }, { status: 503 });
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json(
      { error: "Connecte-toi d'abord pour gérer ton abonnement." },
      { status: 401 },
    );
  }

  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Les comptes ne sont pas configurés sur ce site." }, { status: 503 });
  }

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  const email = userData?.user?.email;
  if (userErr || !email) {
    return NextResponse.json(
      { error: "Session expirée : reconnecte-toi puis réessaie." },
      { status: 401 },
    );
  }

  let clientOrigin: string | undefined;
  try {
    const body = (await req.json()) as { origin?: string };
    if (typeof body?.origin === "string") clientOrigin = body.origin;
  } catch {
    /* corps vide : on retombe sur l'origine par défaut */
  }
  // Même précaution que pour le paiement : on ne renvoie l'élève que vers un
  // domaine connu de l'app, jamais vers une origine arbitraire.
  const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_SITE_URL,
    "https://studijur.fr",
    "https://www.studijur.fr",
    "https://lexio-roan.vercel.app",
    "http://localhost:3000",
  ].filter(Boolean) as string[];
  const origin = clientOrigin && ALLOWED_ORIGINS.includes(clientOrigin)
    ? clientOrigin
    : process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const stripe = new Stripe(secret);

  try {
    // On privilégie l'identifiant client enregistré par le webhook Stripe : il
    // est fiable même si l'élève a changé d'adresse de facturation chez Stripe.
    let customerId: string | null = null;
    const { data: row } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("email", email)
      .maybeSingle();
    if (row?.stripe_customer_id) customerId = row.stripe_customer_id as string;

    if (!customerId) {
      const found = await stripe.customers.list({ email, limit: 1 });
      customerId = found.data[0]?.id ?? null;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "Aucun abonnement payant n'est rattaché à cette adresse. Si tu as payé avec une autre adresse email, écris-nous à contact@studijur.fr." },
        { status: 404 },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/mon-abonnement`,
      locale: "fr",
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ouverture du portail impossible.";
    // Cas courant tant que le portail client n'a pas été activé une première
    // fois dans le tableau de bord Stripe : on le dit clairement plutôt que de
    // renvoyer une erreur technique à l'élève.
    const friendly = message.includes("configuration")
      ? "Le portail de gestion n'est pas encore activé côté Stripe. Écris-nous à contact@studijur.fr, on résilie pour toi."
      : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { idCouponParrainage } from "@/lib/stripe-parrainage";

export const runtime = "nodejs";

// Symétrique à la réduction du filleul (voir /api/checkout, qui applique le
// même coupon directement sur sa session de paiement) : si le compte qui
// vient de payer a été parrainé et que son parrain n'a pas encore été
// récompensé pour lui, on pose le coupon sur son abonnement Stripe actif —
// il apparaît explicitement comme une réduction de 0,90 € sur sa prochaine
// facture (pas un crédit de solde, invisible et présenté comme un simple
// ajustement). S'il n'a pas d'abonnement actif pour l'instant (jamais
// abonné, ou résilié), rien à réduire tout de suite : la récompense reste en
// attente (parrain_credite=false) et s'appliquera à son prochain paiement,
// voir recompenseParrainEnAttente dans /api/checkout. user_id_by_email et
// email_by_user_id : auth.users n'est pas exposé via l'API REST, ces deux
// fonctions SQL security definer font le pont (voir la migration).
async function crediterParrainSiBesoin(stripe: Stripe, sb: SupabaseClient, filleulEmail: string): Promise<void> {
  const { data: filleulId } = await sb.rpc("user_id_by_email", { p_email: filleulEmail });
  if (!filleulId) return;

  const { data: parrainage } = await sb
    .from("parrainages")
    .select("id, parrain_id, parrain_credite")
    .eq("filleul_id", filleulId)
    .maybeSingle();
  if (!parrainage || parrainage.parrain_credite) return;

  const { data: parrainEmail } = await sb.rpc("email_by_user_id", { p_id: parrainage.parrain_id });
  if (!parrainEmail) return;

  const existants = await stripe.customers.list({ email: parrainEmail, limit: 1 });
  const customerId = existants.data[0]?.id;
  if (!customerId) return;

  const abonnements = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  const actif = abonnements.data.find((s) => s.status === "active" || s.status === "trialing");
  if (!actif) return;

  await stripe.subscriptions.update(actif.id, { discounts: [{ coupon: await idCouponParrainage(stripe) }] });
  await sb.from("parrainages").update({ parrain_credite: true }).eq("id", parrainage.id);
}

// Pendant de crediterParrainSiBesoin : quand c'est le parrain lui-même qui
// vient de payer (/api/checkout lui a déjà appliqué la réduction en attente
// à cette session, voir recompenseParrainEnAttente là-bas), on marque ici la
// récompense consommée pour ne jamais la réappliquer à un paiement suivant.
async function marquerRecompenseAppliqueeSiBesoin(sb: SupabaseClient, payeurEmail: string): Promise<void> {
  const { data: payeurId } = await sb.rpc("user_id_by_email", { p_email: payeurEmail });
  if (!payeurId) return;
  await sb.from("parrainages").update({ parrain_credite: true }).eq("parrain_id", payeurId).eq("parrain_credite", false);
}

// Le webhook tient à jour la table `subscriptions` dans Supabase. Sans les clés
// Supabase de service, il se contente d'accuser réception : Stripe ne réessaie
// pas indéfiniment et rien ne casse côté application.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whSecret) return NextResponse.json({ received: true, skipped: "stripe non configuré" });

  const stripe = new Stripe(secret);
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "signature manquante" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, whSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "signature invalide" },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ received: true, skipped: "supabase non configuré" });

  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        // /api/checkout passe désormais `customer` (un Customer Stripe
        // réutilisé d'une session à l'autre, voir ce fichier) plutôt que
        // `customer_email` — ce dernier ne serait alors jamais renseigné sur
        // la session, contrairement à customer_details.email qui reflète
        // l'email du client quelle que soit la façon dont il a été fourni.
        const email = s.customer_details?.email ?? s.customer_email;
        const customerId = typeof s.customer === "string" ? s.customer : null;
        if (email) {
          // "active" ici n'est qu'un statut provisoire, écrasé dans la
          // foulée par customer.subscription.created avec le vrai statut
          // Stripe (trialing, active...) — cette ligne existe surtout pour
          // créer la ligne et relier l'email au client Stripe.
          await sb.from("subscriptions").upsert({
            email,
            stripe_customer_id: customerId,
            status: "active",
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });

          await crediterParrainSiBesoin(stripe, sb, email);
          await marquerRecompenseAppliqueeSiBesoin(sb, email);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await sb.from("subscriptions")
          .update({ status: sub.status, updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", typeof sub.customer === "string" ? sub.customer : "");
        break;
      }
    }
  } catch {
    // On n'échoue jamais bruyamment : Stripe rejouerait l'événement en boucle.
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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
        if (s.customer_email) {
          await sb.from("subscriptions").upsert({
            email: s.customer_email,
            stripe_customer_id: typeof s.customer === "string" ? s.customer : null,
            status: "active",
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });
        }
        break;
      }
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

import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase-admin";
import { pushConfigured } from "@/lib/push";

export const runtime = "nodejs";

type Corps = {
  subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  hour?: number;
  email?: string | null;
  userId?: string | null;
};

export async function POST(req: Request) {
  if (!pushConfigured) {
    return NextResponse.json({ error: "Les notifications ne sont pas configurées sur ce serveur." }, { status: 503 });
  }
  const sb = getAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Le rappel quotidien a besoin de la base de données : ajoute les clés Supabase." },
      { status: 503 },
    );
  }

  let corps: Corps;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const sub = corps.subscription;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: "Abonnement aux notifications incomplet." }, { status: 400 });
  }

  const hour = Number.isInteger(corps.hour) ? Math.min(23, Math.max(0, corps.hour as number)) : 19;

  const { error } = await sb.from("push_subscriptions").upsert(
    {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      hour,
      email: corps.email ?? null,
      // Permet au cron de vérifier, via la table `progress`, si la leçon du
      // jour est déjà faite avant d'envoyer le rappel. Optionnel : un
      // visiteur non connecté (mode appareil uniquement) reste notifié sans
      // ce filtre, faute de pouvoir savoir ce qu'il a déjà fait.
      user_id: corps.userId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, hour });
}

export async function DELETE(req: Request) {
  const sb = getAdmin();
  if (!sb) return NextResponse.json({ ok: true });
  let endpoint = "";
  try {
    endpoint = (await req.json())?.endpoint ?? "";
  } catch {
    /* rien à supprimer */
  }
  if (endpoint) await sb.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}

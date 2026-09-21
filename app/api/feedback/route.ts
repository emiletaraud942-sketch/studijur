import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase-admin";
import { checkQuota } from "@/lib/shared-courses";

export const runtime = "nodejs";

type Corps = { message?: string; email?: string | null; userId?: string | null };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "inconnu";
}

export async function POST(req: Request) {
  const sb = getAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Les suggestions ont besoin de la base de données : ajoute les clés Supabase." },
      { status: 503 },
    );
  }

  let corps: Corps;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const message = (corps.message ?? "").trim();
  if (message.length < 10) {
    return NextResponse.json({ error: "Décris ta suggestion en quelques mots de plus." }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Message trop long (4000 caractères max)." }, { status: 400 });
  }

  // Bucket de quota distinct de celui des corrections : même table, clé préfixée.
  const gate = await checkQuota(`feedback:${clientIp(req)}`);
  if (!gate.ok) {
    return NextResponse.json({ error: "Trop d'envois pour aujourd'hui. Réessaie demain." }, { status: 429 });
  }

  const email = (corps.email ?? "").trim() || null;

  const { error } = await sb.from("feedback").insert({
    message,
    email,
    user_id: corps.userId ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase-admin";
import { envoyerEmail } from "@/lib/brevo";

export const runtime = "nodejs";

// Envoi ponctuel (déclenché à la main via workflow_dispatch, voir
// .github/workflows/relance-email.yml), pas un cron récurrent : à retirer
// une fois la campagne du 09/10/2026 envoyée plutôt que de laisser un
// endpoint "email à tous les comptes" disponible en permanence.
function autorise(req: Request): boolean {
  const attendu = process.env.CRON_SECRET;
  if (!attendu) return false;
  return req.headers.get("authorization") === `Bearer ${attendu}`;
}

const SUJET = "Ton programme de révision t'attend";

const HTML = `
  <p>Salut,</p>
  <p>Ton programme de révision pour tes prochains CC t'attend sur StudiJur : le cours du jour, les définitions, un quiz, et un plan de révision calé automatiquement sur la date de ton contrôle.</p>
  <p>
    <a href="https://studijur.fr/reviser" style="display:inline-block;background:#1a2e22;color:#ffffff;padding:11px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
      Reprendre mes révisions →
    </a>
  </p>
  <p style="color:#767676;font-size:13px;margin-top:28px;">
    Tu reçois cet email parce que tu as un compte StudiJur. Pour ne plus en recevoir, réponds simplement à ce message.
  </p>
`;

export async function GET(req: Request) {
  if (!autorise(req)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const sb = getAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase non configuré." }, { status: 503 });

  const emails: string[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    for (const u of data.users) if (u.email) emails.push(u.email);
    if (data.users.length < 200) break;
  }

  let envoyes = 0;
  const echecs: string[] = [];
  for (const to of emails) {
    const ok = await envoyerEmail({ to, subject: SUJET, html: HTML });
    if (ok) envoyes += 1;
    else echecs.push(to);
  }

  return NextResponse.json({ total: emails.length, envoyes, echecs: echecs.length });
}

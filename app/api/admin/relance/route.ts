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

// `envoyerEmail` (lib/brevo.ts) avale l'erreur Brevo pour ne jamais faire
// échouer l'action qui l'a déclenché ailleurs dans l'app — mais ça laisse
// une campagne ratée (ex. 09/10/2026, 85 échecs) sans aucun détail. Ce mode
// diagnostic appelle Brevo directement, sur un seul destinataire, pour
// voir le vrai statut/corps de réponse avant de retenter sur tout le monde.
async function diagnostic(to: string): Promise<{ status?: number; body?: string; erreur?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { erreur: "BREVO_API_KEY absent" };
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_SENDER_EMAIL ?? "contact@studijur.fr", name: "StudiJur" },
        to: [{ email: to }],
        subject: SUJET,
        htmlContent: HTML,
      }),
    });
    return { status: res.status, body: await res.text() };
  } catch (err) {
    return { erreur: String(err) };
  }
}

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

  const url = new URL(req.url);
  if (url.searchParams.get("debug") === "1") {
    const to = url.searchParams.get("to") ?? emails[0];
    return NextResponse.json({ total: emails.length, teste: to, resultat: await diagnostic(to) });
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

import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase-admin";
import { envoyerEmail } from "@/lib/brevo";

export const runtime = "nodejs";

// Outil de campagne réutilisable (déclenché à la main via workflow_dispatch,
// voir .github/workflows/relance-email.yml), pas un cron récurrent. Pour une
// prochaine campagne : changer SUJET/HTML ci-dessous, committer, puis
// redéclencher le workflow (sans ?debug=1 pour l'envoi réel, avec pour
// tester sur une seule adresse d'abord).
function autorise(req: Request): boolean {
  const attendu = process.env.CRON_SECRET;
  if (!attendu) return false;
  return req.headers.get("authorization") === `Bearer ${attendu}`;
}

const SUJET = "Les CC et les partiels arrivent : révise un peu chaque jour";

const HTML = `
  <p>Salut,</p>
  <p>Les contrôles continus et les partiels approchent. Pas besoin de tout reprendre en une nuit : <strong>un peu chaque jour</strong> suffit, et StudiJur est fait pour ça.</p>
  <ul style="padding-left:18px;line-height:1.6;">
    <li><strong>Révise avec ce qui est déjà dans l'appli</strong> : le programme de L1 (introduction au droit, droit constitutionnel, organisation juridictionnelle, histoire du droit public, méthodologie) en séances de 5 minutes, avec définitions, question type examen corrigée et quiz.</li>
    <li><strong>Ajoute tes propres cours au fur et à mesure</strong> : dépose un PDF ou une photo de ton polycopié, StudiJur en tire une leçon, un quiz et des flashcards (avec le pass 7 jours ou l'abonnement).</li>
    <li><strong>Garde le rythme</strong> : une séance par jour, et un rappel le soir si tu l'actives dans ton profil.</li>
  </ul>
  <p>
    <a href="https://studijur.fr" style="display:inline-block;background:#1a2e22;color:#ffffff;padding:11px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
      Faire ma séance du jour →
    </a>
  </p>
  <p style="font-size:14px;">Tu as des cours à ajouter ? <a href="https://studijur.fr/mes-cours">Dépose-les ici</a>.</p>
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

  const comptes: { id: string; email: string }[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    for (const u of data.users) if (u.email) comptes.push({ id: u.id, email: u.email });
    if (data.users.length < 200) break;
  }

  // Campagne ponctuelle de relance (voir la demande d'Émile du 08/11/2026) :
  // contrairement au rappel quotidien automatique (app/api/cron/rappel/route.ts,
  // personnalisé par compte à rebours du CC le plus proche), celle-ci vise
  // tout le monde, y compris les comptes déjà abonnés au push.
  const emails = comptes.map((c) => c.email);

  const url = new URL(req.url);
  if (url.searchParams.get("debug") === "1") {
    const to = url.searchParams.get("to") || emails[0];
    return NextResponse.json({
      totalComptes: comptes.length,
      aMailer: emails.length,
      teste: to,
      resultat: await diagnostic(to),
    });
  }

  let envoyes = 0;
  const echecs: string[] = [];
  for (const to of emails) {
    const ok = await envoyerEmail({ to, subject: SUJET, html: HTML });
    if (ok) envoyes += 1;
    else echecs.push(to);
  }

  return NextResponse.json({
    totalComptes: comptes.length,
    aMailer: emails.length,
    envoyes,
    echecs: echecs.length,
  });
}

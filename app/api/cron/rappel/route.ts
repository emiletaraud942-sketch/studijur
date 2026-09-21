import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase-admin";
import { getWebPush, pushConfigured } from "@/lib/push";

export const runtime = "nodejs";
export const maxDuration = 300;

// Des messages qui tournent : un rappel identique tous les soirs devient un
// bruit qu'on finit par désactiver.
const MESSAGES = [
  { titre: "Cinq minutes ?", corps: "Ta séance du jour t'attend. Le cours, cinq définitions, un quiz." },
  { titre: "Ta série continue", corps: "Une séance aujourd'hui et le compteur repart de plus belle." },
  { titre: "C'est le moment", corps: "Cinq minutes maintenant valent mieux que trois heures la veille du partiel." },
  { titre: "Une question t'attend", corps: "Question type examen du jour, avec sa correction et son plan détaillé." },
  { titre: "Définitions du jour", corps: "Cinq définitions à réciter. Celles que tu rates reviendront demain." },
];

function autorise(req: Request): boolean {
  const attendu = process.env.CRON_SECRET;
  // Sans CRON_SECRET configuré, cette route est un endpoint public non protégé :
  // n'importe qui pourrait spammer les élèves de notifications. On refuse plutôt
  // que d'ouvrir par défaut (Vercel Cron ajoute lui-même l'en-tête Authorization
  // dès que la variable d'environnement CRON_SECRET existe).
  if (!attendu) return false;
  const entete = req.headers.get("authorization");
  return entete === `Bearer ${attendu}`;
}

export async function GET(req: Request) {
  if (!autorise(req)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const wp = getWebPush();
  const sb = getAdmin();
  if (!pushConfigured || !wp || !sb) {
    return NextResponse.json({ envoyes: 0, ignore: "notifications ou base de données non configurées" });
  }

  // Heure ciblée : celle passée en paramètre, sinon l'heure de Paris courante.
  const url = new URL(req.url);
  const param = url.searchParams.get("heure");
  const heureParis = Number(
    new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", hour12: false, timeZone: "Europe/Paris" })
      .format(new Date()),
  );
  const heure = param !== null ? Number(param) : heureParis;

  const { data: abonnements, error } = await sb
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("hour", heure);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!abonnements?.length) return NextResponse.json({ envoyes: 0, heure });

  const message = MESSAGES[new Date().getDate() % MESSAGES.length];
  const charge = JSON.stringify({ ...message, url: "/" });

  let envoyes = 0;
  const perimes: string[] = [];

  await Promise.all(
    abonnements.map(async (a) => {
      try {
        await wp.sendNotification(
          { endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } },
          charge,
        );
        envoyes += 1;
      } catch (err) {
        const code = (err as { statusCode?: number })?.statusCode;
        // 404 et 410 : l'appareil a désinstallé l'app ou révoqué l'autorisation.
        if (code === 404 || code === 410) perimes.push(a.endpoint);
      }
    }),
  );

  if (perimes.length) {
    await sb.from("push_subscriptions").delete().in("endpoint", perimes);
  }

  return NextResponse.json({ envoyes, nettoyes: perimes.length, heure });
}

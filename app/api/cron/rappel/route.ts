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

  // Abonnements anonymes (appareil sans compte) : seule leur propre colonne
  // `hour` fait foi, faute de préférence de compte à consulter.
  const { data: anonymes, error: erreurAnonymes } = await sb
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, user_id")
    .is("user_id", null)
    .eq("hour", heure);
  if (erreurAnonymes) return NextResponse.json({ error: erreurAnonymes.message }, { status: 500 });

  // Abonnements liés à un compte : on ne filtre pas par leur colonne `hour`,
  // qui n'est qu'un instantané pris à l'activation sur CET appareil. La
  // préférence qui fait foi est celle du compte (state.profile.reminderHour),
  // pour qu'un changement d'heure sur un appareil s'applique aussi aux
  // notifications reçues sur les autres appareils du même compte.
  const { data: comptes, error: erreurComptes } = await sb
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, user_id, hour")
    .not("user_id", "is", null);
  if (erreurComptes) return NextResponse.json({ error: erreurComptes.message }, { status: 500 });

  const idsConnus = [...new Set((comptes ?? []).map((a) => a.user_id).filter((id): id is string => Boolean(id)))];
  const preferences = new Map<string, number>();
  const dejaFaitAujourdhui = new Set<string>();
  if (idsConnus.length) {
    const aujourdhui = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" }).format(new Date());
    const { data: progressions } = await sb
      .from("progress")
      .select("user_id, state")
      .in("user_id", idsConnus);
    for (const p of progressions ?? []) {
      const profil = (p.state as { profile?: { reminderHour?: number }; streak?: { lastDay?: string } } | null);
      if (typeof profil?.profile?.reminderHour === "number") {
        preferences.set(p.user_id as string, profil.profile.reminderHour);
      }
      if (profil?.streak?.lastDay === aujourdhui) dejaFaitAujourdhui.add(p.user_id as string);
    }
  }

  const comptesACetteHeure = (comptes ?? []).filter(
    (a) => (preferences.get(a.user_id as string) ?? a.hour) === heure,
  );

  const abonnements = [...(anonymes ?? []), ...comptesACetteHeure];
  if (!abonnements.length) return NextResponse.json({ envoyes: 0, heure });

  // Un élève qui a déjà fait sa séance du jour n'a pas besoin qu'on le lui
  // rappelle : on ne filtre que ceux dont l'abonnement est relié à un compte
  // (élève connecté), faute de pouvoir savoir ce qu'un visiteur en mode
  // appareil uniquement a déjà fait.
  const aEnvoyer = abonnements.filter((a) => !a.user_id || !dejaFaitAujourdhui.has(a.user_id));

  const message = MESSAGES[new Date().getDate() % MESSAGES.length];
  const charge = JSON.stringify({ ...message, url: "/" });

  let envoyes = 0;
  const perimes: string[] = [];

  await Promise.all(
    aEnvoyer.map(async (a) => {
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

  return NextResponse.json({
    envoyes,
    nettoyes: perimes.length,
    dejaFait: dejaFaitAujourdhui.size,
    heure,
  });
}

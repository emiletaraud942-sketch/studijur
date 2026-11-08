import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase-admin";
import { getWebPush, pushConfigured } from "@/lib/push";

export const runtime = "nodejs";

// Outil de campagne ponctuelle (déclenché à la main via workflow_dispatch,
// voir .github/workflows/relance-push.yml), pendant push de la campagne de
// relance du 08/11/2026 (voir aussi /api/admin/relance pour le volet email).
// Contrairement au rappel quotidien automatique (app/api/cron/rappel/route.ts,
// personnalisé par compte et filtré sur qui n'a pas encore fait sa séance),
// celle-ci envoie le même message à TOUS les abonnés push, sans filtre.
function autorise(req: Request): boolean {
  const attendu = process.env.CRON_SECRET;
  if (!attendu) return false;
  return req.headers.get("authorization") === `Bearer ${attendu}`;
}

const TITRE = "Ça fait un moment !";
const CORPS = "Cinq minutes aujourd'hui pour ne pas tout redécouvrir la veille du partiel.";

export async function GET(req: Request) {
  if (!autorise(req)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const wp = getWebPush();
  const sb = getAdmin();
  if (!pushConfigured || !wp || !sb) {
    return NextResponse.json({ envoyes: 0, ignore: "notifications ou base de données non configurées" });
  }

  const { data: abonnements, error } = await sb
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const url = new URL(req.url);
  if (url.searchParams.get("debug") === "1") {
    return NextResponse.json({ aEnvoyer: (abonnements ?? []).length });
  }

  const charge = JSON.stringify({ titre: TITRE, corps: CORPS, url: "/" });
  let envoyes = 0;
  const perimes: string[] = [];

  await Promise.all(
    (abonnements ?? []).map(async (a) => {
      try {
        await wp.sendNotification(
          { endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } },
          charge,
        );
        envoyes += 1;
      } catch (err) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) perimes.push(a.endpoint);
        else console.error("Échec envoi push (relance)", { endpoint: a.endpoint, code, err });
      }
    }),
  );

  if (perimes.length) {
    await sb.from("push_subscriptions").delete().in("endpoint", perimes);
  }

  return NextResponse.json({
    aEnvoyer: (abonnements ?? []).length,
    envoyes,
    nettoyes: perimes.length,
  });
}

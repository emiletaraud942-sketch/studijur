"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics/react";
import { useEffect, useState } from "react";
import { useStudiJur, supabaseConfigured, trialDaysLeft, passJoursRestants } from "@/lib/state";
import { apresBascule, euros, PASS_JOURS, PRIX_PAR_DEFAUT, type Formule } from "@/lib/tarifs";
import { corpusStats } from "@/lib/corpus";
import { connexionHref } from "@/lib/nav";
import { getSupabase } from "@/lib/supabase";
import { estParraine } from "@/lib/referral";
import { Button, SectionTitle, Tag } from "@/components/ui";
import { Check } from "@/components/icons";

const FEATURES = [
  "Une séance guidée de 5 minutes chaque jour",
  "Tout le corpus L1 : introduction au droit, constitutionnel, organisation juridictionnelle, histoire du droit public, méthodologie",
  "Le mode examen : plan de révision CC, fiches condensées, pièges classiques, dates à connaître, quiz de 15 questions",
  "Cinq définitions par jour, rappelées en révision espacée",
  "Une question type examen par leçon, avec réponse concise et plan détaillé",
  "Tes propres cours transformés en leçons au même format",
];

type Plan = Formule;

export default function SubscribePage() {
  const pathname = usePathname();
  const { state, ready, signedInAs } = useStudiJur();
  const [stripeOn, setStripeOn] = useState<boolean | null>(null);
  const [prix, setPrix] = useState<Record<Formule, number>>(PRIX_PAR_DEFAUT);
  const [disponibles, setDisponibles] = useState<Formule[] | null>(null);
  const [busy, setBusy] = useState<{ plan: Plan; skipTrial: boolean } | null>(null);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | undefined>();
  const [parraine, setParraine] = useState(false);
  const stats = corpusStats(state.customCourses);

  useEffect(() => {
    track("page_abonnement");
    fetch("/api/status").then((r) => r.json()).then((s) => setStripeOn(Boolean(s.stripe))).catch(() => setStripeOn(false));
    fetch("/api/prix").then((r) => r.json()).then((d) => {
      if (d?.prix) setPrix(d.prix);
      if (Array.isArray(d?.disponibles)) setDisponibles(d.disponibles);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!signedInAs) return;
    const sb = getSupabase();
    if (!sb) return;
    let annule = false;
    (async () => {
      const { data } = await sb.auth.getUser();
      const id = data.user?.id;
      if (!id || annule) return;
      setUserId(id);
      setParraine(await estParraine(id));
    })();
    return () => { annule = true; };
  }, [signedInAs]);

  // Un abonnement doit être lié à un compte pour rester actif au-delà de cet
  // appareil (voir /api/checkout) : on demande donc de se connecter avant de
  // payer plutôt que de laisser un paiement qui ne débloquerait jamais rien.
  const needsAccount = supabaseConfigured && !signedInAs;

  async function checkout(plan: Plan, skipTrial = false) {
    if (!signedInAs) return;
    track("checkout_demarre", { formule: plan });
    setBusy({ plan, skipTrial });
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // On transmet l'origine réelle du navigateur : la session (magic
        // link) est stockée par le navigateur pour ce domaine précis, donc
        // si Stripe nous ramène sur un autre domaine après paiement, on
        // paraît « déconnecté » alors que le compte est intact (voir /api/checkout).
        body: JSON.stringify({ plan, email: signedInAs, userId, origin: window.location.origin, skipTrial }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setError(data.error ?? "Le paiement n'est pas encore configuré.");
    } catch {
      setError("Impossible de joindre le serveur de paiement.");
    } finally {
      setBusy(null);
    }
  }

  const left = ready ? trialDaysLeft(state) : null;
  const abonne = ready && state.profile.plan === "active";
  const passRestant = ready ? passJoursRestants(state) : 0;
  const bascule = apresBascule();
  // Un essai avec carte n'existe plus après la bascule (voir /api/checkout).
  const essaiAvecCarte = !bascule;
  const peutPayer = ready && stripeOn === true && !abonne;
  const formuleDispo = (f: Formule) => disponibles === null || disponibles.includes(f);
  const mensuelParAn = Math.round((prix.annual / 12));

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="serif text-[30px] font-bold tracking-tight">Prêt(e) pour tes partiels ?</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px]" style={{ color: "var(--muted)" }}>
          {abonne
            ? "Ton abonnement est actif. Merci."
            : passRestant > 0
              ? `Ton pass partiels est actif : encore ${passRestant} jour${passRestant > 1 ? "s" : ""}.`
              : left !== null && left > 0
                ? `Il te reste ${left} jour${left > 1 ? "s" : ""} d'accès complet gratuit.`
                : "Une leçon gratuite par jour, pour toujours. Pour réviser sans limite avant un examen, choisis ta formule."}
        </p>
      </div>

      {parraine && !abonne && (
        <div className="rounded-xl p-3.5 text-center text-[13.5px] font-semibold" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
          Tu as été invité(e) par un ami : 0,90 € offerts, appliqués automatiquement au paiement.
        </div>
      )}

      {formuleDispo("pass") && (
        <section className="card overflow-hidden" data-hue="gold">
          <div className="h-1" style={{ background: "var(--gold)" }} />
          <div className="p-6">
            <div className="mb-3"><Tag tone="gold">Idéal avant un partiel</Tag></div>
            <div className="flex items-baseline gap-2">
              <span className="serif text-[44px] font-bold leading-none">{euros(prix.pass)}</span>
              <span className="text-[15px]" style={{ color: "var(--muted)" }}>pour {PASS_JOURS} jours</span>
            </div>
            <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>
              Paiement unique, <strong>sans abonnement ni renouvellement</strong> : rien ne sera prélevé ensuite.
              Tout le contenu, plan de révision CC et correction IA compris, pendant ta semaine de révisions.
            </p>
            <div className="mt-5">
              {abonne ? (
                <Button href="/" size="lg" full>Retour à ma séance</Button>
              ) : ready && stripeOn && needsAccount ? (
                <Button href={connexionHref(pathname)} size="lg" full>Se connecter pour continuer</Button>
              ) : ready && stripeOn ? (
                <Button onClick={() => checkout("pass")} disabled={busy !== null} size="lg" full>
                  {busy?.plan === "pass" ? "Redirection…" : passRestant > 0 ? `Prolonger de ${PASS_JOURS} jours` : `Prendre le pass ${PASS_JOURS} jours`}
                </Button>
              ) : (
                <div className="rounded-xl p-4 text-center text-[13.5px]" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                  Le paiement n&apos;est pas encore branché : l&apos;accès reste ouvert. Ajoute les clés Stripe pour l&apos;activer.
                </div>
              )}
            </div>
            {ready && stripeOn && needsAccount && !abonne && (
              <p className="mt-2 text-center text-[12.5px]" style={{ color: "var(--muted)" }}>
                Un compte relie ton accès à tes appareils — aucun mot de passe, juste ton email.
              </p>
            )}
          </div>
        </section>
      )}

      <section className="card p-6" data-hue="green">
        <div className="flex items-baseline gap-2">
          <span className="serif text-[34px] font-bold leading-none">{euros(prix.annual)}</span>
          <span className="text-[15px]" style={{ color: "var(--muted)" }}>pour toute ta L1</span>
        </div>
        <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>
          Soit {euros(mensuelParAn)} par mois : CC, partiels, rattrapages, de la rentrée à la fin de l&apos;année,
          sans te soucier de rien racheter.
          {essaiAvecCarte && " Dix jours d'essai gratuit, prolongés jusqu'à ton CC si besoin."}
        </p>
        {peutPayer && formuleDispo("annual") && (
          <div className="mt-4">
            {needsAccount ? (
              <Button href={connexionHref(pathname)} full>Se connecter pour s&apos;abonner</Button>
            ) : (
              <div className="space-y-2">
                <Button onClick={() => checkout("annual")} disabled={busy !== null} full>
                  {busy?.plan === "annual" && !busy.skipTrial ? "Redirection…" : essaiAvecCarte ? "Démarrer l'essai gratuit" : "Prendre la formule annuelle"}
                </Button>
                {essaiAvecCarte && (
                  <button onClick={() => checkout("annual", true)} disabled={busy !== null}
                    className="block w-full text-center text-[12.5px] font-semibold underline"
                    style={{ color: "var(--muted)" }}>
                    {busy?.plan === "annual" && busy.skipTrial ? "Redirection…" : "Payer tout de suite, sans les 10 jours d'essai"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="card p-6">
        <div className="flex items-baseline gap-2">
          <span className="serif text-[30px] font-bold leading-none">{euros(prix.monthly)}</span>
          <span className="text-[15px]" style={{ color: "var(--muted)" }}>/ mois</span>
        </div>
        <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>
          Sans engagement, résiliable en un clic.
          {essaiAvecCarte && " Dix jours d'essai gratuit, prolongés jusqu'à ton CC si besoin."}
        </p>
        {peutPayer && formuleDispo("monthly") && (
          <div className="mt-4">
            {needsAccount ? (
              <Button href={connexionHref(pathname)} variant="outline" full>Se connecter pour s&apos;abonner</Button>
            ) : (
              <div className="space-y-2">
                <Button onClick={() => checkout("monthly")} disabled={busy !== null} variant="outline" full>
                  {busy?.plan === "monthly" && !busy.skipTrial ? "Redirection…" : "Prendre la formule mensuelle"}
                </Button>
                {essaiAvecCarte && (
                  <button onClick={() => checkout("monthly", true)} disabled={busy !== null}
                    className="block w-full text-center text-[12.5px] font-semibold underline"
                    style={{ color: "var(--muted)" }}>
                    {busy?.plan === "monthly" && busy.skipTrial ? "Redirection…" : "Payer tout de suite, sans les 10 jours d'essai"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {error && <p className="text-center text-[13px]" style={{ color: "var(--bad)" }}>{error}</p>}

      <section className="card p-6">
        <SectionTitle kicker="Dans chaque formule" title="Ce qu'il y a dedans" />
        <ul className="space-y-2.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex gap-2.5 text-[14px] leading-relaxed">
              <span className="mt-0.5 grid shrink-0 place-items-center rounded-full"
                style={{ background: "var(--accent-soft)", color: "var(--accent)", width: 18, height: 18 }}>
                <Check className="h-2.5 w-2.5" />
              </span>
              <span style={{ color: "var(--ink-2)" }}>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            { n: stats.lessons, l: "leçons" },
            { n: stats.definitions, l: "définitions" },
            { n: stats.questions, l: "questions" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl py-4" style={{ background: "var(--surface-2)" }}>
              <div className="serif text-[24px] font-bold tabular">{s.n}</div>
              <div className="text-[12px]" style={{ color: "var(--muted)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Toujours accessible, même pour quelqu'un qui n'est pas connecté sur
          cet appareil : personne ne doit se retrouver avec un abonnement
          qu'il ne sait pas où arrêter. */}
      <p className="text-center text-[13px]">
        <Link href="/mon-abonnement" className="underline" style={{ color: "var(--muted)" }}>
          Déjà abonné ? Gérer ou résilier mon abonnement
        </Link>
      </p>
      <p className="text-center text-[12px]" style={{ color: "var(--muted)" }}>
        En payant, tu acceptes les{" "}
        <Link href="/cgv" className="underline">Conditions générales de vente</Link>.
      </p>
    </div>
  );
}

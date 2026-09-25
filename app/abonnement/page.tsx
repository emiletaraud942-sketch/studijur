"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStudiJur, supabaseConfigured, trialDaysLeft } from "@/lib/state";
import { corpusStats } from "@/lib/corpus";
import { connexionHref } from "@/lib/nav";
import { Button, SectionTitle, Tag } from "@/components/ui";
import { Check } from "@/components/icons";

const FEATURES = [
  "Une séance guidée de 5 minutes chaque jour",
  "Tout le corpus L1 : introduction au droit, constitutionnel, organisation juridictionnelle, histoire du droit public, méthodologie",
  "Cinq définitions par jour, rappelées en révision espacée",
  "Une question type examen par leçon, avec réponse concise et plan détaillé",
  "Un quiz de cinq questions, chaque réponse expliquée",
  "Tes propres cours transformés en leçons au même format",
  "Série quotidienne, statistiques et suivi de mémorisation",
];

type Plan = "annual" | "monthly";

export default function SubscribePage() {
  const pathname = usePathname();
  const { state, ready, signedInAs } = useStudiJur();
  const [stripeOn, setStripeOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<{ plan: Plan; skipTrial: boolean } | null>(null);
  const [error, setError] = useState("");
  const stats = corpusStats(state.customCourses);

  useEffect(() => {
    fetch("/api/status").then((r) => r.json()).then((s) => setStripeOn(Boolean(s.stripe))).catch(() => setStripeOn(false));
  }, []);

  // Un abonnement doit être lié à un compte pour rester actif au-delà de cet
  // appareil (voir /api/checkout) : on demande donc de se connecter avant de
  // payer plutôt que de laisser un paiement qui ne débloquerait jamais rien.
  const needsAccount = supabaseConfigured && !signedInAs;

  async function checkout(plan: Plan, skipTrial = false) {
    if (!signedInAs) return;
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
        body: JSON.stringify({ plan, email: signedInAs, origin: window.location.origin, skipTrial }),
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

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="serif text-[30px] font-bold tracking-tight">StudiJur, tous les jours</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px]" style={{ color: "var(--muted)" }}>
          {abonne
            ? "Ton abonnement est actif. Merci."
            : left === null
              ? "Sept jours d'essai gratuit, puis la formule de ton choix."
              : left > 0
                ? `Il te reste ${left} jour${left > 1 ? "s" : ""} d'essai gratuit.`
                : "Ton essai gratuit est terminé."}
        </p>
      </div>

      <section className="card overflow-hidden" data-hue="green">
        <div className="h-1" style={{ background: "var(--accent)" }} />
        <div className="p-6">
          <div className="mb-3"><Tag tone="gold">Le plus choisi</Tag></div>
          <div className="flex items-baseline gap-2">
            <span className="serif text-[44px] font-bold leading-none">49 €</span>
            <span className="text-[15px]" style={{ color: "var(--muted)" }}>/ an</span>
          </div>
          <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>
            Soit 4,08 € par mois — toute l&apos;année de L1, de la rentrée aux rattrapages.
            7 jours d&apos;essai gratuit.
          </p>
          <div className="mt-5">
            {abonne ? (
              <div className="space-y-3">
                <Button href="/" size="lg" full>Retour à ma séance</Button>
                <Button href="/mon-abonnement" variant="outline" full>Gérer ou résilier mon abonnement</Button>
              </div>
            ) : ready && stripeOn && needsAccount ? (
              <Button href={connexionHref(pathname)} size="lg" full>Se connecter pour s&apos;abonner</Button>
            ) : ready && stripeOn ? (
              <div className="space-y-2">
                <Button onClick={() => checkout("annual")} disabled={busy !== null} size="lg" full>
                  {busy?.plan === "annual" && !busy.skipTrial ? "Redirection…" : "Démarrer l'essai gratuit"}
                </Button>
                <button onClick={() => checkout("annual", true)} disabled={busy !== null}
                  className="block w-full text-center text-[12.5px] font-semibold underline"
                  style={{ color: "var(--muted)" }}>
                  {busy?.plan === "annual" && busy.skipTrial ? "Redirection…" : "Payer tout de suite, sans les 7 jours d'essai"}
                </button>
              </div>
            ) : (
              <div className="rounded-xl p-4 text-center text-[13.5px]" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                Le paiement n&apos;est pas encore branché : l&apos;accès reste ouvert. Ajoute les clés Stripe pour activer l&apos;abonnement.
              </div>
            )}
          </div>
          {ready && stripeOn && needsAccount && !abonne && (
            <p className="mt-2 text-center text-[12.5px]" style={{ color: "var(--muted)" }}>
              Un compte relie ton abonnement à tes appareils — aucun mot de passe, juste ton email.
            </p>
          )}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-baseline gap-2">
          <span className="serif text-[30px] font-bold leading-none">5,90 €</span>
          <span className="text-[15px]" style={{ color: "var(--muted)" }}>/ mois</span>
        </div>
        <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>
          Sans engagement, résiliable en un clic. 7 jours d&apos;essai gratuit.
        </p>
        {!abonne && ready && stripeOn && (
          <div className="mt-4">
            {needsAccount ? (
              <Button href={connexionHref(pathname)} variant="outline" full>Se connecter pour s&apos;abonner</Button>
            ) : (
              <div className="space-y-2">
                <Button onClick={() => checkout("monthly")} disabled={busy !== null} variant="outline" full>
                  {busy?.plan === "monthly" && !busy.skipTrial ? "Redirection…" : "Prendre la formule mensuelle"}
                </Button>
                <button onClick={() => checkout("monthly", true)} disabled={busy !== null}
                  className="block w-full text-center text-[12.5px] font-semibold underline"
                  style={{ color: "var(--muted)" }}>
                  {busy?.plan === "monthly" && busy.skipTrial ? "Redirection…" : "Payer tout de suite, sans les 7 jours d'essai"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {error && <p className="text-center text-[13px]" style={{ color: "var(--bad)" }}>{error}</p>}

      <section className="card p-6">
        <SectionTitle kicker="Dans l'abonnement" title="Ce qu'il y a dedans" />
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
    </div>
  );
}

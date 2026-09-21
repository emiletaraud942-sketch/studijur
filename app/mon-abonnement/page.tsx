"use client";

import { useEffect, useState } from "react";
import { useStudiJur, supabaseConfigured, trialDaysLeft } from "@/lib/state";
import { getSupabase } from "@/lib/supabase";
import { Button, SectionTitle, Tag } from "@/components/ui";
import { Check } from "@/components/icons";

const CONTACT = "contact@studijur.fr";
const MAILTO = `mailto:${CONTACT}?subject=${encodeURIComponent("Résiliation de mon abonnement StudiJur")}&body=${encodeURIComponent(
  "Bonjour,\n\nJe souhaite résilier mon abonnement StudiJur.\n\nAdresse email utilisée lors du paiement : \n\nMerci.",
)}`;

export default function MonAbonnementPage() {
  const { state, ready, signedInAs } = useStudiJur();
  const [stripeOn, setStripeOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/status").then((r) => r.json()).then((s) => setStripeOn(Boolean(s.stripe))).catch(() => setStripeOn(false));
  }, []);

  // Le portail Stripe est ce qui permet de résilier soi-même. On lui transmet
  // le jeton de session : le serveur en déduit l'email réellement authentifié,
  // plutôt que de faire confiance à une adresse envoyée par le navigateur.
  async function openPortal() {
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await sb.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError("Ta session a expiré. Reconnecte-toi, puis reviens sur cette page.");
        return;
      }
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ origin: window.location.origin }),
      });
      const payload = await res.json();
      if (payload.url) { window.location.href = payload.url; return; }
      setError(payload.error ?? "Impossible d'ouvrir la gestion de l'abonnement.");
    } catch {
      setError("Impossible de joindre le serveur. Réessaie dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;
  }

  const abonne = state.profile.plan === "active";
  const left = trialDaysLeft(state);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Mon abonnement</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Voir ta formule, changer de carte, récupérer tes factures ou résilier — tout se fait ici.
        </p>
      </div>

      <section className="card p-5">
        <SectionTitle
          kicker="État"
          title={abonne ? "Abonnement actif" : left > 0 ? "Essai gratuit en cours" : "Aucun abonnement"}
          right={abonne ? <Tag tone="gold">Abonné</Tag> : undefined}
        />
        <div className="space-y-2.5 text-[14px]">
          <Row label="Formule" value={abonne ? "Abonné" : left > 0 ? `Essai — ${left} jour${left > 1 ? "s" : ""} restant${left > 1 ? "s" : ""}` : "Essai terminé"} />
          <Row label="Compte lié" value={signedInAs ?? "Non connecté sur cet appareil"} />
        </div>

        {!supabaseConfigured ? (
          <p className="mt-4 rounded-xl p-4 text-[13.5px]" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
            Les comptes ne sont pas activés sur cette installation.
          </p>
        ) : !signedInAs ? (
          <div className="mt-4">
            <div className="rounded-xl p-4 text-[13.5px] leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}>
              Connecte-toi avec l&apos;adresse email utilisée lors du paiement : c&apos;est elle qui relie
              ton abonnement à ton compte.
            </div>
            <div className="mt-3"><Button href="/connexion" full>Me connecter</Button></div>
          </div>
        ) : stripeOn === false ? (
          <p className="mt-4 rounded-xl p-4 text-[13.5px]" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
            Le paiement n&apos;est pas branché sur cette installation : il n&apos;y a rien à gérer, l&apos;accès reste ouvert.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <Button onClick={openPortal} disabled={busy} size="lg" full>
              {busy ? "Ouverture…" : "Gérer ou résilier mon abonnement"}
            </Button>
            <p className="text-center text-[12.5px]" style={{ color: "var(--muted)" }}>
              Tu seras redirigé vers la page sécurisée de Stripe, notre prestataire de paiement.
            </p>
            {!abonne && (
              <Button href="/abonnement" variant="outline" full>Voir les formules</Button>
            )}
          </div>
        )}

        {error && <p className="mt-3 text-center text-[13px]" style={{ color: "var(--bad)" }}>{error}</p>}
      </section>

      <section className="card p-5">
        <SectionTitle kicker="Résiliation" title="Ce qui se passe quand tu résilies" />
        <ul className="space-y-2.5">
          {[
            "Aucun frais supplémentaire : le prélèvement suivant est annulé.",
            "Tu gardes l'accès complet jusqu'à la fin de la période déjà payée.",
            "Ta progression, tes cours importés et tes statistiques restent enregistrés.",
            "Tu peux te réabonner plus tard et tout retrouver en l'état.",
          ].map((t) => (
            <li key={t} className="flex gap-2.5 text-[14px] leading-relaxed">
              <span className="mt-0.5 grid shrink-0 place-items-center rounded-full"
                style={{ background: "var(--accent-soft)", color: "var(--accent)", width: 18, height: 18 }}>
                <Check className="h-2.5 w-2.5" />
              </span>
              <span style={{ color: "var(--ink-2)" }}>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <SectionTitle kicker="Secours" title="Tu n'arrives pas à te connecter ?" />
        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Ne reste jamais bloqué avec un abonnement que tu ne peux pas arrêter. Deux solutions :
        </p>
        <ol className="mt-3 space-y-3 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          <li>
            <strong>Connecte-toi avec le code, pas avec le lien.</strong> Sur la page de connexion, demande
            ton lien : le même email contient aussi un code à saisir directement dans l&apos;application.
            C&apos;est la méthode à utiliser si tu as épinglé StudiJur sur ton écran d&apos;accueil — un lien
            cliqué depuis ta boîte mail s&apos;ouvre dans le navigateur, pas dans l&apos;application installée,
            et les deux ne partagent pas la même session.
          </li>
          <li>
            <strong>Écris-nous, on résilie pour toi.</strong> Un email à{" "}
            <a href={MAILTO} className="underline font-semibold" style={{ color: "var(--accent)" }}>{CONTACT}</a>{" "}
            avec l&apos;adresse utilisée pour le paiement suffit — aucune justification à donner.
          </li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/connexion" variant="soft" size="sm">Page de connexion</Button>
          {/* Lien mailto en <a> brut : next/link est fait pour la navigation
              interne, pas pour ouvrir le client mail de l'appareil. */}
          <a href={MAILTO}
            className="inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: "transparent", color: "var(--ink)", border: "1.5px solid var(--card-border)" }}>
            Demander la résiliation par email
          </a>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2.5 last:border-b-0" style={{ borderColor: "var(--line)" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span className="min-w-0 truncate text-right font-semibold">{value}</span>
    </div>
  );
}

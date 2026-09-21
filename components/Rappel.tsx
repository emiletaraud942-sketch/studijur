"use client";

import { useEffect, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { getSupabase } from "@/lib/supabase";
import { Button, SectionTitle } from "./ui";
import { Check, Cross, Flame } from "./icons";

const CLE = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function cleVersOctets(base64: string): Uint8Array {
  const rempli = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const brut = atob(rempli);
  const octets = new Uint8Array(brut.length);
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i);
  return octets;
}

type Etat = "inconnu" | "indisponible" | "inactif" | "actif" | "refuse";

export default function Rappel() {
  const { state, update, signedInAs } = useStudiJur();
  const [etat, setEtat] = useState<Etat>("inconnu");
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState("");
  const heure = state.profile.reminderHour ?? 19;

  useEffect(() => {
    const supporte =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window &&
      CLE.length > 0;
    if (!supporte) { setEtat("indisponible"); return; }
    if (Notification.permission === "denied") { setEtat("refuse"); return; }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEtat(sub ? "actif" : "inactif"))
      .catch(() => setEtat("inactif"));
  }, []);

  // Relie automatiquement un abonnement déjà actif au compte : un abonnement
  // créé avant la connexion (ou avant cette version) reste sans user_id tant
  // que personne ne re-soumet le formulaire. Sans ça, le cron ne peut pas
  // rattacher cet appareil à la préférence d'heure du compte.
  useEffect(() => {
    if (!signedInAs) return;
    let annule = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!sub || annule) return;
        const sb = getSupabase();
        const userId = sb ? (await sb.auth.getUser()).data.user?.id ?? null : null;
        if (!userId || annule) return;
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ subscription: sub.toJSON(), hour: heure, userId }),
        });
      } catch {
        /* liaison en tâche de fond : un prochain changement d'heure retentera */
      }
    })();
    return () => { annule = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedInAs]);

  async function activer() {
    setOccupe(true);
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setEtat(permission === "denied" ? "refuse" : "inactif");
        setOccupe(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: cleVersOctets(CLE) as BufferSource,
        }));

      // Si l'élève est connecté, on relie l'abonnement push à son compte pour
      // que le cron puisse vérifier s'il a déjà fait sa leçon du jour avant
      // d'envoyer le rappel (sinon il n'y a aucun moyen de le savoir).
      const sb = getSupabase();
      const userId = sb ? (await sb.auth.getUser()).data.user?.id ?? null : null;

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), hour: heure, userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "L'enregistrement du rappel a échoué.");
        setEtat("inactif");
      } else {
        setEtat("actif");
        setMessage(`Rappel enregistré pour ${heure} h.`);
      }
    } catch {
      setMessage("Impossible d'activer les notifications sur cet appareil.");
      setEtat("inactif");
    } finally {
      setOccupe(false);
    }
  }

  async function desactiver() {
    setOccupe(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => undefined);
        await sub.unsubscribe();
      }
      setEtat("inactif");
      setMessage("");
    } finally {
      setOccupe(false);
    }
  }

  function changerHeure(h: number) {
    update((d) => { d.profile.reminderHour = h; });
    if (etat === "actif") void activer();
  }

  return (
    <section className="card p-5">
      <SectionTitle kicker="Régularité" title="Rappel quotidien" />

      <div className="mb-4 flex items-start gap-3 rounded-xl p-4" style={{ background: "var(--gold-soft)" }}>
        <span style={{ color: "var(--gold)" }}><Flame className="mt-0.5 h-5 w-5 shrink-0" /></span>
        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Une série se casse au troisième jour sans rappel. Un seul message par soir, à l&apos;heure que tu choisis.
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[13px] font-semibold" style={{ color: "var(--muted)" }}>Heure du rappel</div>
        <div className="flex flex-wrap gap-2">
          {[8, 12, 17, 19, 21].map((h) => (
            <button key={h} onClick={() => changerHeure(h)}
              className="rounded-lg px-3.5 py-2 text-[14px] font-semibold tabular transition-all active:scale-[0.98]"
              style={heure === h
                ? { background: "var(--accent)", color: "var(--accent-ink)" }
                : { background: "var(--surface-2)", color: "var(--muted)" }}>
              {h} h
            </button>
          ))}
        </div>
      </div>

      {etat === "indisponible" && (
        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Ce navigateur ne gère pas les notifications, ou le serveur n&apos;est pas encore configuré pour les
          envoyer. Sur iPhone, ajoute d&apos;abord StudiJur à ton écran d&apos;accueil depuis le menu de partage.
        </p>
      )}

      {etat === "refuse" && (
        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--bad)" }}>
          Tu as refusé les notifications pour ce site. Réautorise-les dans les réglages de ton navigateur, puis
          reviens ici.
        </p>
      )}

      {etat === "inactif" && (
        <Button onClick={activer} disabled={occupe} full>
          {occupe ? "Activation…" : "Activer le rappel"}
        </Button>
      )}

      {etat === "actif" && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: "var(--good)" }}>
            <Check className="h-4 w-4" /> Rappel actif à {heure} h
          </span>
          <Button onClick={desactiver} disabled={occupe} variant="outline" size="sm">Désactiver</Button>
        </div>
      )}

      {message && (
        <p className="mt-3 flex items-start gap-2 text-[13px]" style={{ color: "var(--muted)" }}>
          {message.includes("échoué") || message.includes("Impossible")
            ? <Cross className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            : <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
          {message}
        </p>
      )}
    </section>
  );
}

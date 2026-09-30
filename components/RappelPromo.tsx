"use client";

import { useEffect, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { getSupabase } from "@/lib/supabase";
import { activerRappel, iosSansInstallation, pushSupporte, RAPPEL_POST_CONNEXION_REFUSE_KEY } from "@/lib/push-client";
import { Button } from "./ui";
import { Bell } from "./icons";

// Sur 67 comptes, seuls 4 avaient un rappel actif (constat du 30/09/2026) —
// l'étape proposée une seule fois après connexion (voir app/connexion) ne
// suffit pas : beaucoup sont sur iPhone, où `pushSupporte()` est faux tant
// que l'app n'est pas installée sur l'écran d'accueil, donc cette étape ne
// s'affiche même jamais pour eux. Ce bandeau réaffiche l'invitation sur la
// page la plus visitée, avec le bon message selon la cause réelle.
type Etat = "charge" | "cache" | "a-installer" | "a-activer";

function dejaDecline(): boolean {
  try {
    return localStorage.getItem(RAPPEL_POST_CONNEXION_REFUSE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function RappelPromo() {
  const { state } = useStudiJur();
  const [etat, setEtat] = useState<Etat>("charge");
  const [occupe, setOccupe] = useState(false);

  useEffect(() => {
    if (dejaDecline()) { setEtat("cache"); return; }
    if (!pushSupporte()) {
      setEtat(iosSansInstallation() ? "a-installer" : "cache");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEtat(sub ? "cache" : "a-activer"))
      .catch(() => setEtat("a-activer"));
  }, []);

  function decliner() {
    try { localStorage.setItem(RAPPEL_POST_CONNEXION_REFUSE_KEY, "1"); } catch { /* tant pis */ }
    setEtat("cache");
  }

  async function activer() {
    setOccupe(true);
    const sb = getSupabase();
    const userId = sb ? (await sb.auth.getUser()).data.user?.id ?? null : null;
    const resultat = await activerRappel(state.profile.reminderHour ?? 19, userId);
    setOccupe(false);
    if (resultat.ok) { setEtat("cache"); return; }
    if (resultat.refuse) decliner();
  }

  if (etat === "charge" || etat === "cache") return null;

  return (
    <div data-hue="gold" className="rise card flex items-start gap-3.5 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
        <Bell className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-semibold">
          {etat === "a-installer" ? "Reçois ton rappel quotidien" : "Active ton rappel quotidien"}
        </h2>
        <p className="mt-0.5 text-[13px] leading-snug" style={{ color: "var(--muted)" }}>
          {etat === "a-installer" ? (
            <>
              Sur iPhone, Apple bloque les notifications tant que StudiJur n&apos;est pas installé. Appuie sur{" "}
              <strong>Partager</strong> (le carré avec la flèche dans Safari), puis{" "}
              <strong>« Sur l&apos;écran d&apos;accueil »</strong> — ouvre ensuite StudiJur depuis cette icône.
            </>
          ) : (
            "Une série se casse au troisième jour sans rappel. Un seul message par soir, à l'heure que tu choisis dans les réglages."
          )}
        </p>
        <div className="mt-3 flex gap-2">
          {etat === "a-activer" && (
            <Button onClick={activer} disabled={occupe} size="sm">{occupe ? "Activation…" : "Activer"}</Button>
          )}
          <Button onClick={decliner} variant="outline" size="sm">
            {etat === "a-installer" ? "Compris" : "Plus tard"}
          </Button>
        </div>
      </div>
    </div>
  );
}

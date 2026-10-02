"use client";

import { useEffect, useState } from "react";
import { Flame } from "./icons";

const PALIERS = [7, 30, 100] as const;

const MESSAGES: Record<number, { titre: string; texte: string }> = {
  7: { titre: "Une semaine complète", texte: "7 jours d'affilée : l'habitude commence à tenir toute seule." },
  30: { titre: "Un mois sans interruption", texte: "30 jours de série. Peu de monde tient aussi longtemps — continue." },
  100: { titre: "100 jours de série", texte: "Un chiffre que très peu de monde atteint. Chapeau." },
};

// Affichée une seule fois par palier (localStorage), au moment précis où le
// compteur de série atteint 7/30/100 — jamais recalculée après coup : un
// élève qui revient à 50 jours sans être passé par 30 n'aurait de toute
// façon pas pu voir cette palier manqué, donc pas de rattrapage artificiel.
export function StreakMilestone({ streak }: { streak: number }) {
  const [palier, setPalier] = useState<number | null>(null);

  useEffect(() => {
    const atteint = PALIERS.find((p) => p === streak);
    if (!atteint) return;
    const cle = `lexio.streak-celebre.${atteint}`;
    try {
      if (localStorage.getItem(cle)) return;
      localStorage.setItem(cle, "1");
    } catch {
      /* stockage bloqué : tant pis, la célébration pourrait réapparaître */
    }
    setPalier(atteint);
  }, [streak]);

  if (!palier) return null;
  const { titre, texte } = MESSAGES[palier];

  return (
    <div className="pop card mx-auto mt-6 max-w-sm overflow-hidden text-center" data-hue="gold">
      <div className="h-1" style={{ background: "var(--gold)" }} />
      <div className="p-6">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
          <Flame className="h-7 w-7" />
        </div>
        <h2 className="serif text-[19px] font-bold">{titre}</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>{texte}</p>
      </div>
    </div>
  );
}

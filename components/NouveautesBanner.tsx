"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui";
import { Target } from "./icons";

// Les 4 ajouts du 1er-2 octobre 2026 (plan de bataille, chronologie, fiche à
// trous, correction IA sur les exercices de méthode) étaient invisibles tant
// qu'on n'ouvrait pas soi-même /revision-cc ou /entrainement-methode —
// personne ne savait qu'ils existaient. Ce bandeau les annonce une fois,
// sur la page la plus visitée, plutôt que de compter sur la découverte.
const CLE_VU = "lexio.nouveautes.2026-10.vu";

export default function NouveautesBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(CLE_VU) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  function masquer() {
    try { localStorage.setItem(CLE_VU, "1"); } catch { /* tant pis */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div data-hue="gold" className="rise card flex items-start gap-3.5 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
        <Target className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-semibold">Nouveau : le plan de bataille avant un CC</h2>
        <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Sur la révision flash de chaque matière : un programme jour par jour (J-14 fiche complète, J-7 quiz
          complet, J-3 focus sur tes erreurs, J-1 questions de cours), une chronologie interactive et une fiche à
          trous pour retrouver les termes. Et sur les exercices de méthode, une vraie correction IA notée sur 20.
        </p>
        <div className="mt-3 flex gap-2">
          {/* Button ignore onClick dès que href est fourni (voir components/ui.tsx) :
              un <Link> direct est nécessaire pour marquer la bannière vue avant de
              naviguer, sinon elle réapparaîtrait au retour sur l'accueil. */}
          <Link href="/reviser" onClick={masquer}
            className="inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: "var(--h, var(--accent))", color: "var(--accent-ink)" }}>
            Voir ça
          </Link>
          <Button onClick={masquer} variant="outline" size="sm">Plus tard</Button>
        </div>
      </div>
    </div>
  );
}

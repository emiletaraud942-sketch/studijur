"use client";

import { useState } from "react";
import type { FicheMethode as FicheMethodeType } from "@/lib/methode-fiches";
import { Check } from "./icons";

// Présentation interactive d'une fiche méthode : le plan type, étape par
// étape, puis une checklist des critères à vérifier sur sa propre
// rédaction — même logique que la grille de correction de
// /entrainement-methode, mais pour une référence qu'on consulte en
// travaillant, pas pour un exercice noté. État local uniquement : rien à
// synchroniser, une fiche méthode se re-coche à chaque relecture.
export default function FicheMethode({ fiche }: { fiche: FicheMethodeType }) {
  const [coches, setCoches] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setCoches((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="serif text-[20px] font-bold">{fiche.titre}</h2>
        <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>{fiche.teaser}</p>
      </div>

      <div className="space-y-3">
        {fiche.etapes.map((etape, i) => (
          <section key={etape.titre} className="card flex gap-3.5 p-4">
            <span className="serif grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold tabular"
              style={{ background: "var(--h-soft)", color: "var(--h)" }}>
              {i + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-[14.5px] font-semibold">{etape.titre}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{etape.texte}</p>
              {etape.exemple && (
                <p className="mt-2 rounded-lg p-2.5 text-[12.5px] italic leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                  {etape.exemple}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <section className="card p-4">
        <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--h)" }}>
          Critères à vérifier sur ta rédaction
        </h3>
        <ul className="space-y-2">
          {fiche.criteres.map((critere, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-snug">
                <input type="checkbox" checked={coches.has(i)} onChange={() => toggle(i)}
                  className="mt-0.5 h-4 w-4 shrink-0" />
                <span style={{ color: coches.has(i) ? "var(--ink)" : "var(--ink-2)" }}>{critere}</span>
              </label>
            </li>
          ))}
        </ul>
        {coches.size === fiche.criteres.length && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--good)" }}>
            <Check className="h-4 w-4" /> Tous les critères sont respectés
          </p>
        )}
      </section>
    </div>
  );
}

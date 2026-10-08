"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ccAVenir, etapeActuelle, joursAvant, type RevisionCCConfig } from "@/lib/revision-cc-config";
import { Arrow } from "./icons";

// Remplace la grille de 3 matières comme point d'entrée principal de
// /reviser : plutôt que de demander à l'élève de choisir sa matière (il n'y
// a qu'un CC le plus proche qui compte vraiment), un seul gros bloc détecte
// automatiquement lequel et dit quoi faire aujourd'hui. Retour utilisateur
// du 08/10/2026 : "un seul gros bouton Mon CC est le... qui génère son plan
// de révision" — les dates de CC sont déjà connues par matière (voir
// REVISION_CC), donc pas besoin de les faire saisir : seule la détection du
// plus proche manquait de mise en avant.
export default function ProchainCCHero() {
  const [cc, setCc] = useState<RevisionCCConfig | null | undefined>(undefined);

  useEffect(() => { setCc(ccAVenir()[0] ?? null); }, []);

  if (!cc) return null;

  const jours = joursAvant(cc.ccDate!);
  const etape = etapeActuelle(jours);

  return (
    <section className="card overflow-hidden" data-hue="gold">
      <div className="h-1.5" style={{ background: "var(--bad)" }} />
      <div className="p-6 text-center">
        <span className="serif text-[44px] font-bold leading-none tabular" style={{ color: "var(--bad)" }}>
          {jours <= 0 ? "J" : `J-${jours}`}
        </span>
        <h2 className="mt-2 text-[17px] font-bold">{cc.label}</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {jours <= 0
            ? "C'est aujourd'hui."
            : etape
              ? <><strong>{etape.titre}</strong> — {etape.texte}</>
              : `Dans ${jours} jour${jours > 1 ? "s" : ""}.`}
        </p>
        <div className="mt-5">
          <Link href={`/revision-cc/${cc.id}`}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            Voir mon plan de révision <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

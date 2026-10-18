"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ccAVenir, etapeActuelle, joursAvant, type RevisionCCConfig } from "@/lib/revision-cc-config";
import { Arrow } from "./icons";

// Contrairement à ProchainCCBanner (dans l'app, un lien discret par matière),
// cette bannière vit sur / et /presentation pour un visiteur SANS compte —
// retour d'Émile du 18/10/2026 : c'est la toute première chose à voir sur la
// page, avant même le pitch, avec un vrai raccourci "Voir mon plan de
// révision" par matière (même format que ProchainCCHero dans /reviser,
// réservé aux comptes connectés) plutôt qu'une bannière texte qui ne mène
// nulle part avant la création du compte. Calculé côté client (useEffect,
// pas au premier rendu) pour éviter un écart de rendu serveur/client sur
// Date.now() — voir la même remarque dans ProchainCCBanner.
export default function CCPresentationBanner() {
  const [items, setItems] = useState<RevisionCCConfig[]>([]);

  useEffect(() => { setItems(ccAVenir()); }, []);

  if (!items.length) return null;

  return (
    <section className="space-y-2.5">
      <h2 className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
        Les prochains CC approchent
      </h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((c) => {
          const jours = joursAvant(c.ccDate!);
          const etape = etapeActuelle(jours);
          return (
            <div key={c.id} className="card overflow-hidden" data-hue="gold">
              <div className="h-1" style={{ background: "var(--bad)" }} />
              <div className="p-5 text-center">
                <span className="serif text-[32px] font-bold leading-none tabular" style={{ color: "var(--bad)" }}>
                  {jours <= 0 ? "J" : `J-${jours}`}
                </span>
                <h3 className="mt-1.5 text-[15px] font-bold">{c.label}</h3>
                <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {jours <= 0
                    ? "C'est aujourd'hui."
                    : etape
                      ? <><strong>{etape.titre}</strong> — {etape.texte}</>
                      : `Dans ${jours} jour${jours > 1 ? "s" : ""}.`}
                </p>
                <div className="mt-4">
                  <Link href={`/revision-cc/${c.id}`}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-semibold"
                    style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                    Voir mon plan de révision <Arrow className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

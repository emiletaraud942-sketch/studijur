"use client";

import { useEffect, useState } from "react";

// Chiffre réel (table `progress`, voir /api/eleves-inscrits), pas un chiffre
// inventé pour faire joli — rien ne s'affiche tant que la valeur n'est pas
// revenue, plutôt qu'un placeholder trompeur.
export default function PreuveSociale() {
  const [eleves, setEleves] = useState<number | null>(null);

  useEffect(() => {
    let annule = false;
    fetch("/api/eleves-inscrits")
      .then((r) => r.json())
      .then((d) => { if (!annule) setEleves(typeof d.eleves === "number" ? d.eleves : null); })
      .catch(() => {});
    return () => { annule = true; };
  }, []);

  if (eleves === null || eleves <= 0) return null;

  return (
    <span className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
      style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
      {eleves} élève{eleves > 1 ? "s" : ""} déjà inscrit{eleves > 1 ? "s" : ""}
    </span>
  );
}

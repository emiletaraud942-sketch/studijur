"use client";

import { useRouter } from "next/navigation";

// Bouton "retour" générique pour les pages atteintes depuis plusieurs
// endroits (Réviser, l'accueil, une recherche...) : s'appuie sur
// l'historique du navigateur plutôt que sur un lien fixe, pour ramener
// l'élève exactement là d'où il vient plutôt que de le renvoyer
// systématiquement vers /reviser.
export default function BoutonRetour({ label = "Retour" }: { label?: string }) {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
      ← {label}
    </button>
  );
}

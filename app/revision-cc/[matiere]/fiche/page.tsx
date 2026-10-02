"use client";

import { useRevisionCC } from "@/lib/useRevisionCC";
import { RevisionCCRubrique } from "@/components/RevisionCCRubrique";
import { FicheCondensee } from "@/components/FicheCondensee";

export default function FicheCCPage() {
  const { config, lessons } = useRevisionCC();
  return (
    <RevisionCCRubrique config={config} titre="Fiche condensée">
      <FicheCondensee lessons={lessons} />
    </RevisionCCRubrique>
  );
}

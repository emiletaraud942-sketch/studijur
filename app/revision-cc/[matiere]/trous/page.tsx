"use client";

import { useRevisionCC } from "@/lib/useRevisionCC";
import { RevisionCCRubrique } from "@/components/RevisionCCRubrique";
import { FicheATrous } from "@/components/FicheATrous";

export default function TrousCCPage() {
  const { config, lessons } = useRevisionCC();
  return (
    <RevisionCCRubrique config={config} titre="Fiche à trous">
      <FicheATrous lessons={lessons} />
    </RevisionCCRubrique>
  );
}

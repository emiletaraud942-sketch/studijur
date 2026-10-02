"use client";

import { useRevisionCC } from "@/lib/useRevisionCC";
import { RevisionCCRubrique } from "@/components/RevisionCCRubrique";
import { VueEnsemble } from "@/components/VueEnsemble";

export default function ApercuCCPage() {
  const { config, lessons } = useRevisionCC();
  return (
    <RevisionCCRubrique config={config} titre="Vue d'ensemble">
      <VueEnsemble lessons={lessons} />
    </RevisionCCRubrique>
  );
}

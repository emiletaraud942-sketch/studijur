"use client";

import { useRevisionCC } from "@/lib/useRevisionCC";
import { RevisionCCRubrique } from "@/components/RevisionCCRubrique";
import { QuestionsDeCours } from "@/components/QuestionsDeCours";

export default function QuestionsCCPage() {
  const { config, lessons } = useRevisionCC();
  return (
    <RevisionCCRubrique config={config} titre="Questions de cours">
      <QuestionsDeCours lessons={lessons} />
    </RevisionCCRubrique>
  );
}

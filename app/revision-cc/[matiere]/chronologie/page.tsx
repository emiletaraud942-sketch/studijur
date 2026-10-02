"use client";

import { useRevisionCC } from "@/lib/useRevisionCC";
import { RevisionCCRubrique } from "@/components/RevisionCCRubrique";
import { Chronologie } from "@/components/Chronologie";

export default function ChronologieCCPage() {
  const { config, chronologieLessons } = useRevisionCC();
  return (
    <RevisionCCRubrique config={config} titre="Chronologie">
      <Chronologie lessons={chronologieLessons} />
    </RevisionCCRubrique>
  );
}

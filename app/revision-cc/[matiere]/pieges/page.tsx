"use client";

import { useRevisionCC } from "@/lib/useRevisionCC";
import { RevisionCCRubrique } from "@/components/RevisionCCRubrique";
import { PiegesClassiques } from "@/components/PiegesClassiques";

export default function PiegesCCPage() {
  const { config, lessons } = useRevisionCC();
  return (
    <RevisionCCRubrique config={config} titre="Pièges classiques">
      <PiegesClassiques lessons={lessons} />
    </RevisionCCRubrique>
  );
}

"use client";

import Link from "next/link";
import { useStudiJur } from "@/lib/state";
import { Button } from "./ui";
import RevisionCCGate from "./RevisionCCGate";
import type { RevisionCCConfig } from "@/lib/revision-cc-config";

// Même chrome (introuvable / chargement / gate / en-tête avec retour) pour
// chaque rubrique de /revision-cc/[matiere] — évite de le répéter dans les
// 6 pages de rubrique.
export function RevisionCCRubrique({
  config, titre, children,
}: { config: RevisionCCConfig | undefined; titre: string; children: React.ReactNode }) {
  const { ready, signedInAs } = useStudiJur();

  if (!config) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="serif text-[22px] font-bold">Matière introuvable</h1>
        <div className="mt-5"><Button href="/">Retour à l&apos;accueil</Button></div>
      </div>
    );
  }

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  if (!signedInAs) return <RevisionCCGate label={config.label} />;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/revision-cc/${config.id}`} className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
          ← {config.label}
        </Link>
        <h1 className="serif mt-1.5 text-[26px] font-bold tracking-tight">{titre}</h1>
      </div>
      {children}
    </div>
  );
}

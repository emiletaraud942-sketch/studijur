"use client";

import { usePathname } from "next/navigation";
import { connexionHref } from "@/lib/nav";
import { Button } from "./ui";
import { Arrow, Scales } from "./icons";

// Contrairement à /entrainement/* (gratuit et illimité, voir
// CompteApresQuiz), cette page n'affiche jamais son contenu sans compte —
// c'est le point que l'étape 3 de la relance ne corrige pas : /revision-cc
// est conçue gated dès le départ, pas de mode aperçu.
export default function RevisionCCGate({ label }: { label: string }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
        <Scales className="h-8 w-8" />
      </span>
      <h1 className="serif text-[28px] font-bold leading-tight">
        La fiche de révision flash — {label}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
        Compte à rebours jusqu&apos;au CC, fiche condensée leçon par leçon, pièges classiques à éviter et un quiz
        de 15 questions mélangées. Réservée aux comptes connectés, pour que ta progression et ton score de
        préparation te suivent vraiment.
      </p>
      <div className="mt-6">
        <Button href={connexionHref(pathname ?? "/")} size="lg" full>
          Se connecter pour réviser <Arrow className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

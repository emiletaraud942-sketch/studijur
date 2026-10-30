"use client";

import { usePathname } from "next/navigation";
import { hasAccess, useStudiJur } from "@/lib/state";
import { apresBascule, euros, PRIX_PAR_DEFAUT, PASS_JOURS } from "@/lib/tarifs";
import { Button } from "@/components/ui";
import { Arrow, Scales } from "@/components/icons";

// Une seule barrière pour le hub et toutes ses rubriques (fiche, pièges,
// questions…), plutôt qu'une par page. Avant la bascule (lib/tarifs.ts), la
// révision CC reste ouverte à tout compte connecté comme promis aux promos
// d'octobre ; ensuite, c'est le « mode examen » vendu par le pass. La vue
// d'ensemble (/apercu) reste libre, c'est ce qui donne envie. Un visiteur
// sans compte voit déjà RevisionCCGate dans la page elle-même.
export default function RevisionCCLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, ready, signedInAs } = useStudiJur();

  const verrouille = ready && Boolean(signedInAs) && apresBascule() && !hasAccess(state) && !pathname?.endsWith("/apercu");
  if (!verrouille) return <>{children}</>;

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
        <Scales className="h-8 w-8" />
      </span>
      <h1 className="serif text-[28px] font-bold leading-tight">Le mode examen de StudiJur</h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
        Plan de révision jusqu&apos;au CC, fiches condensées, pièges classiques, dates à connaître et quiz de 15
        questions : tout ce qu&apos;il faut pour la dernière ligne droite, débloqué pendant {PASS_JOURS} jours pour{" "}
        {euros(PRIX_PAR_DEFAUT.pass)}, une seule fois, sans abonnement.
      </p>
      <div className="mt-6 space-y-3">
        <Button href="/abonnement" size="lg" full>Débloquer le pass {PASS_JOURS} jours <Arrow className="h-4 w-4" /></Button>
        <Button href="/" variant="outline" full>Retour à ma séance du jour</Button>
      </div>
    </div>
  );
}

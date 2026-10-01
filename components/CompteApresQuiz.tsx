"use client";

import { usePathname } from "next/navigation";
import { useStudiJur } from "@/lib/state";
import { connexionHref } from "@/lib/nav";
import { Button } from "./ui";
import { Check } from "./icons";

// Mur doux posté au moment où la motivation est la plus haute — juste après
// avoir vu son score — plutôt qu'à l'entrée du quiz : un visiteur qui vient
// de faire un CC1 gratuit et illimité ne doit jamais être bloqué avant d'y
// accéder (c'est precisément ce qui a généré l'audience), seulement invité à
// sauvegarder ce qu'il vient de faire.
export default function CompteApresQuiz() {
  const { ready, signedInAs } = useStudiJur();
  const pathname = usePathname();

  if (!ready || signedInAs) return null;

  return (
    <div data-hue="gold" className="card mx-auto mt-6 max-w-sm p-5 text-left">
      <div className="flex items-start gap-3.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
          <Check className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold">Ne perds pas ce score</h3>
          <p className="mt-1 text-[13px] leading-snug" style={{ color: "var(--muted)" }}>
            Sans compte, ce résultat disparaît en fermant l&apos;onglet. Crée un compte gratuit pour le garder et
            être rappelé avant ton prochain CC.
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Button href={connexionHref(pathname)} size="md" full>Créer mon compte</Button>
      </div>
    </div>
  );
}

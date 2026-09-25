"use client";

import { usePathname } from "next/navigation";
import { useStudiJur, supabaseConfigured } from "@/lib/state";
import { connexionHref } from "@/lib/nav";
import { Button } from "@/components/ui";
import { Arrow } from "@/components/icons";

// Encart discret proposant la création de compte, à placer en bas des pages
// de contenu (bibliothèque, cours, leçon). Jamais un mur : le contenu reste
// entièrement consultable sans compte, ceci n'est qu'une incitation.
export default function AccountCTA() {
  const pathname = usePathname();
  const { signedInAs } = useStudiJur();

  if (!(supabaseConfigured && !signedInAs)) return null;

  return (
    <div className="card mt-6 flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
      <p className="text-[14px] font-semibold leading-snug" style={{ color: "var(--ink)" }}>
        Crée ton compte pour garder ta progression et être prévenu avant ton prochain CC1.
      </p>
      <Button href={connexionHref(pathname ?? "/")} size="md">
        Créer mon compte <Arrow className="h-4 w-4" />
      </Button>
    </div>
  );
}

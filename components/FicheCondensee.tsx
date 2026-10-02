"use client";

import { useStudiJur } from "@/lib/state";
import { FicheLesson } from "./FicheLesson";
import { Check } from "./icons";
import type { Lesson } from "@/lib/types";

// Étape 1 du plan de bataille ("lis la fiche condensée... leçon par leçon")
// n'est jamais testée, donc jamais prise en compte par state.cards/quizMastered
// (le quiz et les définitions notées, eux, le sont) : sans ce marquage
// explicite, la lire ne faisait avancer aucun compteur — voir pctPreparation
// dans app/revision-cc/[matiere]/page.tsx, qui l'inclut désormais.
export function FicheCondensee({ lessons }: { lessons: Lesson[] }) {
  const { state, marquerFicheLue } = useStudiJur();

  if (!lessons.length) return null;

  return (
    <div className="space-y-3">
      {lessons.map((l) => {
        const lue = Boolean(state.fichesLues?.[l.id]);
        return (
          <div key={l.id} data-hue="gold" className="card overflow-hidden">
            <FicheLesson lesson={l} />
            <button onClick={() => marquerFicheLue(l.id, !lue)}
              className="flex w-full items-center justify-center gap-2 border-t p-3 text-[12.5px] font-semibold transition-colors"
              style={{ borderColor: "var(--line)", color: lue ? "var(--good)" : "var(--muted)" }}>
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full"
                style={{ background: lue ? "var(--good-soft)" : "var(--surface-2)" }}>
                {lue && <Check className="h-2.5 w-2.5" />}
              </span>
              {lue ? "Fiche lue" : "Marquer comme lue"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

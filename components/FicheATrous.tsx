"use client";

import { useMemo, useState } from "react";
import { shuffle } from "./QuizEclair";
import { Bar, Button } from "./ui";
import type { Lesson } from "@/lib/types";

// Fiche à trous : sens inverse des mini-flashcards de FicheLesson (qui
// montrent le terme et cachent la définition). Ici la définition est
// visible, le terme à deviner — un rappel actif sur un second indice, avec
// les mêmes définitions déjà écrites, mélangées pour ne pas rejouer l'ordre
// des leçons. Une carte à la fois plutôt qu'une grille de 20 : tout voir
// d'un coup donne le tournis et démotive avant même de commencer.
export function FicheATrous({ lessons }: { lessons: Lesson[] }) {
  const items = useMemo(
    () => shuffle(lessons.flatMap((l) => l.definitions.map((d) => ({ ...d, lessonId: l.id })))),
    [lessons],
  );
  const [i, setI] = useState(0);
  const [revele, setRevele] = useState(false);

  if (!items.length) return null;
  const item = items[i];

  function suivant() {
    setRevele(false);
    setI((n) => (n + 1) % items.length);
  }
  function precedent() {
    setRevele(false);
    setI((n) => (n - 1 + items.length) % items.length);
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
          Quel est le terme ?
        </span>
        <span className="text-[12.5px] font-semibold tabular" style={{ color: "var(--muted)" }}>{i + 1}/{items.length}</span>
      </div>
      <Bar value={i + 1} total={items.length} />
      <button onClick={() => setRevele((v) => !v)}
        className="card mt-3 w-full p-6 text-left text-[15px] leading-relaxed transition-colors"
        style={{ borderColor: revele ? "var(--accent)" : undefined, minHeight: 150 }}>
        <p style={{ color: "var(--ink-2)" }}>{item.text}</p>
        <p className="mt-4 text-[14px] font-bold" style={{ color: revele ? "var(--accent)" : "var(--muted)" }}>
          {revele ? item.term : "Touche pour révéler"}
        </p>
      </button>
      <div className="mt-3 flex gap-2">
        <Button onClick={precedent} variant="outline" full>Précédent</Button>
        <Button onClick={suivant} full>Suivant</Button>
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { shuffle } from "./QuizEclair";
import { Cards } from "./icons";
import type { Lesson } from "@/lib/types";

// Fiche à trous : sens inverse des mini-flashcards de FicheLesson (qui
// montrent le terme et cachent la définition). Ici la définition est
// visible, le terme à deviner — un rappel actif sur un second indice, avec
// les mêmes définitions déjà écrites, mélangées pour ne pas rejouer l'ordre
// des leçons.
export function FicheATrous({ lessons }: { lessons: Lesson[] }) {
  const items = useMemo(
    () => shuffle(lessons.flatMap((l) => l.definitions.map((d) => ({ ...d, lessonId: l.id })))),
    [lessons],
  );

  if (!items.length) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
        <Cards className="h-4 w-4" />Fiche à trous — retrouve le terme
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((item, i) => (
          <TrouCard key={`${item.lessonId}::${item.term}::${i}`} terme={item.term} texte={item.text} />
        ))}
      </div>
    </section>
  );
}

function TrouCard({ terme, texte }: { terme: string; texte: string }) {
  const [revele, setRevele] = useState(false);
  return (
    <button onClick={() => setRevele((v) => !v)}
      className="card p-4 text-left text-[13.5px] leading-relaxed transition-colors"
      style={{ borderColor: revele ? "var(--accent)" : undefined }}>
      <p style={{ color: "var(--ink-2)" }}>{texte}</p>
      <p className="mt-2 text-[12.5px] font-bold" style={{ color: revele ? "var(--accent)" : "var(--muted)" }}>
        {revele ? terme : "Quel est le terme ? (touche pour révéler)"}
      </p>
    </button>
  );
}

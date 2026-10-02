"use client";

import { useMemo, useState } from "react";
import { shuffle } from "./QuizEclair";
import { Bar, Button, Tag } from "./ui";
import type { Lesson } from "@/lib/types";

// Un piège à la fois plutôt qu'une longue liste défilante : chacun mérite
// d'être lu et retenu pour lui-même, pas noyé dans quinze autres d'un coup.
export function PiegesClassiques({ lessons }: { lessons: Lesson[] }) {
  const items = useMemo(
    () => shuffle(lessons.flatMap((l) => (l.exam.pitfalls ?? []).map((texte) => ({ texte, lessonTitle: l.title })))),
    [lessons],
  );
  const [i, setI] = useState(0);

  if (!items.length) return null;
  const item = items[i];

  function suivant() { setI((n) => (n + 1) % items.length); }
  function precedent() { setI((n) => (n - 1 + items.length) % items.length); }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--bad)" }}>Piège classique</span>
        <span className="text-[12.5px] font-semibold tabular" style={{ color: "var(--muted)" }}>{i + 1}/{items.length}</span>
      </div>
      <Bar value={i + 1} total={items.length} />
      <div className="card mt-3 overflow-hidden">
        <div className="p-6" style={{ background: "var(--bad-soft)", minHeight: 150 }}>
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{item.texte}</p>
          <div className="mt-4"><Tag>{item.lessonTitle}</Tag></div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={precedent} variant="outline" full>Précédent</Button>
        <Button onClick={suivant} full>Suivant</Button>
      </div>
    </section>
  );
}

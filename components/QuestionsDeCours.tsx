"use client";

import { useMemo, useState } from "react";
import { shuffle } from "./QuizEclair";
import { Bar, Button, Tag } from "./ui";
import type { Lesson } from "@/lib/types";

const NB_QUESTIONS = 3;

// Fixé une fois par montage (useMemo) plutôt que recalculé à chaque rendu,
// sinon les questions changeraient à chaque frappe ou mise à jour d'état.
// Une à la fois, comme les pièges et la fiche à trous : trois questions
// restent courtes, mais autant garder la même mécanique partout.
export function QuestionsDeCours({ lessons }: { lessons: Lesson[] }) {
  const items = useMemo(() => shuffle(lessons.filter((l) => l.exam)).slice(0, NB_QUESTIONS), [lessons]);
  const [i, setI] = useState(0);
  const [revele, setRevele] = useState(false);

  if (!items.length) return null;
  const lesson = items[i];

  function suivant() { setRevele(false); setI((n) => (n + 1) % items.length); }
  function precedent() { setRevele(false); setI((n) => (n - 1 + items.length) % items.length); }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>Question de cours</span>
        <span className="text-[12.5px] font-semibold tabular" style={{ color: "var(--muted)" }}>{i + 1}/{items.length}</span>
      </div>
      <Bar value={i + 1} total={items.length} />
      <div className="card mt-3 p-5">
        <Tag tone="hue">{lesson.title}</Tag>
        <p className="mt-2 text-[15px] font-semibold leading-snug">{lesson.exam.question}</p>
        <button onClick={() => setRevele((v) => !v)}
          className="mt-3 rounded-xl px-3.5 py-2 text-[13px] font-semibold active:scale-[0.98]"
          style={{ background: revele ? "var(--accent)" : "var(--accent-soft)", color: revele ? "var(--accent-ink)" : "var(--accent-strong)" }}>
          {revele ? "Masquer le plan attendu" : "Voir le plan attendu"}
        </button>
        {revele && (
          <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: "var(--line)" }}>
            <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{lesson.exam.concise}</p>
            {lesson.exam.plan.map((partie, idx) => (
              <p key={idx} className="text-[12.5px] font-semibold" style={{ color: "var(--muted)" }}>{partie.title}</p>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={precedent} variant="outline" full>Précédent</Button>
        <Button onClick={suivant} full>Suivant</Button>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Button, Tag } from "./ui";
import { Arrow, Check, Cross } from "./icons";
import type { Lesson, QuizItem } from "@/lib/types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizEclair({
  lessons, onFinish, onBack,
}: {
  lessons: Lesson[];
  onFinish: (good: number, total: number) => void;
  onBack: () => void;
}) {
  const [pool] = useState<(QuizItem & { lessonTitle: string })[]>(
    () => shuffle(lessons.flatMap((l) => l.quiz.map((q) => ({ ...q, lessonTitle: l.title })))).slice(0, 30),
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [good, setGood] = useState(0);

  if (!pool.length) {
    return (
      <div className="py-16 text-center">
        <p style={{ color: "var(--muted)" }}>Pas assez de questions dans les matières choisies.</p>
        <div className="mt-4"><Button onClick={onBack} variant="outline">Retour</Button></div>
      </div>
    );
  }

  const q = pool[i];
  const last = i === pool.length - 1;
  const correct = picked === q.answer;

  function choose(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answer) setGood((n) => n + 1);
  }

  function next() {
    if (last) { onFinish(good + (correct ? 1 : 0), pool.length); return; }
    setI((n) => n + 1);
    setPicked(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[12.5px]" style={{ color: "var(--muted)" }}>
        <button onClick={onBack} className="font-semibold">Abandonner</button>
        <span className="tabular">Question {i + 1} sur {pool.length}</span>
        <span className="tabular">{good} correctes</span>
      </div>

      <div key={i} className="card pop p-5">
        <div className="mb-2"><Tag tone="hue">{q.lessonTitle}</Tag></div>
        <p className="text-[16.5px] font-semibold leading-snug">{q.q}</p>
        <div className="mt-4 space-y-2.5">
          {q.choices.map((c, idx) => {
            const isAnswer = idx === q.answer;
            const isPicked = idx === picked;
            let style: React.CSSProperties = { background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" };
            if (picked !== null && isAnswer) style = { background: "var(--good-soft)", borderColor: "var(--good)", color: "var(--good)" };
            else if (isPicked) style = { background: "var(--bad-soft)", borderColor: "var(--bad)", color: "var(--bad)" };
            else if (picked !== null) style = { ...style, opacity: 0.55 };
            return (
              <button key={idx} onClick={() => choose(idx)} disabled={picked !== null}
                className="flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] font-medium transition-all active:scale-[0.99]"
                style={style}>
                <span>{c}</span>
                {picked !== null && isAnswer && <Check className="h-4 w-4 shrink-0" />}
                {picked !== null && isPicked && !isAnswer && <Cross className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {picked !== null && (
        <div className="rise space-y-3">
          <div className="card p-4" style={{ background: correct ? "var(--good-soft)" : "var(--bad-soft)", borderColor: "transparent" }}>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{q.why}</p>
          </div>
          <Button onClick={next} size="lg" full>{last ? "Voir mon score" : "Question suivante"} <Arrow className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

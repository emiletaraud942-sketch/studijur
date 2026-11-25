"use client";

import { useMemo, useState } from "react";
import { Button, Tag } from "./ui";
import { Arrow, Check, Cross } from "./icons";
import { useStudiJur } from "@/lib/state";
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
  lessons, onFinish, onBack, taille = 30,
}: {
  lessons: Lesson[];
  onFinish: (good: number, total: number) => void;
  onBack: () => void;
  // Nombre de questions tirées par tentative — 30 par défaut (CC1 d'orga,
  // révision intensive), réduit à 15 pour une fiche de révision flash par
  // matière (voir app/revision-cc), plus rapide à faire d'une traite.
  taille?: number;
}) {
  const { state, markQuizMastered } = useStudiJur();
  const [pool] = useState<(QuizItem & { lessonTitle: string; id: string })[]>(() => {
    const mastered = state.quizMastered ?? {};
    const toutes = lessons.flatMap((l) => l.quiz.map((q, idx) => ({ ...q, lessonTitle: l.title, id: `${l.id}::quiz${idx}` })));
    // Une question déjà réussie ne revient que si les questions encore
    // inconnues ou ratées ne suffisent pas à remplir le tirage — jamais avant.
    const aFaire = shuffle(toutes.filter((q) => !mastered[q.id]));
    const acquises = shuffle(toutes.filter((q) => mastered[q.id]));
    return [...aFaire, ...acquises].slice(0, taille);
  });
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
  // La bonne réponse était en position 2 dans ~70 % des questions du corpus
  // (habitude d'écriture, jamais corrigée) — un élève un peu attentif finit
  // par deviner sans lire. Mélangé une fois par question (pas à chaque
  // rendu, sinon l'ordre bougerait sous les yeux en recliquant) ; `choose`
  // et l'affichage continuent de raisonner sur l'index d'origine, donc le
  // score n'est pas affecté.
  const ordre = useMemo(() => shuffle(q.choices.map((_, idx) => idx)), [q]);

  function choose(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answer) {
      setGood((n) => n + 1);
      markQuizMastered(q.id);
    }
  }

  function next() {
    if (last) { onFinish(good + (correct ? 1 : 0), pool.length); return; }
    setI((n) => n + 1);
    setPicked(null);
  }

  const pct = Math.round((i / pool.length) * 100);
  const LETTERS = ["A", "B", "C", "D"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onBack} className="text-[12.5px] font-semibold" style={{ color: "var(--muted)" }}>Abandonner</button>
        <span className="text-[12.5px] tabular" style={{ color: "var(--muted)" }}>Question {i + 1} sur {pool.length}</span>
        <span className="flex items-center gap-1 text-[13px] font-bold tabular" style={{ color: "var(--good)" }}>
          {good} <Check className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--accent)" }} />
      </div>

      <div key={i} className="card pop p-6">
        <div className="mb-3"><Tag tone="hue">{q.lessonTitle}</Tag></div>
        <p className="text-[19px] font-bold leading-snug">{q.q}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {ordre.map((idx) => {
            const c = q.choices[idx];
            const isAnswer = idx === q.answer;
            const isPicked = idx === picked;
            let style: React.CSSProperties = { background: "var(--surface)", borderColor: "var(--line-strong)", color: "var(--ink)" };
            let badgeStyle: React.CSSProperties = { background: "var(--surface-2)", color: "var(--ink-2)" };
            if (picked !== null && isAnswer) {
              style = { background: "var(--good-soft)", borderColor: "var(--good)", color: "var(--good)" };
              badgeStyle = { background: "var(--good)", color: "#fff" };
            } else if (isPicked) {
              style = { background: "var(--bad-soft)", borderColor: "var(--bad)", color: "var(--bad)" };
              badgeStyle = { background: "var(--bad)", color: "#fff" };
            } else if (picked !== null) {
              style = { ...style, opacity: 0.55 };
            }
            return (
              <button key={idx} onClick={() => choose(idx)} disabled={picked !== null}
                className="flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[14.5px] font-semibold transition-all active:scale-[0.99]"
                style={style}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12.5px] font-bold tabular" style={badgeStyle}>
                  {LETTERS[idx]}
                </span>
                <span className="flex-1">{c}</span>
                {picked !== null && isAnswer && <Check className="h-4 w-4 shrink-0" />}
                {picked !== null && isPicked && !isAnswer && <Cross className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {picked !== null && (
        <div className="rise space-y-3">
          <div className="card p-4" style={{ background: "var(--surface-2)", borderColor: "transparent" }}>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{q.why}</p>
          </div>
          <Button onClick={next} size="lg" full>{last ? "Voir mon score" : "Question suivante"} <Arrow className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

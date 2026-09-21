"use client";

import { useMemo, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { allCourses } from "@/lib/corpus";
import { Button, SectionTitle, Tag } from "@/components/ui";
import { inlineMarkup } from "@/lib/format";
import { Arrow, Check, Cross, Flame } from "@/components/icons";
import type { Course, Definition, Lesson, QuizItem } from "@/lib/types";

type Mode = "choix" | "fiche" | "quiz" | "resultat";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RevisionIntensivePage() {
  const { state, ready } = useStudiJur();
  const courses = useMemo(() => allCourses(state.customCourses), [state.customCourses]);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [mode, setMode] = useState<Mode>("choix");
  const [score, setScore] = useState({ good: 0, total: 0 });

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  if (state.profile.plan !== "active") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="serif text-[24px] font-bold">Réservé aux abonnés</h1>
        <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>
          La fiche de dernière minute et le quiz éclair débloquent avec l&apos;abonnement.
        </p>
        <div className="mt-6"><Button href="/abonnement" size="lg">Voir les formules</Button></div>
      </div>
    );
  }

  const active = selected ?? (state.profile.activeCourses.length ? state.profile.activeCourses : courses.map((c) => c.id));
  const picked = courses.filter((c) => active.includes(c.id));
  const lessons = picked.flatMap((c) => c.lessons);

  function toggle(id: string) {
    setSelected((cur) => {
      const base = cur ?? active;
      return base.includes(id) ? base.filter((c) => c !== id) : [...base, id];
    });
  }

  if (mode === "choix") {
    return (
      <div className="space-y-7">
        <div>
          <h1 className="serif text-[28px] font-bold tracking-tight">Révision intensive</h1>
          <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
            Avant un partiel : une fiche condensée de tout ce qu&apos;il faut retenir, puis un quiz éclair qui
            mélange les questions de toutes les matières choisies.
          </p>
        </div>

        <section className="card p-5">
          <SectionTitle kicker="Périmètre" title="Quelles matières réviser ?" />
          <div className="space-y-2">
            {courses.map((c) => (
              <label key={c.id} data-hue={c.hue}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3"
                style={{ borderColor: active.includes(c.id) ? "var(--h)" : "var(--line)", background: active.includes(c.id) ? "var(--h-soft)" : "transparent" }}>
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-semibold">{c.title}</span>
                  <span className="block text-[12.5px]" style={{ color: "var(--muted)" }}>{c.lessons.length} leçons</span>
                </span>
                <input type="checkbox" checked={active.includes(c.id)} onChange={() => toggle(c.id)} className="sr-only" />
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
                  style={active.includes(c.id) ? { background: "var(--h)", color: "var(--accent-ink)" } : { border: "1.5px solid var(--line-strong)" }}>
                  {active.includes(c.id) && <Check className="h-3.5 w-3.5" />}
                </span>
              </label>
            ))}
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={() => setMode("fiche")} size="lg" full disabled={!lessons.length}>
            Fiche de dernière minute <Arrow className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setScore({ good: 0, total: 0 }); setMode("quiz"); }} variant="soft" size="lg" full disabled={!lessons.length}>
            Quiz éclair ({Math.min(30, lessons.reduce((n, l) => n + l.quiz.length, 0))} questions) <Arrow className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "fiche") {
    return <Fiche picked={picked} onBack={() => setMode("choix")} />;
  }

  if (mode === "quiz") {
    return (
      <QuizEclair
        lessons={lessons}
        onFinish={(good, total) => { setScore({ good, total }); setMode("resultat"); }}
        onBack={() => setMode("choix")}
      />
    );
  }

  const pct = score.total ? Math.round((score.good / score.total) * 100) : 0;
  return (
    <div className="pop py-10 text-center">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
        <Flame className="h-10 w-10" />
      </div>
      <h2 className="serif text-[27px] font-bold">Quiz éclair terminé</h2>
      <p className="mt-1.5 text-[15px]" style={{ color: "var(--muted)" }}>
        {score.good}/{score.total} correctes ({pct}%) — {pct >= 80 ? "tu es prêt(e)." : pct >= 50 ? "encore un tour avant l'épreuve." : "reprends la fiche avant de continuer."}
      </p>
      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
        <Button onClick={() => { setScore({ good: 0, total: 0 }); setMode("quiz"); }} size="lg" full>Refaire un tour</Button>
        <Button onClick={() => setMode("choix")} variant="outline" size="lg" full>Changer de matières</Button>
      </div>
    </div>
  );
}

function Fiche({ picked, onBack }: { picked: Course[]; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="serif text-[24px] font-bold tracking-tight">Fiche de dernière minute</h1>
        <Button onClick={onBack} variant="outline" size="sm">Changer de matières</Button>
      </div>
      {picked.map((c) => (
        <section key={c.id} data-hue={c.hue} className="card overflow-hidden">
          <div className="p-5" style={{ background: "var(--h-soft)" }}>
            <Tag tone="hue">{c.short}</Tag>
            <h2 className="serif mt-2 text-[19px] font-bold">{c.title}</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--line)" }}>
            {c.lessons.map((l) => <FicheLesson key={l.id} lesson={l} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function FicheLesson({ lesson }: { lesson: Lesson }) {
  return (
    <div className="p-5">
      <h3 className="text-[15px] font-bold leading-snug">{lesson.title}</h3>
      <ul className="mt-2 space-y-1.5">
        {lesson.keyPoints.map((k, i) => (
          <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--h)" }} />
            <span dangerouslySetInnerHTML={{ __html: inlineMarkup(k) }} />
          </li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {lesson.definitions.map((d) => (
          <MiniFlashcard key={d.term} def={d} />
        ))}
      </div>
    </div>
  );
}

function MiniFlashcard({ def }: { def: Definition }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen((o) => !o)}
      className="rounded-xl border p-3 text-left text-[12.5px] leading-snug transition-colors"
      style={{ borderColor: open ? "var(--h)" : "var(--line)", background: open ? "var(--h-soft)" : "transparent" }}>
      <span className="block font-bold" style={{ color: "var(--ink)" }}>{def.term}</span>
      {open ? (
        <span className="mt-1 block" style={{ color: "var(--ink-2)" }}>{def.text}</span>
      ) : (
        <span className="mt-1 block italic" style={{ color: "var(--muted)" }}>Touche pour révéler</span>
      )}
    </button>
  );
}

function QuizEclair({
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

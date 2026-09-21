"use client";

import { useState } from "react";
import Link from "next/link";
import { findCourse } from "@/lib/corpus";
import { Button } from "@/components/ui";
import { Arrow, Flame, Target } from "@/components/icons";
import QuizEclair from "@/components/QuizEclair";

type Mode = "intro" | "quiz" | "resultat";

export default function EntrainementOrgaPage() {
  const course = findCourse("organisation-juridictionnelle");
  const lessons = course?.lessons ?? [];
  const totalQuestions = lessons.reduce((n, l) => n + l.quiz.length, 0);
  const [mode, setMode] = useState<Mode>("intro");
  const [score, setScore] = useState({ good: 0, total: 0 });

  if (mode === "quiz") {
    return (
      <QuizEclair
        lessons={lessons}
        onFinish={(good, total) => { setScore({ good, total }); setMode("resultat"); }}
        onBack={() => setMode("intro")}
      />
    );
  }

  if (mode === "resultat") {
    const pct = score.total ? Math.round((score.good / score.total) * 100) : 0;
    return (
      <div className="pop py-10 text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
          <Flame className="h-10 w-10" />
        </div>
        <h2 className="serif text-[27px] font-bold">QCM terminé</h2>
        <p className="mt-1.5 text-[15px]" style={{ color: "var(--muted)" }}>
          {score.good}/{score.total} correctes ({pct}%) — {pct >= 80 ? "tu es prêt(e)." : pct >= 50 ? "encore un tour avant l'intero." : "reprends les leçons avant de continuer."}
        </p>
        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
          <Button onClick={() => setMode("quiz")} size="lg" full>Refaire un tour</Button>
          <Button href="/entrainement" variant="outline" size="lg" full>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/entrainement" className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>← Entraînement intero</Link>
        <h1 className="serif mt-1.5 text-[28px] font-bold tracking-tight">Organisation juridictionnelle</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Toutes les questions du programme, mélangées — comme à l&apos;intero.
        </p>
      </div>

      <section data-hue="blue" className="card overflow-hidden">
        <div className="h-1" style={{ background: "var(--h)" }} />
        <div className="p-5 text-center sm:p-7">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
            <Target className="h-7 w-7" />
          </span>
          <p className="text-[15px]" style={{ color: "var(--ink-2)" }}>
            {Math.min(30, totalQuestions)} questions tirées des {lessons.length} leçons du programme.
          </p>
          <div className="mt-5">
            <Button onClick={() => setMode("quiz")} size="lg" full disabled={!totalQuestions}>
              Commencer le QCM <Arrow className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

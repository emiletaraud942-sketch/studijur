"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStudiJur } from "@/lib/state";
import { findLesson } from "@/lib/corpus";
import { REVISION_CC } from "@/lib/revision-cc-config";
import { Button, Tag } from "@/components/ui";
import { Arrow, Clock, Cross, Flame, Sitemap } from "@/components/icons";
import QuizEclair, { shuffle } from "@/components/QuizEclair";
import { FicheLesson } from "@/components/FicheLesson";
import RevisionCCGate from "@/components/RevisionCCGate";
import type { Lesson } from "@/lib/types";

type Mode = "fiche" | "quiz" | "resultat";
const TAILLE_QUIZ = 15;
const NB_QUESTIONS_DE_COURS = 3;

export default function RevisionCCPage() {
  const { matiere } = useParams<{ matiere: string }>();
  const config = REVISION_CC[matiere];
  const { state, ready, signedInAs } = useStudiJur();
  const [mode, setMode] = useState<Mode>("fiche");
  const [score, setScore] = useState({ good: 0, total: 0 });

  const lessons = useMemo(
    () => (config ? (config.lessonSlugs.map((id) => findLesson(id)).filter(Boolean) as Lesson[]) : []),
    [config],
  );
  // Fixé une fois par montage plutôt que recalculé à chaque rendu : sinon les
  // 3 questions de cours changeraient à chaque frappe ou mise à jour d'état.
  const questionsDeCours = useMemo(
    () => shuffle(lessons.filter((l) => l.exam)).slice(0, NB_QUESTIONS_DE_COURS),
    [lessons],
  );

  if (!config) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="serif text-[22px] font-bold">Matière introuvable</h1>
        <div className="mt-5"><Button href="/">Retour à l&apos;accueil</Button></div>
      </div>
    );
  }

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  if (!signedInAs) return <RevisionCCGate label={config.label} />;

  if (mode === "quiz") {
    return (
      <QuizEclair
        lessons={lessons}
        taille={TAILLE_QUIZ}
        onFinish={(good, total) => { setScore({ good, total }); setMode("resultat"); }}
        onBack={() => setMode("fiche")}
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
        <h2 className="serif text-[27px] font-bold">Quiz terminé</h2>
        <p className="mt-1.5 text-[15px]" style={{ color: "var(--muted)" }}>
          {score.good}/{score.total} correctes ({pct}%) — {pct >= 80 ? "tu es prêt(e)." : pct >= 50 ? "encore un tour avant le CC." : "reprends la fiche avant de continuer."}
        </p>
        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
          <Button onClick={() => setMode("quiz")} size="lg" full>Refaire un tour</Button>
          <Button onClick={() => setMode("fiche")} variant="outline" size="lg" full>Retour à la fiche</Button>
        </div>
      </div>
    );
  }

  const pieges = lessons.flatMap((l) => (l.exam.pitfalls ?? []).map((texte) => ({ texte, lessonTitle: l.title })));
  const lessonsAvecSchema = lessons.filter((l) => l.schema);

  const quizIds = lessons.flatMap((l) => l.quiz.map((_, idx) => `${l.id}::quiz${idx}`));
  const defKeys = lessons.flatMap((l) => l.definitions.map((d) => `${l.id}::${d.term}`));
  const quizAcquis = quizIds.filter((id) => state.quizMastered?.[id]).length;
  const defAcquises = defKeys.filter((k) => (state.cards[k]?.box ?? 0) >= 4).length;
  const totalItems = quizIds.length + defKeys.length;
  const pctPreparation = totalItems ? Math.round(((quizAcquis + defAcquises) / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>← Accueil</Link>
        <h1 className="serif mt-1.5 text-[28px] font-bold tracking-tight">Révision flash — {config.label}</h1>
      </div>

      <CompteARebours ccDate={config.ccDate} pctPreparation={pctPreparation} />

      {lessonsAvecSchema.length > 0 && (
        <section>
          <SousTitre icon={<Sitemap className="h-4 w-4" />} texte="Vue d'ensemble" />
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {lessonsAvecSchema.map((l) => (
              <div key={l.id} className="card w-[280px] shrink-0 p-4">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--h)" }}>{l.schema!.titre}</h3>
                <div className="mx-auto mt-3 max-w-[220px] [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: l.schema!.svg }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {pieges.length > 0 && (
        <section className="card overflow-hidden">
          <div className="p-5" style={{ background: "var(--bad-soft)" }}>
            <SousTitre icon={<Cross className="h-4 w-4" />} texte="Pièges classiques" couleur="var(--bad)" />
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
            {pieges.map((p, i) => (
              <li key={i} className="p-4">
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{p.texte}</p>
                <Tag>{p.lessonTitle}</Tag>
              </li>
            ))}
          </ul>
        </section>
      )}

      {questionsDeCours.length > 0 && (
        <section>
          <SousTitre texte="Questions de cours à te poser" />
          <div className="space-y-3">
            {questionsDeCours.map((l) => <QuestionDeCours key={l.id} lesson={l} />)}
          </div>
        </section>
      )}

      <section>
        <SousTitre texte="Fiche condensée" />
        <div className="space-y-3">
          {lessons.map((l) => (
            <div key={l.id} data-hue="gold" className="card overflow-hidden">
              <FicheLesson lesson={l} />
            </div>
          ))}
        </div>
      </section>

      <Button onClick={() => setMode("quiz")} size="lg" full disabled={!lessons.some((l) => l.quiz.length)}>
        Lancer le quiz ({Math.min(TAILLE_QUIZ, lessons.reduce((n, l) => n + l.quiz.length, 0))} questions) <Arrow className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SousTitre({ icon, texte, couleur }: { icon?: React.ReactNode; texte: string; couleur?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: couleur ?? "var(--muted)" }}>
      {icon}{texte}
    </div>
  );
}

function CompteARebours({ ccDate, pctPreparation }: { ccDate: string | null; pctPreparation: number }) {
  const jours = ccDate ? Math.ceil((new Date(`${ccDate}T00:00:00+02:00`).getTime() - Date.now()) / 86400000) : null;
  return (
    <section className="card overflow-hidden">
      <div className="h-1" style={{ background: "var(--bad)" }} />
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
            <Clock className="h-5 w-5" />
          </span>
          <div>
            {jours === null ? (
              <p className="text-[14.5px] font-semibold">Date du CC pas encore communiquée</p>
            ) : jours < 0 ? (
              <p className="text-[14.5px] font-semibold" style={{ color: "var(--muted)" }}>Le CC est passé</p>
            ) : (
              <p className="text-[18px] font-bold" style={{ color: "var(--bad)" }}>
                {jours === 0 ? "C'est aujourd'hui" : `${jours} jour${jours > 1 ? "s" : ""} avant le CC`}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-bold tabular">{pctPreparation}%</p>
          <p className="text-[11.5px]" style={{ color: "var(--muted)" }}>de préparation</p>
        </div>
      </div>
    </section>
  );
}

function QuestionDeCours({ lesson }: { lesson: Lesson }) {
  const [revele, setRevele] = useState(false);
  return (
    <div className="card p-4">
      <Tag tone="hue">{lesson.title}</Tag>
      <p className="mt-2 text-[14.5px] font-semibold leading-snug">{lesson.exam.question}</p>
      <button onClick={() => setRevele((v) => !v)}
        className="mt-3 rounded-xl px-3.5 py-2 text-[13px] font-semibold active:scale-[0.98]"
        style={{ background: revele ? "var(--accent)" : "var(--accent-soft)", color: revele ? "var(--accent-ink)" : "var(--accent-strong)" }}>
        {revele ? "Masquer le plan attendu" : "Voir le plan attendu"}
      </button>
      {revele && (
        <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: "var(--line)" }}>
          <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{lesson.exam.concise}</p>
          {lesson.exam.plan.map((partie, i) => (
            <p key={i} className="text-[12.5px] font-semibold" style={{ color: "var(--muted)" }}>{partie.title}</p>
          ))}
        </div>
      )}
    </div>
  );
}

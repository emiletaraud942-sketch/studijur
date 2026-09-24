"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useStudiJur, hasAccess, trialLessonCapReached, TRIAL_LESSON_LIMIT,
  anonymousLessonCapReached, supabaseConfigured,
} from "@/lib/state";
import { findLesson, findCourse, neighbours, corpusStats } from "@/lib/corpus";
import { Button, Prose, Tag } from "@/components/ui";
import { inlineMarkup } from "@/lib/format";
import { authFetchHeaders } from "@/lib/supabase";
import { connexionHref } from "@/lib/nav";
import { Arrow, Cards, Check, Cross, Flame, Quill, Target } from "@/components/icons";
import type { EssayFeedback, StepName } from "@/lib/types";

const STEPS: { key: StepName; label: string; Icon: typeof Quill }[] = [
  { key: "cours", label: "Le cours", Icon: Quill },
  { key: "definitions", label: "Définitions", Icon: Cards },
  { key: "question", label: "Question", Icon: Target },
  { key: "quiz", label: "Quiz", Icon: Check },
];

export default function LessonPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>}>
      <LessonPageInner />
    </Suspense>
  );
}

function LessonPageInner() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, ready, signedInAs, completeStep, saveDraft, recordQuiz, gradeDefinition } = useStudiJur();
  // Retour de connexion depuis la correction IA (voir Correction ci-dessous) :
  // on rouvre directement l'étape "Question" plutôt que de repartir du cours.
  const [step, setStep] = useState(() => (searchParams.get("step") === "question" ? 2 : 0));
  const autocorrect = searchParams.get("autocorrect") === "1";

  const lesson = useMemo(
    () => (ready ? findLesson(params.id, state.customCourses) : undefined),
    [params.id, ready, state.customCourses],
  );
  const course = lesson ? findCourse(lesson.courseId, state.customCourses) : undefined;
  const nav = useMemo(() => neighbours(params.id, state.customCourses), [params.id, state.customCourses]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  if (!lesson || !course) {
    return (
      <div className="py-24 text-center">
        <p className="text-[15px]" style={{ color: "var(--muted)" }}>Cette leçon n&apos;existe pas.</p>
        <div className="mt-4"><Button href="/" variant="outline">Retour à l&apos;accueil</Button></div>
      </div>
    );
  }

  // Sans compte, un visiteur peut terminer une leçon complète en libre accès
  // pour se faire une idée du produit ; au-delà, on lui demande de se
  // connecter (gratuit) plutôt que de le renvoyer vers l'abonnement — sans
  // Supabase configuré (dev local), personne n'est jamais bloqué ici.
  if (supabaseConfigured && !signedInAs) {
    if (anonymousLessonCapReached(state, lesson.id)) {
      return (
        <div className="mx-auto max-w-md py-20 text-center">
          <h1 className="serif text-[24px] font-bold">Connecte-toi pour continuer à explorer</h1>
          <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>
            C&apos;est gratuit : un simple email, sans mot de passe. Ta première leçon reste acquise, et un
            compte te permet de continuer à découvrir le corpus.
          </p>
          <div className="mt-6"><Button href={connexionHref(pathname)} size="lg">Se connecter</Button></div>
        </div>
      );
    }
  } else {
    if (!hasAccess(state)) {
      return (
        <div className="mx-auto max-w-md py-20 text-center">
          <h1 className="serif text-[24px] font-bold">Ton essai gratuit est terminé</h1>
          <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>
            Abonne-toi pour continuer les séances quotidiennes. Ta progression et ta série sont conservées.
          </p>
          <div className="mt-6"><Button href="/abonnement" size="lg">Voir les formules</Button></div>
        </div>
      );
    }

    if (trialLessonCapReached(state, lesson.id)) {
      return (
        <div className="mx-auto max-w-md py-20 text-center">
          <h1 className="serif text-[24px] font-bold">Tes {TRIAL_LESSON_LIMIT} leçons d&apos;essai sont faites</h1>
          <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>
            Abonne-toi pour débloquer les {corpusStats(state.customCourses).lessons} leçons du corpus et continuer
            tes séances quotidiennes. Ta progression et ta série sont conservées.
          </p>
          <div className="mt-6"><Button href="/abonnement" size="lg">Voir les formules</Button></div>
        </div>
      );
    }
  }

  const done = step >= STEPS.length;

  return (
    <div data-hue={course.hue} className="pb-6">
      <header className="sticky top-0 z-30 -mx-4 px-4 pt-3 pb-3"
        style={{ background: "color-mix(in srgb, var(--paper) 90%, transparent)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Quitter la séance"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
            <Cross className="h-4 w-4" />
          </Link>
          <div className="flex flex-1 gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s.key} className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
                <div className="h-full rounded-full"
                  style={{ width: i < step ? "100%" : i === step ? "45%" : "0%", background: "var(--h)", transition: "width 0.45s cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
            ))}
          </div>
          <span className="shrink-0 text-[12px] font-semibold tabular" style={{ color: "var(--muted)" }}>
            {Math.min(step + 1, STEPS.length)}/{STEPS.length}
          </span>
        </div>
      </header>

      <div className="mb-5 mt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Tag tone="hue">{course.short}</Tag>
          <Tag>Leçon {lesson.order}</Tag>
        </div>
        <h1 className="serif text-[26px] font-bold leading-tight sm:text-[31px]">{lesson.title}</h1>
      </div>

      {!done && (
        <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>
          {(() => { const S = STEPS[step].Icon; return <S className="h-4 w-4" />; })()}
          {STEPS[step].label}
        </div>
      )}

      {step === 0 && <CourseStep lesson={lesson} onNext={() => { completeStep(lesson.id, "cours"); setStep(1); }} />}
      {step === 1 && (
        <DefinitionsStep
          lesson={lesson}
          onGrade={(term, knew) => gradeDefinition(lesson.id, term, knew)}
          onNext={() => { completeStep(lesson.id, "definitions"); setStep(2); }}
        />
      )}
      {step === 2 && (
        <QuestionStep
          lesson={lesson}
          draft={state.lessons[lesson.id]?.draft ?? ""}
          onDraft={(d) => saveDraft(lesson.id, d)}
          onNext={() => { completeStep(lesson.id, "question"); setStep(3); }}
          autocorrect={autocorrect}
        />
      )}
      {step === 3 && (
        <QuizStep
          lesson={lesson}
          onFinish={(score) => { recordQuiz(lesson.id, score, lesson.quiz.length); completeStep(lesson.id, "quiz"); setStep(4); }}
        />
      )}
      {done && (
        <DoneStep
          streak={state.streak.current}
          score={state.lessons[lesson.id]?.quizScore ?? 0}
          total={lesson.quiz.length}
          nextId={nav.next?.id}
          onReplay={() => setStep(0)}
          onHome={() => router.push("/")}
        />
      )}
    </div>
  );
}

function CourseStep({ lesson, onNext }: { lesson: ReturnType<typeof findLesson> & object; onNext: () => void }) {
  const l = lesson as NonNullable<ReturnType<typeof findLesson>>;
  return (
    <div className="rise space-y-5">
      <article className="card p-5 sm:p-6"><Prose paragraphs={l.brief} /></article>
      <section className="card p-5" style={{ background: "var(--h-soft)", borderColor: "transparent" }}>
        <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>
          À retenir absolument
        </h3>
        <ul className="space-y-2.5">
          {l.keyPoints.map((k, i) => (
            <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed" style={{ color: "var(--ink)" }}>
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--h)" }} />
              <span dangerouslySetInnerHTML={{ __html: inlineMarkup(k) }} />
            </li>
          ))}
        </ul>
      </section>
      <Button onClick={onNext} size="lg" full>Passer aux définitions <Arrow className="h-4 w-4" /></Button>
    </div>
  );
}

function DefinitionsStep({
  lesson, onGrade, onNext,
}: {
  lesson: NonNullable<ReturnType<typeof findLesson>>;
  onGrade: (term: string, knew: boolean) => void;
  onNext: () => void;
}) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const d = lesson.definitions[i];
  const last = i === lesson.definitions.length - 1;

  function grade(knew: boolean) {
    onGrade(d.term, knew);
    if (knew) setKnown((n) => n + 1);
    if (last) { onNext(); return; }
    setI((n) => n + 1);
    setRevealed(false);
  }

  return (
    <div className="rise space-y-4">
      <div className="flex items-center justify-between text-[12.5px]" style={{ color: "var(--muted)" }}>
        <span className="tabular">Carte {i + 1} sur {lesson.definitions.length}</span>
        <span className="tabular">{known} / {lesson.definitions.length} sues</span>
      </div>

      <div key={d.term} className="card pop min-h-[230px] p-6">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--h)" }}>Définition</div>
        <h3 className="serif text-[23px] font-bold leading-snug">{d.term}</h3>
        {revealed ? (
          <div className="mt-4 rise">
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{d.text}</p>
            {d.source && (
              <p className="mt-3 border-l-2 pl-3 text-[13px] italic" style={{ borderColor: "var(--gold)", color: "var(--muted)" }}>
                {d.source}
              </p>
            )}
          </div>
        ) : (
          <button onClick={() => setRevealed(true)}
            className="mt-5 w-full rounded-xl border border-dashed py-8 text-[14px] font-semibold transition-colors"
            style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}>
            Récite la définition, puis touche pour vérifier
          </button>
        )}
      </div>

      {revealed && (
        <div className="rise grid grid-cols-2 gap-3">
          <button onClick={() => grade(false)}
            className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold active:scale-[0.98]"
            style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
            <Cross className="h-4 w-4" /> À revoir
          </button>
          <button onClick={() => grade(true)}
            className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold active:scale-[0.98]"
            style={{ background: "var(--good-soft)", color: "var(--good)" }}>
            <Check className="h-4 w-4" /> Je savais
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionStep({
  lesson, draft, onDraft, onNext, autocorrect,
}: {
  lesson: NonNullable<ReturnType<typeof findLesson>>;
  draft: string;
  onDraft: (d: string) => void;
  onNext: () => void;
  autocorrect: boolean;
}) {
  const [showConcise, setShowConcise] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const e = lesson.exam;
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  return (
    <div className="rise space-y-4">
      <section className="card overflow-hidden">
        <div className="px-5 pt-5 pb-4" style={{ background: "var(--gold-soft)" }}>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--gold)" }}>
            {e.kind}
          </div>
          <p className="serif text-[19px] font-semibold leading-snug" style={{ color: "var(--ink)" }}>{e.question}</p>
        </div>
        <div className="p-5">
          <label htmlFor="brouillon" className="mb-2 block text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
            Ton brouillon — jette tes idées et ton plan avant de regarder la correction
          </label>
          <textarea id="brouillon" value={draft} onChange={(e2) => onDraft(e2.target.value)} rows={6}
            placeholder="I. …&#10;  A. …&#10;  B. …&#10;II. …"
            className="w-full resize-y rounded-xl border p-3 text-[14.5px] leading-relaxed outline-none focus:ring-2"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />
        </div>
      </section>

      <Correction lesson={lesson} draft={draft} wordCount={wordCount} autocorrect={autocorrect} />

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => setShowConcise((v) => !v)}
          className="flex items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-[14px] font-semibold active:scale-[0.99]"
          style={{ background: showConcise ? "var(--h)" : "var(--h-soft)", color: showConcise ? "var(--accent-ink)" : "var(--h)" }}>
          Réponse concise <Arrow className="h-4 w-4" />
        </button>
        <button onClick={() => setShowPlan((v) => !v)}
          className="flex items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-[14px] font-semibold active:scale-[0.99]"
          style={{ background: showPlan ? "var(--h)" : "var(--h-soft)", color: showPlan ? "var(--accent-ink)" : "var(--h)" }}>
          Plan détaillé <Arrow className="h-4 w-4" />
        </button>
      </div>

      {showConcise && (
        <section className="card rise p-5">
          <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>Réponse concise</h3>
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}
            dangerouslySetInnerHTML={{ __html: inlineMarkup(e.concise) }} />
        </section>
      )}

      {showPlan && (
        <section className="card rise p-5">
          <h3 className="mb-4 text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>Plan détaillé</h3>
          <div className="space-y-5">
            {e.plan.map((part, i) => (
              <div key={i}>
                <h4 className="serif text-[16.5px] font-bold leading-snug">{part.title}</h4>
                <div className="mt-2.5 space-y-3 border-l-2 pl-4" style={{ borderColor: "var(--h-soft)" }}>
                  {part.children.map((sub, j) => (
                    <div key={j}>
                      <div className="text-[14.5px] font-semibold" style={{ color: "var(--ink)" }}>{sub.title}</div>
                      <ul className="mt-1.5 space-y-1.5">
                        {sub.points.map((p, k) => (
                          <li key={k} className="flex gap-2 text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--muted)" }} />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {e.pitfalls && e.pitfalls.length > 0 && (
            <div className="mt-5 rounded-xl p-4" style={{ background: "var(--bad-soft)" }}>
              <h4 className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--bad)" }}>Pièges à éviter</h4>
              <ul className="space-y-1.5">
                {e.pitfalls.map((p, i) => (
                  <li key={i} className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <Button onClick={onNext} size="lg" full>Passer au quiz <Arrow className="h-4 w-4" /></Button>
    </div>
  );
}

function Correction({
  lesson, draft, wordCount, autocorrect,
}: {
  lesson: NonNullable<ReturnType<typeof findLesson>>;
  draft: string;
  wordCount: number;
  autocorrect: boolean;
}) {
  const pathname = usePathname();
  const { signedInAs } = useStudiJur();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [error, setError] = useState("");
  const ready = wordCount >= 30;
  const connexionRequise = supabaseConfigured && !signedInAs;
  const autoTriggered = useRef(false);

  // Retour de connexion pendant la rédaction : on relance directement la
  // correction que l'élève voulait faire, sans lui faire recliquer.
  useEffect(() => {
    if (!autocorrect || autoTriggered.current) return;
    if (connexionRequise || !ready || state !== "idle") return;
    autoTriggered.current = true;
    correct();
    window.history.replaceState(null, "", pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autocorrect, connexionRequise, ready, state]);

  async function correct() {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/correction", {
        method: "POST",
        headers: { "content-type": "application/json", ...(await authFetchHeaders()) },
        body: JSON.stringify({
          question: lesson.exam.question,
          kind: lesson.exam.kind,
          brouillon: draft,
          lessonTitle: lesson.title,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setError(data.error ?? "La correction a échoué.");
        return;
      }
      setFeedback(data.feedback);
      setState("done");
    } catch {
      setState("error");
      setError("Le serveur n'a pas répondu. Réessaie dans un instant.");
    }
  }

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--h)" }}>
          Correction par l&apos;IA
        </h3>
        {!ready && (
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            {wordCount}/30 mots minimum
          </span>
        )}
      </div>

      {state !== "done" && (
        <>
          <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Écris ton brouillon ci-dessus, puis fais-le corriger : note sur 20, points forts, points faibles et
            conseils, comme un chargé de TD.
          </p>
          {connexionRequise ? (
            <div className="mt-3">
              <p className="mb-2 text-[13px]" style={{ color: "var(--muted)" }}>
                Connecte-toi (gratuit, par email) pour faire corriger ta copie par l&apos;IA.
              </p>
              <Button href={connexionHref(`${pathname}?step=question&autocorrect=1`)} variant="soft" size="md">
                Se connecter
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <Button onClick={correct} disabled={!ready || state === "loading"} variant="soft" size="md">
                {state === "loading" ? "Correction en cours…" : "Faire corriger ma copie"}
              </Button>
            </div>
          )}
          {state === "error" && (
            <p className="mt-3 text-[13.5px]" style={{ color: "var(--bad)" }}>{error}</p>
          )}
        </>
      )}

      {state === "done" && feedback && (
        <div className="rise mt-3 space-y-4">
          <div className="flex items-center gap-4">
            <div className="serif text-[34px] font-bold leading-none tabular" style={{ color: "var(--h)" }}>
              {feedback.note}<span className="text-[16px]" style={{ color: "var(--muted)" }}>/{feedback.bareme}</span>
            </div>
            <p className="flex-1 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{feedback.commentaire}</p>
          </div>
          {feedback.pointsForts.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--good)" }}>Points forts</h4>
              <ul className="space-y-1">
                {feedback.pointsForts.map((p, i) => (
                  <li key={i} className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {feedback.pointsFaibles.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--bad)" }}>À améliorer</h4>
              <ul className="space-y-1">
                {feedback.pointsFaibles.map((p, i) => (
                  <li key={i} className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {feedback.conseils.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--h)" }}>Conseils</h4>
              <ul className="space-y-1">
                {feedback.conseils.map((p, i) => (
                  <li key={i} className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setState("idle")} className="text-[12.5px] font-semibold" style={{ color: "var(--muted)" }}>
            Refaire corriger après modification
          </button>
        </div>
      )}
    </section>
  );
}

function QuizStep({
  lesson, onFinish,
}: {
  lesson: NonNullable<ReturnType<typeof findLesson>>;
  onFinish: (score: number) => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = lesson.quiz[i];
  const last = i === lesson.quiz.length - 1;
  const correct = picked === q.answer;

  function next() {
    if (last) { onFinish(score + (correct ? 1 : 0)); return; }
    setI((n) => n + 1);
    setPicked(null);
  }

  function choose(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answer) setScore((s) => s + 1);
  }

  return (
    <div className="rise space-y-4">
      <div className="flex items-center justify-between text-[12.5px]" style={{ color: "var(--muted)" }}>
        <span className="tabular">Question {i + 1} sur {lesson.quiz.length}</span>
        <span className="tabular">{score} / {lesson.quiz.length} correctes</span>
      </div>

      <div key={i} className="card pop p-5">
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
            <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: correct ? "var(--good)" : "var(--bad)" }}>
              {correct ? "Exact" : "Raté"}
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{q.why}</p>
          </div>
          <Button onClick={next} size="lg" full>
            {last ? "Terminer la séance" : "Question suivante"} <Arrow className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function DoneStep({
  streak, score, total, nextId, onReplay, onHome,
}: {
  streak: number; score: number; total: number; nextId?: string;
  onReplay: () => void; onHome: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const verdict = pct >= 80 ? "Cours maîtrisé." : pct >= 50 ? "Bon début, à consolider." : "À reprendre demain.";
  return (
    <div className="pop py-6 text-center">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
        <Flame className="h-10 w-10" />
      </div>
      <h2 className="serif text-[27px] font-bold">Séance terminée</h2>
      <p className="mt-1.5 text-[15px]" style={{ color: "var(--muted)" }}>{verdict}</p>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="serif text-[27px] font-bold tabular">{score}/{total}</div>
          <div className="text-[12px]" style={{ color: "var(--muted)" }}>au quiz</div>
        </div>
        <div className="card p-4">
          <div className="serif text-[27px] font-bold tabular" style={{ color: "var(--gold)" }}>{streak}</div>
          <div className="text-[12px]" style={{ color: "var(--muted)" }}>jours de série</div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
        {nextId && <Button href={`/lecon/${nextId}`} size="lg" full>Enchaîner la leçon suivante <Arrow className="h-4 w-4" /></Button>}
        <Button onClick={onHome} variant={nextId ? "outline" : "primary"} size="lg" full>Retour à l&apos;accueil</Button>
        <button onClick={onReplay} className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>Refaire la séance</button>
      </div>
    </div>
  );
}

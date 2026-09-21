"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { findLesson, courseOf } from "@/lib/corpus";
import { Button, Tag } from "@/components/ui";
import { Arrow, Check, Cross, Target } from "@/components/icons";

export default function CasPratiqueGuide() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, ready } = useStudiJur();

  const lesson = useMemo(
    () => (ready ? findLesson(params.id, state.customCourses) : undefined),
    [params.id, ready, state.customCourses],
  );
  const course = lesson ? courseOf(lesson, state.customCourses) : undefined;

  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  if (state.profile.plan !== "active") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="serif text-[24px] font-bold">Réservé aux abonnés</h1>
        <p className="mt-2 text-[15px]" style={{ color: "var(--muted)" }}>Les cas pratiques guidés débloquent avec l&apos;abonnement.</p>
        <div className="mt-6"><Button href="/abonnement" size="lg">Voir les formules</Button></div>
      </div>
    );
  }

  if (!lesson || lesson.exam.kind !== "cas pratique") {
    return (
      <div className="py-24 text-center">
        <p className="text-[15px]" style={{ color: "var(--muted)" }}>Ce cas pratique n&apos;existe pas.</p>
        <div className="mt-4"><Button href="/cas-pratiques" variant="outline">Retour</Button></div>
      </div>
    );
  }

  const e = lesson.exam;
  // Étape 0 = les faits, une étape par partie du plan, dernière étape = correction finale.
  const totalSteps = e.plan.length + 2;
  const isFacts = step === 0;
  const isFinal = step === totalSteps - 1;
  const planIndex = step - 1;

  function setDraft(i: number, v: string) {
    setDrafts((d) => { const next = [...d]; next[i] = v; return next; });
  }
  function reveal(i: number) {
    setRevealed((r) => { const next = [...r]; next[i] = true; return next; });
  }

  return (
    <div data-hue={course?.hue} className="space-y-5 pb-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/cas-pratiques" className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>← Cas pratiques</Link>
        <span className="text-[12px] font-semibold tabular" style={{ color: "var(--muted)" }}>
          Étape {step + 1}/{totalSteps}
        </span>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
            <div className="h-full rounded-full" style={{ width: i <= step ? "100%" : "0%", background: "var(--h)", transition: "width 0.4s" }} />
          </div>
        ))}
      </div>

      {isFacts && (
        <section className="rise space-y-4">
          <div className="mb-1"><Tag>Cas pratique</Tag></div>
          <div className="card overflow-hidden">
            <div className="p-5" style={{ background: "var(--gold-soft)" }}>
              <h1 className="serif text-[19px] font-semibold leading-snug">{e.question}</h1>
            </div>
            <div className="p-5">
              <label className="mb-2 block text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
                Avant de continuer : reformule le problème de droit posé par ces faits, en une phrase.
              </label>
              <textarea value={drafts[0] ?? ""} onChange={(e2) => setDraft(0, e2.target.value)} rows={3}
                placeholder="Il s'agit de déterminer si…"
                className="w-full resize-y rounded-xl border p-3 text-[14.5px] leading-relaxed outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />
            </div>
          </div>
          <Button onClick={() => setStep(1)} size="lg" full disabled={(drafts[0] ?? "").trim().length < 10}>
            Passer au premier point <Arrow className="h-4 w-4" />
          </Button>
        </section>
      )}

      {!isFacts && !isFinal && (
        <PlanStep
          key={planIndex}
          part={e.plan[planIndex]}
          draft={drafts[step] ?? ""}
          onDraft={(v) => setDraft(step, v)}
          revealed={Boolean(revealed[step])}
          onReveal={() => reveal(step)}
          onNext={() => setStep((s) => s + 1)}
        />
      )}

      {isFinal && (
        <section className="rise space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>
              Solution rédigée
            </h3>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{e.concise}</p>
          </div>
          {e.pitfalls && e.pitfalls.length > 0 && (
            <div className="card p-4" style={{ background: "var(--bad-soft)" }}>
              <h4 className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--bad)" }}>Pièges à éviter</h4>
              <ul className="space-y-1.5">
                {e.pitfalls.map((p, i) => (
                  <li key={i} className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mx-auto flex max-w-sm flex-col gap-3 pt-2">
            <Button onClick={() => router.push("/cas-pratiques")} size="lg" full>Terminer</Button>
            <button onClick={() => { setStep(0); setDrafts([]); setRevealed([]); }} className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
              Refaire ce cas
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function PlanStep({
  part, draft, onDraft, revealed, onReveal, onNext,
}: {
  part: { title: string; children: { title: string; points: string[] }[] };
  draft: string;
  onDraft: (v: string) => void;
  revealed: boolean;
  onReveal: () => void;
  onNext: () => void;
}) {
  return (
    <section className="rise space-y-4">
      <div className="card p-5">
        <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>
          <Target className="h-4 w-4" /> Point à traiter
        </div>
        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Rédige ta réponse pour ce point du raisonnement, puis compare-la à la correction.
        </p>
        <textarea value={draft} onChange={(e) => onDraft(e.target.value)} rows={5}
          placeholder="Ta règle de droit, puis son application aux faits…"
          className="mt-3 w-full resize-y rounded-xl border p-3 text-[14.5px] leading-relaxed outline-none"
          style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />
        {!revealed && (
          <div className="mt-3">
            <Button onClick={onReveal} variant="soft" disabled={draft.trim().length < 10}>
              Comparer à la correction
            </Button>
          </div>
        )}
      </div>

      {revealed && (
        <div className="card rise p-5">
          <h4 className="serif mb-3 text-[17px] font-bold leading-snug">{part.title}</h4>
          <div className="space-y-3">
            {part.children.map((sub, j) => (
              <div key={j} className="border-l-2 pl-4" style={{ borderColor: "var(--h-soft)" }}>
                <div className="text-[14.5px] font-semibold">{sub.title}</div>
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
          <div className="mt-4 flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--bad)" }}>
              <Cross className="h-3.5 w-3.5" /> À revoir
            </button>
            <button className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--good)" }}>
              <Check className="h-3.5 w-3.5" /> C&apos;était bon
            </button>
            <div className="flex-1" />
            <Button onClick={onNext} size="sm">Étape suivante <Arrow className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      )}
    </section>
  );
}

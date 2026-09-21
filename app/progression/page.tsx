"use client";

import { useMemo, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { allLessons, corpusStats, findLesson } from "@/lib/corpus";
import { BOX_INTERVALS, dueCards, masteredCount, todayKey } from "@/lib/srs";
import { Button, SectionTitle, Tag } from "@/components/ui";
import { Check, Cross, Flame } from "@/components/icons";

export default function ProgressPage() {
  const { state, ready, gradeDefinition } = useStudiJur();
  const custom = state.customCourses;
  const stats = useMemo(() => corpusStats(custom), [custom]);
  const due = useMemo(() => dueCards(state.cards), [state.cards]);
  const doneIds = useMemo(
    () => Object.values(state.lessons).filter((l) => l.completedAt).map((l) => l.lessonId),
    [state.lessons],
  );

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  const scores = Object.values(state.lessons).filter((l) => l.quizTotal);
  const avg = scores.length
    ? Math.round((scores.reduce((n, l) => n + (l.quizScore ?? 0) / (l.quizTotal ?? 5), 0) / scores.length) * 100)
    : null;

  const boxes = BOX_INTERVALS.map((_, i) => Object.values(state.cards).filter((c) => c.box === i + 1).length);
  const maxBox = Math.max(1, ...boxes);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Progression</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Ce que tu sais vraiment, et ce qui revient bientôt.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Série actuelle", v: state.streak.current, s: `record : ${state.streak.best}`, gold: true },
          { l: "Leçons", v: `${doneIds.length}/${stats.lessons}`, s: `${Math.round((doneIds.length / Math.max(1, stats.lessons)) * 100)} % du corpus` },
          { l: "Définitions sues", v: masteredCount(state.cards), s: `sur ${Object.keys(state.cards).length} vues` },
          { l: "Moyenne quiz", v: avg === null ? "—" : `${avg}%`, s: `${scores.length} séance${scores.length > 1 ? "s" : ""}` },
        ].map((k) => (
          <div key={k.l} className="card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{k.l}</div>
            <div className="serif mt-1 text-[26px] font-bold leading-none tabular" style={{ color: k.gold ? "var(--gold)" : "var(--ink)" }}>{k.v}</div>
            <div className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>{k.s}</div>
          </div>
        ))}
      </section>

      <section>
        <SectionTitle kicker="Régularité" title="Tes 12 dernières semaines" />
        <Heatmap days={state.streak.days} />
      </section>

      <section>
        <SectionTitle kicker="Mémorisation" title="Où en sont tes définitions" />
        <div className="card p-5">
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {boxes.map((n, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md"
                    style={{
                      height: `${(n / maxBox) * 100}%`,
                      minHeight: n > 0 ? 6 : 0,
                      background: i >= 3 ? "var(--accent)" : i >= 1 ? "var(--gold)" : "var(--line-strong)",
                      transition: "height 0.5s cubic-bezier(0.22,1,0.36,1)",
                    }} />
                </div>
                <div className="text-center">
                  <div className="text-[13px] font-bold tabular">{n}</div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    {BOX_INTERVALS[i]} j
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Chaque colonne est un délai de révision. Une définition que tu sais monte d&apos;un cran et revient plus
            tard ; une définition ratée redescend à un jour. Les deux dernières colonnes sont les définitions
            considérées comme acquises.
          </p>
        </div>
      </section>

      <section id="revisions" className="scroll-mt-24">
        <SectionTitle
          kicker="À revoir"
          title={due.length ? `${due.length} définition${due.length > 1 ? "s" : ""} dues aujourd'hui` : "Rien à revoir aujourd'hui"}
        />
        {due.length > 0 ? (
          <ReviewDeck cards={due} onGrade={gradeDefinition} />
        ) : (
          <div className="card p-6 text-center">
            <p className="text-[14.5px]" style={{ color: "var(--muted)" }}>
              Tes révisions sont à jour. Reviens demain, ou avance dans une nouvelle leçon.
            </p>
            <div className="mt-4"><Button href="/" variant="outline">Retour à la séance du jour</Button></div>
          </div>
        )}
      </section>
    </div>
  );
}

function Heatmap({ days }: { days: string[] }) {
  const set = new Set(days);
  const today = new Date();
  const cells: { key: string; on: boolean }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = todayKey(d);
    cells.push({ key, on: set.has(key) });
  }
  return (
    <div className="card p-5">
      <div className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ gridAutoColumns: "1fr" }}>
        {cells.map((c) => (
          <div key={c.key} title={c.key}
            className="aspect-square rounded-[3px]"
            style={{ background: c.on ? "var(--accent)" : "var(--surface-2)" }} />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px]" style={{ color: "var(--muted)" }}>
        <span>Il y a 12 semaines</span>
        <span className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5" /> {days.length} jour{days.length > 1 ? "s" : ""} travaillé{days.length > 1 ? "s" : ""}
        </span>
        <span>Aujourd&apos;hui</span>
      </div>
    </div>
  );
}

function ReviewDeck({
  cards, onGrade,
}: {
  cards: { key: string; lessonId: string; term: string }[];
  onGrade: (lessonId: string, term: string, knew: boolean) => void;
}) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = cards[Math.min(i, cards.length - 1)];
  const lesson = findLesson(card.lessonId, []) ?? allLessons([]).find((l) => l.id === card.lessonId);
  const def = lesson?.definitions.find((d) => d.term === card.term);

  if (i >= cards.length) {
    return (
      <div className="card pop p-6 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--good-soft)", color: "var(--good)" }}>
          <Check className="h-7 w-7" />
        </div>
        <h3 className="serif text-[19px] font-bold">Révisions terminées</h3>
        <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>Les cartes sues reviendront plus tard.</p>
      </div>
    );
  }

  function grade(knew: boolean) {
    onGrade(card.lessonId, card.term, knew);
    setI((n) => n + 1);
    setRevealed(false);
  }

  return (
    <div className="space-y-4">
      <div className="text-[12.5px] tabular" style={{ color: "var(--muted)" }}>
        Carte {i + 1} sur {cards.length}
      </div>
      <div key={card.key} className="card pop min-h-[200px] p-6">
        {lesson && <div className="mb-2"><Tag>{lesson.title}</Tag></div>}
        <h3 className="serif text-[22px] font-bold leading-snug">{card.term}</h3>
        {revealed ? (
          <p className="mt-4 rise text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {def?.text ?? "Définition introuvable — la leçon d'origine a peut-être été supprimée."}
          </p>
        ) : (
          <button onClick={() => setRevealed(true)}
            className="mt-5 w-full rounded-xl border border-dashed py-7 text-[14px] font-semibold"
            style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}>
            Touche pour vérifier
          </button>
        )}
      </div>
      {revealed && (
        <div className="rise grid grid-cols-2 gap-3">
          <button onClick={() => grade(false)} className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold active:scale-[0.98]"
            style={{ background: "var(--bad-soft)", color: "var(--bad)" }}><Cross className="h-4 w-4" /> À revoir</button>
          <button onClick={() => grade(true)} className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-semibold active:scale-[0.98]"
            style={{ background: "var(--good-soft)", color: "var(--good)" }}><Check className="h-4 w-4" /> Je savais</button>
        </div>
      )}
    </div>
  );
}

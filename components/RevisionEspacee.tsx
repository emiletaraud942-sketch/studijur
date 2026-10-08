"use client";

import { useMemo, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { allLessons, findLesson } from "@/lib/corpus";
import { dueCards } from "@/lib/srs";
import { Button, SectionTitle, Tag } from "@/components/ui";
import { Check, Cross } from "@/components/icons";

// Extrait de /progression (où il vivait avant la Phase 6) vers /reviser :
// le retour utilisateur signalait que "la révision espacée est annoncée
// dans Réviser mais se trouve dans Progression" — Progression reste la
// page de statistiques (où j'en suis), Réviser devient la page d'action
// (qu'est-ce que je fais maintenant), y compris pour la révision espacée
// quotidienne et pas seulement la révision avant un CC.
export default function RevisionEspacee() {
  const { state, gradeDefinition } = useStudiJur();
  const due = useMemo(() => dueCards(state.cards), [state.cards]);

  return (
    <section id="revisions" className="scroll-mt-24">
      <SectionTitle
        kicker="Révision espacée"
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

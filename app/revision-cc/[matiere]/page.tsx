"use client";

import { useState } from "react";
import Link from "next/link";
import { useStudiJur } from "@/lib/state";
import { useRevisionCC } from "@/lib/useRevisionCC";
import { Button } from "@/components/ui";
import { Arrow, Calendar, Cards, Chevron, Clock, Cross, Flame, Quill, Sitemap, Target } from "@/components/icons";
import QuizEclair from "@/components/QuizEclair";
import { PlanDeBataille } from "@/components/PlanDeBataille";
import RevisionCCGate from "@/components/RevisionCCGate";

type Mode = "hub" | "quiz" | "resultat";
const TAILLE_QUIZ = 15;

// Hub plutôt que longue page unique : chronologie, pièges, questions, fiche
// à trous et fiche condensée vivent chacun sur leur propre route — tout
// cramé sur un seul écran était illisible et décourageant avant de
// commencer. Voir aussi FicheATrous/PiegesClassiques/QuestionsDeCours,
// passées en revue "une carte à la fois" pour la même raison.
export default function RevisionCCPage() {
  const { config, lessons, chronologieLessons } = useRevisionCC();
  const { state, ready, signedInAs } = useStudiJur();
  const [mode, setMode] = useState<Mode>("hub");
  const [score, setScore] = useState({ good: 0, total: 0 });

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
        onBack={() => setMode("hub")}
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
          <Button onClick={() => setMode("hub")} variant="outline" size="lg" full>Retour</Button>
        </div>
      </div>
    );
  }

  const pieges = lessons.flatMap((l) => l.exam.pitfalls ?? []);
  const lessonsAvecSchema = lessons.filter((l) => l.schema);
  const questionsDeCours = lessons.filter((l) => l.exam);
  const defKeysTotal = lessons.flatMap((l) => l.definitions).length;

  const quizIds = lessons.flatMap((l) => l.quiz.map((_, idx) => `${l.id}::quiz${idx}`));
  const defKeys = lessons.flatMap((l) => l.definitions.map((d) => `${l.id}::${d.term}`));
  const quizAcquis = quizIds.filter((id) => state.quizMastered?.[id]).length;
  const defAcquises = defKeys.filter((k) => (state.cards[k]?.box ?? 0) >= 4).length;
  // Étape 1 du plan de bataille (lire la fiche condensée) n'est jamais
  // testée, donc jamais comptée par quizMastered/cards comme les deux autres
  // — sans l'inclure ici, la lire ne faisait avancer aucun compteur (voir
  // FicheCondensee.tsx). Une unité par leçon, comme pour le quiz et les
  // définitions, pour rester proportionné au reste du score.
  const fichesLuesCount = lessons.filter((l) => state.fichesLues?.[l.id]).length;
  const totalItems = quizIds.length + defKeys.length + lessons.length;
  const pctPreparation = totalItems ? Math.round(((quizAcquis + defAcquises + fichesLuesCount) / totalItems) * 100) : 0;

  const rubriques = [
    lessons.length > 0 && { href: "fiche", Icon: Quill, titre: "Fiche condensée", sousTitre: `${fichesLuesCount}/${lessons.length} leçon${lessons.length > 1 ? "s" : ""} lues` },
    chronologieLessons.length > 0 && { href: "chronologie", Icon: Calendar, titre: "Chronologie", sousTitre: "Les dates clés, dans l'ordre" },
    lessonsAvecSchema.length > 0 && { href: "apercu", Icon: Sitemap, titre: "Vue d'ensemble", sousTitre: "Les schémas de synthèse" },
    defKeysTotal > 0 && { href: "trous", Icon: Cards, titre: "Fiche à trous", sousTitre: `${defKeysTotal} terme${defKeysTotal > 1 ? "s" : ""} à deviner` },
    questionsDeCours.length > 0 && { href: "questions", Icon: Target, titre: "Questions de cours", sousTitre: "Le plan attendu, à te tester" },
    pieges.length > 0 && { href: "pieges", Icon: Cross, titre: "Pièges classiques", sousTitre: `${pieges.length} erreur${pieges.length > 1 ? "s" : ""} qui reviennent` },
  ].filter(Boolean) as { href: string; Icon: typeof Calendar; titre: string; sousTitre: string }[];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>← Accueil</Link>
        <h1 className="serif mt-1.5 text-[28px] font-bold tracking-tight">Révision flash — {config.label}</h1>
      </div>

      <CompteARebours ccDate={config.ccDate} pctPreparation={pctPreparation} />

      <PlanDeBataille ccDate={config.ccDate} matiereId={config.id} />

      <section>
        <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
          Par rubrique
        </div>
        <div className="space-y-2.5">
          {rubriques.map(({ href, Icon, titre, sousTitre }) => (
            <Link key={href} href={`/revision-cc/${config.id}/${href}`} data-hue="gold"
              className="card flex items-center gap-3.5 p-3.5 transition-transform hover:-translate-y-0.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                <Icon className="h-[19px] w-[19px]" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-semibold">{titre}</h3>
                <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>{sousTitre}</p>
              </div>
              <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      <Button onClick={() => setMode("quiz")} size="lg" full disabled={!lessons.some((l) => l.quiz.length)}>
        Lancer le quiz ({Math.min(TAILLE_QUIZ, lessons.reduce((n, l) => n + l.quiz.length, 0))} questions) <Arrow className="h-4 w-4" />
      </Button>
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

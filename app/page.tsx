"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { allCourses, corpusStats, pickDailyLesson, findCourse } from "@/lib/corpus";
import { dueCards, dueNotions, masteredCount, streakIsAlive, todayKey } from "@/lib/srs";
import { notionLabel } from "@/lib/notions";
import { fetchLeaderboard } from "@/lib/leaderboard";
import { Bar, Button, SectionTitle, Tag } from "@/components/ui";
import { Arrow, Cards, Check, Chevron, Flame, Grid, Quill, Sitemap, Target } from "@/components/icons";
import { longDate } from "@/lib/format";
import { OBJECTIONS } from "@/lib/objections";
import RevisionIntensiveBanner from "@/components/RevisionIntensiveBanner";
import RappelPromo from "@/components/RappelPromo";
import ProchainCCBanner from "@/components/ProchainCCBanner";

export default function TodayPage() {
  const router = useRouter();
  const { state, ready, signedInAs, refreshSubscription, bumpActiviteDuJour } = useStudiJur();
  const [subConfirmed, setSubConfirmed] = useState(false);

  // Retour de Stripe (?abonnement=ok) : le webhook peut prendre quelques
  // secondes à écrire le statut, donc on réessaie plutôt que de vérifier une
  // seule fois trop tôt. On nettoie l'URL une fois fini, trouvé ou non.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("abonnement") !== "ok") return;
    let cancelled = false;
    let attempts = 0;
    const tick = async () => {
      if (cancelled) return;
      attempts += 1;
      const active = await refreshSubscription();
      if (cancelled) return;
      if (active) {
        setSubConfirmed(true);
      } else if (attempts < 6) {
        setTimeout(tick, 2000);
        return;
      }
      window.history.replaceState({}, "", window.location.pathname);
    };
    tick();
    return () => { cancelled = true; };
  }, [refreshSubscription]);

  const doneIds = useMemo(
    () => Object.values(state.lessons).filter((l) => l.completedAt).map((l) => l.lessonId),
    [state.lessons],
  );
  const custom = state.customCourses;
  const daily = useMemo(
    () => pickDailyLesson(doneIds, state.profile.activeCourses, custom),
    [doneIds, state.profile.activeCourses, custom],
  );
  const dailyCourse = daily ? findCourse(daily.courseId, custom) : undefined;
  const due = useMemo(() => dueCards(state.cards), [state.cards]);
  const revisionsNotions = useMemo(() => dueNotions(state.notions), [state.notions]);
  const [notionsDeplie, setNotionsDeplie] = useState(false);
  const stats = useMemo(() => corpusStats(custom), [custom]);
  const courses = useMemo(() => allCourses(custom), [custom]);
  const doneToday = state.streak.lastDay === todayKey();
  // Série vivante (hier ou aujourd'hui) mais pas encore faite aujourd'hui :
  // elle se romprait si l'élève ne fait rien avant minuit.
  const serieEnRisque = !doneToday && state.streak.current > 0 && streakIsAlive(state.streak);

  // Retour de connexion sans contexte précis (?bienvenue=1, voir /connexion) :
  // direction la séance du jour plutôt que ce tableau de bord. On attend
  // `ready` pour laisser la progression distante (si elle existe, sur un
  // nouvel appareil) le temps de remplacer l'état local avant de choisir la
  // leçon, sinon un élève déjà avancé repartirait de la leçon 1.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("bienvenue") !== "1") return;
    if (!ready || doneToday || !daily) return;
    router.replace(`/lecon/${daily.id}`);
  }, [ready, doneToday, daily, router]);

  const scores = Object.values(state.lessons).filter((l) => l.quizTotal);
  const avg = scores.length
    ? Math.round((scores.reduce((n, l) => n + (l.quizScore ?? 0) / (l.quizTotal ?? 5), 0) / scores.length) * 100)
    : null;

  if (!ready) {
    return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;
  }

  return (
    <div className="space-y-8">
      {subConfirmed && (
        <div className="rise rounded-2xl px-4 py-3 text-[13.5px] font-semibold" style={{ background: "var(--good-soft)", color: "var(--good)" }}>
          Abonnement activé, merci !
        </div>
      )}

      {doneIds.length === 0 && <PitchPremiereVisite dailyId={daily?.id} />}

      <RappelPromo />

      <ProchainCCBanner />

      <RevisionIntensiveBanner />

      <section className="rise">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
          {longDate()}
        </div>
        <h1 className="serif text-[30px] font-bold leading-[1.15] tracking-tight sm:text-[36px]">
          {doneToday ? "Séance du jour terminée." : state.profile.firstName ? `Bonjour ${state.profile.firstName}.` : "Ta séance du jour."}
        </h1>
        <p className="mt-2 max-w-xl text-[15px]" style={{ color: "var(--muted)" }}>
          {doneToday
            ? "Tu peux t'arrêter là, ou enchaîner sur une leçon supplémentaire — la série est déjà validée."
            : "Cinq minutes : le cours, cinq définitions, une question type examen corrigée, puis un quiz."}
        </p>
        <Link href="/plus#suggestions" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold"
          style={{ color: "var(--accent)" }}>
          StudiJur va continuer à s&apos;enrichir de nouvelles fonctionnalités pour te servir toujours mieux —
          dis-moi ce qui te manque, ça compte <Chevron className="h-3.5 w-3.5" />
        </Link>
      </section>

      <Link href="/plus" data-hue="blue" className="rise card flex items-center gap-3.5 p-4 transition-transform hover:-translate-y-0.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--ink)", color: "var(--paper)" }}>
          <Grid className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold">Tous les outils de StudiJur</h2>
          <p className="mt-0.5 text-[13px] leading-snug" style={{ color: "var(--muted)" }}>
            Quiz, cartes mentales, vocabulaire, entraînement CC1, classement...
          </p>
        </div>
        <span className="shrink-0" style={{ color: "var(--muted)" }}><Arrow className="h-4 w-4" /></span>
      </Link>

      {doneToday && signedInAs && Boolean(state.profile.leaderboardOptIn) && state.profile.pseudonym && (
        <RangPromo university={state.profile.university?.trim() || null} pseudonym={state.profile.pseudonym} />
      )}

      {daily && dailyCourse ? (
        <section data-hue={dailyCourse.hue} className="card rise overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="h-1" style={{ background: "var(--h)" }} />
          <div className="p-5 sm:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Tag tone="hue">{dailyCourse.short}</Tag>
              <Tag>Leçon {daily.order}</Tag>
              <Tag>{daily.minutes} min</Tag>
              {doneToday && <Tag tone="gold">Bonus</Tag>}
            </div>
            <h2 className="serif text-[24px] font-bold leading-snug sm:text-[27px]">{daily.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{daily.teaser}</p>

            <div className="mt-5 grid gap-2 text-center" style={{ gridTemplateColumns: `repeat(${2 + (daily.definitions.length > 0 ? 1 : 0) + (daily.quiz.length > 0 ? 1 : 0)}, minmax(0, 1fr))` }}>
              {[
                { Icon: Quill, n: `${daily.minutes} min`, l: "Cours" },
                ...(daily.definitions.length > 0 ? [{ Icon: Cards, n: `${daily.definitions.length}`, l: "Définitions" }] : []),
                { Icon: Target, n: "1", l: "Question" },
                ...(daily.quiz.length > 0 ? [{ Icon: Check, n: `${daily.quiz.length}`, l: "Quiz" }] : []),
              ].map(({ Icon, n, l }) => (
                <div key={l} className="rounded-xl py-3" style={{ background: "var(--surface-2)" }}>
                  <Icon className="mx-auto mb-1 h-4 w-4" />
                  <div className="text-[14px] font-bold tabular">{n}</div>
                  <div className="text-[10.5px] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>{l}</div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <Button href={`/lecon/${daily.id}`} size="lg" full>
                Commencer la séance <Arrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="card p-7 text-center rise">
          <h2 className="serif text-[22px] font-bold">Tout le corpus est terminé.</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px]" style={{ color: "var(--muted)" }}>
            Tu as fait les {stats.lessons} leçons disponibles. Dépose tes propres cours pour générer de nouvelles
            séances, ou reprends les définitions à revoir.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button href="/mes-cours">Déposer un cours</Button>
            <Button href="/progression" variant="outline">Voir ma progression</Button>
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Série", value: state.streak.current,
            sub: serieEnRisque ? "en jeu aujourd'hui" : streakIsAlive(state.streak) ? `record ${state.streak.best}` : "à relancer",
            subColor: serieEnRisque ? "var(--bad)" : undefined,
            Icon: Flame, gold: true,
          },
          { label: "Leçons faites", value: doneIds.length, sub: `sur ${stats.lessons}` },
          { label: "Définitions sues", value: masteredCount(state.cards), sub: `${due.length} à revoir` },
          { label: "Moyenne quiz", value: avg === null ? "—" : `${avg}%`, sub: `${scores.length} quiz` },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              {s.Icon && <s.Icon className="h-3.5 w-3.5" />}
              {s.label}
            </div>
            <div className="serif mt-1 text-[27px] font-bold leading-none tabular" style={{ color: s.gold ? "var(--gold)" : "var(--ink)" }}>
              {s.value}
            </div>
            <div className="mt-1 text-[12px] font-semibold" style={{ color: s.subColor ?? "var(--muted)" }}>{s.sub}</div>
          </div>
        ))}
      </section>

      {due.length > 0 && (
        <section className="card flex items-center justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-2">
              <Cards className="h-4 w-4" />
              <h3 className="text-[16px] font-semibold">{due.length} définition{due.length > 1 ? "s" : ""} à revoir</h3>
            </div>
            <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>
              Révision espacée : celles que tu as ratées reviennent plus souvent.
            </p>
          </div>
          <Button href="/progression#revisions" variant="soft" size="sm">Réviser</Button>
        </section>
      )}

      {revisionsNotions.length > 0 && (
        <section className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sitemap className="h-4 w-4" />
              <h3 className="text-[16px] font-semibold">
                {revisionsNotions.length} notion{revisionsNotions.length > 1 ? "s" : ""} à réviser aujourd&apos;hui
              </h3>
            </div>
            <Button
              variant="soft" size="sm"
              onClick={() => {
                const ouverture = !notionsDeplie;
                setNotionsDeplie(ouverture);
                if (ouverture) bumpActiviteDuJour(0, { notionsDuesRevues: true });
              }}
            >
              {notionsDeplie ? "Masquer" : "Voir"}
            </Button>
          </div>
          {notionsDeplie && (
            <ul className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: "var(--line)" }}>
              {revisionsNotions.map((n) => (
                <li key={n.notionId}>
                  <Link href={`/lecon/${n.notionId}`} className="text-[13.5px] font-medium hover:underline" style={{ color: "var(--h, var(--accent))" }}>
                    {notionLabel(n.notionId, custom)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <SectionTitle
          kicker="Programme"
          title="Tes matières"
          right={<Link href="/bibliotheque" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--accent)" }}>Tout voir <Chevron className="h-3.5 w-3.5" /></Link>}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((c) => {
            const done = c.lessons.filter((l) => doneIds.includes(l.id)).length;
            return (
              <Link key={c.id} href={`/bibliotheque#${c.id}`} data-hue={c.hue}
                className="card p-4 transition-transform duration-150 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="serif truncate text-[17px] font-semibold">{c.title}</h3>
                    <p className="mt-0.5 line-clamp-1 text-[13px]" style={{ color: "var(--muted)" }}>{c.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-[13px] font-bold tabular" style={{ color: "var(--h)" }}>
                    {done}/{c.lessons.length}
                  </span>
                </div>
                <div className="mt-3"><Bar value={done} total={c.lessons.length} /></div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const ATOUTS = [
  { Icon: Check, label: "Quiz par leçon" },
  { Icon: Sitemap, label: "Cartes mentales" },
  { Icon: Cards, label: "Flashcards" },
];

// Présentation courte pour qui n'a encore fait aucune leçon — remplace le
// petit lien vers /presentation par le pitch complet, directement ici :
// une leçon reste à un tap, pas une page de plus à traverser. Disparaît dès
// la première leçon terminée (doneIds.length === 0 côté appelant).
function PitchPremiereVisite({ dailyId }: { dailyId?: string }) {
  const [eleves, setEleves] = useState<number | null>(null);

  useEffect(() => {
    let annule = false;
    fetch("/api/eleves-inscrits")
      .then((r) => r.json())
      .then((d) => { if (!annule) setEleves(typeof d.eleves === "number" ? d.eleves : null); })
      .catch(() => {});
    return () => { annule = true; };
  }, []);

  return (
    <section className="card rise p-6 text-center">
      {eleves !== null && eleves > 0 && (
        <span className="mb-4 inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
          style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
          {eleves} élève{eleves > 1 ? "s" : ""} déjà inscrit{eleves > 1 ? "s" : ""}
        </span>
      )}
      <h2 className="serif text-[24px] font-bold leading-snug sm:text-[27px]">
        Révise ton droit en 5 minutes par jour
      </h2>

      <div className="my-5 border-t" style={{ borderColor: "var(--line)" }} />

      <div className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
        Déjà dans l&apos;appli
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {ATOUTS.map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: "var(--surface-2)" }}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[12.5px] font-medium leading-tight">{label}</span>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-5 max-w-xs text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
        Générés aussi à partir de tes propres cours, pas seulement du programme de L1.
      </p>

      <div className="my-5 border-t" style={{ borderColor: "var(--line)" }} />

      <div className="space-y-3.5 text-left">
        {OBJECTIONS.map((o) => (
          <div key={o.q}>
            <div className="text-[13px] font-semibold">{o.q}</div>
            <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>{o.r}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button href={dailyId ? `/lecon/${dailyId}` : "/bibliotheque"} size="lg" full>
          Essayer une leçon gratuite <Arrow className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-3 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Gratuit, sans carte bancaire · connexion sans mot de passe
      </p>
    </section>
  );
}

// Rang de l'élève dans le classement de sa promo (ou de tout StudiJur sans
// faculté renseignée) — n'a de sens que pour quelqu'un d'inscrit au
// classement (voir /classement) : sans compte lié, aucune position n'existe.
function RangPromo({ university, pseudonym }: { university: string | null; pseudonym: string }) {
  const [rang, setRang] = useState<number | null>(null);

  useEffect(() => {
    let annule = false;
    fetchLeaderboard(university, pseudonym).then((rows) => {
      if (annule) return;
      const i = rows.findIndex((r) => r.isMe);
      setRang(i === -1 ? null : i + 1);
    });
    return () => { annule = true; };
  }, [university, pseudonym]);

  // Absent du classement (pas encore synchronisé, ou hors du top affiché) :
  // pas de position à annoncer plutôt qu'un chiffre trompeur.
  if (rang === null) return null;

  return (
    <Link href="/classement" data-hue="gold"
      className="rise card flex items-center justify-between gap-3 p-4 transition-transform hover:-translate-y-0.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[14px] font-bold tabular"
          style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
          {rang === 1 ? "1er" : `${rang}e`}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-semibold">
            Tu es {rang === 1 ? "1er" : `${rang}e`} sur ta promo
          </p>
          <p className="text-[12.5px]" style={{ color: "var(--muted)" }}>Voir le classement</p>
        </div>
      </div>
      <span className="shrink-0" style={{ color: "var(--muted)" }}><Arrow className="h-4 w-4" /></span>
    </Link>
  );
}

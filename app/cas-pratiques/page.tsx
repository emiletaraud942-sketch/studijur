"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStudiJur } from "@/lib/state";
import { allLessons, courseOf } from "@/lib/corpus";
import { Button, SectionTitle, Tag } from "@/components/ui";
import { Arrow, Target } from "@/components/icons";

export default function CasPratiquesPage() {
  const { state, ready } = useStudiJur();
  const lessons = useMemo(
    () => allLessons(state.customCourses).filter((l) => l.exam.kind === "cas pratique"),
    [state.customCourses],
  );

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

  return (
    <div className="space-y-7">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Cas pratiques guidés</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          La méthode pas à pas : qualification des faits, problème de droit, règle applicable, application,
          conclusion — une étape à la fois, avec la correction officielle révélée seulement après ta réponse.
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-[14.5px]" style={{ color: "var(--muted)" }}>
            Aucun cas pratique disponible pour l&apos;instant dans tes matières actives. Les cours que tu importes
            toi-même peuvent aussi en générer.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((l) => {
            const course = courseOf(l, state.customCourses);
            return (
              <Link key={l.id} href={`/cas-pratique/${l.id}`} data-hue={course?.hue}
                className="card flex items-center justify-between gap-4 p-4 transition-transform hover:-translate-y-0.5">
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    {course && <Tag tone="hue">{course.short}</Tag>}
                    <Tag>Cas pratique</Tag>
                  </div>
                  <h3 className="truncate text-[15px] font-semibold">{l.exam.question}</h3>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                  <Arrow className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <section className="card p-5" style={{ background: "var(--h-soft)" }}>
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0" style={{ color: "var(--h)" }}><Target className="h-4 w-4" /></span>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            Méthode IRAC simplifiée : à chaque étape, écris ta réponse avant de regarder la correction — c&apos;est
            l&apos;effort de récupération qui fait progresser, pas la simple lecture.
          </p>
        </div>
      </section>
    </div>
  );
}

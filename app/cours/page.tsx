"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStudiJur } from "@/lib/state";
import { allCourses, corpusStats } from "@/lib/corpus";
import { SectionTitle, Tag } from "@/components/ui";
import { Chevron } from "@/components/icons";

export default function CoursPage() {
  const { state, ready } = useStudiJur();
  const courses = useMemo(() => allCourses(state.customCourses), [state.customCourses]);
  const stats = useMemo(() => corpusStats(state.customCourses), [state.customCourses]);

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Cours</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Le programme rédigé en entier, classé par matière — pour rattraper une séance manquée ou relire sans le
          format quiz. {stats.lessons} leçons couvertes, mis à jour au fil du semestre.
        </p>
      </div>

      <div className="space-y-3">
        {courses.map((c) => (
          <Link key={c.id} href={`/cours/${c.id}`} data-hue={c.hue}
            className="card flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Tag tone="hue">{c.short}</Tag>
                {c.custom && <Tag tone="gold">Ton cours</Tag>}
              </div>
              <h2 className="serif truncate text-[17px] font-semibold">{c.title}</h2>
              <p className="mt-0.5 line-clamp-1 text-[13px]" style={{ color: "var(--muted)" }}>{c.subtitle}</p>
            </div>
            <span className="shrink-0 text-[13px] font-bold tabular" style={{ color: "var(--h)" }}>
              {c.lessons.length}
            </span>
            <span className="shrink-0" style={{ color: "var(--muted)" }}>
              <Chevron className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <section className="card p-5 text-center">
        <SectionTitle kicker="Tu étais absent ?" title="Un camarade a manqué une séance ?" />
        <p className="mx-auto max-w-md text-[14px]" style={{ color: "var(--muted)" }}>
          Chaque matière ci-dessus se lit d&apos;une traite : cours rédigé, points à retenir et définitions, dans
          l&apos;ordre du programme. Partage le lien de la page pour que tes camarades s&apos;y retrouvent aussi.
        </p>
      </section>
    </div>
  );
}

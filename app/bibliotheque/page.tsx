"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { allCourses, corpusStats } from "@/lib/corpus";
import { Bar, Button, SectionTitle, Tag } from "@/components/ui";
import { Check, Chevron } from "@/components/icons";

export default function LibraryPage() {
  const { state, ready } = useStudiJur();
  const [open, setOpen] = useState<string | null>(null);
  const courses = useMemo(() => allCourses(state.customCourses), [state.customCourses]);
  const stats = useMemo(() => corpusStats(state.customCourses), [state.customCourses]);

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Matières</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          {stats.lessons} leçons, {stats.definitions} définitions et {stats.questions} questions de quiz.
        </p>
      </div>

      <div className="space-y-4">
        {courses.map((c) => {
          const doneCount = c.lessons.filter((l) => state.lessons[l.id]?.completedAt).length;
          const isOpen = open === c.id;
          return (
            <section key={c.id} id={c.id} data-hue={c.hue} className="card overflow-hidden scroll-mt-24">
              <button onClick={() => setOpen(isOpen ? null : c.id)} className="w-full p-5 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Tag tone="hue">{c.short}</Tag>
                      {c.custom && <Tag tone="gold">Ton cours</Tag>}
                    </div>
                    <h2 className="serif text-[19px] font-bold leading-snug">{c.title}</h2>
                    <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>{c.subtitle}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[14px] font-bold tabular" style={{ color: "var(--h)" }}>
                      {doneCount}/{c.lessons.length}
                    </span>
                    <Chevron className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                </div>
                <div className="mt-3"><Bar value={doneCount} total={c.lessons.length} /></div>
              </button>

              {isOpen && (
                <ul className="rise border-t" style={{ borderColor: "var(--line)" }}>
                  {c.lessons.map((l) => {
                    const rec = state.lessons[l.id];
                    const finished = Boolean(rec?.completedAt);
                    return (
                      <li key={l.id}>
                        <Link href={`/lecon/${l.id}`}
                          className="flex items-center gap-3 border-b px-5 py-3.5 transition-colors last:border-b-0"
                          style={{ borderColor: "var(--line)" }}>
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold tabular"
                            style={finished
                              ? { background: "var(--h)", color: "var(--accent-ink)" }
                              : { background: "var(--surface-2)", color: "var(--muted)" }}>
                            {finished ? <Check className="h-3.5 w-3.5" /> : l.order}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14.5px] font-semibold">{l.title}</span>
                            <span className="block truncate text-[12.5px]" style={{ color: "var(--muted)" }}>
                              {rec?.quizTotal ? `Quiz ${rec.quizScore}/${rec.quizTotal}` : l.teaser}
                            </span>
                          </span>
                          <Chevron className="h-4 w-4 shrink-0" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <section className="card p-5 text-center">
        <SectionTitle kicker="Aller plus loin" title="Ajoute tes propres cours" />
        <p className="mx-auto max-w-md text-[14px]" style={{ color: "var(--muted)" }}>
          Dépose le polycopié ou tes notes : StudiJur en tire des leçons de 5 minutes au même format, calées sur ton
          plan de cours et ton chargé de TD.
        </p>
        <div className="mt-4"><Button href="/mes-cours">Déposer un cours</Button></div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useStudiJur } from "@/lib/state";
import { findCourse } from "@/lib/corpus";
import { Prose, Tag, Button } from "@/components/ui";
import { inlineMarkup } from "@/lib/format";
import { Chevron } from "@/components/icons";

export default function CoursMatierePage() {
  const params = useParams<{ matiereId: string }>();
  const { state, ready } = useStudiJur();
  const course = useMemo(
    () => (ready ? findCourse(params.matiereId, state.customCourses) : undefined),
    [params.matiereId, ready, state.customCourses],
  );

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  if (!course) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="serif text-[22px] font-bold">Matière introuvable</h1>
        <div className="mt-5"><Button href="/cours">Retour</Button></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div data-hue={course.hue}>
        <Link href="/cours" className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>← Cours</Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Tag tone="hue">{course.short}</Tag>
        </div>
        <h1 className="serif mt-1.5 text-[26px] font-bold tracking-tight sm:text-[30px]">{course.title}</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>{course.subtitle}</p>
      </div>

      <div className="space-y-10">
        {course.lessons.map((l) => (
          <article key={l.id} id={l.id} data-hue={course.hue} className="scroll-mt-20">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12.5px] font-bold tabular"
                style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                {l.order}
              </span>
              <h2 className="serif text-[20px] font-bold leading-snug">{l.title}</h2>
            </div>

            <div className="card p-5 sm:p-6">
              <Prose paragraphs={l.brief} />

              {l.keyPoints.length > 0 && (
                <div className="mt-5 rounded-xl p-4" style={{ background: "var(--surface-2)" }}>
                  <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--h)" }}>
                    À retenir
                  </h3>
                  <ul className="space-y-1.5">
                    {l.keyPoints.map((k, i) => (
                      <li key={i} className="flex gap-2 text-[14px] leading-relaxed">
                        <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--h)" }} />
                        <span dangerouslySetInnerHTML={{ __html: inlineMarkup(k) }} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {l.definitions.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
                    Définitions
                  </h3>
                  <dl className="space-y-3">
                    {l.definitions.map((d, i) => (
                      <div key={i}>
                        <dt className="text-[14px] font-semibold">{d.term}</dt>
                        <dd className="mt-0.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                          {d.text}{d.source && <span style={{ color: "var(--muted)" }}> — {d.source}</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            <div className="mt-3">
              <Link href={`/lecon/${l.id}`} className="text-[13px] font-semibold" style={{ color: "var(--accent)" }}>
                Faire cette leçon en mode quiz →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

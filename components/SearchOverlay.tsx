"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { search, type SearchResult } from "@/lib/search";
import { Books, Cards, Chevron, Cross, Quill, Search, Target } from "./icons";

const LABELS: Record<SearchResult["kind"], string> = {
  matiere: "Matières",
  lecon: "Leçons",
  definition: "Définitions",
  question: "Questions d'examen",
};

const ICONS: Record<SearchResult["kind"], typeof Quill> = {
  matiere: Books,
  lecon: Quill,
  definition: Cards,
  question: Target,
};

function hrefFor(r: SearchResult): string {
  if (r.kind === "matiere") return `/cours/${r.course.id}`;
  if (r.kind === "question") return `/lecon/${r.lesson.id}?step=question`;
  return `/lecon/${r.lesson.id}`;
}

function titleFor(r: SearchResult): string {
  if (r.kind === "matiere") return r.course.title;
  if (r.kind === "definition") return r.term;
  return r.lesson.title;
}

function subtitleFor(r: SearchResult): string {
  if (r.kind === "matiere") return r.course.subtitle;
  if (r.kind === "question") return `${r.course.title} — question d'examen`;
  if (r.kind === "definition") return `${r.lesson.title} · ${r.course.title}`;
  return r.course.title;
}

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { state } = useStudiJur();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const results = useMemo(() => search(q, state.customCourses), [q, state.customCourses]);
  const groups = useMemo(() => {
    const order: SearchResult["kind"][] = ["matiere", "lecon", "definition", "question"];
    return order
      .map((kind) => ({ kind, items: results.filter((r) => r.kind === kind) }))
      .filter((g) => g.items.length > 0);
  }, [results]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--paper)" }}>
      <div className="flex items-center gap-2.5 border-b p-4" style={{ borderColor: "var(--line)" }}>
        <span className="shrink-0" style={{ color: "var(--muted)" }}><Search className="h-5 w-5" /></span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Une matière, une leçon, une définition…"
          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none"
          style={{ color: "var(--ink)" }}
        />
        <button onClick={onClose} aria-label="Fermer la recherche"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
          <Cross className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {q.trim().length < 2 ? (
          <p className="mt-8 text-center text-[13.5px]" style={{ color: "var(--muted)" }}>
            Tape au moins deux lettres pour chercher dans tout le programme.
          </p>
        ) : groups.length === 0 ? (
          <p className="mt-8 text-center text-[13.5px]" style={{ color: "var(--muted)" }}>
            Aucun résultat pour « {q} ».
          </p>
        ) : (
          <div className="mx-auto max-w-[560px] space-y-6">
            {groups.map(({ kind, items }) => {
              const Icon = ICONS[kind];
              return (
                <section key={kind}>
                  <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>
                    {LABELS[kind]}
                  </div>
                  <div className="space-y-2">
                    {items.map((r, i) => (
                      <Link key={`${kind}-${i}`} href={hrefFor(r)} onClick={onClose}
                        data-hue={r.course.hue}
                        className="card flex items-center gap-3 p-3.5 transition-transform hover:-translate-y-0.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold">{titleFor(r)}</div>
                          <div className="truncate text-[12px]" style={{ color: "var(--muted)" }}>{subtitleFor(r)}</div>
                        </div>
                        <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

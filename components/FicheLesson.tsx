"use client";

import { useState } from "react";
import { inlineMarkup } from "@/lib/format";
import type { Definition, Lesson } from "@/lib/types";

// Partagé entre /revision-intensive et /revision-cc : la même fiche
// condensée (plan en points clés + définitions en flashcards révélables),
// jamais dupliquée entre les deux pages.
export function FicheLesson({ lesson }: { lesson: Lesson }) {
  return (
    <div className="p-5">
      <h3 className="text-[15px] font-bold leading-snug">{lesson.title}</h3>
      <ul className="mt-2 space-y-1.5">
        {lesson.keyPoints.map((k, i) => (
          <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--h)" }} />
            <span dangerouslySetInnerHTML={{ __html: inlineMarkup(k) }} />
          </li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {lesson.definitions.map((d) => (
          <MiniFlashcard key={d.term} def={d} />
        ))}
      </div>
    </div>
  );
}

export function MiniFlashcard({ def }: { def: Definition }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen((o) => !o)}
      className="rounded-xl border p-3 text-left text-[12.5px] leading-snug transition-colors"
      style={{ borderColor: open ? "var(--h)" : "var(--line)", background: open ? "var(--h-soft)" : "transparent" }}>
      <span className="block font-bold" style={{ color: "var(--ink)" }}>{def.term}</span>
      {open ? (
        <span className="mt-1 block" style={{ color: "var(--ink-2)" }}>{def.text}</span>
      ) : (
        <span className="mt-1 block italic" style={{ color: "var(--muted)" }}>Touche pour révéler</span>
      )}
    </button>
  );
}

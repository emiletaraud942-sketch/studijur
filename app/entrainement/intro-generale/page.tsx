"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag } from "@/components/ui";
import { inlineMarkup } from "@/lib/format";
import { introGeneraleEntrainement, type QuestionEntrainement } from "@/lib/entrainement";

export default function EntrainementIntroGeneralePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/entrainement" className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>← Entraînement intero</Link>
        <h1 className="serif mt-1.5 text-[28px] font-bold tracking-tight">Introduction générale au droit</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Vocabulaire des procès, jurisprudence vue en TD, questions de cours — {introGeneraleEntrainement.length}{" "}
          questions. Réponds mentalement avant de révéler la réponse : c&apos;est l&apos;effort de récupération qui
          fait progresser.
        </p>
      </div>

      <div className="space-y-3">
        {introGeneraleEntrainement.map((q) => <QuestionCard key={q.id} q={q} />)}
      </div>
    </div>
  );
}

function QuestionCard({ q }: { q: QuestionEntrainement }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen((o) => !o)}
      className="card block w-full p-4 text-left transition-colors"
      style={{ borderColor: open ? "var(--accent)" : "var(--card-border)" }}>
      <Tag>{q.categorie}</Tag>
      <p className="mt-2 text-[15px] font-semibold leading-snug">{q.question}</p>
      {open ? (
        <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}
          dangerouslySetInnerHTML={{ __html: inlineMarkup(q.reponse) }} />
      ) : (
        <p className="mt-3 text-[13px] italic" style={{ color: "var(--muted)" }}>Touche pour révéler la réponse</p>
      )}
    </button>
  );
}

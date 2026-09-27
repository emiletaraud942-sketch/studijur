"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow, Clock } from "./icons";

// Semaine d'examens — le bandeau s'efface tout seul après cette date, plus
// besoin d'y repenser une fois les épreuves passées.
const HIDE_AFTER = "2026-09-30T17:00:00+02:00";

export default function RevisionIntensiveBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Date.now() < new Date(HIDE_AFTER).getTime()) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <Link href="/revision-intensive" data-hue="gold"
      className="rise flex items-start gap-3.5 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--ink)" }}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gold)", color: "var(--accent-ink)" }}>
        <Clock className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ background: "color-mix(in srgb, var(--paper) 18%, transparent)", color: "var(--paper)" }}>
          Semaine d&apos;examens
        </span>
        <h2 className="mt-2 text-[15.5px] font-semibold" style={{ color: "var(--paper)" }}>Révision de dernière minute</h2>
        <p className="mt-0.5 text-[13px] leading-snug" style={{ color: "color-mix(in srgb, var(--paper) 78%, transparent)" }}>
          La fiche condensée de tout le programme, puis un quiz éclair qui mélange les matières que tu choisis.
        </p>
      </div>
      <span className="shrink-0" style={{ color: "var(--paper)" }}><Arrow className="h-4 w-4" /></span>
    </Link>
  );
}

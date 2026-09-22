"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, Button } from "@/components/ui";
import { Arrow, Chevron } from "@/components/icons";
import { inlineMarkup } from "@/lib/format";
import { introGeneraleEntrainement, type QuestionEntrainement } from "@/lib/entrainement";
import { useStudiJur, entrainementCorrectionCapReached, ENTRAINEMENT_CORRECTION_LIMIT, supabaseConfigured } from "@/lib/state";
import { authFetchHeaders } from "@/lib/supabase";
import type { EntrainementFeedback } from "@/lib/types";

export default function EntrainementIntroGeneralePage() {
  const [i, setI] = useState(0);
  const total = introGeneraleEntrainement.length;
  const q = introGeneraleEntrainement[i];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/entrainement" className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>← Entraînement intero</Link>
        <h1 className="serif mt-1.5 text-[28px] font-bold tracking-tight">Introduction générale au droit</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Vocabulaire des procès, questions de cours, méthodologie. Écris ta réponse si tu veux, fais-la
          corriger par l&apos;IA, puis révèle la réponse attendue.
        </p>
      </div>

      <div className="flex items-center justify-between text-[12.5px]" style={{ color: "var(--muted)" }}>
        <span className="tabular">Question {i + 1} sur {total}</span>
      </div>

      <QuestionCard key={q.id} q={q} />

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}
          className="flex items-center justify-center gap-1.5 rounded-xl py-3.5 text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: "var(--surface-2)", color: "var(--ink)" }}>
          <Chevron className="h-4 w-4 rotate-180" /> Précédent
        </button>
        <button onClick={() => setI((n) => Math.min(total - 1, n + 1))} disabled={i === total - 1}
          className="flex items-center justify-center gap-1.5 rounded-xl py-3.5 text-[14px] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
          Suivant <Arrow className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function QuestionCard({ q }: { q: QuestionEntrainement }) {
  const { state, update, signedInAs } = useStudiJur();
  const [reponse, setReponse] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correctionState, setCorrectionState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState<EntrainementFeedback | null>(null);
  const [error, setError] = useState("");

  const capReached = entrainementCorrectionCapReached(state);
  const connexionRequise = supabaseConfigured && !signedInAs;
  const restantes = Math.max(0, ENTRAINEMENT_CORRECTION_LIMIT - (state.entrainementCorrectionsUsed ?? 0));
  const wordCount = reponse.trim() ? reponse.trim().split(/\s+/).filter(Boolean).length : 0;
  const abonne = state.profile.plan === "active";

  async function corriger() {
    setCorrectionState("loading");
    setError("");
    try {
      const res = await fetch("/api/entrainement-correction", {
        method: "POST",
        headers: { "content-type": "application/json", ...(await authFetchHeaders()) },
        body: JSON.stringify({ question: q.question, reponseAttendue: q.reponse, reponseEtudiant: reponse }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCorrectionState("error");
        setError(data.error ?? "La correction a échoué.");
        return;
      }
      setFeedback(data.feedback);
      setCorrectionState("done");
      update((d) => { d.entrainementCorrectionsUsed = (d.entrainementCorrectionsUsed ?? 0) + 1; });
    } catch {
      setCorrectionState("error");
      setError("Le serveur n'a pas répondu. Réessaie dans un instant.");
    }
  }

  const verdictColor = feedback?.verdict === "correct" ? "good" : feedback?.verdict === "partiel" ? "gold" : "bad";
  const verdictLabel = feedback?.verdict === "correct" ? "Correct" : feedback?.verdict === "partiel" ? "Partiellement correct" : "À revoir";

  return (
    <div className="card pop p-5">
      <Tag>{q.categorie}</Tag>
      <p className="mt-2 text-[16.5px] font-semibold leading-snug">{q.question}</p>

      <textarea
        value={reponse}
        onChange={(e) => setReponse(e.target.value)}
        rows={3}
        placeholder="Réponds de tête, si tu veux (facultatif)…"
        className="mt-3 w-full resize-y rounded-xl border p-3 text-[14px] leading-relaxed outline-none focus:ring-2"
        style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setRevealed((v) => !v)}
          className="rounded-xl px-3.5 py-2 text-[13px] font-semibold active:scale-[0.98]"
          style={{ background: revealed ? "var(--accent)" : "var(--accent-soft)", color: revealed ? "var(--accent-ink)" : "var(--accent-strong)" }}>
          {revealed ? "Masquer la réponse" : "Montrer la réponse"}
        </button>

        {connexionRequise ? (
          <Link href="/connexion"
            className="rounded-xl px-3.5 py-2 text-[13px] font-semibold"
            style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
            Se connecter pour corriger par l&apos;IA
          </Link>
        ) : !capReached ? (
          <Button onClick={corriger} disabled={wordCount < 3 || correctionState === "loading"} variant="soft" size="sm">
            {correctionState === "loading" ? "Correction…" : "Faire corriger par l'IA"}
          </Button>
        ) : (
          <Link href="/abonnement"
            className="rounded-xl px-3.5 py-2 text-[13px] font-semibold"
            style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
            Corrections IA épuisées — voir les formules
          </Link>
        )}
      </div>

      {!abonne && !capReached && (
        <p className="mt-1.5 text-[11.5px]" style={{ color: "var(--muted)" }}>
          {restantes} correction{restantes > 1 ? "s" : ""} IA gratuite{restantes > 1 ? "s" : ""} restante{restantes > 1 ? "s" : ""}
        </p>
      )}

      {correctionState === "error" && (
        <p className="mt-2 text-[13px]" style={{ color: "var(--bad)" }}>{error}</p>
      )}

      {correctionState === "done" && feedback && (
        <div className="mt-3 rounded-xl p-3" style={{ background: `var(--${verdictColor}-soft)` }}>
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: `var(--${verdictColor})` }}>
            {verdictLabel}
          </div>
          <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{feedback.commentaire}</p>
        </div>
      )}

      {revealed && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--line)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Réponse attendue</p>
          <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}
            dangerouslySetInnerHTML={{ __html: inlineMarkup(q.reponse) }} />
        </div>
      )}
    </div>
  );
}

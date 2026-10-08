"use client";

import { useState } from "react";
import { useStudiJur } from "@/lib/state";
import { getSupabase } from "@/lib/supabase";
import { Check, Cross } from "./icons";

// Un bouton discret sur chaque leçon plutôt qu'un formulaire de suggestion
// générique (SuggestionForm) détourné pour ça : le contexte (quelle leçon)
// part automatiquement avec le message, l'élève n'a qu'à décrire l'erreur.
// Réutilise la même table/route `feedback` — un préfixe suffit à distinguer
// un signalement d'une suggestion dans la boîte mail de notification.
export default function SignalerErreur({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const { signedInAs } = useStudiJur();
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErreur("");
    try {
      const sb = getSupabase();
      const userId = sb ? (await sb.auth.getUser()).data.user?.id ?? null : null;
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: `[Erreur signalée] Leçon « ${lessonTitle} » (${lessonId}) :\n${message.trim()}`,
          email: signedInAs ?? null,
          userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) setErreur(data.error ?? "L'envoi a échoué.");
      else { setEnvoye(true); setMessage(""); }
    } catch {
      setErreur("L'envoi a échoué. Vérifie ta connexion et réessaie.");
    } finally {
      setBusy(false);
    }
  }

  if (envoye) {
    return (
      <p className="flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--good)" }}>
        <Check className="h-3.5 w-3.5" /> Signalement envoyé, merci.
      </p>
    );
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)}
        className="text-[12.5px] font-semibold underline" style={{ color: "var(--muted)" }}>
        Signaler une erreur dans cette leçon
      </button>
    );
  }

  return (
    <form onSubmit={envoyer} className="space-y-2">
      <textarea
        required
        autoFocus
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Quelle erreur as-tu repérée ? (date, définition, jurisprudence...)"
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-lg border px-3 py-2 text-[13px] leading-relaxed outline-none"
        style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }}
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy || message.trim().length < 5}
          className="rounded-full px-3.5 py-1.5 text-[12.5px] font-bold disabled:opacity-40"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
          {busy ? "Envoi…" : "Envoyer"}
        </button>
        <button type="button" onClick={() => setOuvert(false)}
          className="text-[12.5px] font-semibold" style={{ color: "var(--muted)" }}>
          Annuler
        </button>
      </div>
      {erreur && (
        <p className="flex items-start gap-2 text-[12.5px]" style={{ color: "var(--bad)" }}>
          <Cross className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {erreur}
        </p>
      )}
    </form>
  );
}

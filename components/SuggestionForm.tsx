"use client";

import { useState } from "react";
import { useStudiJur } from "@/lib/state";
import { getSupabase } from "@/lib/supabase";
import { Button, SectionTitle } from "./ui";
import { Check, Cross } from "./icons";

export default function SuggestionForm() {
  const { signedInAs } = useStudiJur();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(signedInAs ?? "");
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
        body: JSON.stringify({ message: message.trim(), email: email.trim() || null, userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error ?? "L'envoi a échoué.");
      } else {
        setEnvoye(true);
        setMessage("");
      }
    } catch {
      setErreur("L'envoi a échoué. Vérifie ta connexion et réessaie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card p-5">
      <SectionTitle kicker="Ton avis" title="Une suggestion, une demande ?" />

      {envoye ? (
        <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "var(--good-soft)" }}>
          <span style={{ color: "var(--good)" }}><Check className="mt-0.5 h-5 w-5 shrink-0" /></span>
          <div>
            <p className="text-[14.5px] font-semibold" style={{ color: "var(--good)" }}>Message envoyé, merci !</p>
            <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              Je lis chaque message. Si tu as laissé ton email, je peux te répondre directement.
            </p>
          </div>
          <button onClick={() => setEnvoye(false)} className="ml-auto shrink-0 text-[13px] font-semibold underline" style={{ color: "var(--good)" }}>
            Envoyer autre chose
          </button>
        </div>
      ) : (
        <form onSubmit={envoyer} className="space-y-3">
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Une fonctionnalité qui te manque, un bug, une leçon à améliorer, une matière à ajouter…"
            rows={5}
            maxLength={4000}
            className="w-full resize-none rounded-xl border px-4 py-3 text-[14.5px] leading-relaxed outline-none"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ton email (facultatif, pour que je puisse te répondre)"
            className="w-full rounded-xl border px-4 py-3 text-[14.5px] outline-none"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }}
          />
          <Button type="submit" size="lg" full disabled={busy || message.trim().length < 10}>
            {busy ? "Envoi…" : "Envoyer"}
          </Button>
          {erreur && (
            <p className="flex items-start gap-2 text-[13px]" style={{ color: "var(--bad)" }}>
              <Cross className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {erreur}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

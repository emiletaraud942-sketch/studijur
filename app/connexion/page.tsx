"use client";

import { useState } from "react";
import { supabaseConfigured } from "@/lib/state";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui";
import { Scales } from "@/components/icons";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setError("");
    const { error: err } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  // Alternative au lien cliquable : indispensable pour StudiJur épinglé sur
  // l'écran d'accueil (iOS notamment). Un lien ouvert depuis l'appli Mail
  // s'ouvre toujours dans Safari, jamais dans l'icône installée — or Safari
  // et l'appli installée ont chacun leur propre stockage local (comportement
  // iOS, pas un bug StudiJur), donc la session obtenue via le lien reste
  // invisible depuis l'icône. Saisir le code directement dans l'appli
  // installée règle ce cas : la session est alors créée dans le bon contexte.
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setVerifying(true);
    setCodeError("");
    const { error: err } = await sb.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    if (err) {
      setVerifying(false);
      setCodeError(err.message);
      return;
    }
    // Rechargement complet (comme après un clic sur le lien) pour que le
    // reste de l'appli, qui ne relit la session qu'au montage, la prenne
    // en compte immédiatement.
    window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-sm py-10 text-center">
      <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
        <Scales className="h-7 w-7" />
      </span>
      <h1 className="serif text-[26px] font-bold">Retrouver ma progression</h1>

      {!supabaseConfigured ? (
        <>
          <p className="mt-2 text-[14.5px]" style={{ color: "var(--muted)" }}>
            Les comptes ne sont pas encore activés. Ta progression est enregistrée sur cet appareil et te suit
            d&apos;une session à l&apos;autre.
          </p>
          <div className="mt-6"><Button href="/" variant="outline" full>Retour</Button></div>
        </>
      ) : sent ? (
        <>
          <p className="mt-3 rounded-xl p-4 text-[14.5px] leading-relaxed"
            style={{ background: "var(--good-soft)", color: "var(--good)" }}>
            Lien envoyé à {email}. Ouvre-le depuis cet appareil pour synchroniser ta progression.
          </p>
          <p className="mt-5 text-[13px]" style={{ color: "var(--muted)" }}>
            StudiJur épinglé sur ton écran d&apos;accueil ? Le lien s&apos;ouvre dans Safari, pas dans l&apos;icône —
            entre plutôt le code reçu dans le même email, directement ici :
          </p>
          <form onSubmit={verifyCode} className="mt-3 space-y-3">
            <input type="text" inputMode="numeric" required value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code reçu par email"
              className="w-full rounded-xl border px-4 py-3 text-center text-[15px] tracking-widest outline-none"
              style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />
            <Button type="submit" size="lg" full variant="outline" disabled={verifying}>
              {verifying ? "Vérification…" : "Valider le code"}
            </Button>
          </form>
          {codeError && <p className="mt-3 text-[13px]" style={{ color: "var(--bad)" }}>{codeError}</p>}
        </>
      ) : (
        <>
          <p className="mt-2 text-[14.5px]" style={{ color: "var(--muted)" }}>
            Entre ton adresse : tu recevras un lien de connexion, sans mot de passe.
          </p>
          <form onSubmit={send} className="mt-6 space-y-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@etu.univ-rouen.fr"
              className="w-full rounded-xl border px-4 py-3 text-center text-[15px] outline-none"
              style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />
            <Button type="submit" size="lg" full disabled={busy}>{busy ? "Envoi…" : "Recevoir mon lien"}</Button>
          </form>
          {error && <p className="mt-3 text-[13px]" style={{ color: "var(--bad)" }}>{error}</p>}
        </>
      )}
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseConfigured, useStudiJur } from "@/lib/state";
import { getSupabase } from "@/lib/supabase";
import { safeNext } from "@/lib/nav";
import { abonnementActif, activerRappel, pushSupporte, RAPPEL_POST_CONNEXION_REFUSE_KEY } from "@/lib/push-client";
import { Button } from "@/components/ui";
import { Flame, Scales } from "@/components/icons";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function dejaDecline(): boolean {
  try {
    return localStorage.getItem(RAPPEL_POST_CONNEXION_REFUSE_KEY) === "1";
  } catch {
    return false;
  }
}

function SignInForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const { state } = useStudiJur();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [phase, setPhase] = useState<"formulaire" | "rappel">("formulaire");
  const [rappelOccupe, setRappelOccupe] = useState(false);

  function terminer() {
    window.location.href = next;
  }

  // Couvre à la fois le retour du lien magique (le client Supabase détecte
  // la session depuis le fragment d'URL au chargement de cette page — voir
  // emailRedirectTo ci-dessous) et la validation du code juste en dessous :
  // les deux déclenchent le même événement, donc un seul endroit décide de
  // la suite plutôt que deux chemins de redirection dupliqués.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const { data: abonnement } = sb.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      (async () => {
        if (dejaDecline() || !pushSupporte() || (await abonnementActif())) {
          terminer();
          return;
        }
        setPhase("rappel");
      })();
    });
    return () => abonnement.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function activerLeRappel() {
    setRappelOccupe(true);
    const sb = getSupabase();
    const userId = sb ? (await sb.auth.getUser()).data.user?.id ?? null : null;
    const resultat = await activerRappel(state.profile.reminderHour ?? 19, userId);
    if (!resultat.ok && resultat.refuse) {
      try { localStorage.setItem(RAPPEL_POST_CONNEXION_REFUSE_KEY, "1"); } catch { /* tant pis */ }
    }
    terminer();
  }

  function plusTard() {
    try { localStorage.setItem(RAPPEL_POST_CONNEXION_REFUSE_KEY, "1"); } catch { /* tant pis */ }
    terminer();
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setError("");
    const { error: err } = await sb.auth.signInWithOtp({
      email: email.trim(),
      // Renvoie vers cette page plutôt que directement vers `next` : c'est ce
      // qui permet de proposer l'étape "rappel" avant d'arriver sur `next`,
      // qu'on revienne par le lien ou par le code juste en dessous.
      options: {
        emailRedirectTo: typeof window !== "undefined"
          ? `${window.location.origin}/connexion?next=${encodeURIComponent(next)}`
          : undefined,
      },
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
    // La suite (étape rappel ou redirection vers `next`) est décidée par
    // l'écouteur onAuthStateChange ci-dessus, déclenché par ce même verifyOtp.
  }

  if (phase === "rappel") {
    return (
      <div className="mx-auto max-w-sm py-10 text-center">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
          <Flame className="h-7 w-7" />
        </span>
        <h1 className="serif text-[24px] font-bold leading-tight">
          Active ton rappel quotidien pour ne pas rater ton CC1
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Un seul message le soir, à l&apos;heure de ton choix. Modifiable ou désactivable à tout moment dans les
          réglages.
        </p>
        <div className="mt-6 space-y-3">
          <Button onClick={activerLeRappel} disabled={rappelOccupe} size="lg" full>
            {rappelOccupe ? "Activation…" : "Activer le rappel"}
          </Button>
          <button onClick={plusTard} disabled={rappelOccupe}
            className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
            Plus tard
          </button>
        </div>
      </div>
    );
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

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseConfigured } from "@/lib/state";
import { getSupabase } from "@/lib/supabase";
import { safeNext } from "@/lib/nav";
import { Button } from "@/components/ui";
import { Scales } from "@/components/icons";
import { attribuerParrainageSiBesoin } from "@/lib/referral";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [renvoiDisponibleDans, setRenvoiDisponibleDans] = useState(0);

  function terminer() {
    // Aucun contexte précis demandé (cas par défaut) : direction la séance du
    // jour plutôt que le tableau de bord — ça évite le clic en plus, et
    // c'était la fuite la plus nette une fois connecté (élèves qui se
    // connectaient puis ne faisaient jamais leur première leçon). L'étape
    // "activer le rappel" qui s'affichait ici avant d'arriver sur la leçon a
    // été retirée pour la même raison : elle ajoutait un palier de friction
    // juste avant le premier contenu réel. Le rappel est maintenant proposé
    // plus tard, une fois l'élève engagé, via le bandeau RappelPromo de la
    // page d'accueil.
    window.location.href = next === "/" ? "/?bienvenue=1" : next;
  }

  // Couvre à la fois le retour du lien magique (le client Supabase détecte
  // la session depuis le fragment d'URL au chargement de cette page — voir
  // emailRedirectTo ci-dessous) et la validation du code juste en dessous :
  // les deux déclenchent le même événement.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const { data: abonnement } = sb.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN") return;
      (async () => {
        // Attendu avant terminer() : celui-ci navigue via window.location.href,
        // ce qui coupe toute requête encore en vol — l'attribution doit donc
        // être terminée avant la redirection, pas lancée en tâche de fond.
        const userId = session?.user?.id;
        if (userId) await attribuerParrainageSiBesoin(userId);
        terminer();
      })();
    });
    return () => abonnement.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compte à rebours avant de proposer le renvoi : évite qu'on le déclenche
  // par réflexe avant même que le premier email ait eu une chance d'arriver.
  useEffect(() => {
    if (renvoiDisponibleDans <= 0) return;
    const t = setTimeout(() => setRenvoiDisponibleDans((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [renvoiDisponibleDans]);

  async function envoyerLien() {
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setError("");
    const { error: err } = await sb.auth.signInWithOtp({
      email: email.trim(),
      // Renvoie vers cette page plutôt que directement vers `next` : c'est ce
      // qui permet à l'écouteur onAuthStateChange de gérer la redirection de
      // façon uniforme, qu'on revienne par le lien ou par le code juste en
      // dessous.
      options: {
        emailRedirectTo: typeof window !== "undefined"
          ? `${window.location.origin}/connexion?next=${encodeURIComponent(next)}`
          : undefined,
      },
    });
    setBusy(false);
    if (err) setError(err.message);
    else { setSent(true); setRenvoiDisponibleDans(30); }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    await envoyerLien();
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
    // La suite (redirection vers `next`) est décidée par l'écouteur
    // onAuthStateChange ci-dessus, déclenché par ce même verifyOtp.
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

          <p className="mt-5 text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Pas reçu ? Vérifie aussi tes spams / courriers indésirables — certaines adresses universitaires
            filtrent ce type d&apos;email.
          </p>
          <button onClick={envoyerLien} disabled={busy || renvoiDisponibleDans > 0}
            className="mt-2 text-[13px] font-semibold underline disabled:no-underline"
            style={{ color: renvoiDisponibleDans > 0 ? "var(--muted)" : "var(--accent)" }}>
            {busy ? "Envoi…" : renvoiDisponibleDans > 0 ? `Renvoyer le lien (${renvoiDisponibleDans}s)` : "Renvoyer le lien"}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-[14.5px]" style={{ color: "var(--muted)" }}>
            Entre ton adresse : tu recevras un lien de connexion, sans mot de passe.
          </p>
          <p className="mt-2 text-[13px] font-semibold" style={{ color: "var(--accent)" }}>
            Pour ne jamais perdre ta progression, et être rappelé avant tes prochains CC.
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

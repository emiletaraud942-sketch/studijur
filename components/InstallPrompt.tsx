"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "studijur.install-dismissed.v1";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const w = window as unknown as { MSStream?: unknown };
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !w.MSStream;
}

// Bannière d'installation PWA : « épingler » StudiJur sur l'écran d'accueil
// (mobile) ou l'installer comme application (bureau). Sur Chrome/Edge, on
// intercepte l'évènement natif pour proposer un vrai bouton « Installer ».
// Sur iOS/Safari, cet évènement n'existe pas : on affiche le mode d'emploi.
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* stockage bloqué : on affiche quand même, tant pis pour la mémorisation */
    }

    if (isIOS()) {
      setIos(true);
      setShow(true);
      return;
    }

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setShow(true);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* tant pis, la bannière pourra réapparaître */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setShow(false);
    // Une fois l'installation acceptée, la bannière ne doit plus jamais
    // revenir sur cet appareil — sinon elle réapparaît tant que l'utilisateur
    // n'a pas rouvert StudiJur depuis l'icône (display-mode: standalone).
    // Un refus, en revanche, reste temporaire : on peut la reproposer plus tard.
    if (outcome === "accepted") {
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        /* tant pis, la bannière pourra réapparaître */
      }
    }
  }

  if (!show) return null;

  return (
    <div className="mx-auto max-w-[1080px] px-4 pt-3">
      <div
        className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
        style={{ background: "var(--accent-soft)", border: "1.5px solid var(--card-border)" }}
      >
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold" style={{ color: "var(--accent-strong)" }}>
            Installer StudiJur
          </p>
          <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--ink-2)" }}>
            {ios
              ? "Appuie sur Partager (le carré avec la flèche), puis « Sur l'écran d'accueil »."
              : "Épingle StudiJur sur ton écran d'accueil ou ton bureau : l'appli s'ouvre en plein écran, sans le navigateur."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!ios && (
            <button
              onClick={install}
              className="rounded-full px-3.5 py-2 text-[12.5px] font-bold"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            >
              Installer
            </button>
          )}
          <button
            onClick={dismiss}
            aria-label="Fermer"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold"
            style={{ color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

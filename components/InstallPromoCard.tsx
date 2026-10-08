"use client";

import { useEffect, useState } from "react";
import { INSTALL_DISMISS_KEY, isIOS, isStandalone } from "@/lib/install-client";
import { Button } from "./ui";
import { Pin } from "./icons";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Carte « épingler », juste à côté du rappel quotidien en fin de 1ère leçon
// (voir DoneStep dans app/lecon/[id]/page.tsx) — demande du 08/10/2026 :
// l'épinglage et les notifications sont les deux leviers de retour, à
// proposer ensemble à ce moment précis plutôt qu'à une visite ultérieure
// hypothétique. Sur iOS, RappelPromo affiche déjà le mode d'emploi
// d'installation dès que `pushSupporte()` est faux (cas standard avant
// installation) : cette carte s'efface donc sur iOS pour ne pas répéter la
// même instruction deux fois sur le même écran. Partage la clé de refus de
// InstallPrompt (bannière de l'accueil) : décliner ici ne la fait pas
// réapparaître à la prochaine visite, et inversement.
export default function InstallPromoCard() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isIOS() || isStandalone()) return;
    try {
      if (localStorage.getItem(INSTALL_DISMISS_KEY)) return;
    } catch {
      /* stockage bloqué : on affiche quand même, tant pis pour la mémorisation */
    }
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setShow(true);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function decliner() {
    try { localStorage.setItem(INSTALL_DISMISS_KEY, "1"); } catch { /* tant pis */ }
    setShow(false);
  }

  async function installer() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setShow(false);
    if (outcome === "accepted") {
      try { localStorage.setItem(INSTALL_DISMISS_KEY, "1"); } catch { /* tant pis */ }
    }
  }

  if (!show) return null;

  return (
    <div data-hue="gold" className="rise card flex items-start gap-3.5 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
        <Pin className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-semibold">Épingle StudiJur sur ton écran d&apos;accueil</h2>
        <p className="mt-0.5 text-[13px] leading-snug" style={{ color: "var(--muted)" }}>
          L&apos;appli s&apos;ouvre en plein écran, sans le navigateur — plus simple à rouvrir demain.
        </p>
        <div className="mt-3 flex gap-2">
          <Button onClick={installer} size="sm">Installer</Button>
          <Button onClick={decliner} variant="outline" size="sm">Plus tard</Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Configuration à changer soi-même à chaque échéance — rien d'autre à
// toucher dans ce fichier. `id` doit changer à chaque nouvelle échéance :
// c'est lui qui sert de clé de mémorisation, donc un id différent fait
// réapparaître le bandeau même chez quelqu'un qui avait fermé le précédent.
const URGENCY = {
  id: "cc1-intro-droit-2026-09-29",
  message: "CC1 d'Introduction générale au droit — mardi 29 septembre.",
  ctaLabel: "Réviser maintenant",
  href: "/entrainement/intro-generale",
  // Le bandeau ne s'affiche plus du tout à partir de cette date, même sans
  // fermeture manuelle — inutile de rappeler un contrôle déjà passé.
  hideAfter: "2026-09-30T00:00:00+02:00",
};

const DISMISS_KEY = `studijur.urgency-dismissed.${URGENCY.id}`;

export default function UrgencyBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Date.now() >= new Date(URGENCY.hideAfter).getTime()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* stockage bloqué : on affiche quand même, tant pis pour la mémorisation */
    }
    setShow(true);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* tant pis, le bandeau pourra réapparaître */
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
            {URGENCY.message}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={URGENCY.href}
            className="rounded-full px-3.5 py-2 text-[12.5px] font-bold"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          >
            {URGENCY.ctaLabel}
          </Link>
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

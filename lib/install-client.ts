"use client";

// Détection d'installation PWA, côté navigateur — partagée entre la bannière
// générale (components/InstallPrompt.tsx) et la carte proposée juste après
// la première leçon (components/InstallPromoCard.tsx, voir DoneStep dans
// app/lecon/[id]/page.tsx). Même clé de refus pour les deux : décliner l'une
// ne doit pas faire réapparaître l'autre à la prochaine visite.

export const INSTALL_DISMISS_KEY = "studijur.install-dismissed.v1";

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const w = window as unknown as { MSStream?: unknown };
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !w.MSStream;
}

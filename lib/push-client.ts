"use client";

// Logique d'abonnement aux notifications push, côté navigateur — partagée
// entre le réglage "Rappel quotidien" (components/Rappel.tsx) et l'étape
// proposée juste après la connexion (app/connexion/page.tsx).

const CLE = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

// Posé quand l'élève a explicitement décliné le rappel proposé après la
// connexion (bouton "Plus tard", ou refus de la permission navigateur) :
// on ne le repropose alors plus à chaque connexion.
export const RAPPEL_POST_CONNEXION_REFUSE_KEY = "studijur.rappel-post-connexion-refuse";

export function pushSupporte(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    CLE.length > 0
  );
}

function cleVersOctets(base64: string): Uint8Array {
  const rempli = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const brut = atob(rempli);
  const octets = new Uint8Array(brut.length);
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i);
  return octets;
}

// Un abonnement push existe déjà sur cet appareil (activé depuis les
// réglages, ou lors d'une connexion précédente) : inutile de reproposer
// l'étape post-connexion dans ce cas.
export async function abonnementActif(): Promise<boolean> {
  if (!pushSupporte()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return Boolean(sub);
  } catch {
    return false;
  }
}

export type ResultatRappel = { ok: true } | { ok: false; refuse: boolean; message?: string };

// Demande la permission de notification puis abonne l'appareil au push.
export async function activerRappel(hour: number, userId: string | null): Promise<ResultatRappel> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, refuse: permission === "denied" };
    }
    const reg = await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: cleVersOctets(CLE) as BufferSource,
      }));

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), hour, userId }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, refuse: false, message: data.error ?? "L'enregistrement du rappel a échoué." };
    return { ok: true };
  } catch {
    return { ok: false, refuse: false, message: "Impossible d'activer les notifications sur cet appareil." };
  }
}

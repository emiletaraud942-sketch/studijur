"use client";

import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const t = setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* navigateur privé ou stockage bloqué : l'application marche sans */
      });
    }, 1200);
    return () => clearTimeout(t);
  }, []);
  return null;
}

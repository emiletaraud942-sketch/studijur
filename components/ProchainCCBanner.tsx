"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ccAVenir, type RevisionCCConfig } from "@/lib/revision-cc-config";
import { Arrow, Clock } from "./icons";

// Calculé côté client uniquement (useEffect, pas au premier rendu) : une
// comparaison à Date.now() rendue côté serveur puis réhydratée côté client
// peut différer de quelques secondes et déclencher un avertissement
// d'hydratation React pour un gain nul ici.
export default function ProchainCCBanner() {
  const [items, setItems] = useState<RevisionCCConfig[]>([]);

  useEffect(() => { setItems(ccAVenir()); }, []);

  if (!items.length) return null;

  return (
    <div className="space-y-2.5">
      {items.map((c) => {
        const jours = Math.ceil((new Date(`${c.ccDate}T00:00:00+02:00`).getTime() - Date.now()) / 86400000);
        return (
          <Link key={c.id} href={`/revision-cc/${c.id}`} data-hue="gold"
            className="rise card flex items-center gap-3.5 p-4 transition-transform hover:-translate-y-0.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
              <Clock className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold">Réviser pour {c.label}</h2>
              <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>
                {jours <= 0 ? "C'est aujourd'hui" : `CC dans ${jours} jour${jours > 1 ? "s" : ""}`}
              </p>
            </div>
            <span className="shrink-0" style={{ color: "var(--muted)" }}><Arrow className="h-4 w-4" /></span>
          </Link>
        );
      })}
    </div>
  );
}

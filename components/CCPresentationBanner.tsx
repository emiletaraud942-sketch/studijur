"use client";

import { useEffect, useState } from "react";
import { REVISION_CC, type RevisionCCConfig } from "@/lib/revision-cc-config";
import { Clock } from "./icons";

// Contrairement à ProchainCCBanner (dans l'app, fenêtre de 14 jours pour ne
// pousser que l'urgence réelle), cette bannière vit sur /presentation — la
// page pensée pour un lien partagé dans un groupe, à n'importe quel moment
// avant le CC. Ici on VEUT annoncer l'échéance tôt, pour attirer avant la
// dernière semaine plutôt que de laisser le pic de trafic se concentrer sur
// les deux derniers jours (constat du 02/10/2026 : aucune longévité d'usage
// avec ce pic-là). Calculé côté client (voir ProchainCCBanner) pour éviter
// un écart de rendu serveur/client sur Date.now().
function groupesParDate(items: RevisionCCConfig[]): { date: string; jours: number; label: string }[] {
  const dated = items.filter((c): c is RevisionCCConfig & { ccDate: string } => Boolean(c.ccDate));
  const parDate = new Map<string, string[]>();
  for (const c of dated) {
    const liste = parDate.get(c.ccDate) ?? [];
    liste.push(c.label);
    parDate.set(c.ccDate, liste);
  }
  return [...parDate.entries()]
    .map(([date, labels]) => ({
      date,
      jours: Math.ceil((new Date(`${date}T00:00:00+02:00`).getTime() - Date.now()) / 86400000),
      label: labels.join(" & "),
    }))
    .filter((g) => g.jours >= 0)
    .sort((a, b) => a.jours - b.jours);
}

export default function CCPresentationBanner() {
  const [groupes, setGroupes] = useState<{ date: string; jours: number; label: string }[]>([]);

  useEffect(() => { setGroupes(groupesParDate(Object.values(REVISION_CC))); }, []);

  if (!groupes.length) return null;

  return (
    <section className="card overflow-hidden" data-hue="gold">
      <div className="h-1" style={{ background: "var(--bad)" }} />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
            <Clock className="h-[18px] w-[18px]" />
          </span>
          <h2 className="text-[15px] font-bold">Les prochains CC approchent</h2>
        </div>
        <div className="mt-3 space-y-1.5">
          {groupes.map((g) => (
            <p key={g.date} className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              <strong>{g.label}</strong> — dans {g.jours} jour{g.jours > 1 ? "s" : ""}
            </p>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Le mieux, c&apos;est de ne pas attendre la dernière semaine : 5 minutes par jour maintenant valent mieux
          qu&apos;une nuit blanche la veille. La fiche de révision flash (compte à rebours, chronologie, quiz
          mélangé) t&apos;attend une fois le compte créé.
        </p>
      </div>
    </section>
  );
}

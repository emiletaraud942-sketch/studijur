"use client";

import { useState } from "react";
import Link from "next/link";
import { REVISION_CC } from "@/lib/revision-cc-config";
import { Chevron, Clock, Scales, Target } from "./icons";
import { Tag } from "./ui";

type Outil = { href: string; Icon: typeof Scales; title: string; text: string; nouveau?: boolean };

const SENTRAINER: Outil[] = [
  { href: "/revision-intensive", Icon: Clock, title: "Révision intensive", text: "La fiche de dernière minute — tout le programme condensé — puis un quiz éclair toutes matières." },
  { href: "/entrainement/intro-generale", Icon: Target, title: "Entraînement CC1", text: "30 questions dans le style exact du sujet donné par ton professeur." },
  { href: "/cas-pratiques", Icon: Target, title: "Cas pratiques guidés", text: "La méthode pas à pas, avec la correction révélée seulement après ta réponse à chaque étape." },
  { href: "/entrainement-methode", Icon: Scales, title: "S'entraîner à la méthode", text: "Cas pratique, commentaire d'arrêt, dissertation — rédige en conditions réelles, puis une correction IA notée sur 20.", nouveau: true },
];

// Replié par défaut : ProchainCCHero et RevisionEspacee couvrent déjà "que
// faire maintenant" pour l'écrasante majorité des visites. Le reste (choisir
// une autre matière que celle détectée, les outils d'entraînement ponctuels)
// reste accessible en un tap plutôt que de concourir visuellement avec
// l'action principale — c'est ce qui rendait la page dense avant le
// 09/10/2026 (8 entrées sans hiérarchie claire, retour utilisateur du
// 08/10/2026).
export default function ReviserOutils() {
  const [ouvert, setOuvert] = useState(false);
  const matieres = Object.values(REVISION_CC);

  return (
    <section>
      <button onClick={() => setOuvert((o) => !o)}
        className="flex w-full items-center justify-between rounded-2xl p-4 text-left"
        style={{ background: "var(--surface-2)" }}>
        <span className="text-[14px] font-semibold">Plus d&apos;outils de révision</span>
        <Chevron className={`h-4 w-4 shrink-0 transition-transform duration-200 ${ouvert ? "rotate-90" : ""}`} />
      </button>

      {ouvert && (
        <div className="rise mt-4 space-y-6">
          <div>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>
              Plan de révision par matière, calé sur ton CC
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {matieres.map((m) => (
                <Link key={m.id} href={`/revision-cc/${m.id}`} data-hue="gold"
                  className="card flex items-center gap-3 p-3.5 transition-transform hover:-translate-y-0.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                    <Clock className="h-[17px] w-[17px]" />
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">{m.label}</span>
                  <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
                </Link>
              ))}
            </div>
          </div>

          <div data-hue="gold">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>
              S&apos;entraîner avant l&apos;examen
            </div>
            <div className="space-y-2.5">
              {SENTRAINER.map(({ href, Icon, title, text, nouveau }) => (
                <Link key={href} href={href}
                  className="card flex items-center gap-3.5 p-3.5 transition-transform hover:-translate-y-0.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                    <Icon className="h-[19px] w-[19px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14.5px] font-semibold">{title}</h3>
                      {nouveau && <Tag tone="gold">Nouveau</Tag>}
                    </div>
                    <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>{text}</p>
                  </div>
                  <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

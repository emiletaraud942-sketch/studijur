import Link from "next/link";
import { Arrow, Quill, Target } from "@/components/icons";

const MODULES = [
  {
    href: "/entrainement/intro-generale",
    hue: "gold",
    Icon: Quill,
    title: "Introduction générale au droit",
    text: "Deux onglets : 30 questions basées sur le sujet d'entraînement du CC1, et les questions de révision générale.",
  },
  {
    href: "/entrainement/organisation-juridictionnelle",
    hue: "blue",
    Icon: Target,
    title: "Organisation juridictionnelle",
    text: "QCM : toutes les questions du programme mélangées, comme à l'intero.",
  },
] as const;

export default function EntrainementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Entraînement intero</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Gratuit, sans limite, même sans abonnement.
        </p>
      </div>

      <div className="space-y-3">
        {MODULES.map(({ href, hue, Icon, title, text }) => (
          <Link key={href} href={href} data-hue={hue}
            className="card flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15.5px] font-semibold">{title}</h3>
              <p className="mt-0.5 text-[13px] leading-snug" style={{ color: "var(--muted)" }}>{text}</p>
            </div>
            <span className="shrink-0" style={{ color: "var(--muted)" }}>
              <Arrow className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Arrow, Cards, Flame, Target } from "@/components/icons";

const ITEMS = [
  {
    href: "/classement",
    hue: "gold",
    Icon: Flame,
    title: "Classement de promo",
    text: "Compare ta série et tes définitions sues à celles de ta promo, de façon anonyme.",
  },
  {
    href: "/revision-intensive",
    hue: "rust",
    Icon: Cards,
    title: "Révision intensive",
    text: "Une fiche condensée et un quiz éclair qui mélange toutes tes matières, avant un partiel.",
  },
  {
    href: "/cas-pratiques",
    hue: "blue",
    Icon: Target,
    title: "Cas pratiques guidés",
    text: "La méthode pas à pas, avec la correction révélée seulement après ta réponse à chaque étape.",
  },
] as const;

export default function PlusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Plus</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Les autres façons de progresser, en dehors de la séance du jour.
        </p>
      </div>

      <div className="space-y-3">
        {ITEMS.map(({ href, hue, Icon, title, text }) => (
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

      <p className="text-center text-[12.5px]" style={{ color: "var(--muted)" }}>
        Encore une mention légale au menu : voir <Link href="/mentions-legales" className="underline">mentions légales</Link>.
      </p>
    </div>
  );
}

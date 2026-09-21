"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudiJur, trialDaysLeft } from "@/lib/state";
import { Books, Chart, Gear, Grid, Home, Quill, Scales, Upload, Flame } from "./icons";
import { longDate } from "@/lib/format";
import InstallPrompt from "./InstallPrompt";

const NAV = [
  { href: "/", label: "Aujourd'hui", Icon: Home },
  { href: "/bibliotheque", label: "Matières", Icon: Books },
  { href: "/cours", label: "Cours", Icon: Quill },
  { href: "/mes-cours", label: "Mes cours", Icon: Upload },
  { href: "/progression", label: "Progression", Icon: Chart },
  { href: "/plus", label: "Plus", Icon: Grid },
  { href: "/reglages", label: "Réglages", Icon: Gear },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, ready } = useStudiJur();
  const inLesson = pathname?.startsWith("/lecon/");
  const publique = pathname === "/presentation";
  const daysLeft = trialDaysLeft(state);
  const showTrial = ready && state.profile.plan !== "active" && daysLeft <= 7;

  return (
    <div className="min-h-dvh">
      {!inLesson && (
        <header className="sticky top-0 z-30" style={{ background: "color-mix(in srgb, var(--paper) 88%, transparent)", backdropFilter: "blur(12px)" }}>
          <div className="mx-auto max-w-[1080px] px-4">
            <div className="flex items-center justify-between gap-4 pt-4 pb-3">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-2xl" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  <Scales className="h-5 w-5" />
                </span>
                <span>
                  <span className="serif block text-[20px] font-bold leading-none tracking-tight">StudiJur</span>
                  <span className="block text-[10.5px] font-medium uppercase tracking-[0.16em]" style={{ color: "var(--muted)" }}>
                    5 minutes de droit
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-3">
                {ready && !publique && state.streak.current > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold tabular"
                    style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
                    <Flame className="h-4 w-4" />
                    {state.streak.current}
                  </span>
                )}
                {publique ? (
                  <Link href="/" className="rounded-full px-3.5 py-2 text-[13.5px] font-bold"
                    style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                    Commencer
                  </Link>
                ) : (
                  <span className="hidden text-[13px] sm:block" style={{ color: "var(--muted)" }}>
                    {longDate()}
                  </span>
                )}
              </div>
            </div>
            <div className="rule rounded-full" />
          </div>
        </header>
      )}

      {!inLesson && !publique && <InstallPrompt />}

      {showTrial && !inLesson && !publique && (
        <div className="mx-auto max-w-[1080px] px-4 pt-3">
          <Link href="/abonnement" className="flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-medium"
            style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
            <span>
              {daysLeft > 0
                ? `Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`
                : "Ton essai gratuit est terminé"}
            </span>
            <span className="font-bold">S'abonner →</span>
          </Link>
        </div>
      )}

      <main className={`mx-auto max-w-[1080px] px-4 ${inLesson ? "pb-10 pt-0" : publique ? "pb-14 pt-6" : "pb-28 pt-6"}`}>{children}</main>

      {!inLesson && !publique && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t"
          style={{ background: "color-mix(in srgb, var(--surface) 94%, transparent)", backdropFilter: "blur(14px)", borderColor: "var(--line)", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="mx-auto flex max-w-[1080px] items-stretch justify-around px-2">
            {NAV.map(({ href, label, Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
              return (
                <Link key={href} href={href}
                  className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold transition-colors"
                  style={{ color: active ? "var(--accent)" : "var(--muted)" }}>
                  <Icon className="h-[21px] w-[21px]" />
                  <span className="text-center leading-tight">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

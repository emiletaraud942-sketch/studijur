"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useStudiJur, trialDaysLeft, supabaseConfigured, estVisiteurNeuf, estPremium } from "@/lib/state";
import { apresBascule } from "@/lib/tarifs";
import { connexionHref } from "@/lib/nav";
import { Books, Chart, Grid, Home, Scales, Search, Target, Flame, Upload } from "./icons";
import InstallPrompt from "./InstallPrompt";
import SearchOverlay from "./SearchOverlay";

// 6 onglets : "Matières" et "Cours" (même liste, juste pratique vs. lecture)
// fusionnent dans /programme ; "Réviser" regroupe tout ce qui prépare un CC ;
// "Mes cours" (dépôt) ressort de "Plus" avec son propre onglet le 09/10/2026 —
// différenciateur n°1 du site, il ne doit pas dépendre d'un détour pour être
// découvert. "Réglages" reste dans "Plus" (sous le nom "Profil").
const NAV = [
  { href: "/", label: "Aujourd'hui", Icon: Home },
  { href: "/programme", label: "Programme", Icon: Books },
  { href: "/mes-cours", label: "Mes cours", Icon: Upload },
  { href: "/reviser", label: "Réviser", Icon: Target },
  { href: "/progression", label: "Progression", Icon: Chart },
  { href: "/plus", label: "Plus", Icon: Grid },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { state, ready, signedInAs } = useStudiJur();
  const inLesson = pathname?.startsWith("/lecon/");
  // "/" bascule aussi en mode vitrine (pas de nav, pas de bandeaux d'app) pour
  // un premier visiteur : app/page.tsx y affiche alors le même contenu que
  // /presentation (voir Landing) plutôt que le tableau de bord.
  const publique = pathname === "/presentation" || (pathname === "/" && ready && estVisiteurNeuf(state, signedInAs));
  const daysLeft = trialDaysLeft(state);
  const midTrial = daysLeft >= 2 && daysLeft <= 4;
  // Sans compte, le vrai palier n'est pas le compte à rebours de l'essai
  // (inopérant tant qu'aucun compte ne l'ancre) mais la connexion, requise
  // après une leçon complète — voir anonymousLessonCapReached.
  const anonyme = supabaseConfigured && !signedInAs;
  // Fenêtre d'urgence du bandeau : la dernière semaine, quelle que soit la
  // durée totale de l'essai (10 jours fixes ou prolongée jusqu'au CC).
  const showTrial = ready && !anonyme && !estPremium(state) && daysLeft <= 7;
  const showConnexion = ready && anonyme;
  const initiale = (state.profile.firstName?.trim()?.[0] ?? "É").toUpperCase();
  const chrome = !inLesson && !publique;

  return (
    <div className="min-h-dvh md:flex">
      {/* Barre latérale façon usekard.be/espace : fixe sur bureau, remplacée
          par la barre d'onglets du bas sur mobile (nav identique, en dessous). */}
      {chrome && (
        <aside className="hidden w-[248px] shrink-0 border-r md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col md:px-4 md:py-6"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
          <Link href="/" className="flex items-center gap-2.5 px-2 pb-6">
            <span className="grid h-9 w-9 place-items-center rounded-2xl" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              <Scales className="h-5 w-5" />
            </span>
            <span className="text-[16px] font-extrabold uppercase tracking-tight">StudiJur</span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map(({ href, label, Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
              return (
                <Link key={href} href={href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors"
                  style={active ? { background: "var(--accent-soft)", color: "var(--accent)" } : { color: "var(--ink-2)" }}>
                  <Icon className="h-[19px] w-[19px] shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
          {ready && state.streak.current > 0 && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-bold tabular"
              style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
              <Flame className="h-4 w-4" />
              {state.streak.current} jour{state.streak.current > 1 ? "s" : ""} de suite
            </div>
          )}
        </aside>
      )}

      <div className={chrome ? "min-w-0 flex-1 md:pl-[248px]" : "min-w-0 flex-1"}>
        {chrome && (
          <header className="sticky top-0 z-30 border-b" style={{ background: "color-mix(in srgb, var(--paper) 92%, transparent)", backdropFilter: "blur(12px)", borderColor: "var(--line)" }}>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Link href="/" className="flex items-center gap-2 md:hidden">
                <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  <Scales className="h-4 w-4" />
                </span>
              </Link>
              <button onClick={() => setSearchOpen(true)} aria-label="Rechercher"
                className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-4 py-2.5 text-left"
                style={{ background: "var(--surface-2)" }}>
                <span className="shrink-0" style={{ color: "var(--muted)" }}><Search className="h-4 w-4" /></span>
                <span className="truncate text-[13.5px]" style={{ color: "var(--muted)" }}>
                  Rechercher une leçon, une matière…
                </span>
              </button>
              {ready && state.streak.current > 0 && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold tabular md:hidden"
                  style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
                  <Flame className="h-4 w-4" />
                  {state.streak.current}
                </span>
              )}
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: "var(--accent)" }}>
                {initiale}
              </span>
            </div>
          </header>
        )}

        {chrome && <InstallPrompt />}

        {showConnexion && chrome && (
          <div className="px-4 pt-4">
            <Link href={connexionHref(pathname)} className="flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-medium"
              style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
              <span>Une leçon complète en libre accès — connecte-toi gratuitement pour continuer</span>
              <span className="font-bold">Se connecter →</span>
            </Link>
          </div>
        )}

        {showTrial && chrome && (
          <div className="px-4 pt-4">
            <Link href="/abonnement" className="flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-medium"
              style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
              <span>
                {daysLeft <= 0
                  ? (apresBascule() ? "Une leçon gratuite par jour — pass 7 jours pour tout débloquer" : "Ton essai gratuit est terminé")
                  // Milieu d'essai (J3-J5 sur 7) : personne ne va jamais voir les
                  // formules avant que l'essai n'expire — le bandeau générique,
                  // affiché tout du long, ne suffit pas à l'inciter. Un message
                  // qui pousse à regarder plutôt qu'à décider tout de suite.
                  : midTrial
                    ? `Plus que ${daysLeft} jour${daysLeft > 1 ? "s" : ""} d'essai — vois ce que l'abonnement débloque`
                    : `Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`}
              </span>
              <span className="font-bold">{daysLeft <= 0 ? "Voir le pass →" : midTrial ? "Voir les formules →" : "S'abonner →"}</span>
            </Link>
          </div>
        )}

        <main className={`mx-auto max-w-[1080px] px-4 ${inLesson ? "pb-10 pt-0" : publique ? "pb-14 pt-6" : "pb-28 pt-6 md:pb-10"}`}>{children}</main>

        {chrome && (
          <nav className="fixed inset-x-0 bottom-0 z-30 border-t md:hidden"
            style={{ background: "color-mix(in srgb, var(--surface) 94%, transparent)", backdropFilter: "blur(14px)", borderColor: "var(--line)", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="flex items-stretch justify-around px-2">
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

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

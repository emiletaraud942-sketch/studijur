"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStudiJur, supabaseConfigured, trialDaysLeft } from "@/lib/state";
import { allCourses } from "@/lib/corpus";
import { getSupabase } from "@/lib/supabase";
import { connexionHref } from "@/lib/nav";
import { Button, SectionTitle } from "@/components/ui";
import { Check } from "@/components/icons";
import Rappel from "@/components/Rappel";

export default function SettingsPage() {
  const pathname = usePathname();
  const { state, ready, update, reset, signedInAs, syncing } = useStudiJur();
  const [confirmReset, setConfirmReset] = useState(false);
  const courses = allCourses(state.customCourses);

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  const active = state.profile.activeCourses;
  const isActive = (id: string) => active.length === 0 || active.includes(id);

  function toggleCourse(id: string) {
    update((d) => {
      const current = d.profile.activeCourses.length ? d.profile.activeCourses : courses.map((c) => c.id);
      const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
      d.profile.activeCourses = next.length === courses.length ? [] : next;
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Réglages</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>Ton profil, ton programme et ton compte.</p>
      </div>

      <section className="card p-5">
        <SectionTitle kicker="Profil" title="Qui es-tu ?" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" value={state.profile.firstName ?? ""} placeholder="Émile"
            onChange={(v) => update((d) => { d.profile.firstName = v || undefined; })} />
          <Field label="Faculté" value={state.profile.university ?? ""} placeholder="Université de Rouen"
            onChange={(v) => update((d) => { d.profile.university = v || undefined; })} />
        </div>
        <div className="mt-4">
          <div className="mb-2 text-[13px] font-semibold" style={{ color: "var(--muted)" }}>Objectif quotidien</div>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button key={n} onClick={() => update((d) => { d.profile.dailyGoal = n; })}
                className="flex-1 rounded-xl py-3 text-[14px] font-semibold transition-all active:scale-[0.98]"
                style={state.profile.dailyGoal === n
                  ? { background: "var(--accent)", color: "var(--accent-ink)" }
                  : { background: "var(--surface-2)", color: "var(--muted)" }}>
                {n} leçon{n > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle kicker="Programme" title="Matières suivies" />
        <p className="mb-3 text-[13.5px]" style={{ color: "var(--muted)" }}>
          Décoche une matière que tu n&apos;as pas cette année : elle ne sortira plus dans la séance du jour.
        </p>
        <div className="space-y-2">
          {courses.map((c) => (
            <label key={c.id} data-hue={c.hue}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3"
              style={{ borderColor: isActive(c.id) ? "var(--h)" : "var(--line)", background: isActive(c.id) ? "var(--h-soft)" : "transparent" }}>
              <span className="min-w-0">
                <span className="block truncate text-[14.5px] font-semibold">{c.title}</span>
                <span className="block text-[12.5px]" style={{ color: "var(--muted)" }}>{c.lessons.length} leçons</span>
              </span>
              <input type="checkbox" checked={isActive(c.id)} onChange={() => toggleCourse(c.id)} className="sr-only" />
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
                style={isActive(c.id) ? { background: "var(--h)", color: "var(--accent-ink)" } : { border: "1.5px solid var(--line-strong)" }}>
                {isActive(c.id) && <Check className="h-3.5 w-3.5" />}
              </span>
            </label>
          ))}
        </div>
      </section>

      <Rappel />

      <section className="card p-5">
        <SectionTitle kicker="Affichage" title="Thème" />
        <div className="flex gap-2">
          {([["auto", "Automatique"], ["light", "Clair"], ["dark", "Sombre"]] as const).map(([v, label]) => (
            <button key={v} onClick={() => update((d) => { d.profile.theme = v; })}
              className="flex-1 rounded-xl py-3 text-[14px] font-semibold transition-all active:scale-[0.98]"
              style={state.profile.theme === v
                ? { background: "var(--accent)", color: "var(--accent-ink)" }
                : { background: "var(--surface-2)", color: "var(--muted)" }}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle kicker="Compte" title="Abonnement et synchronisation" />
        <div className="space-y-2.5 text-[14px]">
          <Row label="Formule"
            value={state.profile.plan === "active" ? "Abonné" : `Essai — ${trialDaysLeft(state)} j restants`} />
          <Row label="Synchronisation"
            value={supabaseConfigured ? (signedInAs ? `${signedInAs}${syncing ? " (en cours…)" : ""}` : "Non connecté") : "Appareil uniquement"} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {supabaseConfigured && !signedInAs && <Button href={connexionHref(pathname)} variant="soft" size="sm">Se connecter</Button>}
          {supabaseConfigured && signedInAs && (
            <Button variant="outline" size="sm" onClick={async () => { await getSupabase()?.auth.signOut(); location.reload(); }}>
              Se déconnecter
            </Button>
          )}
          {/* Toujours visible : un élève doit pouvoir atteindre la gestion (et
              donc la résiliation) de son abonnement même s'il n'est pas
              connecté sur cet appareil — la page explique alors quoi faire. */}
          <Button href="/mon-abonnement" variant="soft" size="sm">Gérer mon abonnement</Button>
          {state.profile.plan !== "active" && <Button href="/abonnement" size="sm">Voir les formules</Button>}
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle kicker="Application" title="Épingler StudiJur" />
        <p className="mb-3 text-[13.5px]" style={{ color: "var(--muted)" }}>
          Installée, StudiJur s&apos;ouvre en plein écran depuis ton bureau ou ton écran d&apos;accueil, comme une
          vraie application — plus rapide, sans la barre d&apos;adresse du navigateur.
        </p>
        <div className="space-y-2 text-[13.5px]">
          <HowTo label="iPhone / iPad (Safari)">
            Appuie sur <strong>Partager</strong> (le carré avec la flèche), puis <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
          </HowTo>
          <HowTo label="Android (Chrome)">
            Menu <strong>⋮</strong> en haut à droite, puis <strong>« Installer l&apos;application »</strong>
            (ou accepte la bannière proposée automatiquement).
          </HowTo>
          <HowTo label="Ordinateur (Chrome / Edge)">
            Icône d&apos;installation <strong>⊕</strong> dans la barre d&apos;adresse, ou menu <strong>⋮</strong> →{" "}
            <strong>« Installer StudiJur »</strong>.
          </HowTo>
          <HowTo label="Mac (Safari)">
            Menu <strong>Fichier</strong> → <strong>« Ajouter au Dock »</strong>.
          </HowTo>
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle kicker="Zone sensible" title="Effacer ma progression" />
        <p className="text-[13.5px]" style={{ color: "var(--muted)" }}>
          {signedInAs
            ? "Supprime définitivement les leçons faites, les définitions mémorisées et la série — sur cet appareil et sur tous les autres connectés à ce compte, une fois la synchronisation faite."
            : "Supprime définitivement les leçons faites, les définitions mémorisées et la série sur cet appareil."}
        </p>
        <div className="mt-4">
          {confirmReset ? (
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmReset(false)}>Annuler</Button>
              <button onClick={() => { reset(); setConfirmReset(false); }}
                className="rounded-lg px-3 py-1.5 text-[13px] font-semibold"
                style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
                Oui, tout effacer
              </button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmReset(true)}>Effacer ma progression</Button>
          )}
        </div>
      </section>

      <p className="text-center text-[12.5px]">
        <Link href="/mentions-legales" className="underline" style={{ color: "var(--muted)" }}>
          Mentions légales & Conditions d&apos;utilisation
        </Link>
      </p>
    </div>
  );
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold" style={{ color: "var(--muted)" }}>{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3.5 py-2.5 text-[14.5px] outline-none"
        style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2.5 last:border-b-0" style={{ borderColor: "var(--line)" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function HowTo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: "var(--surface-2)" }}>
      <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>{label}</div>
      <div className="mt-1 leading-relaxed" style={{ color: "var(--ink-2)" }}>{children}</div>
    </div>
  );
}


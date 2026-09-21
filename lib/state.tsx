"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import type { Course, ProgressState, StepName } from "./types";
import { bumpStreak, gradeCard, newCard, todayKey } from "./srs";
import { getSupabase, supabaseConfigured } from "./supabase";

const KEY = "lexio.state.v1";
const TRIAL_DAYS = 7;

function freshState(): ProgressState {
  const now = new Date().toISOString();
  return {
    version: 1,
    profile: {
      dailyGoal: 1,
      activeCourses: [],
      // Thème clair par défaut : on ne suit plus la préférence système, pour
      // une première impression cohérente (beaucoup de mobiles sont en sombre
      // par défaut, ce qui ne mettait pas le design de StudiJur en valeur).
      theme: "light",
      createdAt: now,
      trialStartedAt: now,
      plan: "trial",
    },
    lessons: {},
    cards: {},
    streak: { current: 0, best: 0, days: [] },
    customCourses: [],
  };
}

function readLocal(): ProgressState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || typeof parsed !== "object" || !parsed.profile) return null;
    return { ...freshState(), ...parsed, profile: { ...freshState().profile, ...parsed.profile } };
  } catch {
    return null;
  }
}

function writeLocal(state: ProgressState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota dépassé ou stockage bloqué : l'application continue en mémoire */
  }
}

export function trialDaysLeft(state: ProgressState): number {
  const start = new Date(state.profile.trialStartedAt).getTime();
  const elapsed = Math.floor((Date.now() - start) / 86400000);
  return Math.max(0, TRIAL_DAYS - elapsed);
}

export function hasAccess(state: ProgressState): boolean {
  return state.profile.plan === "active" || trialDaysLeft(state) > 0;
}

// Le corpus fait 32 leçons : sans plafond, un élève motivé peut tout finir
// pendant les 7 jours d'essai, avant même d'être passé à la caisse. Deux
// leçons suffisent à donner un aperçu sans vider le corpus. Une leçon déjà
// commencée reste toujours consultable, seules les nouvelles se verrouillent.
export const TRIAL_LESSON_LIMIT = 2;

export function trialLessonCapReached(state: ProgressState, lessonId: string): boolean {
  if (state.profile.plan === "active") return false;
  const dejaFaites = new Set(
    Object.values(state.lessons).filter((l) => l.completedAt).map((l) => l.lessonId),
  );
  if (dejaFaites.has(lessonId)) return false;
  return dejaFaites.size >= TRIAL_LESSON_LIMIT;
}

// La table `subscriptions` est tenue à jour par le webhook Stripe (voir
// app/api/stripe/webhook/route.ts) mais rien ne la relisait jamais côté
// application avant cette fonction : un abonnement payé ne débloquait donc
// rien de son côté. La RLS `subscriptions_select_own` ne laisse un élève
// connecté lire que sa propre ligne (auth.jwt() ->> 'email' = email).
async function fetchSubscriptionActive(email: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { data } = await sb.from("subscriptions").select("status").eq("email", email).maybeSingle();
    return data?.status === "active" || data?.status === "trialing";
  } catch {
    return false;
  }
}

type Ctx = {
  state: ProgressState;
  ready: boolean;
  syncing: boolean;
  signedInAs: string | null;
  refreshSubscription: () => Promise<boolean>;
  update: (fn: (draft: ProgressState) => void) => void;
  completeStep: (lessonId: string, step: StepName) => void;
  saveDraft: (lessonId: string, draft: string) => void;
  recordQuiz: (lessonId: string, score: number, total: number) => void;
  gradeDefinition: (lessonId: string, term: string, knew: boolean) => void;
  addCustomCourse: (course: Course) => void;
  removeCustomCourse: (courseId: string) => void;
  reset: () => void;
};

const StudiJurCtx = createContext<Ctx | null>(null);

export function StudiJurProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(freshState);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const local = readLocal();
    if (local) setState(local);
    setReady(true);

    const sb = getSupabase();
    if (!sb) return;
    let cancelled = false;
    (async () => {
      const { data } = await sb.auth.getUser();
      if (cancelled || !data.user) return;
      setSignedInAs(data.user.email ?? data.user.id);
      const { data: row } = await sb
        .from("progress")
        .select("state")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (!cancelled && row?.state) {
        // Le distant fait foi s'il est plus récent : un réglage (heure de
        // rappel, thème…) changé depuis un autre appareil doit s'appliquer
        // ici aussi, pas seulement la progression. On compare l'horodatage
        // de dernière écriture plutôt que le nombre de leçons, qui ne dit
        // rien des réglages et pouvait laisser cet appareil bloqué sur une
        // ancienne version dès qu'il avait autant ou plus de leçons faites.
        const remote = row.state as ProgressState;
        const remoteTime = remote.savedAt ? Date.parse(remote.savedAt) : 0;
        const localTime = local?.savedAt ? Date.parse(local.savedAt) : 0;
        if (!local || remoteTime > localTime) setState({ ...freshState(), ...remote });
      }
      // Un abonnement payé peut avoir été activé depuis un autre appareil, ou
      // juste avant que cette session ne se (re)connecte : on vérifie à
      // chaque connexion plutôt que de ne jamais le faire.
      if (data.user.email) {
        const active = await fetchSubscriptionActive(data.user.email);
        if (!cancelled && active) {
          setState((prev) => (prev.profile.plan === "active" ? prev : { ...prev, profile: { ...prev.profile, plan: "active" } }));
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persistance locale immédiate, synchronisation distante différée.
  // L'horodatage est posé ici, à l'écriture, plutôt que dans `update()` : il
  // marque quand cette version a été enregistrée, pas quand elle a été
  // modifiée en mémoire, et ne modifie pas `state` (pas de boucle de re-render).
  useEffect(() => {
    if (!ready) return;
    const stamped: ProgressState = { ...state, savedAt: new Date().toISOString() };
    writeLocal(stamped);
    const sb = getSupabase();
    if (!sb || !signedInAs) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSyncing(true);
      try {
        const { data } = await sb.auth.getUser();
        if (data.user) {
          await sb.from("progress").upsert({
            user_id: data.user.id,
            state: stamped,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {
        /* hors ligne : le stockage local garde tout, la synchro reprendra */
      } finally {
        setSyncing(false);
      }
    }, 1500);
  }, [state, ready, signedInAs]);

  useEffect(() => {
    const theme = state.profile.theme;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "auto" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [state.profile.theme]);

  const update = useCallback((fn: (draft: ProgressState) => void) => {
    setState((prev) => {
      const draft: ProgressState = JSON.parse(JSON.stringify(prev));
      fn(draft);
      return draft;
    });
  }, []);

  // Exposé pour le retour de paiement (/?abonnement=ok) : le webhook Stripe
  // met la table à jour en quelques centaines de ms à quelques secondes,
  // donc la page qui gère ce retour peut appeler ceci en boucle courte le
  // temps que ça arrive, plutôt que d'attendre la prochaine connexion.
  const refreshSubscription = useCallback(async (): Promise<boolean> => {
    const sb = getSupabase();
    if (!sb) return false;
    const { data } = await sb.auth.getUser();
    if (!data.user?.email) return false;
    const active = await fetchSubscriptionActive(data.user.email);
    if (active) update((d) => { d.profile.plan = "active"; });
    return active;
  }, [update]);

  const completeStep = useCallback((lessonId: string, step: StepName) => {
    update((d) => {
      const rec = d.lessons[lessonId] ?? { lessonId };
      rec.lastStep = step;
      if (step === "quiz") {
        rec.completedAt = new Date().toISOString();
        rec.attempts = (rec.attempts ?? 0) + 1;
        d.streak = bumpStreak(d.streak);
      }
      d.lessons[lessonId] = rec;
    });
  }, [update]);

  const saveDraft = useCallback((lessonId: string, draft: string) => {
    update((d) => {
      d.lessons[lessonId] = { ...(d.lessons[lessonId] ?? { lessonId }), draft };
    });
  }, [update]);

  const recordQuiz = useCallback((lessonId: string, score: number, total: number) => {
    update((d) => {
      const rec = d.lessons[lessonId] ?? { lessonId };
      // On garde le meilleur score : refaire un quiz doit être encouragé.
      rec.quizScore = Math.max(score, rec.quizScore ?? 0);
      rec.quizTotal = total;
      d.lessons[lessonId] = rec;
    });
  }, [update]);

  const gradeDefinition = useCallback((lessonId: string, term: string, knew: boolean) => {
    update((d) => {
      const key = `${lessonId}::${term}`;
      const existing = d.cards[key];
      d.cards[key] = existing ? gradeCard(existing, knew) : newCard(lessonId, term);
      if (existing && !knew) d.cards[key] = gradeCard(existing, false);
    });
  }, [update]);

  const addCustomCourse = useCallback((course: Course) => {
    update((d) => {
      d.customCourses = [...d.customCourses.filter((c) => c.id !== course.id), course];
      if (d.profile.activeCourses.length) d.profile.activeCourses.push(course.id);
    });
  }, [update]);

  const removeCustomCourse = useCallback((courseId: string) => {
    update((d) => {
      d.customCourses = d.customCourses.filter((c) => c.id !== courseId);
      d.profile.activeCourses = d.profile.activeCourses.filter((c) => c !== courseId);
    });
  }, [update]);

  const reset = useCallback(() => {
    setState(freshState());
    try { window.localStorage.removeItem(KEY); } catch { /* ignoré */ }
  }, []);

  const value = useMemo<Ctx>(() => ({
    state, ready, syncing, signedInAs, refreshSubscription, update, completeStep, saveDraft,
    recordQuiz, gradeDefinition, addCustomCourse, removeCustomCourse, reset,
  }), [state, ready, syncing, signedInAs, refreshSubscription, update, completeStep, saveDraft,
       recordQuiz, gradeDefinition, addCustomCourse, removeCustomCourse, reset]);

  return <StudiJurCtx.Provider value={value}>{children}</StudiJurCtx.Provider>;
}

export function useStudiJur(): Ctx {
  const ctx = useContext(StudiJurCtx);
  if (!ctx) throw new Error("useStudiJur doit être utilisé dans un StudiJurProvider");
  return ctx;
}

export { supabaseConfigured, todayKey, TRIAL_DAYS };

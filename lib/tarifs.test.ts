import { afterEach, describe, expect, it, vi } from "vitest";
import { apresBascule, euros } from "./tarifs";
import { estPremium, hasAccess, leconGratuiteDisponible, passJoursRestants, trialDaysLeft } from "./state";
import type { ProgressState } from "./types";

function etat(over: Partial<ProgressState["profile"]> = {}, extra: Partial<ProgressState> = {}): ProgressState {
  return {
    version: 1,
    profile: { dailyGoal: 1, activeCourses: [], theme: "light", createdAt: "", trialStartedAt: "2026-10-01T10:00:00Z", plan: "trial", ...over },
    lessons: {}, cards: {}, notions: {}, exercicesMethodo: {}, quizMastered: {}, fichesLues: {},
    streak: { current: 0, best: 0, days: [] },
    activiteDuJour: { jour: "", reponses: 0, notionsDuesRevues: false, actuLue: false },
    customCourses: [],
    ...extra,
  } as ProgressState;
}

afterEach(() => vi.useRealTimers());

describe("tarifs", () => {
  it("formate les euros", () => {
    expect(euros(490)).toBe("4,90 €");
    expect(euros(5900)).toBe("59 €");
  });

  it("bascule au 7 novembre 2026", () => {
    expect(apresBascule(Date.parse("2026-11-06T12:00:00+01:00"))).toBe(false);
    expect(apresBascule(Date.parse("2026-11-07T00:00:00+01:00"))).toBe(true);
  });

  it("garde l'essai jusqu'au CC avant la bascule", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-03T10:00:00+01:00"));
    expect(hasAccess(etat())).toBe(true);
  });

  it("plus d'essai ni de prolongation après la bascule", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-20T10:00:00+01:00"));
    expect(trialDaysLeft(etat())).toBe(0);
    expect(trialDaysLeft(etat({ trialStartedAt: "2026-11-10T10:00:00Z" }))).toBe(0);
  });

  it("un pass valide donne l'accès, un pass expiré non", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-20T10:00:00+01:00"));
    const valide = etat({ passExpiresAt: "2026-11-24T10:00:00+01:00" });
    expect(passJoursRestants(valide)).toBe(4);
    expect(estPremium(valide) && hasAccess(valide)).toBe(true);
    const expire = etat({ passExpiresAt: "2026-11-19T10:00:00+01:00" });
    expect(estPremium(expire)).toBe(false);
    expect(hasAccess(expire)).toBe(false);
  });

  it("une seule leçon nouvelle par jour en gratuit", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-20T10:00:00+01:00"));
    expect(leconGratuiteDisponible(etat(), "a")).toBe(true);
    const aujourdhui = etat({}, { leconsGratuites: { jour: new Date().toISOString().slice(0, 10), ids: ["a"] } });
    expect(leconGratuiteDisponible(aujourdhui, "a")).toBe(true);
    expect(leconGratuiteDisponible(aujourdhui, "b")).toBe(false);
  });
});

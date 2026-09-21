import type { CardRecord } from "./types";

// Leitner à 5 boîtes. Intervalles en jours, calés sur un semestre de L1 :
// une définition vue aujourd'hui revient demain, puis à 3 j, 7 j, 16 j, 35 j.
export const BOX_INTERVALS = [1, 3, 7, 16, 35];

export function todayKey(d: Date = new Date()): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addDays(days: number, from: Date = new Date()): string {
  const d = new Date(from.getTime() + days * 86400000);
  return d.toISOString();
}

export function gradeCard(card: CardRecord, knew: boolean): CardRecord {
  const box = knew ? Math.min(card.box + 1, BOX_INTERVALS.length) : 1;
  const interval = BOX_INTERVALS[box - 1];
  return {
    ...card,
    box,
    reviews: card.reviews + 1,
    lapses: knew ? card.lapses : card.lapses + 1,
    dueAt: addDays(interval),
  };
}

export function newCard(lessonId: string, term: string): CardRecord {
  return {
    key: `${lessonId}::${term}`,
    lessonId,
    term,
    box: 1,
    dueAt: addDays(1),
    lapses: 0,
    reviews: 1,
  };
}

export function dueCards(cards: Record<string, CardRecord>, now: Date = new Date()): CardRecord[] {
  return Object.values(cards)
    .filter((c) => new Date(c.dueAt).getTime() <= now.getTime())
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export function masteredCount(cards: Record<string, CardRecord>): number {
  return Object.values(cards).filter((c) => c.box >= 4).length;
}

// Une série ne se casse pas si l'élève a travaillé hier : elle se casse au
// deuxième jour manqué. C'est la règle la plus lisible pour un étudiant.
export function bumpStreak(streak: { current: number; best: number; lastDay?: string; days: string[] }) {
  const today = todayKey();
  if (streak.lastDay === today) return streak;
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  const current = streak.lastDay === yesterday ? streak.current + 1 : 1;
  const days = streak.days.includes(today) ? streak.days : [...streak.days, today].slice(-400);
  return { current, best: Math.max(current, streak.best), lastDay: today, days };
}

export function streakIsAlive(streak: { lastDay?: string }): boolean {
  if (!streak.lastDay) return false;
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  return streak.lastDay === today || streak.lastDay === yesterday;
}

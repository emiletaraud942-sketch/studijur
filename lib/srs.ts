import type { ActiviteDuJour, CardRecord, NotionMastery } from "./types";

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

// Répétition espacée par notion (Fonctionnalité B) : même mécanique de
// Leitner à 5 boîtes que les cartes de définitions ci-dessus, mais à la
// granularité de la notion (= une leçon, voir lib/notions.ts) — une notion
// se grade à chaque question qui la couvre, tous types confondus (actu du
// jour, quiz, définitions, correction d'examen), pas seulement ses propres
// définitions.

// Score affiché (0-100), dérivé directement du box : une seule source de
// vérité pour la maîtrise, jamais un second calcul (ex. moyenne pondérée
// séparée) qui pourrait diverger du scheduling réel.
export function scoreMaitriseFromBox(box: number): number {
  const clamped = Math.max(1, Math.min(box, BOX_INTERVALS.length));
  return Math.round((clamped / BOX_INTERVALS.length) * 100);
}

export function newNotionMastery(notionId: string): NotionMastery {
  return {
    notionId,
    box: 1,
    scoreMaitrise: scoreMaitriseFromBox(1),
    reussitesConsecutives: 0,
    lapses: 0,
    reviews: 1,
    dueAt: addDays(1),
  };
}

export function gradeNotion(mastery: NotionMastery, correct: boolean): NotionMastery {
  const box = correct ? Math.min(mastery.box + 1, BOX_INTERVALS.length) : 1;
  const interval = BOX_INTERVALS[box - 1];
  return {
    ...mastery,
    box,
    scoreMaitrise: scoreMaitriseFromBox(box),
    reussitesConsecutives: correct ? mastery.reussitesConsecutives + 1 : 0,
    lapses: correct ? mastery.lapses : mastery.lapses + 1,
    reviews: mastery.reviews + 1,
    dueAt: addDays(interval),
  };
}

// Notions dues aujourd'hui, triées par score de maîtrise croissant :
// priorité aux plus faibles, comme demandé pour "à réviser aujourd'hui".
export function dueNotions(notions: Record<string, NotionMastery>, now: Date = new Date()): NotionMastery[] {
  return Object.values(notions)
    .filter((n) => new Date(n.dueAt).getTime() <= now.getTime())
    .sort((a, b) => a.scoreMaitrise - b.scoreMaitrise || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

// Une série ne se casse pas si l'élève a travaillé hier : elle se casse au
// deuxième jour manqué. C'est la règle la plus lisible pour un étudiant.
export function bumpStreak(streak: { current: number; best: number; lastDay?: string; days: string[]; objectifAtteint?: boolean }) {
  const today = todayKey();
  if (streak.lastDay === today) return streak;
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  const current = streak.lastDay === yesterday ? streak.current + 1 : 1;
  const days = streak.days.includes(today) ? streak.days : [...streak.days, today].slice(-400);
  // Spread plutôt que littéral neuf : préserve `objectifAtteint`, posé
  // séparément par bumpActiviteDuJour (lib/state.tsx), qui peut avoir déjà
  // tourné dans la même séance d'actions.
  return { ...streak, current, best: Math.max(current, streak.best), lastDay: today, days };
}

export function streakIsAlive(streak: { lastDay?: string }): boolean {
  if (!streak.lastDay) return false;
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  return streak.lastDay === today || streak.lastDay === yesterday;
}

// Habitude quotidienne (Fonctionnalité E). Seuil bas et rond : le but est
// d'ancrer une routine de 10-15 minutes, pas de fixer un objectif ambitieux.
export const SEUIL_REPONSES_QUOTIDIEN = 5;

export function freshActiviteDuJour(jour: string = todayKey()): ActiviteDuJour {
  return { jour, reponses: 0, notionsDuesRevues: false, actuLue: false };
}

// Remet les compteurs à zéro si `activite` date d'un autre jour — à appeler
// avant toute lecture ou incrémentation, jamais de compteur qui grossirait
// indéfiniment d'un jour sur l'autre.
export function activiteDuJourActuelle(activite: ActiviteDuJour): ActiviteDuJour {
  const jour = todayKey();
  return activite.jour === jour ? activite : freshActiviteDuJour(jour);
}

// Un jour est "objectif atteint" dès qu'UNE des trois conditions est vraie :
// un nombre minimal de questions répondues, les notions dues du jour
// consultées, ou l'actu du jour lue. `activite` doit déjà être celle
// d'aujourd'hui (voir activiteDuJourActuelle) : une activité périmée (d'un
// autre jour) ne compte jamais, même si ses compteurs semblent atteints.
export function objectifAtteintAujourdhui(activite: ActiviteDuJour): boolean {
  if (activite.jour !== todayKey()) return false;
  return activite.reponses >= SEUIL_REPONSES_QUOTIDIEN || activite.notionsDuesRevues || activite.actuLue;
}

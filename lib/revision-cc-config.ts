export type RevisionCCConfig = {
  id: string;
  label: string;
  // Au format ISO (YYYY-MM-DD), heure locale Paris implicite à minuit. `null`
  // tant que la date exacte n'est pas connue — jamais inventée : la page
  // affiche alors "date pas encore communiquée" plutôt qu'un compte à rebours
  // fantaisiste. Voir app/revision-cc/[matiere]/page.tsx.
  ccDate: string | null;
  lessonSlugs: string[];
  // Ids de la matière "dates" (lib/corpus/parts/dates.*.json) dont les
  // définitions (terme = date, texte = événement) composent la chronologie
  // interactive de cette page — réutilise un contenu déjà écrit, jamais une
  // nouvelle frise à produire. Absent ou vide : pas de section chronologie
  // plutôt qu'un rapprochement de dates mal assorti.
  chronologieLessonIds?: string[];
};

export const REVISION_CC: Record<string, RevisionCCConfig> = {
  "droit-public": {
    id: "droit-public",
    label: "Introduction historique au droit public",
    ccDate: "2026-10-21",
    lessonSlugs: [
      "histoire-01", "histoire-02", "histoire-03", "histoire-04", "histoire-05", "histoire-06",
      "histoire-07", "histoire-08", "histoire-09", "histoire-10", "histoire-11", "histoire-12",
      "histoire-13", "histoire-14", "histoire-15", "histoire-16", "histoire-17", "histoire-18",
    ],
    chronologieLessonIds: ["dates-01", "dates-02", "dates-03", "dates-04", "dates-05"],
  },
  constit: {
    id: "constit",
    label: "Droit constitutionnel",
    ccDate: "2026-10-22",
    lessonSlugs: [
      "constit-01", "constit-02", "constit-03", "constit-04",
      "constit-05", "constit-06", "constit-07", "constit-08",
    ],
    chronologieLessonIds: ["dates-07"],
  },
  "intro-generale": {
    id: "intro-generale",
    label: "Introduction générale au droit",
    ccDate: "2026-10-22",
    lessonSlugs: [
      "intro-01", "intro-02", "intro-03", "intro-04", "intro-05", "intro-06", "intro-07", "intro-08",
      "intro-09", "intro-10", "intro-11", "intro-12", "intro-13", "intro-14", "intro-15", "intro-16",
    ],
  },
};

export type Etape = { seuil: number; titre: string; texte: string };

// Seuils en jours restants avant le CC, du plus loin au plus proche —
// transforme le compte à rebours en programme concret plutôt qu'une date
// qu'on regarde passivement défiler. Utilisés par PlanDeBataille (page
// /revision-cc), ProchainCCBanner (bannière "J-" de l'accueil) et la cron de
// rappel push (contenu personnalisé de la notification).
export const ETAPES: Etape[] = [
  { seuil: 8, titre: "Fiche complète", texte: "Lis la fiche condensée, la chronologie et les schémas, leçon par leçon." },
  { seuil: 4, titre: "Quiz complet", texte: "Fais le quiz en entier au moins une fois, sans regarder la fiche avant." },
  { seuil: 2, titre: "Focus sur tes erreurs", texte: "Reprends la fiche à trous et uniquement les questions ratées au quiz." },
  { seuil: 0, titre: "Dernière ligne droite", texte: "Relis les plans de dissertation et les pièges classiques, pas de contenu nouveau." },
];

export function joursAvant(ccDate: string): number {
  return Math.ceil((new Date(`${ccDate}T00:00:00+02:00`).getTime() - Date.now()) / 86400000);
}

export function etapeActuelle(jours: number): Etape | null {
  const i = ETAPES.findIndex((e) => jours >= e.seuil);
  return i === -1 ? null : ETAPES[i];
}

// Les CC à venir, triés par échéance — utilisé par ProchainCCBanner sur la
// page d'accueil. Fenêtre large (60 jours, pas 14) : le plan de bataille
// affiché avec donne déjà la bonne étape ("Fiche complète" tant qu'on est à
// J-8 ou plus), donc montrer le compte à rebours tôt encourage à s'y mettre
// avant la dernière semaine plutôt que de l'annoncer seulement quand il est
// presque trop tard (voir la stratégie de rétention du 2 octobre 2026).
// Tant qu'aucune date n'est connue, cette liste reste vide et aucun bandeau
// n'apparaît : pas de fausse urgence.
export function ccAVenir(dansLesJours = 60): RevisionCCConfig[] {
  const seuil = Date.now() + dansLesJours * 86400000;
  return Object.values(REVISION_CC)
    .filter((c) => c.ccDate && new Date(c.ccDate).getTime() <= seuil && new Date(c.ccDate).getTime() >= Date.now() - 86400000)
    .sort((a, b) => new Date(a.ccDate!).getTime() - new Date(b.ccDate!).getTime());
}

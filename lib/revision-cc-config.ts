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

// Les CC dans moins de 14 jours, triés par échéance — utilisé par la page
// d'accueil pour proposer le bouton "Réviser pour [matière]" (voir
// app/page.tsx). Tant qu'aucune date n'est connue, cette liste reste vide et
// aucun bouton n'apparaît : pas de fausse urgence.
export function ccAVenir(dansLesJours = 14): RevisionCCConfig[] {
  const seuil = Date.now() + dansLesJours * 86400000;
  return Object.values(REVISION_CC)
    .filter((c) => c.ccDate && new Date(c.ccDate).getTime() <= seuil && new Date(c.ccDate).getTime() >= Date.now() - 86400000)
    .sort((a, b) => new Date(a.ccDate!).getTime() - new Date(b.ccDate!).getTime());
}

// Partagé entre /presentation et le pitch de première visite sur / : un seul
// endroit à mettre à jour plutôt que deux discours qui divergent avec le temps.
export const OBJECTIONS = [
  {
    q: "Je n'ai pas le temps.",
    r: "C'est exactement le problème que StudiJur règle. Cinq minutes par jour, c'est moins qu'un trajet de bus. Sur un semestre, cela fait quinze heures de révision active — davantage que la plupart des étudiants n'en font avant les partiels.",
  },
  {
    q: "Mon cours n'est pas le même que le vôtre.",
    r: "Dépose-le (PDF ou photo). StudiJur le découpe sur les titres de ton propre professeur et en tire automatiquement un quiz, des flashcards à révision espacée et une carte mentale — la génération que d'autres sites font payer cher, incluse ici.",
  },
  {
    q: "Les fiches, je sais déjà les faire.",
    r: "Faire une fiche, c'est de la lecture active une fois. StudiJur te fait te tester, espace les rappels dans le temps et note ce que tu ne sais pas encore. C'est la différence entre relire et retenir.",
  },
] as const;

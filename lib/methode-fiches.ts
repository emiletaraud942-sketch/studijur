// Fiches méthode interactives : le plan type d'un exercice (étapes, dans
// l'ordre) et les critères à vérifier sur sa propre rédaction. Contenu repris
// fidèlement des leçons methodo-03, methodo-05 et methodo-06 du corpus
// (lib/corpus/parts/methodo.a.json) — rien d'inventé ici, seulement une
// présentation interactive de ce que ces leçons expliquent déjà en texte.

export type EtapeMethode = {
  titre: string;
  texte: string;
  exemple?: string;
};

export type FicheMethode = {
  id: string;
  titre: string;
  teaser: string;
  etapes: EtapeMethode[];
  criteres: string[];
};

export const FICHES_METHODE: FicheMethode[] = [
  {
    id: "syllogisme",
    titre: "Le syllogisme juridique",
    teaser: "Majeure, mineure, conclusion : la règle, les faits, la solution — jamais dans le désordre.",
    etapes: [
      {
        titre: "La majeure",
        texte: "La règle de droit applicable : un texte, un principe jurisprudentiel — éventuellement combinée à sa condition d'entrée en vigueur ou d'application (ex. un décret d'application attendu). Elle reste générale et abstraite, valable indépendamment du cas posé.",
        exemple: "« Une disposition législative qui subordonne elle-même son application à un décret n'est pas d'application immédiate : le droit qu'elle institue n'existe juridiquement qu'à compter de l'entrée en vigueur du décret attendu… »",
      },
      {
        titre: "La mineure",
        texte: "Les faits de l'espèce, qualifiés juridiquement au regard des conditions posées par la majeure. Règle d'or : les faits se placent ici, jamais dans la majeure.",
        exemple: "« En l'espèce, la loi renvoie expressément à un décret pour fixer les conditions du droit institué, et ce décret n'a pas été publié six mois après la loi. »",
      },
      {
        titre: "La conclusion",
        texte: "L'application de la majeure à la mineure, qui répond à la question posée — sans jamais rien y ajouter.",
        exemple: "« Le justiciable ne peut pas encore se prévaloir de ce droit : son entrée en vigueur reste suspendue à la publication du décret. »",
      },
    ],
    criteres: [
      "La majeure reste générale, sans aucun fait de l'espèce",
      "Si la règle dépend d'un acte complémentaire (décret…), la majeure l'intègre",
      "La mineure confronte chaque condition de la majeure à un fait précis",
      "La question de droit et la majeure apparaissent distinctement, sans être confondues",
      "La conclusion ne contient rien que majeure et mineure n'autorisent pas",
    ],
  },
  {
    id: "fiche-arret",
    titre: "La fiche d'arrêt",
    teaser: "Résumer une décision avant de la commenter : faits, procédure, moyens, problème de droit, solution.",
    etapes: [
      {
        titre: "Les faits",
        texte: "Résumé chronologique et objectif, sans jugement de valeur ; parties identifiées par leur qualité procédurale (demandeur/défendeur, ou au pourvoi) plutôt que par leur nom répété à chaque phrase.",
      },
      {
        titre: "La procédure",
        texte: "Qui a saisi quelle juridiction en premier, ce qu'elle a décidé, qui a interjeté appel, ce qu'a décidé la cour d'appel, qui s'est pourvu en cassation et pourquoi.",
      },
      {
        titre: "Les prétentions et moyens",
        texte: "Ce que chaque partie demande, et l'argumentation juridique — le moyen — qui soutient sa demande. Vérifier aussi si la Cour relève un moyen d'office, distinct de celui des parties.",
      },
      {
        titre: "Le problème de droit",
        texte: "La question juridique précise que la juridiction doit trancher, formulée en une question synthétique — jamais en reprenant les faits de l'espèce.",
      },
      {
        titre: "La solution",
        texte: "Le dispositif (cassation avec ou sans renvoi, rejet, confirmation ou infirmation) assorti du raisonnement qui y conduit, parfois résumé dans un chapeau.",
      },
    ],
    criteres: [
      "Les faits sont résumés sans jugement de valeur",
      "Les parties sont identifiées par leur qualité procédurale, pas répétées par leur nom",
      "La procédure retrace chaque étape dans l'ordre, jusqu'au pourvoi",
      "Un éventuel moyen relevé d'office est noté, pas seulement celui de la partie",
      "Le problème de droit est une question synthétique, sans reprise des faits",
      "La solution donne le dispositif ET le raisonnement qui y conduit",
    ],
  },
  {
    id: "titres-plan",
    titre: "Titres, chapeaux et transitions",
    teaser: "Un titre est une affirmation, jamais une question — et le chapeau n'est pas décoratif.",
    etapes: [
      {
        titre: "Le plan binaire",
        texte: "Deux parties, deux sous-parties chacune, équilibrées. Jamais de plan thèse/antithèse : chaque partie doit démontrer quelque chose, pas seulement s'opposer à l'autre.",
      },
      {
        titre: "Les titres",
        texte: "Affirmatifs (jamais une question), nominaux (sans verbe conjugué), courts (une ligne au maximum), sans « et » ni énumération, et appariés avec leur symétrique : I et II doivent s'opposer ou se compléter (« affirmée » / « relativisée »).",
      },
      {
        titre: "Le chapeau",
        texte: "Le court paragraphe qui suit immédiatement le titre de partie et annonce les deux sous-parties, en deux ou trois phrases : « … (A), avant d'examiner … (B). »",
      },
      {
        titre: "Les transitions",
        texte: "Une phrase suffit entre A et B. Entre I et II, un vrai paragraphe : bilan de ce qui vient d'être démontré, puis annonce du basculement. Pas de conclusion en dissertation juridique : le plan doit se suffire à lui-même.",
      },
    ],
    criteres: [
      "Deux parties, deux sous-parties, équilibrées",
      "Chaque titre est affirmatif, nominal, court, sans « et »",
      "I et II sont appariés (ex. affirmée / relativisée)",
      "Le chapeau annonce les deux sous-parties",
      "La transition entre I et II fait un bilan avant de basculer",
      "Aucune conclusion en fin de devoir",
    ],
  },
];

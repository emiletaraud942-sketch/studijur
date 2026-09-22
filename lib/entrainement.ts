// Contenu d'entraînement pour l'intero d'Introduction générale au droit,
// construit à partir des notes de cours d'Émile : vocabulaire des procès,
// questions de cours, méthodologie. Pas de question sur un arrêt ou un
// document précis tiré de son TD personnel — seulement des notions
// générales que tout étudiant de la matière étudie.

export type QuestionEntrainement = {
  id: string;
  categorie: "Vocabulaire des procès" | "Question de cours" | "Méthodologie";
  question: string;
  reponse: string;
};

export const introGeneraleEntrainement: QuestionEntrainement[] = [
  // --- Vocabulaire des procès (connaissance pure, très demandé en QCM/questions courtes) ---
  {
    id: "voc-01",
    categorie: "Vocabulaire des procès",
    question: "Comment s'appelle celui qui saisit le tribunal en première instance, et celui qui se défend ?",
    reponse: "Celui qui saisit le tribunal est le **demandeur** (ou la demanderesse) ; celui contre qui la demande est formée est le **défendeur** (ou la défenderesse).",
  },
  {
    id: "voc-02",
    categorie: "Vocabulaire des procès",
    question: "Une fois qu'on interjette appel d'un jugement, comment s'appellent les deux parties ?",
    reponse: "Celui qui interjette appel devient l'**appelant** (ou l'appelante) ; l'autre partie devient l'**intimé** (ou l'intimée).",
  },
  {
    id: "voc-03",
    categorie: "Vocabulaire des procès",
    question: "Comment s'appellent les parties devant la Cour de cassation ?",
    reponse: "Celui qui forme le pourvoi est le **demandeur au pourvoi** ; l'autre partie est le **défendeur au pourvoi**.",
  },
  {
    id: "voc-04",
    categorie: "Vocabulaire des procès",
    question: "Quelle est la différence entre un \"jugement\" et un \"arrêt\" ?",
    reponse: "Un **jugement** est rendu par un tribunal, en première instance : le juge y tranche les faits ET le droit. Un **arrêt** est rendu par une cour — cour d'appel (qui rejuge elle aussi les faits et le droit) ou Cour de cassation (qui ne juge que le droit).",
  },
  {
    id: "voc-05",
    categorie: "Vocabulaire des procès",
    question: "La Cour de cassation est-elle un \"troisième degré de juridiction\" ?",
    reponse: "Non — c'est un piège classique. La Cour de cassation ne rejuge **jamais** les faits, elle vérifie seulement si la cour d'appel a correctement appliqué la loi.",
  },
  {
    id: "voc-06",
    categorie: "Vocabulaire des procès",
    question: "Que signifie \"rejet du pourvoi\" ?",
    reponse: "La Cour de cassation confirme que la cour d'appel a bien appliqué le droit : l'arrêt d'appel reste valable, celui qui a formé le pourvoi perd définitivement.",
  },
  {
    id: "voc-07",
    categorie: "Vocabulaire des procès",
    question: "Que signifie \"cassation\" (ou \"casse et annule\") ? La Cour de cassation tranche-t-elle alors elle-même le litige ?",
    reponse: "La Cour de cassation estime que le droit a été mal appliqué : elle annule l'arrêt d'appel et, en principe, **renvoie** l'affaire devant une autre cour d'appel (la « cour d'appel de renvoi »). Elle ne tranche **jamais** elle-même le fond du litige.",
  },
  {
    id: "voc-08",
    categorie: "Vocabulaire des procès",
    question: "Qu'est-ce qu'une \"assemblée plénière\" à la Cour de cassation ?",
    reponse: "Une formation solennelle de la Cour de cassation, réunie pour trancher des questions de principe — souvent après un désaccord entre juges du fond et une première cassation.",
  },
  {
    id: "voc-09",
    categorie: "Vocabulaire des procès",
    question: "Quelles sont les 5 parties qu'on retrouve dans l'anatomie d'un arrêt de la Cour de cassation ?",
    reponse: "1) L'**en-tête** (juridiction, formation, date, n° de pourvoi) ; 2) **Faits et procédure** (récit des faits, décisions des juges du fond, qui se pourvoit contre quoi) ; 3) **Examen des moyens — l'énoncé** (les griefs de l'auteur du pourvoi, souvent cités entre guillemets « alors que… ») ; 4) La **réponse de la Cour** (les motifs : la règle énoncée, puis son application aux faits) ; 5) Le **dispositif** (introduit par « PAR CES MOTIFS » : rejette, ou casse et annule avec ou sans renvoi, dépens, article 700).",
  },
  {
    id: "voc-10",
    categorie: "Vocabulaire des procès",
    question: "Qu'est-ce qu'un \"attendu de principe\", et depuis quand la Cour de cassation ne les utilise-t-elle plus systématiquement ?",
    reponse: "C'est la formule par laquelle les juges énoncent la règle générale qui fonde leur décision — la phrase-clé à citer dans un commentaire d'arrêt. Avant le **1ᵉʳ octobre 2019**, les arrêts se présentaient en une seule phrase scandée par des « Attendu que… ». Depuis cette date, la Cour de cassation rédige en **style direct**, avec des paragraphes numérotés et un plan apparent.",
  },
  {
    id: "voc-11",
    categorie: "Vocabulaire des procès",
    question: "En matière de succession : comment s'appelle celui qui rédige un testament, et celui qui en bénéficie ?",
    reponse: "Celui qui rédige le testament est le **testateur** (ou la testatrice) ; celui qui reçoit est le **légataire** (un legs universel désigne un légataire universel). Celui qui est exclu du testament est l'**exhérédé**.",
  },
  {
    id: "voc-12",
    categorie: "Vocabulaire des procès",
    question: "Quelle est la différence entre \"confirmer\" et \"infirmer\" un jugement en appel ?",
    reponse: "**Confirmer** : la cour d'appel maintient la solution retenue par le premier juge. **Infirmer** : elle l'annule et statue différemment.",
  },
  {
    id: "voc-13",
    categorie: "Vocabulaire des procès",
    question: "Qu'est-ce que le syllogisme juridique, et à quoi sert-il ?",
    reponse: "Le raisonnement en trois temps qu'applique tout juriste : la **majeure** énonce la règle de droit applicable, avec sa source ; la **mineure** confronte les faits, préalablement qualifiés, aux conditions posées par la règle ; la **conclusion** en déduit la solution. C'est la structure élémentaire de tout raisonnement juridique, au cœur du cas pratique.",
  },
  {
    id: "voc-14",
    categorie: "Vocabulaire des procès",
    question: "Les juges du tribunal et de la cour d'appel apprécient-ils les faits de la même façon que la Cour de cassation ?",
    reponse: "Non. Les juges « du fond » (tribunal, puis cour d'appel) constatent et apprécient **souverainement** les faits. La Cour de cassation, elle, ne juge que le **droit** : elle vérifie seulement que la règle a été correctement appliquée, sans jamais rejuger les faits.",
  },
  {
    id: "voc-15",
    categorie: "Méthodologie",
    question: "Comment cite-t-on un article de code, une loi et une décision de justice ?",
    reponse: "Un **article de code** : le code puis le numéro (« C. civ., art. 1253 »). Une **loi** : son numéro, sa date et son intitulé (« L. n°2021-1539 du 30 nov. 2021 visant à définir et protéger le patrimoine sensoriel des campagnes françaises »). Une **décision** : la juridiction, la formation, la date et le numéro — pour la Cour de cassation (« Cass. 3ᵉ civ., 21 mai 2026, n°24-10.569 »), pour une cour d'appel (« CA Bordeaux, 5ᵉ ch., 1ᵉʳ juin 2006, n°05/00492 »).",
  },

  // --- Questions de cours (issues des fiches de cours) ---
  {
    id: "cours-01",
    categorie: "Question de cours",
    question: "Pourquoi la contrainte étatique est-elle le critère dominant, mais pas exclusif, de la règle de droit ?",
    reponse: "Parce qu'on trouve trois contre-exemples embarrassants où une règle est tenue pour du droit sans contrainte étatique organisée : le **droit international** (peu de « gendarme mondial »), les **obligations naturelles** (exécutées sans contrainte possible) et la **soft law** (recommandations, chartes, avis, sans sanction). La juridicité est donc affaire de degré : la contrainte étatique domine, mais la **justiciabilité** (la possibilité de porter l'affaire devant un juge) complète le critère.",
  },
  {
    id: "cours-02",
    categorie: "Question de cours",
    question: "Distinguez le contrôle de constitutionnalité et le contrôle de conventionnalité : quelles juridictions les exercent, et pourquoi le Conseil constitutionnel refuse-t-il d'exercer le second ?",
    reponse: "Le **contrôle de constitutionnalité** vérifie la conformité d'une loi à la Constitution ; le **contrôle de conventionnalité** vérifie sa conformité à un traité international. Le Conseil constitutionnel a **refusé** d'exercer ce second contrôle par sa décision du 15 janvier 1975. Ce sont le **Conseil d'État** (depuis *Nicolo*, 1989) et la **Cour de cassation** (depuis *Jacques Vabre*, 1975) qui l'exercent.",
  },
  {
    id: "cours-03",
    categorie: "Question de cours",
    question: "En quoi une loi peut-elle viser une catégorie précise de personnes (mineurs, commerçants…) sans perdre son caractère général ?",
    reponse: "La loi doit être la même pour tous, mais elle peut viser des **catégories** définies par des critères objectifs (âge, profession…) sans perdre sa généralité, tant qu'elle ne désigne jamais des **personnes nommées**. La généralité n'est pas l'uniformité : elle exige seulement que la règle reste **normative**.",
  },
  {
    id: "cours-04",
    categorie: "Question de cours",
    question: "Qu'est-ce que le negotium et l'instrumentum d'un acte juridique, et pourquoi cette distinction compte-t-elle en matière de preuve ?",
    reponse: "Le **negotium** est l'opération intellectuelle elle-même, l'accord de volontés ; l'**instrumentum** est l'écrit qui le constate. L'instrumentum n'est que la **preuve** du negotium : un contrat peut exister sans écrit, sauf si la loi en exige un à peine de nullité — au-delà de 1 500 €, un acte juridique doit en principe être prouvé par écrit, alors qu'un simple fait juridique se prouve par tout moyen.",
  },
  {
    id: "cours-05",
    categorie: "Question de cours",
    question: "Reprenez la méthode de traduction d'un fait en droit, et appliquez-la à un exemple.",
    reponse: "Quatre étapes : (1) la **qualification** de l'opération (ex. : un contrat de prêt), (2) le **droit subjectif** qui en naît (ici, une créance exigible), (3) le **préalable** avant d'agir (une mise en demeure), (4) le **chemin vers le juge** (une action en paiement). Exemple : « j'ai prêté 100 € à un ami qui ne me rembourse pas » suit exactement ces quatre étapes.",
  },
  {
    id: "cours-06",
    categorie: "Question de cours",
    question: "Distinguez le fruit et le produit en droit des biens, et donnez une conséquence pratique de cette distinction.",
    reponse: "Le **fruit** est un bien produit périodiquement par un autre bien sans entamer sa substance (loyers, récoltes, intérêts). Le **produit** entame la substance du bien (ex. : le minerai extrait d'une carrière). Conséquence pratique : le régime juridique diffère (l'usufruitier a droit aux fruits, pas nécessairement aux produits, qui appauvrissent le bien).",
  },
  {
    id: "cours-07",
    categorie: "Question de cours",
    question: "Comparez les conceptions de l'état de nature chez Hobbes et chez Locke, et expliquez en quoi elles déterminent la nature du transfert de pouvoir au souverain.",
    reponse: "Chez **Hobbes**, l'état de nature est un chaos (la loi du plus fort) : le transfert de pouvoir au souverain est donc **total et inconditionnel**, seul un pouvoir absolu peut garantir la paix. Chez **Locke**, l'état de nature est plutôt heureux : le transfert est **conditionnel**, le souverain devant respecter les droits naturels des individus.",
  },
  {
    id: "cours-08",
    categorie: "Question de cours",
    question: "Expliquez la formule de Georges Vedel : « Tout le droit constitutionnel n'est pas dans la Constitution », en l'illustrant par l'exemple du Royaume-Uni.",
    reponse: "Le droit constitutionnel ne se réduit pas au texte écrit de la Constitution : il inclut aussi les pratiques, les principes et la jurisprudence. Le Royaume-Uni l'illustre parfaitement : il a un véritable droit constitutionnel (règles sur l'organisation et le fonctionnement de l'État), sans pourtant disposer d'une Constitution écrite unique — il repose sur des textes épars, des conventions et des coutumes constitutionnelles.",
  },
  {
    id: "cours-11",
    categorie: "Question de cours",
    question: "Pourquoi dit-on que la notion de \"bonnes mœurs\" est aujourd'hui en recul face à celle d'\"ordre public\" ?",
    reponse: "Historiquement, un contrat ou une libéralité pouvait être annulé pour deux motifs distincts : la contrariété à l'**ordre public** (l'intérêt général, la société) et la contrariété aux **bonnes mœurs** (la morale sexuelle et familiale dominante). Les affaires du legs à la « maîtresse » (1999, puis assemblée plénière 2004) illustrent ce recul : une libéralité consentie pour maintenir une relation adultère n'est plus jugée contraire aux bonnes mœurs. Depuis la réforme du droit des contrats de 2016, le nouvel article ne vise d'ailleurs plus que l'**ordre public**, la référence aux bonnes mœurs ayant disparu du texte.",
  },
  {
    id: "cours-12",
    categorie: "Question de cours",
    question: "Le droit se distingue de la morale et de la religion. Sur quoi repose cette distinction, et où le droit et la morale se rejoignent-ils malgré tout ?",
    reponse: "Le droit se distingue par sa **source** (il émane de l'État) et par sa **sanction** (organisée, étatique — un juge peut la faire exécuter par la force). La morale et la religion reposent sur la conscience individuelle ou une croyance, sans contrainte étatique. Ils se rejoignent pourtant en un point : l'**ordre public**, et autrefois les bonnes mœurs, par lesquels le droit reprend à son compte certaines exigences morales et les rend, elles, sanctionnables.",
  },
  {
    id: "cours-13",
    categorie: "Question de cours",
    question: "Qu'est-ce que le \"droit souple\" (soft law), et en quoi se distingue-t-il du droit \"dur\" ?",
    reponse: "Le **droit dur** (loi, règlement, jurisprudence) a un caractère obligatoire et une sanction étatique. Le **droit souple** (recommandations, codes de déontologie, avis, mises en garde des autorités de régulation) n'a pas de force obligatoire — mais il produit des effets concrets sur les comportements, ce qui pose la question de son contrôle par le juge.",
  },
];

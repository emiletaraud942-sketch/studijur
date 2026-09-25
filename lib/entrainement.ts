// Contenu d'entraînement pour l'intero d'Introduction générale au droit,
// construit à partir des notes de cours d'Émile : vocabulaire des procès,
// questions de cours, méthodologie. Pas de question sur un arrêt ou un
// document précis tiré de son TD personnel — seulement des notions
// générales que tout étudiant de la matière étudie.

export type QuestionEntrainement = {
  id: string;
  categorie: "Vocabulaire des procès" | "Question de cours" | "Méthodologie" | "Entraînement CC1";
  question: string;
  reponse: string;
};

export const introGeneraleEntrainement: QuestionEntrainement[] = [
  // --- Entraînement CC1 (mardi 29/09, intro au droit) : mêmes thèmes et même
  // registre que le sujet d'entraînement officiel (définitions/distinctions,
  // question de compréhension, question de méthode) — programme couvert :
  // Introduction et Partie I du cours (séances du 3 au 17 septembre). ---
  {
    id: "cc1-01",
    categorie: "Entraînement CC1",
    question: "Définissez le panjurisme et donnez-en un exemple.",
    reponse: "Le **panjurisme** est l'idée que le droit est omniprésent dans la vie sociale : l'essentiel du droit s'organise sans juge, en créant des prérogatives plutôt qu'en multipliant les interdits. Exemple le plus banal : un simple contrat de vente (art. 1582 du Code civil).",
  },
  {
    id: "cc1-02",
    categorie: "Entraînement CC1",
    question: "Définissez le non-droit chez Jean Carbonnier et distinguez-le du panjurisme.",
    reponse: "Le **non-droit** désigne, chez **Carbonnier**, tout ce qui échappe à l'emprise du droit alors même que le panjurisme prétend à son omniprésence : le droit est en réalité plus petit que l'ensemble des rapports sociaux, car la **morale** et la **religion** organisent elles aussi la société. Exemple : les règles de politesse ou d'affection entre proches, jamais sanctionnées par un juge.",
  },
  {
    id: "cc1-03",
    categorie: "Entraînement CC1",
    question: "Pourquoi dit-on que le panjurisme « reste une ambition qui, en pratique, ne fonctionne pas pleinement » ?",
    reponse: "Parce que l'omniprésence du droit n'est pas une réussite en soi : il existe **trop de règles**, on ne les respecte pas toutes alors qu'il en existe toujours plus, beaucoup ne sont pas **effectives**, et certaines sont des « **lois d'émotion** », votées dans la foulée d'un fait divers qui a ému l'opinion plutôt que par une réflexion posée.",
  },
  {
    id: "cc1-04",
    categorie: "Entraînement CC1",
    question: "Le mot « droit » recouvre trois sens différents : lesquels ?",
    reponse: "Le **droit objectif** (l'ensemble des règles), les **droits subjectifs** (les prérogatives reconnues à chacun) et la **science du droit** (la discipline d'étude qui l'analyse).",
  },
  {
    id: "cc1-05",
    categorie: "Entraînement CC1",
    question: "Quelle définition du droit est retenue en cours, et sur quels deux critères repose-t-elle ?",
    reponse: "Le droit est un **ordre** : un ensemble organisé et hiérarchisé de règles de conduite, socialement édictées et sanctionnées. Deux critères reviennent pour cerner cette définition : la **contrainte** (la règle est assortie d'une sanction étatique) et la **justiciabilité** (elle peut être portée devant un juge).",
  },
  {
    id: "cc1-06",
    categorie: "Entraînement CC1",
    question: "Loi et droit se confondent-ils ? Justifiez à partir de l'étymologie et d'un exemple.",
    reponse: "Non. *Directum* (le droit), « ce qui est droit » au sens géométrique, n'est pas *lex* (la loi) : une loi peut exister et être pourtant **injuste** — les lois antisémites de 1940 en sont l'exemple. De même, *jus* (le droit) est historiquement proche de *justitia* (la justice) sans s'y confondre. D'où la formule d'**Ihering** : « la fin du droit, c'est la paix ; le moyen d'y parvenir, c'est la lutte. »",
  },

  {
    id: "cc1-07",
    categorie: "Entraînement CC1",
    question: "Présentez la « palette des sanctions » dont dispose l'État en rattachant chaque sanction à sa logique.",
    reponse: "Quatre logiques : **contraindre**, par l'**exécution forcée** (forcer l'exécution d'une obligation) ; **effacer**, par la **nullité** d'un acte (l'acte est anéanti comme s'il n'avait jamais existé) ; **réparer**, par la **réparation** en nature ou par équivalent (indemniser un préjudice) ; **punir**, par une **peine** privative de liberté ou une amende (sanctionner une faute pénale).",
  },
  {
    id: "cc1-08",
    categorie: "Entraînement CC1",
    question: "Pourquoi la contrainte étatique est-elle le critère dominant, mais pas exclusif, de la juridicité ?",
    reponse: "Parce que trois contre-exemples embarrassants sont pourtant tenus pour du droit sans contrainte étatique organisée : le **droit international** (peu de « gendarme mondial »), les **obligations naturelles** (exécutées sans contrainte possible) et la ***soft law*** (recommandations, chartes, avis, sans sanction directe). La juridicité est donc affaire de **degré**.",
  },
  {
    id: "cc1-09",
    categorie: "Entraînement CC1",
    question: "Distinguez « effacer » et « punir » comme logiques de sanction : pourquoi ne faut-il pas les confondre ?",
    reponse: "**Effacer**, c'est la **nullité** : l'acte est anéanti rétroactivement, comme s'il n'avait jamais existé (ex. : un contrat conclu sans consentement valable). **Punir**, c'est la **peine** : une sanction pénale infligée à l'auteur d'une infraction, indépendamment du sort de l'acte lui-même. La première vise l'acte, la seconde vise la personne fautive.",
  },
  {
    id: "cc1-10",
    categorie: "Entraînement CC1",
    question: "Qu'est-ce que la légitime défense, et en quoi est-elle une exception notable au monopole étatique de la contrainte ?",
    reponse: "Le droit accepte en principe de remplacer la violence par le procès et interdit de se faire justice à soi-même. La **légitime défense** est l'exception notable à ce principe : elle autorise, sous conditions strictes, une riposte immédiate et proportionnée à une agression, sans passer par le juge au moment des faits.",
  },
  {
    id: "cc1-11",
    categorie: "Entraînement CC1",
    question: "Décrivez le continuum des degrés de normativité, du plus souple au plus contraignant.",
    reponse: "*Soft law* (recommandations, chartes, sans force obligatoire) → **règles supplétives** (environ 80 % du droit des contrats : elles s'appliquent à défaut de volonté contraire) → **règles impératives** (aucune dérogation possible). S'y ajoutent les **principes**, qui posent des valeurs fondatrices applicables même sans texte et corrigent une application trop stricte de la règle.",
  },

  {
    id: "cc1-12",
    categorie: "Entraînement CC1",
    question: "Présentez la conception kelsénienne de l'ordre juridique.",
    reponse: "**Hans Kelsen** représente l'ordre juridique comme une **pyramide posée sur sa pointe** : chaque norme tire sa validité de sa conformité à la norme immédiatement supérieure. Trois contrôles de conformité descendante en découlent : le contrôle de **constitutionnalité** de la loi, de **conventionnalité** de la loi, et de **légalité** du règlement. Une règle est valide si elle est **conforme** à la règle supérieure et si elle est **effective**.",
  },
  {
    id: "cc1-13",
    categorie: "Entraînement CC1",
    question: "Présentez la conception institutionnaliste de Santi Romano et distinguez-la de celle de Kelsen.",
    reponse: "Pour **Santi Romano** (théorie institutionnaliste), un ordre juridique n'est pas d'abord un système hiérarchisé de normes mais une **institution** : toute organisation sociale durable, structurée et dotée d'un pouvoir d'appliquer ses propres règles en sécrète un — l'État bien sûr, mais aussi une fédération sportive comme la FIFA. Kelsen, lui, définit l'ordre juridique par sa **structure normative hiérarchisée** (la pyramide), indépendamment de l'institution qui la porte. La grille de **Delmas-Marty** — groupe social identifiable, intérêt commun, structure unitaire, trois pouvoirs (produire, appliquer, faire respecter le droit) — donne une version opérationnelle de cette approche institutionnaliste.",
  },
  {
    id: "cc1-14",
    categorie: "Entraînement CC1",
    question: "Qu'est-ce que le déni de justice, et à quel principe cardinal de l'ordre juridique se rattache-t-il ?",
    reponse: "Le **déni de justice** est le fait, pour un juge, de refuser de statuer sous prétexte qu'aucune loi n'est applicable — c'est une faute. Il se rattache au principe selon lequel tout ordre juridique doit garantir les **trois pouvoirs** de produire, d'appliquer et de faire respecter le droit (grille de Delmas-Marty) : un juge qui refuse de trancher prive l'ordre juridique de sa fonction d'application.",
  },
  {
    id: "cc1-15",
    categorie: "Entraînement CC1",
    question: "En quel sens l'ordre étatique n'est-il « qu'un ordre parmi d'autres » ? Citez au moins trois exemples.",
    reponse: "C'est le **pluralisme juridique** : une véritable constellation d'ordres coexiste avec l'ordre étatique — l'ordre **international** (des États égaux, liés par leurs engagements), l'**Union européenne** (extrêmement organisée), l'ordre **religieux**, les **ordres professionnels** (avocats, médecins) et l'ordre **sportif** (la FIFA).",
  },
  {
    id: "cc1-16",
    categorie: "Entraînement CC1",
    question: "Qu'a établi l'arrêt Blanco (Tribunal des conflits, 8 février 1873), et pourquoi est-il fondateur ?",
    reponse: "Une jeune fille est renversée par un wagonnet exploité par une manufacture publique. Le Tribunal des conflits juge que la responsabilité de l'État **ne peut pas être régie par les règles du Code civil** : elle obéit à des règles propres et relève de l'**ordre administratif**. L'arrêt est fondateur car il fonde l'autonomie du droit administratif par rapport au droit privé.",
  },

  {
    id: "cc1-17",
    categorie: "Entraînement CC1",
    question: "Quelles sont les quatre grandes familles de droit selon la classification classique, avec un exemple de zone géographique pour chacune ?",
    reponse: "Le **droit civil** (romano-germanique), en Europe continentale et en Amérique latine ; la ***common law***, en Angleterre et dans le Commonwealth ; le **droit musulman**, en Afrique du Nord et au Proche et Moyen-Orient ; les **droits traditionnels**, en Afrique et en Océanie.",
  },
  {
    id: "cc1-18",
    categorie: "Entraînement CC1",
    question: "Caractérisez le droit civil (romano-germanique) : conception, symbole, ce qui commande le raisonnement.",
    reponse: "Un droit **rationnel**, dont le symbole est le **Code civil**, et dont le raisonnement est commandé par la **loi** — on part du texte pour en déduire la solution.",
  },
  {
    id: "cc1-19",
    categorie: "Entraînement CC1",
    question: "Caractérisez la common law : conception, symbole, ce qui commande le raisonnement, et son poids dans le monde.",
    reponse: "Un droit **pragmatique**, dont le symbole est le **précédent**, et dont le raisonnement est commandé par l'**action en justice** — on part du cas concret pour construire la règle. Elle représente environ **un tiers** des systèmes juridiques mondiaux.",
  },
  {
    id: "cc1-20",
    categorie: "Entraînement CC1",
    question: "Caractérisez le droit musulman : conception, symbole, ce qui commande le raisonnement.",
    reponse: "Un droit **révélé** (la parole divine), dont le symbole est la **charia**, et dont le raisonnement est commandé par le **Coran** et la **Sunna**.",
  },
  {
    id: "cc1-21",
    categorie: "Entraînement CC1",
    question: "Caractérisez les droits traditionnels : conception, symbole, ce qui commande le raisonnement.",
    reponse: "Un droit **ancestral**, dont le symbole est la **coutume**, et dont le raisonnement est commandé par la **tradition du groupe**.",
  },
  {
    id: "cc1-22",
    categorie: "Entraînement CC1",
    question: "Pourquoi cette classification en quatre familles « ne doit pas être entendue de façon rigide » ?",
    reponse: "Parce que les familles ne sont pas cloisonnées : la *common law* n'est pas composée que de jurisprudence, elle comprend aussi une part importante de **loi écrite** ; et des démarches de **circulation des modèles** et de **rapprochement des systèmes juridiques** existent, notamment au sein de l'Union européenne — preuve que le droit s'inscrit toujours dans une **logique de culture**, mouvante, plutôt que dans des cases étanches.",
  },

  {
    id: "cc1-23",
    categorie: "Entraînement CC1",
    question: "Une cliente glisse sur le sol mouillé d'un supermarché et se blesse. (a) Acte ou fait juridique ? (b) Patrimonial ou extrapatrimonial, le droit à réparation qui en naît ?",
    reponse: "(a) C'est un **fait juridique** : un événement non recherché auquel la loi attache des effets de droit, comme l'accident. (b) Le droit à réparation qui en naît est **patrimonial** : il a une valeur pécuniaire (une indemnisation chiffrée), il est cessible et transmissible — à distinguer de l'atteinte à l'intégrité physique elle-même, qui touche à la personne.",
  },
  {
    id: "cc1-24",
    categorie: "Entraînement CC1",
    question: "Distinguez l'acte juridique et le fait juridique, et donnez la conséquence pratique de cette distinction en matière de preuve.",
    reponse: "L'**acte juridique** est une manifestation de volonté destinée à produire des effets de droit (contrat, testament) ; le **fait juridique** est un événement, volontaire ou non, auquel la loi attache des effets sans qu'ils aient été recherchés (accident, naissance). Conséquence : au-delà de **1 500 euros**, l'acte juridique doit en principe être prouvé par **écrit** (art. 1359 C. civ.), parce que les parties ont eu le temps de se ménager une preuve ; le fait juridique, lui, se prouve par **tout moyen**, puisque personne ne prévoit un accident.",
  },
  {
    id: "cc1-25",
    categorie: "Entraînement CC1",
    question: "Distinguez le droit réel et le droit personnel, chacun illustré d'un exemple.",
    reponse: "Le **droit réel** porte directement sur une chose et confère un droit de suite et un droit de préférence : la **propriété** en est le modèle. Le **droit personnel** (ou droit de créance) est le droit d'exiger d'une personne déterminée une prestation : c'est le rapport d'**obligation**, par exemple la créance d'un prêteur contre son emprunteur.",
  },
  {
    id: "cc1-26",
    categorie: "Entraînement CC1",
    question: "Distinguez les droits patrimoniaux et les droits extrapatrimoniaux, chacun illustré d'un exemple.",
    reponse: "Les droits **patrimoniaux** ont une valeur pécuniaire : cessibles, transmissibles, saisissables et prescriptibles — le droit de propriété. Les droits **extrapatrimoniaux** en sont l'exact inverse, hors commerce, incessibles, insaisissables et en principe imprescriptibles — le droit au nom, le droit à l'honneur, l'autorité parentale.",
  },
  {
    id: "cc1-27",
    categorie: "Entraînement CC1",
    question: "Une commune vend un immeuble de son domaine privé à un particulier, par un contrat de vente ordinaire. Ce litige relève-t-il du droit privé ou du droit public ? Appliquez les trois critères.",
    reponse: "Du **droit privé**, malgré la présence d'une personne publique. Critère **organique** (qui agit ?) : une personne publique, la commune — ce critère seul pencherait vers le droit public. Mais critère **matériel** (quelle activité ?) : une **gestion privée ordinaire** de son patrimoine, pas un service public. Critère **finaliste** (quel but ?) : la commune agit ici comme n'importe quel vendeur, sans poursuivre l'intérêt général de façon spécifique. Les trois critères combinés font pencher vers le droit privé et le juge judiciaire.",
  },
  {
    id: "cc1-28",
    categorie: "Entraînement CC1",
    question: "Un piéton est renversé par un véhicule du service de propreté d'une mairie, en tournée de nettoyage. De quel ordre de juridiction ce litige relève-t-il, et pourquoi ?",
    reponse: "De l'**ordre administratif**, sur le modèle de l'arrêt **Blanco** (TC, 8 février 1873) : une personne publique (la mairie), agissant dans le cadre d'un **service public** (le nettoiement, mission de service public), cause un dommage à un administré. La responsabilité de l'administration a ses règles propres, distinctes du Code civil, et relève du juge administratif — à distinguer d'un dommage causé par un livreur ou un automobiliste privés, qui relève lui du juge judiciaire.",
  },
  {
    id: "cc1-29",
    categorie: "Entraînement CC1",
    question: "Qu'est-ce que la summa divisio, et quelle conséquence pratique majeure emporte-t-elle ?",
    reponse: "La ***summa divisio*** est la distinction fondamentale entre **droit privé** (rapports entre personnes privées) et **droit public** (organisation de l'État et ses rapports avec les particuliers). Conséquence pratique majeure : elle commande la **compétence juridictionnelle** — au juge judiciaire les litiges de droit privé, au juge administratif ceux de droit public, depuis la loi des 16 et 24 août 1790.",
  },
  {
    id: "cc1-30",
    categorie: "Entraînement CC1",
    question: "Pourquoi le piège classique en dissertation consiste-t-il à traiter la distinction droit privé/droit public comme une « frontière géographique » ? Comment faut-il la traiter à la place ?",
    reponse: "Parce que des matières entières sont **mixtes** — le droit pénal punit au nom de la société (logique publique) mais est appliqué par le juge judiciaire ; le droit du travail mêle contrat privé et ordre public social — ce qui rend une frontière par matières trompeuse. Il faut plutôt traiter la distinction comme deux **logiques** : le droit privé raisonne à partir de l'**égalité des volontés** et du contrat, le droit public à partir de l'**inégalité**, de la prérogative de puissance publique et de l'**intérêt général**. C'est cette différence de logique qui survit même quand la frontière des matières se brouille.",
  },

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

export type Definition = {
  term: string;
  text: string;
  source?: string;
};

export type PlanPart = {
  title: string;
  children: { title: string; points: string[] }[];
};

export type ExamQuestion = {
  kind: "dissertation" | "question de cours" | "cas pratique" | "commentaire";
  question: string;
  concise: string;
  plan: PlanPart[];
  pitfalls?: string[];
};

export type QuizItem = {
  q: string;
  choices: string[];
  answer: number;
  why: string;
};

// Schéma dessiné à la main pour une leçon précise — pas généré depuis les
// autres champs (à la différence de la carte mentale) : réservé aux quelques
// leçons où un mécanisme (une hiérarchie, un parcours) se comprend mieux en
// image qu'en texte. `svg` est le contenu d'un <svg>...</svg> complet, en
// attributs simple-guillemet pour rester lisible dans le JSON.
export type LessonSchema = {
  titre: string;
  svg: string;
  legende: string;
};

export type Lesson = {
  id: string;
  courseId: string;
  order: number;
  title: string;
  teaser: string;
  minutes: number;
  brief: string[];
  keyPoints: string[];
  definitions: Definition[];
  exam: ExamQuestion;
  quiz: QuizItem[];
  custom?: boolean;
  schema?: LessonSchema;
};

export type Course = {
  id: string;
  title: string;
  short: string;
  subtitle: string;
  hue: "green" | "blue" | "gold" | "plum" | "rust";
  lessons: Lesson[];
  custom?: boolean;
  // Absent = L1, pour ne pas devoir migrer les matières existantes.
  niveau?: "L1" | "L2" | "L3";
};

export type StepName = "cours" | "definitions" | "mindmap" | "question" | "quiz";

export type LessonRecord = {
  lessonId: string;
  completedAt?: string;
  lastStep?: StepName;
  quizScore?: number;
  quizTotal?: number;
  draft?: string;
  attempts?: number;
};

export type CardRecord = {
  key: string;
  lessonId: string;
  term: string;
  box: number;
  dueAt: string;
  lapses: number;
  reviews: number;
};

// Veille juridique reliée au programme (Fonctionnalité A) : une actu du jour,
// générée en brouillon par l'IA puis relue à la main avant publication.
// `notionId` référence l'id d'une leçon du corpus (voir lib/notions.ts) —
// pas de catalogue de notions séparé, le corpus fait déjà cet office.
export type StatutActualite = "draft" | "published" | "rejected";

export type TypeQuestionActu = "qcm" | "vrai_faux" | "ouverte";

export type QuestionActu = {
  id: string;
  actualiteId: string;
  enonce: string;
  type: TypeQuestionActu;
  // Uniquement pour type "qcm" ; absent pour vrai_faux et ouverte.
  choix?: string[];
  reponse: string;
  explication: string;
  // Distincte de `Actualite.sourceUrl` : permet de citer un texte précis
  // (article de code, arrêt) si la question en vise un particulier.
  sourceCitee: string;
};

export type Actualite = {
  id: string;
  titre: string;
  resume: string;
  datePublication: string;
  sourceUrl: string;
  sourceNom: string;
  notionId: string;
  // URL collée dans l'admin ayant servi de matière première au brouillon —
  // peut différer de sourceUrl (la source officielle citée à l'élève).
  urlOrigine?: string;
  statut: StatutActualite;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  // Jointure optionnelle, remplie à la lecture (pas stockée avec l'actu).
  questions?: QuestionActu[];
};

// Répétition espacée par notion (Fonctionnalité B) : même mécanique que
// CardRecord (Leitner à 5 boîtes, lib/srs.ts) mais à la granularité de la
// notion plutôt que du terme — une notion est « maîtrisée » par toutes les
// questions qui la couvrent, tous types confondus.
export type NotionMastery = {
  notionId: string;
  box: number;
  // 0-100, dérivé directement du box (voir scoreMaitriseFromBox) : une
  // seule source de vérité, jamais un second calcul qui pourrait diverger.
  scoreMaitrise: number;
  reussitesConsecutives: number;
  lapses: number;
  reviews: number;
  dueAt: string;
};

// Méthodologie d'examen (Fonctionnalité D) : exercice de cas pratique, de
// commentaire d'arrêt ou de dissertation, généré depuis le contenu existant
// d'une notion (pas depuis une source externe, à la différence des actus).
// Pas de notation automatique : l'élève s'auto-évalue contre grilleCorrection
// et corrigeType après une rédaction libre.
export type TypeExerciceMethodo = "cas_pratique" | "commentaire_arret" | "dissertation";
export type StatutExerciceMethodo = "draft" | "published" | "rejected";

export type ExerciceMethodo = {
  id: string;
  type: TypeExerciceMethodo;
  notionId: string;
  enonce: string;
  grilleCorrection: string[];
  corrigeType: string;
  statut: StatutExerciceMethodo;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

// Suivi minimal côté élève : un exercice fait, avec son verdict d'auto-
// évaluation. Les critères cochés eux-mêmes ne sont pas conservés — l'état
// vivant qui compte est le score de maîtrise de la notion (lib/srs.ts),
// déjà mis à jour par ce même verdict.
export type ExerciceMethodoRecord = {
  exerciceId: string;
  completedAt?: string;
  reussi?: boolean;
};

// Habitude quotidienne (Fonctionnalité E) : de quoi calculer `objectifAtteint`
// sans avoir besoin de relire le journal d'audit `reponses_utilisateur`
// (écriture seule, jamais relu côté client — voir lib/notions.ts). `jour`
// (todayKey()) sert uniquement à savoir quand remettre les compteurs à zéro.
export type ActiviteDuJour = {
  jour: string;
  reponses: number;
  notionsDuesRevues: boolean;
  actuLue: boolean;
};

export type Profile = {
  firstName?: string;
  university?: string;
  dailyGoal: number;
  activeCourses: string[];
  theme: "auto" | "light" | "dark";
  createdAt: string;
  trialStartedAt: string;
  plan: "trial" | "active" | "expired";
  reminderHour?: number;
  // Classement de promo, anonyme et désactivé par défaut.
  leaderboardOptIn?: boolean;
  pseudonym?: string;
  // Consentement explicite à la mutualisation d'un cours déposé entre élèves.
  sharingConsent?: boolean;
};

export type ProgressState = {
  version: number;
  profile: Profile;
  lessons: Record<string, LessonRecord>;
  cards: Record<string, CardRecord>;
  // Maîtrise par notion (= par leçon du corpus, voir lib/notions.ts), tous
  // types de questions confondus (actu du jour, quiz, définitions, examen) —
  // distinct de `cards`, qui ne suit que les définitions terme à terme.
  notions: Record<string, NotionMastery>;
  exercicesMethodo: Record<string, ExerciceMethodoRecord>;
  // `objectifAtteint` : calculé pour AUJOURD'HUI (voir `activiteDuJour` et
  // lib/srs.ts) — la forme d'origine ({current, best, lastDay, days}) n'est
  // pas modifiée, ce champ ne fait que s'y ajouter.
  streak: { current: number; best: number; lastDay?: string; days: string[]; objectifAtteint?: boolean };
  // Compteurs du jour courant (Fonctionnalité E), remis à zéro dès que `jour`
  // ne correspond plus à aujourd'hui — voir activiteDuJourActuelle (lib/srs.ts).
  activiteDuJour: ActiviteDuJour;
  customCourses: Course[];
  // Horodatage de la dernière écriture (posé au moment de la persistance, pas
  // à chaque frappe) : départage quel appareil a la version la plus récente
  // à la connexion, pour que réglages et progression suivent le compte plutôt
  // que de rester bloqués sur le premier appareil qui a le plus de leçons.
  savedAt?: string;
  // Nombre de corrections IA utilisées dans le module d'entraînement gratuit
  // (questions ouvertes d'intro générale). Plafonné pour les comptes non
  // abonnés, voir ENTRAINEMENT_CORRECTION_LIMIT dans lib/state.tsx.
  entrainementCorrectionsUsed?: number;
  // Questions de QuizEclair (components/QuizEclair.tsx) déjà réussies au
  // moins une fois : identifiées par `${lesson.id}::quiz${index}` (pas d'id
  // dans QuizItem, la position dans le tableau du corpus suffit). Une
  // question qui y figure n'est retirée du tirage que tant que d'autres,
  // non encore réussies, restent disponibles pour compléter le tirage.
  quizMastered?: Record<string, true>;
};

// Retour de l'IA sur une copie rédigée par l'élève (mode correction).
export type EssayFeedback = {
  note: number;
  bareme: number;
  pointsForts: string[];
  pointsFaibles: string[];
  conseils: string[];
  commentaire: string;
};

// Retour de l'IA sur une réponse courte du module d'entraînement (questions
// de cours / vocabulaire / jurisprudence), comparée à la réponse attendue.
export type EntrainementFeedback = {
  verdict: "correct" | "partiel" | "incorrect";
  commentaire: string;
};

// Une ligne du classement anonyme de promo : jamais d'identité, seulement
// un pseudonyme choisi par l'élève et des compteurs agrégés.
export type LeaderboardRow = {
  pseudonym: string;
  streak: number;
  mastered: number;
  lessonsDone: number;
  isMe?: boolean;
};

export const HUES: Record<Course["hue"], { fg: string; soft: string; strong: string }> = {
  green: { fg: "#1F6F53", soft: "#E3F0E8", strong: "#16513C" },
  blue: { fg: "#1D5E86", soft: "#DEEDF5", strong: "#154864" },
  gold: { fg: "#8A6A1E", soft: "#F6EDD8", strong: "#6B5117" },
  plum: { fg: "#6E3B6E", soft: "#F1E4F1", strong: "#532C53" },
  rust: { fg: "#9C4A26", soft: "#F5E4DA", strong: "#7A381D" },
};

export const HUES_DARK: Record<Course["hue"], { fg: string; soft: string; strong: string }> = {
  green: { fg: "#57C79A", soft: "#15352A", strong: "#7BDBB3" },
  blue: { fg: "#6FB6DE", soft: "#12293A", strong: "#9BD0EC" },
  gold: { fg: "#D8B368", soft: "#2E2716", strong: "#E7CD94" },
  plum: { fg: "#C98BC9", soft: "#2E1F30", strong: "#DDB0DD" },
  rust: { fg: "#E38A5E", soft: "#33231A", strong: "#EDAA85" },
};

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
  streak: { current: number; best: number; lastDay?: string; days: string[] };
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

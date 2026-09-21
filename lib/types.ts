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

export type StepName = "cours" | "definitions" | "question" | "quiz";

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
  streak: { current: number; best: number; lastDay?: string; days: string[] };
  customCourses: Course[];
  // Horodatage de la dernière écriture (posé au moment de la persistance, pas
  // à chaque frappe) : départage quel appareil a la version la plus récente
  // à la connexion, pour que réglages et progression suivent le compte plutôt
  // que de rester bloqués sur le premier appareil qui a le plus de leçons.
  savedAt?: string;
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

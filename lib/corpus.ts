import type { Course, Lesson } from "./types";

import meta from "./corpus/meta.json";
import introA from "./corpus/parts/intro-droit.a.json";
import introB from "./corpus/parts/intro-droit.b.json";
import introC from "./corpus/parts/intro-droit.c.json";
import introD from "./corpus/parts/intro-droit.d.json";
import constitA from "./corpus/parts/constit.a.json";
import constitB from "./corpus/parts/constit.b.json";
import orgaA from "./corpus/parts/orga.a.json";
import orgaB from "./corpus/parts/orga.b.json";
import orgaC from "./corpus/parts/orga.c.json";
import histoireA from "./corpus/parts/histoire.a.json";
import histoireB from "./corpus/parts/histoire.b.json";
import histoireC from "./corpus/parts/histoire.c.json";
import methodoA from "./corpus/parts/methodo.a.json";
import obligationsA from "./corpus/parts/obligations.a.json";
import auteursA from "./corpus/parts/auteurs.a.json";
import auteursB from "./corpus/parts/auteurs.b.json";
import auteursC from "./corpus/parts/auteurs.c.json";

type RawLesson = Omit<Lesson, "courseId">;

// Le corpus est écrit en petits fichiers par matière, puis assemblé ici au
// chargement du module. Aucune étape de build n'est nécessaire, et ajouter une
// matière revient à déposer un fichier et à l'enregistrer dans cette table.
const PARTS: Record<string, RawLesson[][]> = {
  "intro-droit": [introA, introB, introC, introD] as unknown as RawLesson[][],
  constit: [constitA, constitB] as unknown as RawLesson[][],
  orga: [orgaA, orgaB, orgaC] as unknown as RawLesson[][],
  histoire: [histoireA, histoireB, histoireC] as unknown as RawLesson[][],
  methodo: [methodoA] as unknown as RawLesson[][],
  obligations: [obligationsA] as unknown as RawLesson[][],
  auteurs: [auteursA, auteursB, auteursC] as unknown as RawLesson[][],
};

type Meta = {
  id: string;
  title: string;
  short: string;
  subtitle: string;
  hue: Course["hue"];
  prefix: string;
  niveau?: Course["niveau"];
};

// Le contenu L2/L3 existe déjà dans le corpus (cf. "niveau" sur chaque matière)
// mais reste masqué tant qu'il n'a pas été relu : passer ce booléen à true
// pour l'ouvrir aux élèves une fois la relecture faite.
const L2L3_VISIBLE = false;

export const CORPUS: Course[] = (meta as Meta[])
  .map((m) => ({
    id: m.id,
    title: m.title,
    short: m.short,
    subtitle: m.subtitle,
    hue: m.hue,
    niveau: m.niveau,
    lessons: (PARTS[m.prefix] ?? [])
      .flat()
      .map((l) => ({ ...l, courseId: m.id }))
      .sort((a, b) => a.order - b.order),
  }))
  .filter((c) => L2L3_VISIBLE || !c.niveau || c.niveau === "L1");

export function allCourses(custom: Course[] = []): Course[] {
  return [...CORPUS, ...custom];
}

export function allLessons(custom: Course[] = []): Lesson[] {
  return allCourses(custom).flatMap((c) => c.lessons);
}

export function findLesson(id: string, custom: Course[] = []): Lesson | undefined {
  return allLessons(custom).find((l) => l.id === id);
}

export function findCourse(id: string, custom: Course[] = []): Course | undefined {
  return allCourses(custom).find((c) => c.id === id);
}

export function courseOf(lesson: Lesson, custom: Course[] = []): Course | undefined {
  return findCourse(lesson.courseId, custom);
}

export function neighbours(lessonId: string, custom: Course[] = []) {
  const lesson = findLesson(lessonId, custom);
  if (!lesson) return { prev: undefined, next: undefined };
  const course = courseOf(lesson, custom);
  if (!course) return { prev: undefined, next: undefined };
  const i = course.lessons.findIndex((l) => l.id === lessonId);
  return { prev: course.lessons[i - 1], next: course.lessons[i + 1] };
}

// Choisit la leçon du jour : on avance dans les matières actives en round-robin,
// pour éviter de rester bloqué sur une seule matière pendant deux semaines.
export function pickDailyLesson(
  doneIds: string[],
  activeCourses: string[],
  custom: Course[] = [],
): Lesson | undefined {
  const courses = allCourses(custom).filter(
    (c) => activeCourses.length === 0 || activeCourses.includes(c.id),
  );
  if (!courses.length) return allLessons(custom).find((l) => !doneIds.includes(l.id));

  const done = new Set(doneIds);
  const available = courses
    .map((c) => ({
      course: c,
      next: c.lessons.find((l) => !done.has(l.id)),
      doneCount: c.lessons.filter((l) => done.has(l.id)).length,
    }))
    .filter((p) => p.next);
  if (!available.length) return undefined;
  available.sort((a, b) => a.doneCount - b.doneCount || a.course.id.localeCompare(b.course.id));
  return available[0].next;
}

export function corpusStats(custom: Course[] = []) {
  const lessons = allLessons(custom);
  return {
    courses: allCourses(custom).length,
    lessons: lessons.length,
    definitions: lessons.reduce((n, l) => n + l.definitions.length, 0),
    questions: lessons.reduce((n, l) => n + l.quiz.length, 0),
    minutes: lessons.reduce((n, l) => n + l.minutes, 0),
  };
}

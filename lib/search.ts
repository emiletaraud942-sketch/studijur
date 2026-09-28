import type { Course, Lesson } from "./types";
import { allCourses } from "./corpus";

export type SearchResult =
  | { kind: "matiere"; course: Course }
  | { kind: "lecon"; course: Course; lesson: Lesson }
  | { kind: "definition"; course: Course; lesson: Lesson; term: string }
  | { kind: "question"; course: Course; lesson: Lesson };

const PAR_TYPE = 8;

// Insensible aux accents et à la casse : "generale" doit trouver "générale".
function normalise(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function search(query: string, custom: Course[] = []): SearchResult[] {
  const q = normalise(query.trim());
  if (q.length < 2) return [];

  const matieres: SearchResult[] = [];
  const lecons: SearchResult[] = [];
  const definitions: SearchResult[] = [];
  const questions: SearchResult[] = [];

  for (const course of allCourses(custom)) {
    if (matieres.length < PAR_TYPE && (normalise(course.title).includes(q) || normalise(course.subtitle).includes(q))) {
      matieres.push({ kind: "matiere", course });
    }
    for (const lesson of course.lessons) {
      if (lecons.length < PAR_TYPE && (normalise(lesson.title).includes(q) || normalise(lesson.teaser).includes(q))) {
        lecons.push({ kind: "lecon", course, lesson });
      }
      if (definitions.length < PAR_TYPE) {
        const hit = lesson.definitions.find((d) => normalise(d.term).includes(q));
        if (hit) definitions.push({ kind: "definition", course, lesson, term: hit.term });
      }
      if (questions.length < PAR_TYPE && normalise(lesson.exam.question).includes(q)) {
        questions.push({ kind: "question", course, lesson });
      }
    }
  }

  return [...matieres, ...lecons, ...definitions, ...questions];
}

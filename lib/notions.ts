import type { Course, Lesson } from "./types";
import { allLessons, findCourse, findLesson } from "./corpus";

// Une "notion" (Fonctionnalité A : veille juridique, Fonctionnalité B :
// maîtrise par notion) n'a pas de catalogue séparé à maintenir : c'est une
// leçon du corpus existant. L'id de la notion = l'id de la leçon — ça évite
// de faire vivre deux hiérarchies de contenu qui pourraient diverger.

export function notionLesson(notionId: string, custom: Course[] = []): Lesson | undefined {
  return findLesson(notionId, custom);
}

export function isKnownNotion(notionId: string, custom: Course[] = []): boolean {
  return Boolean(findLesson(notionId, custom));
}

// Libellé d'affichage court : "Matière — Titre de la leçon".
export function notionLabel(notionId: string, custom: Course[] = []): string {
  const lesson = findLesson(notionId, custom);
  if (!lesson) return notionId;
  const course = findCourse(lesson.courseId, custom);
  return course ? `${course.short} — ${lesson.title}` : lesson.title;
}

export function allNotionIds(custom: Course[] = []): string[] {
  return allLessons(custom).map((l) => l.id);
}

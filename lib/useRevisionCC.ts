"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { findLesson } from "./corpus";
import { REVISION_CC } from "./revision-cc-config";
import type { Lesson } from "./types";

// Partagé entre le hub /revision-cc/[matiere] et chacune de ses rubriques
// (chronologie, pièges, questions, trous, fiche) : même config, mêmes
// leçons chargées une seule fois par route plutôt que dupliquées 6 fois.
export function useRevisionCC() {
  const { matiere } = useParams<{ matiere: string }>();
  const config = REVISION_CC[matiere];
  const lessons = useMemo(
    () => (config ? (config.lessonSlugs.map((id) => findLesson(id)).filter(Boolean) as Lesson[]) : []),
    [config],
  );
  const chronologieLessons = useMemo(
    () => (config?.chronologieLessonIds ?? []).map((id) => findLesson(id)).filter(Boolean) as Lesson[],
    [config],
  );
  return { config, lessons, chronologieLessons };
}

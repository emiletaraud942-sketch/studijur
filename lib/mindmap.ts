import type { Lesson } from "./types";

// Une carte mentale n'a rien à faire générer par l'IA : la leçon contient
// déjà une hiérarchie toute faite (points clés, définitions, plan d'examen
// en I/II puis A/B puis points) — on ne fait que la redessiner. Gratuit,
// instantané, fidèle au contenu, et ça marche même sans clé API configurée.
export type MindNode = {
  id: string;
  label: string;
  detail?: string;
  children?: MindNode[];
};

export function lessonMindMap(lesson: Lesson): MindNode {
  const branches: MindNode[] = [
    {
      id: "keypoints",
      label: "Points clés",
      // `detail` = le point clé en entier : la feuille n'a pas d'enfants,
      // donc sans lui son libellé tronqué (souvent une phrase complète)
      // resterait coupé sans aucun moyen de le lire en entier.
      children: lesson.keyPoints.map((k, i) => ({ id: `kp-${i}`, label: k, detail: k })),
    },
    {
      id: "definitions",
      label: "Définitions",
      children: lesson.definitions.map((d, i) => ({
        id: `def-${i}`,
        label: d.term,
        detail: d.text,
      })),
    },
    {
      id: "plan",
      label: "Plan d'examen",
      children: lesson.exam.plan.map((part, i) => ({
        id: `plan-${i}`,
        label: part.title,
        children: part.children.map((sub, j) => ({
          id: `plan-${i}-${j}`,
          label: sub.title,
          children: sub.points.map((p, k) => ({ id: `plan-${i}-${j}-${k}`, label: p, detail: p })),
        })),
      })),
    },
  ];
  return {
    id: "root",
    label: lesson.title,
    // Une leçon sans définitions (ex. méthodologie) n'a rien à montrer sous
    // cette branche : mieux vaut l'omettre qu'afficher un nœud mort, jamais
    // cliquable, qui ne mène nulle part.
    children: branches.filter((b) => (b.children?.length ?? 0) > 0),
  };
}

import { callModel, extractJson, getAnthropic } from "./anthropic";
import { getAdmin } from "./supabase-admin";
import { findCourse, findLesson } from "./corpus";
import type { Course, ExerciceMethodo, TypeExerciceMethodo } from "./types";

// Fonctionnalité D — méthodologie d'examen. Contrairement aux actus
// (Fonctionnalité A), un exercice de méthode n'a pas besoin de source externe :
// il se génère depuis le contenu déjà enseigné dans la notion (= une leçon du
// corpus), pour rester strictement fondé sur ce que l'élève a réellement vu.

const LABELS: Record<TypeExerciceMethodo, string> = {
  cas_pratique: "un cas pratique",
  commentaire_arret: "un commentaire d'arrêt",
  dissertation: "une dissertation",
};

const SYSTEM = `Tu es chargé de TD en droit dans une université française et tu conçois des exercices de méthode pour des étudiants de première année de licence.

On te donne le contenu d'une leçon (cours, points clés, question type examen). Tu produis UN exercice de méthode, strictement fondé sur ce contenu : tu n'inventes aucune règle, aucun article, aucune jurisprudence qui n'y figure pas. Si le contenu ne suffit pas pour un élément précis, reste général plutôt que d'inventer.

Réponds UNIQUEMENT par un objet JSON valide, sans texte autour, à ce format exact :
{
  "enonce": "l'énoncé complet de l'exercice (un cas concret pour un cas pratique, un extrait à commenter pour un commentaire d'arrêt, un sujet pour une dissertation), 60 à 150 mots",
  "grilleCorrection": ["4 à 7 critères de correction, un par ligne, courts et vérifiables (ex. « qualifie correctement les faits », « cite l'article applicable », « distingue bien X de Y »)"],
  "corrigeType": "un corrigé rédigé de 150 à 300 mots, qui répond vraiment à l'énoncé et permet à l'élève de comparer sa propre rédaction"
}

Contraintes impératives : exactement le type d'exercice demandé, la grille de correction porte uniquement sur des points vérifiables par l'élève lui-même (jamais « bien écrit » ou « original »), tout est rédigé en français.`;

export type ExerciceMethodoDraft = {
  enonce: string;
  grilleCorrection: string[];
  corrigeType: string;
};

function sane(d: unknown): d is ExerciceMethodoDraft {
  const x = d as ExerciceMethodoDraft;
  return Boolean(
    x && typeof x.enonce === "string" && x.enonce.trim().length > 30 &&
    Array.isArray(x.grilleCorrection) && x.grilleCorrection.length >= 3 &&
    x.grilleCorrection.every((c) => typeof c === "string" && c.trim().length > 0) &&
    typeof x.corrigeType === "string" && x.corrigeType.trim().length > 50,
  );
}

export type GenerationResult =
  | { ok: true; exercice: ExerciceMethodo }
  | { ok: false; error: string };

// Déclenchable manuellement (bouton admin ou script) — jamais automatique.
// Produit toujours un brouillon (statut "draft"), jamais publié directement :
// la relecture par le propriétaire du site reste une étape à part (voir
// l'écran d'admin, Fonctionnalité D étape 2).
export async function generateExerciceMethodo(
  notionId: string,
  type: TypeExerciceMethodo,
  custom: Course[] = [],
): Promise<GenerationResult> {
  const lesson = findLesson(notionId, custom);
  if (!lesson) {
    return { ok: false, error: `Notion inconnue : « ${notionId} » ne correspond à aucune leçon du corpus.` };
  }

  const client = getAnthropic();
  if (!client) return { ok: false, error: "La clé API Claude n'est pas configurée." };

  const admin = getAdmin();
  if (!admin) return { ok: false, error: "La base de données n'est pas configurée (clé de service manquante)." };

  const course = findCourse(lesson.courseId, custom);
  const matiere = course ? `${course.title} (${course.short})` : lesson.courseId;
  const contenu = [
    `Titre de la leçon : ${lesson.title}`,
    `Points clés :\n${lesson.keyPoints.map((k) => `- ${k}`).join("\n")}`,
    `Cours :\n${lesson.brief.join("\n\n")}`,
    `Question type examen déjà posée sur cette notion (pour éviter de la redemander à l'identique) : ${lesson.exam.question}`,
  ].join("\n\n");

  let raw: string;
  try {
    raw = await callModel(client, {
      system: SYSTEM,
      cacheSystem: true,
      maxTokens: 1800,
      user: `Matière : ${matiere}\nNotion : ${lesson.title}\nType d'exercice demandé : ${LABELS[type]}\n\n--- CONTENU DE LA LEÇON ---\n${contenu}\n--- FIN DU CONTENU ---\n\nProduis l'exercice JSON.`,
    });
  } catch {
    return { ok: false, error: "La génération a échoué (appel au modèle)." };
  }

  let draft: unknown;
  try {
    draft = extractJson(raw);
  } catch {
    return { ok: false, error: "La réponse du modèle n'était pas un JSON exploitable." };
  }

  if (!sane(draft)) {
    return { ok: false, error: "La réponse du modèle ne respecte pas le schéma attendu — rejetée." };
  }

  const { data, error } = await admin
    .from("exercices_methodo")
    .insert({
      type,
      notion_id: notionId,
      enonce: draft.enonce.trim(),
      grille_correction: draft.grilleCorrection.map((c) => c.trim()),
      corrige_type: draft.corrigeType.trim(),
      statut: "draft",
    })
    .select()
    .single();

  if (error || !data) {
    return { ok: false, error: `Écriture en base échouée : ${error?.message ?? "erreur inconnue"}.` };
  }

  return {
    ok: true,
    exercice: {
      id: data.id,
      type: data.type,
      notionId: data.notion_id,
      enonce: data.enonce,
      grilleCorrection: data.grille_correction,
      corrigeType: data.corrige_type,
      statut: data.statut,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      publishedAt: data.published_at ?? undefined,
    },
  };
}

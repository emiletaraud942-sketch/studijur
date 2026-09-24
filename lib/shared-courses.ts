import { createHash } from "node:crypto";
import type { Course } from "./types";
import { getAdmin } from "./supabase-admin";

// Deux élèves d'une même promo déposent le même polycopié : on ne paie la
// génération qu'une fois. L'empreinte est calculée sur le texte normalisé, de
// sorte qu'une différence de mise en forme, d'espaces ou de casse n'empêche pas
// la reconnaissance.
export function fingerprint(text: string): string {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return createHash("sha256").update(normalized).digest("hex");
}

export function sharedCourseId(fp: string): string {
  return `cours-${fp.slice(0, 12)}`;
}

// Cache mémoire, utile même sans Supabase : sur une même instance, la deuxième
// personne qui dépose le document du jour ne relance pas la génération.
const MEMORY_LIMIT = 40;
const memory = new Map<string, Course>();

function remember(fp: string, course: Course) {
  memory.delete(fp);
  memory.set(fp, course);
  while (memory.size > MEMORY_LIMIT) {
    const oldest = memory.keys().next().value;
    if (oldest === undefined) break;
    memory.delete(oldest);
  }
}

export type LookupResult = { course: Course; origin: "mémoire" | "base" } | null;

export async function lookupShared(fp: string): Promise<LookupResult> {
  const local = memory.get(fp);
  if (local) return { course: local, origin: "mémoire" };

  const sb = getAdmin();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from("shared_courses")
      .select("course, hits")
      .eq("fingerprint", fp)
      .maybeSingle();
    if (!data?.course) return null;
    const course = data.course as Course;
    remember(fp, course);
    // Compteur d'usage, sans bloquer la réponse.
    void sb.from("shared_courses")
      .update({ hits: (data.hits ?? 0) + 1 })
      .eq("fingerprint", fp)
      .then(() => undefined, () => undefined);
    return { course, origin: "base" };
  } catch {
    return null;
  }
}

// On enregistre la leçon produite, jamais le texte source du cours : le
// polycopié d'un professeur reste chez l'élève qui l'a déposé.
export async function storeShared(fp: string, course: Course): Promise<void> {
  remember(fp, course);
  const sb = getAdmin();
  if (!sb) return;
  try {
    await sb.from("shared_courses").upsert(
      { fingerprint: fp, title: course.title, course, hits: 1 },
      { onConflict: "fingerprint" },
    );
  } catch {
    /* la mutualisation est un optimisation, jamais un point de rupture */
  }
}

// Garde-fou de coût : sans comptes, l'adresse IP est la seule identité
// disponible. Le compteur vit dans la table Supabase `api_quota` quand elle
// est disponible : il survit aux redémarrages d'instance et est partagé par
// toutes les instances serverless, ce qu'une simple Map en mémoire ne permet
// pas (chaque instance froide repartait sinon avec un compteur à zéro).
// Sans Supabase configuré, ou tant que la table n'a pas encore été créée, on
// retombe sur la mémoire locale : imparfait, mais on ne bloque jamais un
// élève pour une panne d'infrastructure.
//
// Le quota compte des appels modèle, pas des requêtes HTTP : l'OCR (jusqu'à
// MAX_PHOTOS photos) et le dépôt de cours (jusqu'à MAX_LESSONS sections)
// appellent l'IA plusieurs fois en une seule requête. Sans ça, "3
// générations/jour" pouvait en réalité déclencher des dizaines d'appels
// facturés. `amount` porte donc le nombre d'appels réellement engagés.
const QUOTA_PER_DAY = 3;
const QUOTA_WINDOW_MS = 86400000;
const memoryQuota = new Map<string, { count: number; resetAt: number }>();

function checkQuotaInMemory(key: string, amount: number, limit: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryQuota.get(key);
  if (!entry || entry.resetAt < now) {
    if (amount > limit) return { ok: false, remaining: limit };
    memoryQuota.set(key, { count: amount, resetAt: now + QUOTA_WINDOW_MS });
    return { ok: true, remaining: limit - amount };
  }
  if (entry.count + amount > limit) return { ok: false, remaining: Math.max(0, limit - entry.count) };
  entry.count += amount;
  return { ok: true, remaining: limit - entry.count };
}

function releaseQuotaInMemory(key: string, amount: number) {
  const entry = memoryQuota.get(key);
  if (entry) entry.count = Math.max(0, entry.count - amount);
}

// `limit` permet de relever le plafond quotidien pour un utilisateur abonné
// (voir app/api/ingest/route.ts) : le compteur consommé reste le même pour
// tout le monde, seul le seuil au-delà duquel on refuse change.
export async function checkQuota(key: string, amount = 1, limit: number = QUOTA_PER_DAY): Promise<{ ok: boolean; remaining: number }> {
  const sb = getAdmin();
  if (!sb) return checkQuotaInMemory(key, amount, limit);

  try {
    const nowIso = new Date().toISOString();
    const { data: row, error: readError } = await sb
      .from("api_quota")
      .select("count, reset_at")
      .eq("key", key)
      .maybeSingle();
    if (readError) return checkQuotaInMemory(key, amount, limit); // table absente ou panne : dégradation gracieuse

    if (!row || row.reset_at < nowIso) {
      if (amount > limit) return { ok: false, remaining: limit };
      const resetAt = new Date(Date.now() + QUOTA_WINDOW_MS).toISOString();
      const { error } = await sb
        .from("api_quota")
        .upsert({ key, count: amount, reset_at: resetAt }, { onConflict: "key" });
      if (error) return checkQuotaInMemory(key, amount, limit);
      return { ok: true, remaining: limit - amount };
    }
    if (row.count + amount > limit) return { ok: false, remaining: Math.max(0, limit - row.count) };
    const nextCount = row.count + amount;
    const { error } = await sb.from("api_quota").update({ count: nextCount }).eq("key", key);
    if (error) return checkQuotaInMemory(key, amount, limit);
    return { ok: true, remaining: limit - nextCount };
  } catch {
    return checkQuotaInMemory(key, amount, limit);
  }
}

export async function releaseQuota(key: string, amount = 1): Promise<void> {
  const sb = getAdmin();
  if (!sb) return releaseQuotaInMemory(key, amount);
  try {
    const { data: row, error } = await sb.from("api_quota").select("count").eq("key", key).maybeSingle();
    if (error || !row) return;
    const next = Math.max(0, row.count - amount);
    await sb.from("api_quota").update({ count: next }).eq("key", key);
  } catch {
    /* best effort : un crédit non rendu n'est jamais bloquant */
  }
}

// Avec un compte obligatoire pour les fonctionnalités IA, on plafonne à la
// fois par compte (clé `user:<id>`) et par IP : le premier empêche un même
// élève de multiplier les essais gratuits en changeant d'appareil ou de
// navigateur, le second reste un filet contre le partage d'un seul compte
// entre plusieurs personnes. Les deux clés doivent passer pour continuer ;
// si l'une échoue, celles déjà consommées sont immédiatement rendues.
export async function checkQuotaBoth(keys: string[], amount = 1, limit: number = QUOTA_PER_DAY): Promise<{ ok: boolean; remaining: number }> {
  const consumed: string[] = [];
  let minRemaining = limit;
  for (const key of keys) {
    const r = await checkQuota(key, amount, limit);
    if (!r.ok) {
      for (const c of consumed) await releaseQuota(c, amount);
      return { ok: false, remaining: r.remaining };
    }
    minRemaining = Math.min(minRemaining, r.remaining);
    consumed.push(key);
  }
  return { ok: true, remaining: minRemaining };
}

export async function releaseQuotaAll(keys: string[], amount = 1): Promise<void> {
  await Promise.all(keys.map((k) => releaseQuota(k, amount)));
}

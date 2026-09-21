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
const QUOTA_PER_DAY = 6;
const QUOTA_WINDOW_MS = 86400000;
const memoryQuota = new Map<string, { count: number; resetAt: number }>();

function checkQuotaInMemory(key: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryQuota.get(key);
  if (!entry || entry.resetAt < now) {
    memoryQuota.set(key, { count: 1, resetAt: now + QUOTA_WINDOW_MS });
    return { ok: true, remaining: QUOTA_PER_DAY - 1 };
  }
  if (entry.count >= QUOTA_PER_DAY) return { ok: false, remaining: 0 };
  entry.count += 1;
  return { ok: true, remaining: QUOTA_PER_DAY - entry.count };
}

function releaseQuotaInMemory(key: string) {
  const entry = memoryQuota.get(key);
  if (entry && entry.count > 0) entry.count -= 1;
}

export async function checkQuota(ip: string): Promise<{ ok: boolean; remaining: number }> {
  const sb = getAdmin();
  if (!sb) return checkQuotaInMemory(ip);

  try {
    const nowIso = new Date().toISOString();
    const { data: row, error: readError } = await sb
      .from("api_quota")
      .select("count, reset_at")
      .eq("key", ip)
      .maybeSingle();
    if (readError) return checkQuotaInMemory(ip); // table absente ou panne : dégradation gracieuse

    if (!row || row.reset_at < nowIso) {
      const resetAt = new Date(Date.now() + QUOTA_WINDOW_MS).toISOString();
      const { error } = await sb
        .from("api_quota")
        .upsert({ key: ip, count: 1, reset_at: resetAt }, { onConflict: "key" });
      if (error) return checkQuotaInMemory(ip);
      return { ok: true, remaining: QUOTA_PER_DAY - 1 };
    }
    if (row.count >= QUOTA_PER_DAY) return { ok: false, remaining: 0 };
    const nextCount = row.count + 1;
    const { error } = await sb.from("api_quota").update({ count: nextCount }).eq("key", ip);
    if (error) return checkQuotaInMemory(ip);
    return { ok: true, remaining: QUOTA_PER_DAY - nextCount };
  } catch {
    return checkQuotaInMemory(ip);
  }
}

export async function releaseQuota(ip: string): Promise<void> {
  const sb = getAdmin();
  if (!sb) return releaseQuotaInMemory(ip);
  try {
    const { data: row, error } = await sb.from("api_quota").select("count").eq("key", ip).maybeSingle();
    if (error || !row) return;
    if (row.count > 0) await sb.from("api_quota").update({ count: row.count - 1 }).eq("key", ip);
  } catch {
    /* best effort : un crédit non rendu n'est jamais bloquant */
  }
}

import { NextResponse } from "next/server";
import { authRequired, requireUser } from "@/lib/auth-server";
import { isOwner } from "@/lib/owner";
import { getAdmin } from "@/lib/supabase-admin";
import { generateExerciceMethodo } from "@/lib/exercices-methodo";
import type { TypeExerciceMethodo } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const TYPES: TypeExerciceMethodo[] = ["cas_pratique", "commentaire_arret", "dissertation"];

// Écran d'admin réservé au propriétaire du site : mêmes vérifications que
// /api/ingest (authRequired ne s'active que si les comptes sont configurés,
// mais l'admin lui-même n'a de sens qu'avec un compte propriétaire réel).
async function checkOwner(req: Request): Promise<string | null> {
  if (!authRequired()) return "Comptes non configurés : l'admin n'est pas accessible.";
  const user = await requireUser(req);
  if (!user || !isOwner(user.email)) return "Accès réservé.";
  return null;
}

export async function GET(req: Request) {
  const deny = await checkOwner(req);
  if (deny) return NextResponse.json({ error: deny }, { status: 403 });

  const admin = getAdmin();
  if (!admin) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });

  const { data, error } = await admin
    .from("exercices_methodo")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ exercices: data });
}

type Body =
  | { action: "generate"; notionId?: string; type?: string }
  | { action: "update"; id?: string; enonce?: string; grilleCorrection?: string[]; corrigeType?: string }
  | { action: "publish" | "reject"; id?: string };

export async function POST(req: Request) {
  const deny = await checkOwner(req);
  if (deny) return NextResponse.json({ error: deny }, { status: 403 });

  const admin = getAdmin();
  if (!admin) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  if (body.action === "generate") {
    const notionId = (body.notionId ?? "").trim();
    const type = body.type as TypeExerciceMethodo;
    if (!notionId || !TYPES.includes(type)) {
      return NextResponse.json({ error: "notionId et type (cas_pratique/commentaire_arret/dissertation) requis." }, { status: 400 });
    }
    const result = await generateExerciceMethodo(notionId, type);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
    return NextResponse.json({ exercice: result.exercice });
  }

  if (body.action === "update") {
    const id = (body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.enonce === "string") patch.enonce = body.enonce;
    if (Array.isArray(body.grilleCorrection)) patch.grille_correction = body.grilleCorrection;
    if (typeof body.corrigeType === "string") patch.corrige_type = body.corrigeType;
    const { error } = await admin.from("exercices_methodo").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "publish" || body.action === "reject") {
    const id = (body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });
    const statut = body.action === "publish" ? "published" : "rejected";
    const patch: Record<string, unknown> = { statut, updated_at: new Date().toISOString() };
    if (statut === "published") patch.published_at = new Date().toISOString();
    const { error } = await admin.from("exercices_methodo").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}

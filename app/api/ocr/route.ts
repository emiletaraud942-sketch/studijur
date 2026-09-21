import { NextResponse } from "next/server";
import { callModel, getAnthropic, currentModel, type ContentBlock } from "@/lib/anthropic";
import { checkQuotaBoth, releaseQuotaAll } from "@/lib/shared-courses";
import { AUTH_REQUIRED_MESSAGE, authRequired, requireUser } from "@/lib/auth-server";

export const runtime = "nodejs";
export const maxDuration = 120;

// Un étudiant qui prend son cours en photo au lieu de le taper : on
// retranscrit fidèlement chaque page avec la vision de Claude, puis le texte
// obtenu rejoint le même champ que le copier-coller ou l'import de fichier —
// aucune leçon n'est encore générée ici, juste la lecture des photos.
// Alignée sur le quota quotidien (3) : une seule transcription peut au pire
// consommer toutes les générations du jour, jamais plus — voir shared-courses.ts.
const MAX_PHOTOS = 3;
const PHOTO_MAX_TOKENS = 1300;
const MAX_BASE64_CHARS = 6_000_000; // ~4,5 Mo décodés, marge de sécurité par photo
const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const SYSTEM = `Tu es un outil de transcription. On te montre la photo d'une page de cours de droit (imprimée ou manuscrite). Retranscris fidèlement TOUT le texte visible, dans l'ordre de lecture naturel, sans rien résumer, reformuler, corriger ou compléter. Respecte les paragraphes et la ponctuation d'origine. Si un mot ou un passage est illisible, écris [illisible] à sa place plutôt que de deviner. Ne commente rien et ne réponds que par le texte transcrit, sans préambule, sans balises, sans guillemets englobants.`;

type ImageIn = { data?: string; mediaType?: string };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "inconnu";
}

export async function POST(req: Request) {
  let body: { images?: ImageIn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const images = (body.images ?? []).filter(
    (i): i is Required<ImageIn> => Boolean(i && typeof i.data === "string" && typeof i.mediaType === "string"),
  );

  if (!images.length) {
    return NextResponse.json({ error: "Aucune photo reçue." }, { status: 400 });
  }
  if (images.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `Trop de photos en une fois (maximum ${MAX_PHOTOS}).` }, { status: 400 });
  }
  for (const img of images) {
    if (!ALLOWED_MEDIA_TYPES.has(img.mediaType)) {
      return NextResponse.json({ error: "Format de photo non pris en charge." }, { status: 400 });
    }
    if (img.data.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: "Une des photos est trop lourde. Réessaie avec une photo moins grande." }, { status: 400 });
    }
  }

  const client = getAnthropic();
  if (!client) {
    return NextResponse.json(
      {
        error:
          "La lecture de photos nécessite l'IA Claude, qui n'est pas configurée sur ce déploiement. Copie-colle le texte de ton cours à la place.",
      },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  let quotaKeys = [ip];
  if (authRequired()) {
    const user = await requireUser(req);
    if (!user) return NextResponse.json({ error: AUTH_REQUIRED_MESSAGE }, { status: 401 });
    quotaKeys = [`user:${user.id}`, ip];
  }

  // Une photo = un appel modèle : le quota se consomme sur ce nombre réel
  // d'appels, pas sur la requête HTTP (voir checkQuotaBoth).
  const gate = await checkQuotaBoth(quotaKeys, images.length);
  if (!gate.ok) {
    return NextResponse.json(
      {
        error: `Tu envoies ${images.length} photo${images.length > 1 ? "s" : ""}, mais il ne te reste que ${gate.remaining} génération${gate.remaining > 1 ? "s" : ""} IA aujourd'hui. Réessaie demain, ou colle le texte directement.`,
      },
      { status: 429 },
    );
  }

  const results: (string | null)[] = new Array(images.length).fill(null);
  const queue = images.map((img, i) => ({ img, i }));
  const CONCURRENCY = 3;

  async function worker() {
    for (;;) {
      const job = queue.shift();
      if (!job) return;
      const { img, i } = job;
      try {
        // Le cast de media_type est sûr : ALLOWED_MEDIA_TYPES a déjà validé la valeur plus haut.
        const mediaType = img.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        const content: ContentBlock[] = [
          { type: "image", source: { type: "base64", media_type: mediaType, data: img.data } },
          { type: "text", text: "Transcris cette page." },
        ];
        const raw = await callModel(client!, { system: SYSTEM, maxTokens: PHOTO_MAX_TOKENS, user: content });
        const trimmed = raw.trim();
        results[i] = trimmed.length > 0 ? trimmed : null;
      } catch {
        results[i] = null;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const pages = results
    .map((text, i) => (text ? `--- Page ${i + 1} ---\n${text}` : null))
    .filter((p): p is string => Boolean(p));

  if (!pages.length) {
    await releaseQuotaAll(quotaKeys, images.length);
    return NextResponse.json(
      { error: "Impossible de lire ces photos. Vérifie qu'elles sont nettes et bien cadrées, ou copie-colle le texte à la place." },
      { status: 422 },
    );
  }

  return NextResponse.json({
    text: pages.join("\n\n"),
    pages: pages.length,
    skipped: images.length - pages.length,
    model: currentModel(),
  });
}

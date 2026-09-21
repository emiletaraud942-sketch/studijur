import Anthropic from "@anthropic-ai/sdk";

export const anthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

// Le premier modèle disponible gagne. Cette liste évite qu'un renommage de
// modèle côté API casse la génération : on descend la liste jusqu'à ce qu'un
// identifiant soit accepté, et on mémorise celui qui marche.
export const MODEL_CANDIDATES = [
  process.env.LEXIO_MODEL,
  "claude-haiku-4-5",
  "claude-haiku-4-5-20251001",
  "claude-3-5-haiku-latest",
  "claude-sonnet-4-5",
].filter(Boolean) as string[];

let resolvedModel: string | null = null;

export function getAnthropic(): Anthropic | null {
  if (!anthropicConfigured) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export function currentModel(): string {
  return resolvedModel ?? MODEL_CANDIDATES[0] ?? "claude-haiku-4-5";
}

// Bloc de contenu multimodal minimal : texte ou image encodée en base64.
// Permet à callModel de servir aussi bien la génération de leçons (texte
// seul) que la transcription de photos de cours (image + consigne).
export type ContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; data: string };
    };

type CallOpts = {
  system: string;
  user: string | ContentBlock[];
  maxTokens: number;
  cacheSystem?: boolean;
};

export async function callModel(client: Anthropic, opts: CallOpts): Promise<string> {
  const candidates = resolvedModel ? [resolvedModel] : MODEL_CANDIDATES;
  let lastError: unknown = null;

  for (const model of candidates) {
    try {
      const res = await client.messages.create({
        model,
        max_tokens: opts.maxTokens,
        system: opts.cacheSystem
          ? [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }]
          : opts.system,
        messages: [{ role: "user", content: opts.user }],
      });
      resolvedModel = model;
      return res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      // 404 = modèle inconnu : on tente le suivant. Toute autre erreur est réelle.
      if (status !== 404 && status !== 400) throw err;
    }
  }
  throw lastError ?? new Error("Aucun modèle disponible");
}

// Les modèles renvoient parfois le JSON entouré de texte ou de balises de code.
export function extractJson<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error("Pas de JSON dans la réponse du modèle");
  const opening = candidate[start];
  const closing = opening === "[" ? "]" : "}";
  const end = candidate.lastIndexOf(closing);
  if (end === -1) throw new Error("JSON incomplet dans la réponse du modèle");
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

// Renvoie null tant que les clés ne sont pas renseignées : toute l'application
// doit fonctionner sans Supabase, en stockage local, et basculer sans changement
// de code dès que les variables d'environnement apparaissent.
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) client = createClient(url!, anon!, { auth: { persistSession: true } });
  return client;
}

// Les routes IA côté serveur exigent un compte : ce jeton part dans l'en-tête
// Authorization de chaque appel pour qu'elles puissent identifier l'élève.
export async function getAccessToken(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function authFetchHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

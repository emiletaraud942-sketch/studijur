import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const adminConfigured = Boolean(url && serviceKey);

let admin: SupabaseClient | null = null;

// Client serveur à privilèges élevés : il contourne la RLS. Il ne doit jamais
// être importé depuis un composant client.
export function getAdmin(): SupabaseClient | null {
  if (!adminConfigured) return null;
  if (!admin) admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
  return admin;
}

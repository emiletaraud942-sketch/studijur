import { getAdmin } from "./supabase-admin";

export type AuthedUser = { id: string; email: string };

export const AUTH_REQUIRED_MESSAGE =
  "Connecte-toi avec ton adresse email (gratuit, sans mot de passe) pour utiliser cette fonctionnalité — c'est ce qui permet de suivre correctement ton essai gratuit.";

// L'exigence de connexion ne s'applique que si les comptes sont réellement
// disponibles (clé de service Supabase configurée) : en local sans ces
// variables, l'app reste utilisable sans compte, comme le reste du produit.
export function authRequired(): boolean {
  return Boolean(getAdmin());
}

// Vérifie le jeton envoyé par le client (Authorization: Bearer <token>)
// directement auprès de Supabase — jamais de confiance dans un user_id
// fourni par le client lui-même.
export async function requireUser(req: Request): Promise<AuthedUser | null> {
  const sb = getAdmin();
  if (!sb) return null;
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  try {
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? "" };
  } catch {
    return null;
  }
}

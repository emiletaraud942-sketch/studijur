import { getAdmin } from "./supabase-admin";

// Seul le webhook Stripe écrit dans `subscriptions` (voir
// app/api/stripe/webhook/route.ts) : contrairement au profil synchronisé côté
// client (lib/state.tsx), qui n'est qu'un état local que l'utilisateur
// pourrait falsifier, cette lecture via le client admin fait foi côté serveur.
// La table est indexée par email, pas par user_id (même limite déjà vécue par
// app/api/portal/route.ts) : si l'email Supabase Auth diffère de celui payé
// chez Stripe, l'abonnement ne sera pas trouvé.
export async function hasActiveSubscription(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const sb = getAdmin();
  if (!sb) return false;
  try {
    const { data } = await sb.from("subscriptions").select("status").eq("email", email).maybeSingle();
    return data?.status === "active" || data?.status === "trialing";
  } catch {
    return false;
  }
}

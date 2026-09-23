// Une page peut demander une connexion depuis n'importe où (leçon, import,
// abonnement, réglages...) : ce paramètre ramène l'utilisateur exactement là
// où il était après le lien magique ou la validation du code, plutôt que de
// le renvoyer systématiquement à l'accueil.
export function connexionHref(next: string): string {
  return `/connexion?next=${encodeURIComponent(next)}`;
}

// N'accepte qu'un chemin relatif interne : un `next` lu depuis l'URL ne doit
// jamais pouvoir rediriger vers un domaine externe après connexion.
export function safeNext(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

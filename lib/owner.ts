// Le compte du créateur du site : essai illimité et aucun quota IA, sur
// n'importe quel appareil — déduit de cette seule adresse à la connexion,
// jamais d'un état stocké localement (qui ne suivrait pas d'un appareil à
// l'autre). Fichier neutre, sans dépendance serveur, pour rester
// importable aussi bien depuis le client que depuis les routes API.
const OWNER_EMAIL = "emiletaraud942@gmail.com";

export function isOwner(email: string | null | undefined): boolean {
  return Boolean(email) && email === OWNER_EMAIL;
}

import { redirect } from "next/navigation";

// Fusionné dans /programme (mode Pratique) — voir app/programme/page.tsx.
// Un lien existant vers /bibliotheque#id reste valable : le navigateur
// réapplique l'ancre d'origine après la redirection.
export default function BibliothequeRedirect() {
  redirect("/programme");
}

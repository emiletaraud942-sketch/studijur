import { redirect } from "next/navigation";

// Fusionné dans /programme (mode Lecture) — voir app/programme/page.tsx.
// app/cours/[matiereId]/page.tsx (la lecture d'une matière précise) n'est
// pas concerné, seul cet index l'est.
export default function CoursRedirect() {
  redirect("/programme");
}

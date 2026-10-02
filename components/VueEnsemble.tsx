import type { Lesson } from "@/lib/types";

// Carrousel horizontal des schémas de synthèse — déjà compact (une rangée
// qui défile), pas besoin de la mécanique "une carte à la fois" des autres
// rubriques.
export function VueEnsemble({ lessons }: { lessons: Lesson[] }) {
  const avecSchema = lessons.filter((l) => l.schema);
  if (!avecSchema.length) return null;

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {avecSchema.map((l) => (
        <div key={l.id} className="card w-[280px] shrink-0 p-4">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--h)" }}>{l.schema!.titre}</h3>
          <div className="mx-auto mt-3 max-w-[220px] [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: l.schema!.svg }} />
        </div>
      ))}
    </div>
  );
}

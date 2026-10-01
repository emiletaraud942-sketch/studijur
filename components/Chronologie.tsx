import type { Lesson } from "@/lib/types";
import { Calendar } from "./icons";

type Evenement = { annee: number; terme: string; texte: string };

// Année extraite d'un terme de la matière "dates", pour le tri uniquement
// (le terme original reste affiché tel quel). Deux pièges : un jour du mois
// ("5 mai 1789") ne doit pas être pris pour l'année — on écarte les nombres
// à moins de 3 chiffres s'il en reste un plus plausible ; et le tiret d'un
// intervalle ("527-565", "1648-1653") n'est pas un signe moins — le
// lookbehind `(?<!\d)` ne garde "-" que quand il ne suit pas un chiffre,
// comme dans "-509" ou "(-451/-449)".
function anneeDepuisTerme(terme: string): number | null {
  const matches = terme.match(/(?<!\d)-?\d+/g);
  if (!matches) return null;
  const nombres = matches.map(Number);
  const plausibles = nombres.filter((n) => Math.abs(n) >= 100);
  return plausibles.length ? plausibles[0] : nombres[0];
}

// Frise chronologique assemblée depuis les définitions déjà écrites de la
// matière "dates" (voir lib/revision-cc-config.ts, chronologieLessonIds) —
// aucun nouveau contenu, juste un tri et une mise en forme différents.
export function Chronologie({ lessons }: { lessons: Lesson[] }) {
  const evenements: Evenement[] = lessons
    .flatMap((l) => l.definitions)
    .map((d) => {
      const annee = anneeDepuisTerme(d.term);
      return annee === null ? null : { annee, terme: d.term, texte: d.text };
    })
    .filter((e): e is Evenement => e !== null)
    .sort((a, b) => a.annee - b.annee);

  if (!evenements.length) return null;

  return (
    <section data-hue="gold">
      <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
        <Calendar className="h-4 w-4" />Chronologie
      </div>
      <div className="card relative overflow-hidden p-5">
        <div className="absolute left-[29px] top-5 bottom-5 w-px" style={{ background: "var(--line)" }} />
        <ol className="space-y-5">
          {evenements.map((e, i) => (
            <li key={i} className="relative flex gap-4">
              <span className="relative z-10 mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: "var(--h)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--paper)" }} />
              </span>
              <div className="min-w-0">
                <span className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: "var(--h)" }}>{e.terme}</span>
                <p className="mt-0.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{e.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

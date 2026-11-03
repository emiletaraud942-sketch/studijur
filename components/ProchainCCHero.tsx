import Link from "next/link";
import { REVISION_CC } from "@/lib/revision-cc-config";
import { Arrow, Clock } from "./icons";

// Point d'entrée principal de /reviser pour les révisions de CC/partiels —
// un seul bloc, un lien par matière, en haut de la page plutôt que replié
// derrière "Plus d'outils" (voir ReviserOutils). Pas de date ni de compte à
// rebours (voir le commentaire sur `ccDate`, lib/revision-cc-config.ts) :
// les CC varient d'une université à l'autre, donc pas de fausse urgence
// commune à tous — juste un accès direct à la fiche et au quiz de chaque
// matière.
export default function ProchainCCHero() {
  const matieres = Object.values(REVISION_CC);

  return (
    <section className="card overflow-hidden" data-hue="gold">
      <div className="h-1.5" style={{ background: "var(--h)" }} />
      <div className="p-6">
        <h2 className="text-center text-[17px] font-bold">Réviser pour les CC et les partiels</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-center text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Fiche condensée, chronologie, fiche à trous, pièges classiques et quiz, matière par matière.
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {matieres.map((m) => (
            <Link key={m.id} href={`/revision-cc/${m.id}`}
              className="flex items-center gap-3 rounded-xl p-3.5 transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--surface-2)" }}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                <Clock className="h-[17px] w-[17px]" />
              </span>
              <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-snug">{m.label}</span>
              <span className="shrink-0" style={{ color: "var(--muted)" }}><Arrow className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

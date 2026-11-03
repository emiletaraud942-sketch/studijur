import Link from "next/link";
import { REVISION_CC } from "@/lib/revision-cc-config";
import { Arrow, Clock } from "./icons";

// Contrairement à ProchainCCBanner (dans l'app, un lien discret par matière),
// cette bannière vit sur / et /presentation pour un visiteur SANS compte —
// la toute première chose à voir, avant même le pitch, avec un raccourci
// direct vers chaque matière. Pas de date ni de compte à rebours (voir le
// commentaire sur `ccDate`, lib/revision-cc-config.ts) : les CC varient d'une
// université à l'autre, donc pas de fausse urgence commune à tous — juste la
// liste des fiches et quiz de révision par matière.
export default function CCPresentationBanner() {
  const matieres = Object.values(REVISION_CC);

  return (
    <section className="space-y-2.5">
      <h2 className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
        Réviser pour les CC et les partiels
      </h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {matieres.map((m) => (
          <Link key={m.id} href={`/revision-cc/${m.id}`} data-hue="gold"
            className="card flex items-center gap-3.5 p-4 transition-transform hover:-translate-y-0.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
              style={{ background: "var(--h-soft)", color: "var(--h)" }}>
              <Clock className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold">{m.label}</h3>
              <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>
                Fiche condensée, chronologie, quiz et pièges classiques
              </p>
            </div>
            <span className="shrink-0" style={{ color: "var(--muted)" }}><Arrow className="h-4 w-4" /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

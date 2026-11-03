import Link from "next/link";
import { REVISION_CC } from "@/lib/revision-cc-config";
import { Arrow, Clock } from "./icons";

// Sur l'accueil (compte connecté) : accès direct aux fiches de révision CC,
// matière par matière. Pas de date ni de compte à rebours (voir le
// commentaire sur `ccDate`, lib/revision-cc-config.ts) — les CC varient d'une
// université à l'autre, donc pas de fausse urgence commune à tous.
export default function ProchainCCBanner() {
  const matieres = Object.values(REVISION_CC);

  return (
    <div className="space-y-2.5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
        Réviser pour les CC et les partiels
      </h2>
      {matieres.map((m) => (
        <Link key={m.id} href={`/revision-cc/${m.id}`} data-hue="gold"
          className="rise card flex items-center gap-3.5 p-4 transition-transform hover:-translate-y-0.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
            style={{ background: "var(--h-soft)", color: "var(--h)" }}>
            <Clock className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold">Réviser pour {m.label}</h3>
            <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>
              Fiche condensée, quiz et pièges classiques
            </p>
          </div>
          <span className="shrink-0" style={{ color: "var(--muted)" }}><Arrow className="h-4 w-4" /></span>
        </Link>
      ))}
    </div>
  );
}

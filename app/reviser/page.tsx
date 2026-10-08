import ProchainCCHero from "@/components/ProchainCCHero";
import RevisionEspacee from "@/components/RevisionEspacee";
import ReviserOutils from "@/components/ReviserOutils";

// Un étudiant à J-7 ne sait pas par où commencer face à 8 entrées sans
// hiérarchie claire (retour utilisateur du 08/10/2026) — refonte du
// 09/10/2026 : un seul point d'entrée principal (ProchainCCHero, détecte
// automatiquement le CC le plus proche), la révision espacée du jour juste
// en dessous (autre action "à faire maintenant"), et tout le reste
// (choisir une autre matière, outils d'entraînement ponctuels) replié
// derrière "Plus d'outils de révision" plutôt qu'affiché avec le même poids
// visuel. Voir ReviserOutils.
export default function ReviserPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Réviser</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Ce qu&apos;il y a à faire maintenant, avant un contrôle.
        </p>
      </div>

      <ProchainCCHero />

      <RevisionEspacee />

      <ReviserOutils />
    </div>
  );
}

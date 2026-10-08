import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Conditions générales de vente — StudiJur",
};

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
      {children}
    </p>
  );
}

export default function CGVPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-10">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Conditions générales de vente</h1>
        <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--muted)" }}>
          Dernière mise à jour : octobre 2026.
        </p>
      </div>

      <section className="space-y-3">
        <SectionTitle kicker="Identification" title="Vendeur" />
        <P>
          StudiJur est édité et vendu par Émile Taraud, micro-entreprise individuelle (SIRET 106 143 134 00018) —
          coordonnées complètes dans les <Link href="/mentions-legales" className="underline">mentions légales</Link>.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Objet" title="Le service vendu" />
        <P>
          StudiJur donne accès à un entraînement quotidien de révision pour les étudiants en L1 de droit : leçons
          courtes, définitions en révision espacée, questions type examen corrigées (avec correction générée par
          IA, indicative) et quiz, construits à partir du corpus fourni par l&apos;éditeur et, le cas échéant, des
          documents déposés par l&apos;étudiant lui-même.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Prix" title="Formules et tarifs" />
        <P>Deux formules, sans engagement, résiliables à tout moment :</P>
        <ul className="ml-5 list-disc space-y-1 text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          <li>Abonnement annuel : 49 € pour l&apos;année de L1 (soit 4,08 € / mois).</li>
          <li>Abonnement mensuel : 5,90 € / mois, résiliable à tout moment.</li>
        </ul>
        <P>
          Les prix sont indiqués toutes taxes comprises ; la TVA n&apos;est pas applicable (franchise en base,
          art. 293 B du CGI). Un parrainage peut donner droit à une réduction automatique de 0,90 € appliquée au
          paiement.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Avant de payer" title="Essai gratuit" />
        <P>
          L&apos;accès est gratuit pendant au moins dix jours à compter de la création du compte, prolongés
          jusqu&apos;au prochain contrôle continu connu de l&apos;étudiant si celui-ci tombe plus tard. Aucune
          carte bancaire n&apos;est demandée pour profiter de cet essai. Un étudiant qui préfère s&apos;abonner
          immédiatement peut le faire : dans ce cas, l&apos;abonnement Stripe applique la même règle (au moins dix
          jours, prolongés jusqu&apos;au CC) avant le premier prélèvement, sauf s&apos;il choisit explicitement de
          payer tout de suite sans attendre.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Paiement" title="Modalités de paiement" />
        <P>
          Le paiement s&apos;effectue par carte bancaire, via Stripe, prestataire de paiement sécurisé. StudiJur
          ne reçoit et ne conserve aucune donnée bancaire : elles sont traitées directement par Stripe. Les deux
          formules sont des abonnements à reconduction automatique (annuelle ou mensuelle selon le choix fait à
          la souscription), jusqu&apos;à résiliation.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Arrêter" title="Résiliation" />
        <P>
          La résiliation se fait à tout moment, sans frais ni justification à donner, depuis la page Profil
          (bouton « Gérer ou résilier mon abonnement », qui ouvre le portail Stripe) ou par email à{" "}
          <a href="mailto:contact@studijur.fr" className="underline">contact@studijur.fr</a>. Elle annule le
          prochain prélèvement ; l&apos;accès complet reste ouvert jusqu&apos;à la fin de la période déjà payée,
          et la progression (leçons faites, définitions sues, série) reste enregistrée en cas de réabonnement
          ultérieur.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Rétractation" title="Droit de rétractation" />
        <P>
          Conformément au Code de la consommation, un consommateur dispose en principe d&apos;un délai de 14
          jours pour se rétracter d&apos;un achat à distance. Pour un contenu numérique fourni immédiatement
          (comme l&apos;accès à StudiJur), ce droit peut être exclu dès lors que l&apos;exécution a commencé avec
          l&apos;accord explicite du consommateur et sa renonciation expresse à son droit de rétractation.
          L&apos;essai gratuit décrit ci-dessus, qui précède tout prélèvement, a vocation à couvrir cette période
          de réflexion en pratique.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Cadre" title="Responsabilité" />
        <P>
          StudiJur est un outil de révision complémentaire : il ne se substitue pas au cours donné par
          l&apos;établissement de l&apos;étudiant, et ne saurait être tenu responsable d&apos;un résultat
          d&apos;examen. Les corrections générées par intelligence artificielle sont indicatives et peuvent
          contenir des erreurs ; chaque leçon dispose d&apos;un bouton pour signaler une erreur de contenu.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Droit applicable" title="Litiges" />
        <P>
          Les présentes conditions sont soumises au droit français. En cas de litige, et à défaut de résolution
          amiable (écrire à <a href="mailto:contact@studijur.fr" className="underline">contact@studijur.fr</a>),
          les tribunaux français compétents seront saisis. Un dispositif de médiation à la consommation reste à
          mettre en place par l&apos;éditeur — à ne pas considérer comme déjà opérationnel.
        </P>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Mentions légales & CGU — StudiJur",
};

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
      {children}
    </p>
  );
}

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-10">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Mentions légales & Conditions d&apos;utilisation</h1>
        <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--muted)" }}>
          Dernière mise à jour : octobre 2026.
        </p>
      </div>

      <section className="space-y-3">
        <SectionTitle kicker="Identification" title="Éditeur du site" />
        <P>Le site StudiJur est édité par :</P>
        <div className="card space-y-1.5 p-4 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          <p><strong>Émile Taraud</strong>, exerçant sous le nom commercial Maison Émile</p>
          <p>Forme juridique : micro-entreprise (entrepreneur individuel)</p>
          <p>SIRET : 106 143 134 00018 — R.C.S. Rouen</p>
          <p>Code APE/NAF : 6201Z — Programmation informatique</p>
          <p>TVA : non applicable, art. 293 B du CGI (franchise en base)</p>
          <p>Adresse : 3 square Georges Braque, 76770 Malaunay, France</p>
          <p>Email : contact@studijur.fr</p>
          <p>Directeur de la publication : Émile Taraud</p>
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Hébergement" title="Hébergeur et sous-traitants" />
        <P>
          Le site (l&apos;application elle-même) est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina,
          CA 91723, États-Unis (<span className="whitespace-nowrap">vercel.com</span>).
        </P>
        <P>
          Les comptes et la progression (leçons faites, définitions sues, série) sont stockés par Supabase, sur
          un serveur situé en France (région Paris). Les paiements sont traités directement par Stripe, qui ne
          transmet à StudiJur ni numéro de carte ni donnée bancaire. Le texte soumis pour une correction générée
          par IA est envoyé à Anthropic (États-Unis), le temps de produire la correction, selon sa propre
          politique de confidentialité.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Le service" title="Objet" />
        <P>
          StudiJur est un service de révision quotidienne destiné aux étudiants en droit. Il propose des leçons
          courtes, des définitions en révision espacée, des questions type examen corrigées et des quiz, construits
          à partir d&apos;un corpus fourni par l&apos;éditeur et, le cas échéant, à partir des documents que
          l&apos;étudiant dépose lui-même.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Point important" title="Mutualisation des cours déposés" />
        <P>
          Lorsqu&apos;un étudiant dépose un polycopié, un support de cours ou des notes pour en générer des leçons,
          StudiJur vérifie si un document identique ou quasi identique a déjà été traité pour un autre étudiant
          (par exemple le même polycopié officiel distribué par une faculté ou un chargé de TD). Si c&apos;est le
          cas, les leçons déjà générées à partir de ce document sont réutilisées et proposées immédiatement,
          plutôt que régénérées à l&apos;identique.
        </P>
        <P>
          Concrètement, le contenu pédagogique produit à partir d&apos;un document source (titres, définitions,
          questions et corrections générées) peut donc être mis à disposition d&apos;autres étudiants ayant déposé
          le même support. En revanche, les éléments personnels de l&apos;étudiant — sa progression, ses réponses,
          ses brouillons, son pseudonyme et ses résultats de quiz — ne sont jamais partagés et restent strictement
          individuels.
        </P>
        <P>
          L&apos;étudiant qui dépose un document reste responsable de s&apos;assurer qu&apos;il est en droit de le
          faire traiter par le service (support de cours qui lui a été distribué dans le cadre de sa scolarité,
          notes personnelles, etc.). StudiJur n&apos;utilise ces documents que pour produire une aide à la révision
          et ne les redistribue pas en dehors de ce format pédagogique.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Droits" title="Propriété intellectuelle" />
        <P>
          La marque StudiJur, la structure du site, son code et le corpus de leçons rédigé par l&apos;éditeur sont
          protégés et ne peuvent être reproduits sans autorisation. Les documents déposés par les étudiants restent
          la propriété de leurs auteurs ou établissements respectifs ; leur dépôt sur StudiJur ne vaut pas cession
          de droits, et sert uniquement à générer les leçons décrites ci-dessus.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Vie privée" title="Données personnelles" />
        <P>
          Sans compte créé, la progression (leçons faites, définitions sues, série) est conservée uniquement sur
          l&apos;appareil de l&apos;étudiant. Avec un compte, StudiJur conserve : l&apos;email (identification et
          lien avec l&apos;abonnement), la progression (leçons faites, définitions sues, série, réponses
          rédigées), et les champs optionnels renseignés dans le profil (prénom, université). Ces données sont
          conservées tant que le compte existe ; la page Profil permet de les effacer à tout moment, et
          d&apos;écrire à l&apos;adresse de contact ci-dessous supprime aussi le compte sur demande.
        </P>
        <P>
          Aucune donnée n&apos;est vendue à des tiers. Conformément au RGPD, tu disposes d&apos;un droit
          d&apos;accès, de rectification et de suppression de tes données : écris à l&apos;adresse de contact
          ci-dessous.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Abonnement" title="Essai gratuit et résiliation" />
        <P>
          L&apos;essai gratuit dure au moins dix jours, prolongé jusqu&apos;au prochain contrôle continu connu de
          l&apos;étudiant si celui-ci tombe plus tard — aucune carte bancaire n&apos;est demandée pour en
          profiter. Passé ce délai sans abonnement, l&apos;accès aux nouvelles leçons est suspendu ; la
          progression déjà faite reste conservée.
        </P>
        <P>
          Un abonnement payant se résilie à tout moment, sans frais ni justification, depuis la page Profil
          (gestion de l&apos;abonnement) ou par email à l&apos;adresse de contact. La résiliation annule le
          prochain prélèvement ; l&apos;accès reste ouvert jusqu&apos;à la fin de la période déjà payée, et la
          progression est conservée en cas de réabonnement ultérieur. Le détail complet (prix, modalités de
          paiement, droit de rétractation) figure dans les{" "}
          <Link href="/cgv" className="underline">Conditions générales de vente</Link>.
        </P>
      </section>

      <section className="space-y-3">
        <SectionTitle kicker="Contact" title="Une question ?" />
        <P>
          Pour toute question sur ces mentions, sur l&apos;usage de tes documents ou sur tes données
          personnelles, écris à <a href="mailto:contact@studijur.fr" className="underline">contact@studijur.fr</a>.
        </P>
      </section>
    </div>
  );
}

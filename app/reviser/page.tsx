import Link from "next/link";
import { Cards, Chevron, Clock, Scales, Target } from "@/components/icons";
import { REVISION_CC } from "@/lib/revision-cc-config";
import ProchainCCBanner from "@/components/ProchainCCBanner";
import { Tag } from "@/components/ui";

type Outil = { href: string; Icon: typeof Scales; title: string; text: string; nouveau?: boolean };

// Regroupe tout ce qui prépare un CC — remplace le groupe "Réviser avant un
// contrôle" de /plus. La révision flash par matière (/revision-cc), jusque-là
// seulement accessible par lien direct ou bandeau d'accueil, devient ici le
// premier élément de la page plutôt qu'une fonctionnalité invisible.
const AVANT_UN_CC: Outil[] = [
  { href: "/revision-intensive", Icon: Clock, title: "Révision intensive", text: "La fiche de dernière minute — tout le programme condensé — puis un quiz éclair toutes matières." },
  { href: "/entrainement/intro-generale", Icon: Target, title: "Entraînement CC1", text: "30 questions dans le style exact du sujet donné par ton professeur." },
  { href: "/cas-pratiques", Icon: Target, title: "Cas pratiques guidés", text: "La méthode pas à pas, avec la correction révélée seulement après ta réponse à chaque étape." },
];

const METHODE: Outil[] = [
  { href: "/entrainement-methode", Icon: Scales, title: "S'entraîner à la méthode", text: "Cas pratique, commentaire d'arrêt, dissertation — rédige en conditions réelles, puis une correction IA notée sur 20.", nouveau: true },
];

export default function ReviserPage() {
  const matieres = Object.values(REVISION_CC);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Réviser</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Tout ce qu&apos;il faut avant un contrôle, au même endroit.
        </p>
      </div>

      <ProchainCCBanner />

      <section>
        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>
          Révision flash par matière
          <Tag tone="gold">Nouveau : plan de bataille</Tag>
        </div>
        <p className="mb-3 text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Pour chaque matière : programme jour par jour jusqu&apos;au CC (plan de bataille J-14/J-7/J-3/J-1),
          chronologie interactive et fiche à trous, en plus de la fiche condensée et du quiz mélangé.
        </p>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {matieres.map((m) => (
            <Link key={m.id} href={`/revision-cc/${m.id}`} data-hue="gold"
              className="card flex items-center gap-3 p-3.5 transition-transform hover:-translate-y-0.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                <Clock className="h-[17px] w-[17px]" />
              </span>
              <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">{m.label}</span>
              <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section data-hue="gold">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>
          Avant un CC
        </div>
        <div className="space-y-2.5">
          {AVANT_UN_CC.map(({ href, Icon, title, text }) => (
            <Link key={href} href={href}
              className="card flex items-center gap-3.5 p-3.5 transition-transform hover:-translate-y-0.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                <Icon className="h-[19px] w-[19px]" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-semibold">{title}</h3>
                <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>{text}</p>
              </div>
              <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section data-hue="plum">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>
          Méthode d&apos;examen
        </div>
        <div className="space-y-2.5">
          {METHODE.map(({ href, Icon, title, text, nouveau }) => (
            <Link key={href} href={href}
              className="card flex items-center gap-3.5 p-3.5 transition-transform hover:-translate-y-0.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                <Icon className="h-[19px] w-[19px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14.5px] font-semibold">{title}</h3>
                  {nouveau && <Tag tone="gold">Nouveau</Tag>}
                </div>
                <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>{text}</p>
              </div>
              <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/progression#revisions" data-hue="green"
        className="card flex items-center gap-3.5 p-3.5 transition-transform hover:-translate-y-0.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
          <Cards className="h-[19px] w-[19px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14.5px] font-semibold">Révision espacée</h3>
          <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>
            Les définitions ratées reviennent plus souvent, celles que tu sais s&apos;espacent.
          </p>
        </div>
        <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
      </Link>
    </div>
  );
}

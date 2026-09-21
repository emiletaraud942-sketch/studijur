import type { Metadata } from "next";
import Link from "next/link";
import { CORPUS, corpusStats } from "@/lib/corpus";
import { Scales, Quill, Cards, Target, Check, Arrow, Flame } from "@/components/icons";

export const metadata: Metadata = {
  title: "StudiJur — 5 minutes de droit par jour",
  description:
    "L'entraînement quotidien des étudiants en L1 de droit : une leçon de 5 minutes, cinq définitions, une question type examen corrigée et un quiz. Sept jours d'essai gratuit.",
  openGraph: {
    title: "StudiJur — 5 minutes de droit par jour",
    description:
      "Une séance de 5 minutes par jour : le cours, cinq définitions, une question type examen corrigée, un quiz. Pour les L1 de droit.",
    type: "website",
    locale: "fr_FR",
    siteName: "StudiJur",
    url: "/presentation",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "StudiJur — 5 minutes de droit par jour" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudiJur — 5 minutes de droit par jour",
    description: "Réviser sa L1 de droit cinq minutes par jour. Sept jours gratuits.",
    images: ["/og.png"],
  },
};

const ETAPES = [
  { Icon: Quill, titre: "Le cours", texte: "Une notion, expliquée en quatre paragraphes, avec les trois points à retenir absolument." },
  { Icon: Cards, titre: "Cinq définitions", texte: "Tu récites, tu vérifies, tu te notes. Celles que tu rates reviennent demain, celles que tu sais reviennent dans un mois." },
  { Icon: Target, titre: "Une question d'examen", texte: "Tu fais ton plan au brouillon, puis tu débloques la réponse concise et le plan détaillé en I/A/B." },
  { Icon: Check, titre: "Un quiz de cinq questions", texte: "Correction immédiate, chaque réponse expliquée — y compris celles que tu as ratées." },
];

const OBJECTIONS = [
  {
    q: "Je n'ai pas le temps.",
    r: "C'est exactement le problème que StudiJur règle. Cinq minutes par jour, c'est moins qu'un trajet de bus. Sur un semestre, cela fait quinze heures de révision active — davantage que la plupart des étudiants n'en font avant les partiels.",
  },
  {
    q: "Mon cours n'est pas le même que le vôtre.",
    r: "Dépose-le. StudiJur le découpe sur les titres de ton propre professeur et en tire des leçons au même format, avec tes définitions et tes exemples.",
  },
  {
    q: "Les fiches, je sais déjà les faire.",
    r: "Faire une fiche, c'est de la lecture active une fois. StudiJur te fait te tester, espace les rappels dans le temps et note ce que tu ne sais pas encore. C'est la différence entre relire et retenir.",
  },
];

export default function PresentationPage() {
  const stats = corpusStats();

  return (
    <div className="space-y-14 pb-10">
      <section className="pt-6 text-center">
        <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <Scales className="h-9 w-9" />
        </span>
        <h1 className="serif mx-auto max-w-2xl text-[34px] font-bold leading-[1.1] tracking-tight sm:text-[46px]">
          Cinq minutes de droit par jour.<br />Tous les jours.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
          StudiJur est l&apos;entraînement quotidien des étudiants en première année de droit. Une séance courte,
          guidée, qui te fait réviser pour de vrai — pas relire en diagonale la veille du partiel.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <Link href="/"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            Commencer maintenant <Arrow className="h-4 w-4" />
          </Link>
          <span className="text-[13px]" style={{ color: "var(--muted)" }}>
            Sept jours gratuits. Aucune carte bancaire demandée.
          </span>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        {[
          { n: stats.lessons, l: "leçons prêtes" },
          { n: stats.definitions, l: "définitions" },
          { n: stats.questions, l: "questions de quiz" },
        ].map((s) => (
          <div key={s.l} className="card py-5">
            <div className="serif text-[28px] font-bold tabular sm:text-[34px]">{s.n}</div>
            <div className="mt-0.5 text-[12.5px]" style={{ color: "var(--muted)" }}>{s.l}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="serif mb-1 text-center text-[26px] font-bold">Ta séance, quatre temps</h2>
        <p className="mb-6 text-center text-[14.5px]" style={{ color: "var(--muted)" }}>
          Toujours la même structure. C&apos;est ce qui la rend tenable.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ETAPES.map(({ Icon, titre, texte }, i) => (
            <div key={titre} className="card p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <h3 className="serif text-[17px] font-bold">
                  <span className="tabular" style={{ color: "var(--muted)" }}>{i + 1}. </span>{titre}
                </h3>
              </div>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{texte}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="serif mb-1 text-center text-[26px] font-bold">Le programme de L1, déjà écrit</h2>
        <p className="mb-6 text-center text-[14.5px]" style={{ color: "var(--muted)" }}>
          Et ton propre cours si tu le déposes.
        </p>
        <div className="space-y-2.5">
          {CORPUS.map((c) => (
            <div key={c.id} data-hue={c.hue} className="card flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <h3 className="serif truncate text-[16px] font-bold">{c.title}</h3>
                <p className="mt-0.5 truncate text-[13px]" style={{ color: "var(--muted)" }}>{c.subtitle}</p>
              </div>
              <span className="shrink-0 rounded-full px-3 py-1 text-[12.5px] font-bold tabular"
                style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                {c.lessons.length} leçons
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
            style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
            <Flame className="h-6 w-6" />
          </span>
          <div>
            <h2 className="serif text-[20px] font-bold">La série, c&apos;est ce qui fait la différence</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              Un jour travaillé, un jour de plus au compteur. Ce n&apos;est pas la leçon qui te fera revenir
              demain : c&apos;est le chiffre que tu ne voudras pas remettre à zéro. Les applications de langues
              en vivent depuis quinze ans ; le droit s&apos;y prête encore mieux, parce qu&apos;il se joue
              entièrement sur la mémoire et la méthode.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="serif mb-6 text-center text-[26px] font-bold">Ce que tu es en train de te dire</h2>
        <div className="space-y-3">
          {OBJECTIONS.map((o) => (
            <div key={o.q} className="card p-5">
              <h3 className="text-[15px] font-semibold">{o.q}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{o.r}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden text-center">
        <div className="h-1" style={{ background: "var(--accent)" }} />
        <div className="p-7">
          <h2 className="serif text-[24px] font-bold">Sept jours pour voir</h2>
          <p className="mx-auto mt-2 max-w-md text-[14.5px]" style={{ color: "var(--muted)" }}>
            Gratuit, sans carte bancaire. Ensuite, 49 € pour toute l&apos;année de L1, ou 5,90 € par mois
            sans engagement.
          </p>
          <div className="mt-6">
            <Link href="/"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
              Faire ma première séance <Arrow className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

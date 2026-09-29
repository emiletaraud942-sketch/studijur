import Link from "next/link";
import { Bell, Books, Calendar, Cards, Chevron, Clock, Flame, Quill, Scales, Sitemap, Target, Trophy, Upload } from "@/components/icons";
import SuggestionForm from "@/components/SuggestionForm";

type Outil = { href: string; Icon: typeof Quill; title: string; text: string };
type Highlight = { href: string; Icon: typeof Quill; badge: string; title: string; text: string; tags: [string, string] };
type Groupe = { label: string; hue: "green" | "blue" | "gold" | "plum" | "rust"; items: Outil[]; highlight?: Highlight };

// Un outil par besoin, regroupé par objectif plutôt que par ordre d'ajout —
// c'est ce qui manquait le plus : personne ne devinait tout ce que fait
// StudiJur en ne voyant que la séance du jour.
const GROUPES: Groupe[] = [
  {
    label: "Apprendre chaque jour",
    hue: "rust",
    items: [
      { href: "/", Icon: Quill, title: "Leçon quotidienne", text: "5 minutes : le cours, les définitions, une carte mentale, une question type examen et un quiz." },
      { href: "/cours", Icon: Calendar, title: "Cours mis à jour en continu", text: "Les leçons suivent ce qui est vraiment vu en amphi, mises à jour au fil du semestre — précieux si tu as manqué un cours." },
      { href: "/bibliotheque", Icon: Sitemap, title: "Cartes mentales", text: "Toute une leçon visualisée d'un coup d'œil, pour réviser sans tout relire." },
      { href: "/cours/vocabulaire-juridique", Icon: Books, title: "Vocabulaire juridique", text: "Le lexique des mots importants — ordonnance, décret, jurisprudence... — à consulter dès qu'un mot t'échappe." },
    ],
  },
  {
    label: "Réviser avant un contrôle",
    hue: "gold",
    highlight: {
      href: "/revision-intensive",
      Icon: Clock,
      badge: "La veille d'un contrôle",
      title: "Révision intensive",
      text: "La fiche de dernière minute — tout le programme condensé en points clés et flashcards — puis un quiz éclair qui mélange les matières que tu choisis.",
      tags: ["Fiche condensée", "Quiz éclair"],
    },
    items: [
      { href: "/entrainement/intro-generale", Icon: Target, title: "Entraînement CC1", text: "30 questions dans le style exact du sujet donné par ton professeur." },
      { href: "/progression#revisions", Icon: Cards, title: "Révision espacée", text: "Les définitions ratées reviennent plus souvent, celles que tu sais s'espacent." },
      { href: "/cas-pratiques", Icon: Target, title: "Cas pratiques guidés", text: "La méthode pas à pas, avec la correction révélée seulement après ta réponse à chaque étape." },
      { href: "/entrainement-methode", Icon: Scales, title: "S'entraîner à la méthode", text: "Cas pratique, commentaire d'arrêt, dissertation — rédige en conditions réelles, puis auto-évalue-toi contre une grille de correction." },
    ],
  },
  {
    label: "Suivre ta progression",
    hue: "green",
    items: [
      { href: "/progression", Icon: Flame, title: "Série et statistiques", text: "Ta série de jours, tes leçons faites, tes quiz réussis et tes définitions mémorisées." },
      { href: "/classement", Icon: Trophy, title: "Classement de promo", text: "Anonyme : compare ta série et tes définitions sues à celles de ta fac." },
    ],
  },
];

export default function PlusPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Tous les outils</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Un outil pour chaque besoin. Reviens ici dès que tu cherches quelque chose.
        </p>
      </div>

      {GROUPES.map((g) => (
        <section key={g.label} data-hue={g.hue}>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--h)" }}>
            {g.label}
          </div>
          {g.highlight && (
            <Link href={g.highlight.href}
              className="mb-2.5 flex items-start gap-3.5 rounded-2xl p-4.5 transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--ink)" }}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gold)", color: "var(--accent-ink)" }}>
                <g.highlight.Icon className="h-[19px] w-[19px]" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{ background: "color-mix(in srgb, var(--paper) 18%, transparent)", color: "var(--paper)" }}>
                  {g.highlight.badge}
                </span>
                <h3 className="mt-2 text-[14.5px] font-semibold" style={{ color: "var(--paper)" }}>{g.highlight.title}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--paper) 78%, transparent)" }}>
                  {g.highlight.text}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {g.highlight.tags.map((t) => (
                    <div key={t} className="rounded-lg py-2 text-center text-[11px] font-bold"
                      style={{ background: "color-mix(in srgb, var(--paper) 12%, transparent)", color: "var(--paper)" }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          )}
          <div className="space-y-2.5">
            {g.items.map(({ href, Icon, title, text }) => (
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
      ))}

      <section>
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>
          Génère depuis tes propres cours
        </div>
        <Link href="/mes-cours"
          className="flex items-start gap-3.5 rounded-2xl p-4.5 transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--ink)" }}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            <Upload className="h-[19px] w-[19px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-semibold" style={{ color: "var(--paper)" }}>Dépose un cours, obtiens tout le reste</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--paper) 78%, transparent)" }}>
              PDF ou photo de ton polycopié : StudiJur en tire automatiquement un quiz, des flashcards à révision
              espacée et une carte mentale — la génération que d&apos;autres sites font payer cher, incluse ici.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["Quiz", "Flashcards", "Carte mentale"].map((t) => (
                <div key={t} className="rounded-lg py-2 text-center text-[11px] font-bold"
                  style={{ background: "color-mix(in srgb, var(--paper) 12%, transparent)", color: "var(--paper)" }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </Link>

        <Link href="/reglages" data-hue="plum"
          className="card mt-2.5 flex items-center gap-3.5 p-3.5 transition-transform hover:-translate-y-0.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
            <Bell className="h-[19px] w-[19px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-semibold">Rappel quotidien</h3>
            <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>
              Une notification à l&apos;heure de ton choix pour ne pas rater ta série.
            </p>
          </div>
          <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
        </Link>
      </section>

      <div id="suggestions" data-hue="plum" className="scroll-mt-20">
        <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
            <Quill className="h-3.5 w-3.5" />
          </span>
          Suggestions &amp; retours — dis-moi ce qui te manque, je lis tout.
        </div>
        <SuggestionForm />
      </div>

      <p className="text-center text-[12.5px]" style={{ color: "var(--muted)" }}>
        Encore une mention légale au menu : voir <Link href="/mentions-legales" className="underline">mentions légales</Link>.
      </p>
    </div>
  );
}

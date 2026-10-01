import Link from "next/link";
import { Books, Chevron, Gear, Quill, Upload } from "@/components/icons";
import SuggestionForm from "@/components/SuggestionForm";

// Catch-all pour ce qui ne tient pas dans les 4 autres onglets : dépôt de
// cours, réglages (profil, matières suivies, notifications, abonnement,
// thème — plus accessible directement depuis la barre du bas), un raccourci
// vers le vocabulaire, et les suggestions. Tout ce qui concerne la révision
// avant un CC a déménagé vers /reviser, et les matières vers /programme.
export default function PlusPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Plus</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Dépôt de cours, réglages et vocabulaire.
        </p>
      </div>

      <section>
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
            <Gear className="h-[19px] w-[19px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-semibold">Réglages</h3>
            <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>
              Profil, matières suivies, notifications, abonnement et thème.
            </p>
          </div>
          <span className="shrink-0" style={{ color: "var(--muted)" }}><Chevron className="h-4 w-4" /></span>
        </Link>

        <Link href="/cours/vocabulaire-juridique" data-hue="blue"
          className="card mt-2.5 flex items-center gap-3.5 p-3.5 transition-transform hover:-translate-y-0.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
            <Books className="h-[19px] w-[19px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-semibold">Vocabulaire juridique</h3>
            <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>
              Le lexique des mots importants — ordonnance, décret, jurisprudence...
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

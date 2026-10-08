import Link from "next/link";
import { Chevron, Gear, Quill } from "@/components/icons";
import SuggestionForm from "@/components/SuggestionForm";

// Ce qui ne tient pas dans les 5 autres onglets : profil (matières suivies,
// notifications, abonnement, thème, déconnexion) et suggestions. Le dépôt de
// cours a quitté cette page le 09/10/2026 pour son propre onglet ("Mes
// cours", voir components/Shell) — différenciateur n°1 du site, il ne doit
// plus dépendre d'un détour par "Plus" pour être découvert. Tout ce qui
// concerne la révision avant un CC a déménagé vers /reviser, les matières
// vers /programme (dont le vocabulaire juridique, qui n'a donc pas besoin de
// son propre raccourci ici).
export default function PlusPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Plus</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Profil et suggestions.
        </p>
      </div>

      <section>
        <Link href="/reglages" data-hue="plum"
          className="card flex items-center gap-3.5 p-3.5 transition-transform hover:-translate-y-0.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
            <Gear className="h-[19px] w-[19px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14.5px] font-semibold">Profil</h3>
            <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>
              Matières suivies, notifications, abonnement, thème — et te déconnecter.
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
        <Link href="/presentation" className="underline">Revoir la présentation de StudiJur</Link> ·{" "}
        <Link href="/mentions-legales" className="underline">Mentions légales</Link> ·{" "}
        <Link href="/cgv" className="underline">CGV</Link>
      </p>
    </div>
  );
}

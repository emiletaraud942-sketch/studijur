import { Check } from "./icons";
import { ETAPES, joursAvant } from "@/lib/revision-cc-config";

export function PlanDeBataille({ ccDate }: { ccDate: string | null }) {
  if (!ccDate) return null;
  const jours = joursAvant(ccDate);
  if (jours < 0) return null;

  const activeIndex = ETAPES.findIndex((e) => jours >= e.seuil);

  return (
    <section>
      <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
        Plan de bataille
      </div>
      <div className="card divide-y p-1" style={{ borderColor: "var(--line)" }}>
        {ETAPES.map((e, i) => {
          const fait = i < activeIndex;
          const active = i === activeIndex;
          return (
            <div key={e.titre} className="flex gap-3 p-3.5" style={{ opacity: fait ? 0.55 : 1 }}>
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"
                style={{
                  background: fait ? "var(--good-soft)" : active ? "var(--accent)" : "var(--surface-2)",
                  color: fait ? "var(--good)" : active ? "var(--accent-ink)" : "var(--muted)",
                }}>
                {fait ? <Check className="h-3.5 w-3.5" /> : <span className="text-[11px] font-bold">{i + 1}</span>}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold" style={{ color: active ? "var(--accent-strong, var(--accent))" : "var(--ink)" }}>
                  {e.titre}{active && " — maintenant"}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--muted)" }}>{e.texte}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

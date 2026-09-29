"use client";

import { useEffect, useMemo, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { getSupabase } from "@/lib/supabase";
import { logReponse } from "@/lib/reponses";
import { allCourses } from "@/lib/corpus";
import { notionLabel } from "@/lib/notions";
import { Button, Tag } from "@/components/ui";
import { Arrow, Check } from "@/components/icons";
import type { TypeExerciceMethodo } from "@/lib/types";

const TYPE_LABEL: Record<TypeExerciceMethodo, string> = {
  cas_pratique: "Cas pratique",
  commentaire_arret: "Commentaire d'arrêt",
  dissertation: "Dissertation",
};

// Forme brute renvoyée par Supabase (colonnes snake_case) pour un exercice
// publié — pas besoin d'un mapping complet vers ExerciceMethodo ici, cette
// page ne fait que lire.
type ExercicePublic = {
  id: string;
  type: TypeExerciceMethodo;
  notion_id: string;
  enonce: string;
  grille_correction: string[];
  corrige_type: string;
};

export default function EntrainementMethodePage() {
  const { state, gradeExerciceMethodo, bumpActiviteDuJour } = useStudiJur();
  const [exercices, setExercices] = useState<ExercicePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [notionFiltre, setNotionFiltre] = useState("");
  const [ouvertId, setOuvertId] = useState<string | null>(null);
  const [redaction, setRedaction] = useState("");
  const [grilleVisible, setGrilleVisible] = useState(false);
  const [coches, setCoches] = useState<Set<number>>(new Set());
  const [resultat, setResultat] = useState<"reussi" | "a-retravailler" | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    (async () => {
      const { data } = await sb
        .from("exercices_methodo")
        .select("id, type, notion_id, enonce, grille_correction, corrige_type")
        .order("created_at", { ascending: false });
      setExercices((data as ExercicePublic[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const notions = useMemo(
    () => allCourses(state.customCourses).flatMap((c) => c.lessons.map((l) => l.id)).filter((id) =>
      exercices.some((e) => e.notion_id === id),
    ),
    [state.customCourses, exercices],
  );

  const filtres = notionFiltre ? exercices.filter((e) => e.notion_id === notionFiltre) : exercices;
  const ouvert = exercices.find((e) => e.id === ouvertId);

  function ouvrir(id: string) {
    setOuvertId(id);
    setRedaction("");
    setGrilleVisible(false);
    setCoches(new Set());
    setResultat(null);
  }

  function toggleCritere(i: number) {
    setCoches((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  function valider() {
    if (!ouvert) return;
    const reussi = coches.size > ouvert.grille_correction.length / 2;
    setResultat(reussi ? "reussi" : "a-retravailler");
    gradeExerciceMethodo(ouvert.id, ouvert.notion_id, reussi);
    bumpActiviteDuJour(1);
    void logReponse({
      notionId: ouvert.notion_id,
      questionId: `methodo:${ouvert.id}`,
      source: "methodo",
      correcte: reussi,
    });
  }

  if (loading) {
    return <p className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</p>;
  }

  if (ouvert) {
    return (
      <div className="space-y-4">
        <button onClick={() => setOuvertId(null)} className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
          ← Retour à la liste
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="hue">{TYPE_LABEL[ouvert.type]}</Tag>
          <Tag>{notionLabel(ouvert.notion_id, state.customCourses)}</Tag>
        </div>

        <section className="card p-5">
          <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--h)" }}>Énoncé</h2>
          <p className="text-[15px] leading-relaxed">{ouvert.enonce}</p>
        </section>

        <section className="card p-5">
          <label htmlFor="redaction" className="mb-2 block text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
            Ta rédaction — en conditions réelles, sans regarder la grille avant d&apos;avoir fini
          </label>
          <textarea id="redaction" rows={10} value={redaction} onChange={(e) => setRedaction(e.target.value)}
            className="w-full resize-y rounded-xl border p-3 text-[14.5px] leading-relaxed outline-none"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)" }} />
        </section>

        {!grilleVisible ? (
          <Button onClick={() => setGrilleVisible(true)} size="lg" full>
            Voir la grille de correction <Arrow className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <section className="card p-5">
              <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--h)" }}>
                Grille de correction — coche ce que ta rédaction a réellement atteint
              </h2>
              <ul className="space-y-2.5">
                {ouvert.grille_correction.map((critere, i) => (
                  <li key={i}>
                    <label className="flex items-start gap-2.5 text-[14px] leading-snug">
                      <input type="checkbox" checked={coches.has(i)} onChange={() => toggleCritere(i)}
                        className="mt-0.5 h-4 w-4 shrink-0" />
                      {critere}
                    </label>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card p-5" style={{ background: "var(--h-soft)", borderColor: "transparent" }}>
              <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--h)" }}>Corrigé type</h2>
              <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink)" }}>{ouvert.corrige_type}</p>
            </section>

            {resultat === null ? (
              <Button onClick={valider} size="lg" full>Valider mon auto-évaluation</Button>
            ) : (
              <div className="card p-5 text-center" style={{
                background: resultat === "reussi" ? "var(--good-soft)" : "var(--bad-soft)",
              }}>
                <p className="flex items-center justify-center gap-2 text-[15px] font-semibold"
                  style={{ color: resultat === "reussi" ? "var(--good)" : "var(--bad)" }}>
                  {resultat === "reussi" ? <Check className="h-4 w-4" /> : null}
                  {resultat === "reussi" ? "En bonne voie sur cette notion" : "À retravailler"}
                </p>
                <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
                  {coches.size} / {ouvert.grille_correction.length} critères cochés
                </p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="serif text-[26px] font-bold">S&apos;entraîner à la méthode</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Cas pratique, commentaire d&apos;arrêt, dissertation : rédige en conditions réelles, puis auto-évalue-toi
          contre une grille de correction et un corrigé type. Pas de note automatique — c&apos;est à toi de juger.
        </p>
      </div>

      {notions.length > 0 && (
        <select value={notionFiltre} onChange={(e) => setNotionFiltre(e.target.value)}
          className="w-full rounded-lg border p-2.5 text-[13.5px]" style={{ borderColor: "var(--line)" }}>
          <option value="">Toutes les notions</option>
          {notions.map((id) => <option key={id} value={id}>{notionLabel(id, state.customCourses)}</option>)}
        </select>
      )}

      {filtres.length === 0 ? (
        <p className="text-[14px]" style={{ color: "var(--muted)" }}>
          Aucun exercice disponible pour l&apos;instant — reviens bientôt.
        </p>
      ) : (
        <div className="space-y-3">
          {filtres.map((e) => {
            const fait = state.exercicesMethodo[e.id];
            return (
              <button key={e.id} onClick={() => ouvrir(e.id)}
                className="card flex w-full items-start gap-3 p-4 text-left transition-transform hover:-translate-y-0.5">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Tag tone="hue">{TYPE_LABEL[e.type]}</Tag>
                    <Tag>{notionLabel(e.notion_id, state.customCourses)}</Tag>
                    {fait && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.07em]"
                        style={{
                          background: fait.reussi ? "var(--good-soft)" : "var(--bad-soft)",
                          color: fait.reussi ? "var(--good)" : "var(--bad)",
                        }}>
                        {fait.reussi ? "Réussi" : "À retravailler"}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-[14px] leading-snug" style={{ color: "var(--ink-2)" }}>{e.enonce}</p>
                </div>
                <span className="mt-1 shrink-0" style={{ color: "var(--muted)" }}><Arrow className="h-4 w-4" /></span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

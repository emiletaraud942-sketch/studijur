"use client";

import { useEffect, useMemo, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { isOwner } from "@/lib/owner";
import { authFetchHeaders } from "@/lib/supabase";
import { allCourses } from "@/lib/corpus";
import { notionLabel } from "@/lib/notions";
import { Button } from "@/components/ui";
import type { ExerciceMethodo, StatutExerciceMethodo, TypeExerciceMethodo } from "@/lib/types";

const TYPES: { value: TypeExerciceMethodo; label: string }[] = [
  { value: "cas_pratique", label: "Cas pratique" },
  { value: "commentaire_arret", label: "Commentaire d'arrêt" },
  { value: "dissertation", label: "Dissertation" },
];

const STATUT_LABEL: Record<StatutExerciceMethodo, string> = {
  draft: "Brouillon",
  published: "Publié",
  rejected: "Rejeté",
};

// Ligne brute renvoyée par l'API (colonnes snake_case, telles qu'en base) —
// distincte du type client ExerciceMethodo (camelCase) utilisé partout
// ailleurs, pour ne pas avoir à faire semblant que l'API renvoie déjà la
// forme normalisée.
type Row = {
  id: string;
  type: TypeExerciceMethodo;
  notion_id: string;
  enonce: string;
  grille_correction: string[];
  corrige_type: string;
  statut: StatutExerciceMethodo;
  created_at: string;
};

export default function AdminMethodoPage() {
  const { signedInAs } = useStudiJur();
  const [notionId, setNotionId] = useState("");
  const [type, setType] = useState<TypeExerciceMethodo>("cas_pratique");
  const [generating, setGenerating] = useState(false);
  const [erreur, setErreur] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, { enonce: string; grille: string; corrige: string }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const notions = useMemo(
    () => allCourses().flatMap((c) => c.lessons.map((l) => ({ id: l.id, label: `${c.short} — ${l.title}` }))),
    [],
  );

  async function charger() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/methodo", { headers: await authFetchHeaders() });
      const data = await res.json();
      if (res.ok) {
        setRows(data.exercices ?? []);
        setEdits(
          Object.fromEntries(
            (data.exercices as Row[]).map((r) => [
              r.id,
              { enonce: r.enonce, grille: r.grille_correction.join("\n"), corrige: r.corrige_type },
            ]),
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (signedInAs && isOwner(signedInAs)) charger(); }, [signedInAs]);

  if (!signedInAs || !isOwner(signedInAs)) {
    return <p className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Accès réservé.</p>;
  }

  async function generer() {
    if (!notionId) { setErreur("Choisis une notion."); return; }
    setGenerating(true);
    setErreur("");
    try {
      const res = await fetch("/api/admin/methodo", {
        method: "POST",
        headers: { "content-type": "application/json", ...(await authFetchHeaders()) },
        body: JSON.stringify({ action: "generate", notionId, type }),
      });
      const data = await res.json();
      if (!res.ok) { setErreur(data.error ?? "La génération a échoué."); return; }
      await charger();
    } finally {
      setGenerating(false);
    }
  }

  async function agir(id: string, action: "publish" | "reject" | "update") {
    setBusyId(id);
    try {
      const edit = edits[id];
      const body: Record<string, unknown> = { action, id };
      if (action === "update" && edit) {
        body.enonce = edit.enonce;
        body.grilleCorrection = edit.grille.split("\n").map((l) => l.trim()).filter(Boolean);
        body.corrigeType = edit.corrige;
      }
      const res = await fetch("/api/admin/methodo", {
        method: "POST",
        headers: { "content-type": "application/json", ...(await authFetchHeaders()) },
        body: JSON.stringify(body),
      });
      if (res.ok) await charger();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="serif text-[26px] font-bold">Admin — Exercices de méthode</h1>
        <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted)" }}>
          Génère un brouillon, relis-le, corrige si besoin, puis publie ou rejette. Rien n&apos;est jamais publié
          automatiquement.
        </p>
      </div>

      <section className="card space-y-3 p-4">
        <h2 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
          Générer un nouveau brouillon
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select value={notionId} onChange={(e) => setNotionId(e.target.value)}
            className="flex-1 rounded-lg border p-2 text-[13.5px]" style={{ borderColor: "var(--line)" }}>
            <option value="">— Choisir une notion —</option>
            {notions.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value as TypeExerciceMethodo)}
            className="rounded-lg border p-2 text-[13.5px]" style={{ borderColor: "var(--line)" }}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <Button onClick={generer} disabled={generating}>{generating ? "Génération…" : "Générer"}</Button>
        </div>
        {erreur && <p className="text-[13px]" style={{ color: "var(--bad)" }}>{erreur}</p>}
      </section>

      {loading ? (
        <p className="text-[13.5px]" style={{ color: "var(--muted)" }}>Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-[13.5px]" style={{ color: "var(--muted)" }}>Aucun exercice pour l&apos;instant.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const edit = edits[r.id] ?? { enonce: r.enonce, grille: r.grille_correction.join("\n"), corrige: r.corrige_type };
            return (
              <section key={r.id} className="card space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="rounded-full px-2.5 py-1 font-bold" style={{ background: "var(--h-soft)", color: "var(--h)" }}>
                    {TYPES.find((t) => t.value === r.type)?.label ?? r.type}
                  </span>
                  <span className="rounded-full px-2.5 py-1 font-semibold"
                    style={{
                      background: r.statut === "published" ? "var(--good-soft)" : r.statut === "rejected" ? "var(--bad-soft)" : "var(--gold-soft)",
                      color: r.statut === "published" ? "var(--good)" : r.statut === "rejected" ? "var(--bad)" : "var(--gold)",
                    }}>
                    {STATUT_LABEL[r.statut]}
                  </span>
                  <span style={{ color: "var(--muted)" }}>{notionLabel(r.notion_id)}</span>
                </div>

                <label className="block text-[12px] font-semibold" style={{ color: "var(--muted)" }}>Énoncé</label>
                <textarea rows={3} value={edit.enonce}
                  onChange={(e) => setEdits((prev) => ({ ...prev, [r.id]: { ...edit, enonce: e.target.value } }))}
                  className="w-full rounded-lg border p-2 text-[13.5px]" style={{ borderColor: "var(--line)" }} />

                <label className="block text-[12px] font-semibold" style={{ color: "var(--muted)" }}>
                  Grille de correction (un critère par ligne)
                </label>
                <textarea rows={4} value={edit.grille}
                  onChange={(e) => setEdits((prev) => ({ ...prev, [r.id]: { ...edit, grille: e.target.value } }))}
                  className="w-full rounded-lg border p-2 text-[13.5px]" style={{ borderColor: "var(--line)" }} />

                <label className="block text-[12px] font-semibold" style={{ color: "var(--muted)" }}>Corrigé type</label>
                <textarea rows={4} value={edit.corrige}
                  onChange={(e) => setEdits((prev) => ({ ...prev, [r.id]: { ...edit, corrige: e.target.value } }))}
                  className="w-full rounded-lg border p-2 text-[13.5px]" style={{ borderColor: "var(--line)" }} />

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => agir(r.id, "update")} disabled={busyId === r.id} variant="outline" size="sm">
                    Enregistrer
                  </Button>
                  {r.statut !== "published" && (
                    <Button onClick={() => agir(r.id, "publish")} disabled={busyId === r.id} size="sm">Publier</Button>
                  )}
                  {r.statut !== "rejected" && (
                    <Button onClick={() => agir(r.id, "reject")} disabled={busyId === r.id} variant="outline" size="sm">
                      Rejeter
                    </Button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

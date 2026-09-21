"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { hasAccess, supabaseConfigured, useStudiJur } from "@/lib/state";
import { TRIAL_IMPORT_LIMIT } from "@/lib/limits";
import { prepareImage } from "@/lib/image-prep";
import { authFetchHeaders } from "@/lib/supabase";
import { Button, SectionTitle, Tag } from "@/components/ui";
import { Camera, Check, Cross, Upload } from "@/components/icons";
import type { Course } from "@/lib/types";

type Phase = "idle" | "reading" | "generating" | "done" | "error";
type Photo = { id: string; mediaType: "image/jpeg"; base64: string };

const MAX_PHOTOS = 3;

export default function MyCoursesPage() {
  const { state, ready, addCustomCourse, removeCustomCourse, signedInAs } = useStudiJur();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Course | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const importes = state.customCourses.length;
  const abonne = state.profile.plan === "active";
  const acces = hasAccess(state);
  // Bloqué soit parce que l'essai est fini (plus d'accès du tout), soit parce
  // que le plafond d'imports de l'essai est atteint alors que l'essai court
  // encore — sans ce premier cas, un essai expiré avec un import inutilisé
  // pouvait continuer à appeler l'IA (ingest/ocr) indéfiniment.
  const plafondAtteint = !acces || (!abonne && importes >= TRIAL_IMPORT_LIMIT);
  // L'OCR et la génération de leçons consomment de l'IA : sans compte, un
  // élève pouvait réinitialiser son essai en vidant simplement son cache.
  const connexionRequise = supabaseConfigured && !signedInAs;
  const bloque = connexionRequise || plafondAtteint;

  async function readFile(file: File) {
    setPhase("reading");
    setMessage(`Lecture de ${file.name}…`);
    try {
      const name = file.name.toLowerCase();
      let extracted = "";

      if (name.endsWith(".pdf")) {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((it) => ("str" in it ? it.str : "")).join(" "));
          setMessage(`Lecture de la page ${i} sur ${doc.numPages}…`);
        }
        extracted = pages.join("\n\n");
      } else if (name.endsWith(".docx")) {
        const mammoth = await import("mammoth/mammoth.browser");
        const res = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        extracted = res.value;
      } else {
        extracted = await file.text();
      }

      if (extracted.trim().length < 500) {
        setPhase("error");
        setMessage("Ce fichier ne contient pas assez de texte lisible. S'il s'agit d'un PDF scanné, copie-colle plutôt le texte.");
        return;
      }
      setText(extracted);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
      setPhase("idle");
      setMessage(`${Math.round(extracted.length / 1000)} 000 caractères extraits de ${file.name}.`);
    } catch {
      setPhase("error");
      setMessage("Impossible de lire ce fichier. Copie-colle le texte de ton cours dans le champ ci-dessous.");
    }
  }

  async function addPhotos(fileList: FileList) {
    const files = Array.from(fileList).slice(0, Math.max(0, MAX_PHOTOS - photos.length));
    if (!files.length) return;
    setPhase("reading");
    setMessage("Préparation des photos…");
    try {
      const prepared = await Promise.all(
        files.map(async (f) => {
          const { mediaType, base64 } = await prepareImage(f);
          return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, mediaType, base64 };
        }),
      );
      setPhotos((prev) => [...prev, ...prepared].slice(0, MAX_PHOTOS));
      setPhase("idle");
      setMessage(
        `${prepared.length} photo${prepared.length > 1 ? "s" : ""} ajoutée${prepared.length > 1 ? "s" : ""}. Lance la transcription quand tu es prêt${prepared.length > 1 ? "es" : ""}.`,
      );
    } catch {
      setPhase("error");
      setMessage("Impossible de lire une des photos. Réessaie avec une autre image.");
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  async function transcribePhotos() {
    if (!photos.length) return;
    setPhase("reading");
    setMessage(`Lecture de ${photos.length} photo${photos.length > 1 ? "s" : ""}… cela peut prendre une minute.`);
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "content-type": "application/json", ...(await authFetchHeaders()) },
        body: JSON.stringify({ images: photos.map((p) => ({ data: p.base64, mediaType: p.mediaType })) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase("error");
        setMessage(data.error ?? "La lecture des photos a échoué.");
        return;
      }
      setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${data.text}` : data.text));
      setPhase("idle");
      setMessage(
        `${data.pages} page${data.pages > 1 ? "s" : ""} transcrite${data.pages > 1 ? "s" : ""}${data.skipped ? ` (${data.skipped} illisible${data.skipped > 1 ? "s" : ""})` : ""}. Relis le texte ci-dessous avant de générer les leçons.`,
      );
      setPhotos([]);
    } catch {
      setPhase("error");
      setMessage("Le serveur n'a pas répondu. Réessaie dans un instant.");
    }
  }

  async function generate() {
    setPhase("generating");
    setMessage("Découpage du cours et rédaction des leçons… cela peut prendre une à deux minutes.");
    setResult(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "content-type": "application/json", ...(await authFetchHeaders()) },
        body: JSON.stringify({ title: title.trim() || "Cours importé", text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase("error");
        setMessage(data.error ?? "La génération a échoué.");
        return;
      }
      addCustomCourse(data.course);
      setResult(data.course);
      setPhase("done");
      setMessage(
        data.reused
          ? `${data.course.lessons.length} leçons récupérées instantanément : un autre étudiant avait déjà déposé ce document.`
          : data.engine === "claude"
            ? `${data.course.lessons.length} leçons générées${data.skipped ? ` (${data.skipped} partie(s) ignorée(s))` : ""}.`
            : data.warning ?? "Leçons générées par l'analyseur local.",
      );
      setText("");
      setTitle("");
    } catch {
      setPhase("error");
      setMessage("Le serveur n'a pas répondu. Réessaie dans un instant.");
    }
  }

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  const busy = phase === "reading" || phase === "generating";

  return (
    <div className="space-y-7">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Mes cours</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Dépose ton polycopié, tes notes, ou prends-les en photo : StudiJur en tire des leçons de 5 minutes au même format que le corpus.
        </p>
      </div>

      <section className="card p-5">
        <SectionTitle kicker="Nouveau cours" title="Importer" />

        <input ref={fileRef} type="file" accept=".txt,.md,.pdf,.docx" className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }} />
        <input ref={photoRef} type="file" accept="image/*" multiple className="sr-only"
          onChange={(e) => { if (e.target.files?.length) addPhotos(e.target.files); e.target.value = ""; }} />

        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => fileRef.current?.click()} disabled={busy || bloque}
            className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-7 text-center transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}>
            <Upload className="h-6 w-6" />
            <span className="text-[14.5px] font-semibold" style={{ color: "var(--ink)" }}>Choisir un fichier</span>
            <span className="text-[12.5px]">PDF, Word (.docx), texte ou Markdown</span>
          </button>
          <button onClick={() => photoRef.current?.click()} disabled={busy || bloque || photos.length >= MAX_PHOTOS}
            className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-7 text-center transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}>
            <Camera className="h-6 w-6" />
            <span className="text-[14.5px] font-semibold" style={{ color: "var(--ink)" }}>Prendre en photo</span>
            <span className="text-[12.5px]">Ton cours ou ton poly, jusqu&apos;à {MAX_PHOTOS} pages</span>
          </button>
        </div>

        {photos.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={p.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`data:${p.mediaType};base64,${p.base64}`} alt={`Page ${i + 1}`}
                    className="h-16 w-16 rounded-lg object-cover" style={{ border: "1.5px solid var(--card-border)" }} />
                  <button onClick={() => removePhoto(p.id)} aria-label={`Retirer la photo ${i + 1}`} disabled={busy}
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full"
                    style={{ background: "var(--bad)", color: "#fff" }}>
                    <Cross className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={transcribePhotos} disabled={busy || bloque} variant="soft" size="sm" full>
              {phase === "reading" ? "Lecture en cours…" : `Transcrire ${photos.length > 1 ? `ces ${photos.length} photos` : "cette photo"}`}
            </Button>
          </div>
        )}

        <div className="my-4 flex items-center gap-3 text-[12px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          <span className="h-px flex-1" style={{ background: "var(--line)" }} /> ou colle ton cours
          <span className="h-px flex-1" style={{ background: "var(--line)" }} />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold" style={{ color: "var(--muted)" }}>Nom de la matière</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Droit civil — les personnes"
            className="mb-4 w-full rounded-xl border px-3.5 py-2.5 text-[14.5px] outline-none"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />
        </label>

        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} disabled={busy || bloque}
          placeholder="Colle ici le texte de ton cours, de ton poly ou de tes notes de CM…"
          className="w-full resize-y rounded-xl border p-3.5 text-[14px] leading-relaxed outline-none"
          style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />

        <div className="mt-2 flex items-center justify-between text-[12.5px]" style={{ color: "var(--muted)" }}>
          <span className="tabular">{text.length.toLocaleString("fr-FR")} caractères</span>
          <span>{text.length >= 500 ? "Prêt" : "500 caractères minimum"}</span>
        </div>

        {message && (
          <div className="mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-[13.5px] leading-relaxed"
            style={{
              background: phase === "error" ? "var(--bad-soft)" : phase === "done" ? "var(--good-soft)" : "var(--surface-2)",
              color: phase === "error" ? "var(--bad)" : phase === "done" ? "var(--good)" : "var(--muted)",
            }}>
            {phase === "error" && <Cross className="mt-0.5 h-4 w-4 shrink-0" />}
            {phase === "done" && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        <div className="mt-4">
          {connexionRequise ? (
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--gold-soft)" }}>
              <p className="text-[14px] font-semibold" style={{ color: "var(--gold)" }}>
                Connecte-toi pour importer un cours
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                L&apos;OCR et la génération de leçons utilisent l&apos;IA : un compte gratuit (email, sans mot de
                passe) est nécessaire pour suivre correctement ton essai.
              </p>
              <div className="mt-3"><Button href="/connexion" size="sm">Se connecter</Button></div>
            </div>
          ) : plafondAtteint ? (
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--gold-soft)" }}>
              <p className="text-[14px] font-semibold" style={{ color: "var(--gold)" }}>
                {acces ? "Limite de l'essai gratuit atteinte" : "Ton essai gratuit est terminé"}
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                {acces
                  ? `Pendant l'essai, tu peux importer ${TRIAL_IMPORT_LIMIT} cours. Abonne-toi pour en déposer autant que tu veux — tes ${importes} cours déjà importés restent accessibles.`
                  : `Abonne-toi pour déposer de nouveaux cours et continuer à en générer — tes ${importes} cours déjà importés restent accessibles.`}
              </p>
              <div className="mt-3"><Button href="/abonnement" size="sm">Voir les formules</Button></div>
            </div>
          ) : (
            <Button onClick={generate} disabled={busy || text.trim().length < 500} size="lg" full>
              {phase === "generating" ? "Génération en cours…" : "Générer mes leçons"}
            </Button>
          )}
          {!abonne && !bloque && (
            <p className="mt-2 text-center text-[12.5px]" style={{ color: "var(--muted)" }}>
              Essai gratuit : {TRIAL_IMPORT_LIMIT - importes} import{TRIAL_IMPORT_LIMIT - importes > 1 ? "s" : ""} restant{TRIAL_IMPORT_LIMIT - importes > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </section>

      {result && (
        <section className="card rise p-5" data-hue="rust">
          <SectionTitle kicker="Prêt" title={result.title} />
          <ul className="space-y-1.5">
            {result.lessons.map((l) => (
              <li key={l.id}>
                <Link href={`/lecon/${l.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px]"
                  style={{ background: "var(--surface-2)" }}>
                  <span className="text-[12px] font-bold tabular" style={{ color: "var(--h)" }}>{l.order}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{l.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.customCourses.length > 0 && (
        <section>
          <SectionTitle kicker="Bibliothèque perso" title={`${state.customCourses.length} cours importé${state.customCourses.length > 1 ? "s" : ""}`} />
          <div className="space-y-3">
            {state.customCourses.map((c) => (
              <div key={c.id} data-hue={c.hue} className="card flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="mb-1"><Tag tone="hue">{c.lessons.length} leçons</Tag></div>
                  <h3 className="truncate text-[15px] font-semibold">{c.title}</h3>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button href={`/bibliotheque#${c.id}`} variant="soft" size="sm">Ouvrir</Button>
                  <button onClick={() => removeCustomCourse(c.id)} aria-label={`Supprimer ${c.title}`}
                    className="grid h-8 w-8 place-items-center rounded-lg"
                    style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
                    <Cross className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

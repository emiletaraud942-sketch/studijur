"use client";

import { useEffect, useState } from "react";
import { useStudiJur, supabaseConfigured } from "@/lib/state";
import { fetchLeaderboard, syncLeaderboardEntry } from "@/lib/leaderboard";
import { Button, SectionTitle, Tag } from "@/components/ui";
import { Check, Flame } from "@/components/icons";
import type { LeaderboardRow } from "@/lib/types";

export default function ClassementPage() {
  const { state, ready, update, signedInAs } = useStudiJur();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [pseudoDraft, setPseudoDraft] = useState(state.profile.pseudonym ?? "");
  const [scope, setScope] = useState<"promo" | "tous">("promo");

  const optedIn = Boolean(state.profile.leaderboardOptIn);
  const university = state.profile.university?.trim() || null;

  async function reload() {
    setLoading(true);
    const data = await fetchLeaderboard(
      scope === "promo" ? university : null,
      state.profile.pseudonym ?? null,
    );
    setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    if (ready && optedIn && signedInAs) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, optedIn, signedInAs, scope]);

  if (!ready) return <div className="py-24 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>;

  if (!supabaseConfigured) {
    return (
      <div className="py-16 text-center">
        <h1 className="serif text-[24px] font-bold">Classement de promo</h1>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px]" style={{ color: "var(--muted)" }}>
          Cette fonctionnalité a besoin de la synchronisation en ligne, pas encore activée sur cette installation.
        </p>
      </div>
    );
  }

  if (!signedInAs) {
    return (
      <div className="py-16 text-center">
        <h1 className="serif text-[24px] font-bold">Classement de promo</h1>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px]" style={{ color: "var(--muted)" }}>
          Connecte-toi pour comparer ta série et tes définitions sues à celles de ta promo, de façon anonyme.
        </p>
        <div className="mt-5"><Button href="/connexion">Se connecter</Button></div>
      </div>
    );
  }

  async function save() {
    update((d) => { d.profile.pseudonym = pseudoDraft.trim().slice(0, 24) || undefined; });
    setSaveMsg("Enregistrement…");
    const res = await syncLeaderboardEntry({ ...state, profile: { ...state.profile, pseudonym: pseudoDraft.trim().slice(0, 24) } });
    setSaveMsg(res.ok ? "Enregistré." : (res.error ?? "Échec de l'enregistrement."));
    if (res.ok) reload();
  }

  async function toggleOptIn(next: boolean) {
    update((d) => { d.profile.leaderboardOptIn = next; });
    const res = await syncLeaderboardEntry({ ...state, profile: { ...state.profile, leaderboardOptIn: next } });
    setSaveMsg(res.ok ? "" : (res.error ?? ""));
    if (next) reload(); else setRows(null);
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="serif text-[28px] font-bold tracking-tight">Classement de promo</h1>
        <p className="mt-1.5 text-[14.5px]" style={{ color: "var(--muted)" }}>
          Anonyme et facultatif : seuls un pseudonyme choisi par toi et tes compteurs de série apparaissent.
          Personne ne voit ton nom, ton email ni tes réponses.
        </p>
      </div>

      <section className="card p-5">
        <SectionTitle kicker="Ta participation" title={optedIn ? "Tu es dans le classement" : "Rejoindre le classement"} />
        <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3" style={{ background: "var(--surface-2)" }}>
          <span className="text-[14px] font-medium">Apparaître dans le classement de ma promo</span>
          <button onClick={() => toggleOptIn(!optedIn)}
            className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
            style={{ background: optedIn ? "var(--h, var(--accent))" : "var(--line-strong)" }}
            aria-pressed={optedIn}>
            <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
              style={{ transform: optedIn ? "translateX(22px)" : "translateX(2px)" }} />
          </button>
        </div>

        {optedIn && (
          <div className="mt-4 rise">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold" style={{ color: "var(--muted)" }}>Ton pseudonyme (visible des autres)</span>
              <div className="flex gap-2">
                <input value={pseudoDraft} onChange={(e) => setPseudoDraft(e.target.value)} maxLength={24}
                  placeholder="ex. Athenae42"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-[14.5px] outline-none"
                  style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />
                <Button onClick={save}>Enregistrer</Button>
              </div>
            </label>
            {saveMsg && <p className="mt-2 text-[12.5px]" style={{ color: "var(--muted)" }}>{saveMsg}</p>}
            {!university && (
              <p className="mt-2 text-[12.5px]" style={{ color: "var(--muted)" }}>
                Renseigne ta faculté dans les réglages pour te comparer à ta propre promo plutôt qu&apos;à tout StudiJur.
              </p>
            )}
          </div>
        )}
      </section>

      {optedIn && state.profile.pseudonym && (
        <section>
          <SectionTitle
            kicker="Classement"
            title={scope === "promo" && university ? `Ta promo — ${university}` : "Tous les élèves StudiJur"}
            right={university ? (
              <div className="flex gap-1.5">
                <button onClick={() => setScope("promo")} className="rounded-lg px-2.5 py-1 text-[12.5px] font-semibold"
                  style={scope === "promo" ? { background: "var(--h-soft)", color: "var(--h)" } : { color: "var(--muted)" }}>Ma promo</button>
                <button onClick={() => setScope("tous")} className="rounded-lg px-2.5 py-1 text-[12.5px] font-semibold"
                  style={scope === "tous" ? { background: "var(--h-soft)", color: "var(--h)" } : { color: "var(--muted)" }}>Tous</button>
              </div>
            ) : undefined}
          />
          {loading ? (
            <div className="card p-6 text-center text-[14px]" style={{ color: "var(--muted)" }}>Chargement…</div>
          ) : !rows || rows.length === 0 ? (
            <div className="card p-6 text-center text-[14px]" style={{ color: "var(--muted)" }}>
              Personne d&apos;autre n&apos;a encore rejoint ce classement.
            </div>
          ) : (
            <div className="card overflow-hidden">
              {rows.map((r, i) => (
                <div key={`${r.pseudonym}-${i}`}
                  className="flex items-center gap-3 border-b px-5 py-3.5 last:border-b-0"
                  style={{ borderColor: "var(--line)", background: r.isMe ? "var(--h-soft)" : "transparent" }}>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold tabular"
                    style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 truncate text-[14.5px] font-semibold">
                      {r.pseudonym} {r.isMe && <Tag tone="hue">Toi</Tag>}
                    </span>
                    <span className="block text-[12.5px]" style={{ color: "var(--muted)" }}>
                      {r.lessonsDone} leçons · {r.mastered} définitions sues
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-[14px] font-bold tabular" style={{ color: "var(--gold)" }}>
                    <Flame className="h-4 w-4" /> {r.streak}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="card p-5" style={{ background: "var(--h-soft)" }}>
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0" style={{ color: "var(--h)" }}><Check className="h-4 w-4" /></span>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            Le classement ne montre jamais ton nom, ton email ni le contenu de tes réponses — seulement le
            pseudonyme que tu choisis et trois compteurs. Tu peux le quitter à tout moment en désactivant le
            réglage ci-dessus.
          </p>
        </div>
      </section>
    </div>
  );
}

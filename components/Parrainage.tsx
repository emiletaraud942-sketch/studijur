"use client";

import { useEffect, useState } from "react";
import { useStudiJur } from "@/lib/state";
import { compterFilleuls, lienParrainage } from "@/lib/referral";
import { getSupabase } from "@/lib/supabase";
import { Button, SectionTitle } from "./ui";

export default function Parrainage() {
  const { signedInAs } = useStudiJur();
  const [lien, setLien] = useState("");
  const [filleuls, setFilleuls] = useState<number | null>(null);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!signedInAs) return;
    const sb = getSupabase();
    if (!sb) return;
    let annule = false;
    (async () => {
      const { data } = await sb.auth.getUser();
      const userId = data.user?.id;
      if (!userId || annule) return;
      setLien(lienParrainage(userId));
      const n = await compterFilleuls(userId);
      if (!annule) setFilleuls(n);
    })();
    return () => { annule = true; };
  }, [signedInAs]);

  if (!signedInAs || !lien) return null;

  async function copier() {
    try {
      await navigator.clipboard.writeText(lien);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      /* clipboard indisponible : le lien reste sélectionnable à la main */
    }
  }

  return (
    <section className="card p-5">
      <SectionTitle kicker="Parrainage" title="Invite tes amis" />
      <p className="mb-3 text-[13.5px]" style={{ color: "var(--muted)" }}>
        {filleuls === null
          ? "Partage ton lien : quand ton camarade s'abonne, vous économisez chacun 0,90 €."
          : filleuls === 0
            ? "Personne n'a encore rejoint via ton lien — partage-le dans ton groupe de promo. Quand un camarade s'abonne, vous économisez chacun 0,90 €."
            : `${filleuls} camarade${filleuls > 1 ? "s" : ""} ${filleuls > 1 ? "ont" : "a"} rejoint StudiJur grâce à toi.`}
      </p>
      <div className="flex gap-2">
        <input readOnly value={lien} onFocus={(e) => e.currentTarget.select()}
          className="w-full min-w-0 rounded-xl border px-3.5 py-2.5 text-[13px] outline-none"
          style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink)" }} />
        <Button onClick={copier} variant="soft" size="sm">{copie ? "Copié !" : "Copier"}</Button>
      </div>
    </section>
  );
}

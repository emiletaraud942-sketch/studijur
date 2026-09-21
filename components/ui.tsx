"use client";

import Link from "next/link";
import type { Course } from "@/lib/types";
import { HUES, HUES_DARK } from "@/lib/types";
import { inlineMarkup } from "@/lib/format";

export function hueVars(hue: Course["hue"]): React.CSSProperties {
  const l = HUES[hue];
  return { ["--h" as string]: l.fg, ["--h-soft" as string]: l.soft, ["--h-strong" as string]: l.strong };
}

export function HueStyle({ hue }: { hue: Course["hue"] }) {
  const l = HUES[hue];
  const d = HUES_DARK[hue];
  const css = `[data-hue="${hue}"]{--h:${l.fg};--h-soft:${l.soft};--h-strong:${l.strong}}
.dark [data-hue="${hue}"]{--h:${d.fg};--h-soft:${d.soft};--h-strong:${d.strong}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export function AllHueStyles() {
  const hues: Course["hue"][] = ["green", "blue", "gold", "plum", "rust"];
  const css = hues
    .map((h) => {
      const l = HUES[h];
      const d = HUES_DARK[h];
      return `[data-hue="${h}"]{--h:${l.fg};--h-soft:${l.soft};--h-strong:${l.strong}}
.dark [data-hue="${h}"]{--h:${d.fg};--h-soft:${d.soft};--h-strong:${d.strong}}`;
    })
    .join("\n");
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "hue" | "gold" }) {
  const styles: Record<string, React.CSSProperties> = {
    neutral: { background: "var(--surface-2)", color: "var(--muted)" },
    hue: { background: "var(--h-soft)", color: "var(--h)" },
    gold: { background: "var(--gold-soft)", color: "var(--gold)" },
  };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.07em]"
      style={styles[tone]}
    >
      {children}
    </span>
  );
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="prose-law text-[15.5px]">
      {paragraphs.map((p, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: inlineMarkup(p) }} />
      ))}
    </div>
  );
}

export function Ring({ value, total, size = 46, label }: { value: number; total: number; size?: number; label?: string }) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={label ?? `${value} sur ${total}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--h, var(--accent))" strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        className="tabular" style={{ fontSize: size * 0.3, fill: "var(--ink)", fontWeight: 600 }}>
        {value}
      </text>
    </svg>
  );
}

export function Bar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: "var(--h, var(--accent))", transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </div>
  );
}

export function Button({
  children, onClick, href, variant = "primary", size = "md", disabled, type = "button", full,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "soft" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  full?: boolean;
}) {
  const sizes = {
    sm: "px-3.5 py-1.5 text-[13px] rounded-full",
    md: "px-4.5 py-2.5 text-[14px] rounded-full",
    lg: "px-5 py-3.5 text-[15px] rounded-full",
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--h, var(--accent))",
      color: "var(--accent-ink)",
      border: "1.5px solid transparent",
      boxShadow: "0 10px 20px -10px var(--h, var(--accent))",
    },
    soft: { background: "var(--h-soft, var(--accent-soft))", color: "var(--h, var(--accent))", border: "1.5px solid transparent" },
    outline: { background: "transparent", color: "var(--ink)", border: "1.5px solid var(--card-border)" },
    ghost: { background: "transparent", color: "var(--muted)", border: "1.5px solid transparent" },
  };
  const cls = `inline-flex items-center justify-center gap-2 font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none hover:brightness-[1.06] ${sizes[size]} ${full ? "w-full" : ""}`;
  if (href) {
    return (
      <Link href={href} className={cls} style={variants[variant]}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={variants[variant]}>
      {children}
    </button>
  );
}

export function SectionTitle({ kicker, title, right }: { kicker?: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {kicker && (
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
            {kicker}
          </div>
        )}
        <h2 className="text-[21px] font-semibold leading-tight">{title}</h2>
      </div>
      {right}
    </div>
  );
}

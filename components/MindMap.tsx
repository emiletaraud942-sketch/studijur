"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MindNode } from "@/lib/mindmap";
import type { Course } from "@/lib/types";

const WIDTH_BY_DEPTH = [180, 162, 148, 140];
const COL_GAP = 40;
const ROW_GAP = 12;

// Une couleur pastel par branche (réutilise la palette de teintes déjà
// utilisée pour les matières, cf. HUES dans lib/types.ts) : ça donne des
// repères visuels immédiats pour relire la carte, comme sur une vraie carte
// mentale annotée à la main. La racine garde la teinte du cours (var(--h)
// hérité de data-hue={course.hue} posé plus haut dans la page) ; on exclut
// cette teinte de la palette des branches pour qu'aucune ne s'y confonde.
const ALL_HUES: Course["hue"][] = ["gold", "blue", "plum", "green", "rust"];
function branchHues(exclude?: Course["hue"]): Course["hue"][] {
  return ALL_HUES.filter((h) => h !== exclude);
}

function widthAt(depth: number): number {
  return WIDTH_BY_DEPTH[Math.min(depth, WIDTH_BY_DEPTH.length - 1)];
}

function xAt(depth: number): number {
  let x = 0;
  for (let d = 0; d < depth; d++) x += widthAt(d) + COL_GAP;
  return x;
}

// Pas de mesure DOM (coûteuse et hors sujet en SSR) : on estime la hauteur
// d'un bloc de texte à partir de sa longueur, suffisant pour un plan de carte
// qui n'a pas besoin d'être pixel-parfait.
function estimateHeight(text: string, w: number): number {
  const charsPerLine = Math.max(10, Math.floor((w - 26) / 6.3));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  return lines * 15 + 18;
}

// Seule la racine (le titre de la leçon) est dépliée par défaut : les 3
// branches (Points clés / Définitions / Plan d'examen) et tout ce qu'elles
// contiennent démarrent repliées, pour que la vue initiale tienne sans
// défiler. On déplie ensuite au fil des taps, branche par branche.
function defaultCollapsed(node: MindNode, depth = 0, acc = new Set<string>()): Set<string> {
  if (depth >= 1 && node.children?.length) acc.add(node.id);
  node.children?.forEach((c) => defaultCollapsed(c, depth + 1, acc));
  return acc;
}

type Placed = {
  node: MindNode; depth: number; x: number; y: number; w: number; h: number;
  hasHiddenChildren: boolean; hue?: Course["hue"];
};

function layoutTree(root: MindNode, collapsed: Set<string>, open: Set<string>, hues: Course["hue"][]) {
  const placed: Placed[] = [];
  const links: { from: Placed; to: Placed }[] = [];
  let cursorY = 0;

  function visit(node: MindNode, depth: number, hue: Course["hue"] | undefined): Placed {
    const w = widthAt(depth);
    const labelH = estimateHeight(node.label, w);
    const detailH = node.detail && open.has(node.id) ? estimateHeight(node.detail, w) : 0;
    const ownH = labelH + detailH;
    const showChildren = Boolean(node.children?.length) && !collapsed.has(node.id);

    let self: Placed;
    if (!showChildren) {
      self = { node, depth, x: xAt(depth), y: cursorY, w, h: ownH, hasHiddenChildren: Boolean(node.children?.length) && collapsed.has(node.id), hue };
      placed.push(self);
      cursorY += ownH + ROW_GAP;
    } else {
      const startY = cursorY;
      const kids = node.children!.map((k, i) => visit(k, depth + 1, depth === 0 ? hues[i % hues.length] : hue));
      const first = kids[0];
      const last = kids[kids.length - 1];
      const centerY = (first.y + first.h / 2 + last.y + last.h / 2) / 2;
      const y = Math.max(startY, centerY - ownH / 2);
      self = { node, depth, x: xAt(depth), y, w, h: ownH, hasHiddenChildren: false, hue };
      placed.push(self);
      for (const k of kids) links.push({ from: self, to: k });
    }
    return self;
  }

  visit(root, 0, undefined);
  const width = Math.max(...placed.map((p) => p.x + p.w));
  const height = Math.max(...placed.map((p) => p.y + p.h), cursorY);
  return { placed, links, width, height };
}

function linkPath(from: Placed, to: Placed): string {
  const x1 = from.x + from.w, y1 = from.y + from.h / 2;
  const x2 = to.x, y2 = to.y + to.h / 2;
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

export function MindMap({ root, courseHue }: { root: MindNode; courseHue?: Course["hue"] }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => defaultCollapsed(root));
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const revealTarget = useRef<string | null>(null);
  const hues = useMemo(() => branchHues(courseHue), [courseHue]);

  const { placed, links, width, height } = useMemo(
    () => layoutTree(root, collapsed, open, hues),
    [root, collapsed, open, hues],
  );

  // Une branche dépliée pousse ses enfants plus loin à droite (et parfois
  // plus bas) que la zone visible sur mobile : sans ça, taper une branche
  // ne semble rien faire tant qu'on n'a pas pensé à faire défiler soi-même.
  useEffect(() => {
    const id = revealTarget.current;
    if (!id || !containerRef.current) return;
    const kids = links.filter((l) => l.from.node.id === id).map((l) => l.to);
    const target = kids[Math.floor(kids.length / 2)];
    if (!target) return;
    const el = containerRef.current.querySelector<HTMLElement>(`[data-node-id="${target.node.id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    revealTarget.current = null;
  }, [links]);

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); revealTarget.current = id; } else next.add(id);
      return next;
    });
  }
  function toggleOpen(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const PAD = 16;

  return (
    <div ref={containerRef} className="card overflow-auto p-2" style={{ maxHeight: 520 }}>
      <svg width={width + PAD * 2} height={height + PAD * 2} className="block">
        <g transform={`translate(${PAD},${PAD})`}>
          {links.map((l, i) => (
            <path
              key={i}
              data-hue={l.to.hue}
              d={linkPath(l.from, l.to)}
              fill="none"
              stroke="var(--h-strong, var(--line-strong))"
              strokeWidth={1.5}
            />
          ))}
          {placed.map((p) => {
            const isRoot = p.depth === 0;
            const isBranch = p.depth === 1;
            const clickable = Boolean(p.node.children?.length) || Boolean(p.node.detail);
            const isDetailOpen = open.has(p.node.id);
            return (
              <foreignObject key={p.node.id} x={p.x} y={p.y} width={p.w} height={p.h} overflow="visible">
                <div
                  data-node-id={p.node.id}
                  data-hue={p.hue}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={() => {
                    if (p.node.children?.length) toggleCollapse(p.node.id);
                    else if (p.node.detail) toggleOpen(p.node.id);
                  }}
                  className="flex h-full flex-col justify-center rounded-xl border px-3 py-2 text-[12px] leading-snug"
                  style={{
                    background: isRoot ? "var(--h, var(--accent))" : isBranch ? "var(--h-soft, var(--accent-soft))" : "var(--surface-2)",
                    color: isRoot ? "var(--accent-ink)" : isBranch ? "var(--h, var(--accent))" : "var(--ink)",
                    borderColor: isRoot ? "transparent" : isBranch ? "var(--h-soft, var(--accent-soft))" : "var(--h, var(--line))",
                    borderWidth: isRoot ? 1 : isBranch ? 1 : 1.5,
                    fontWeight: isRoot || isBranch ? 700 : 500,
                    cursor: clickable ? "pointer" : "default",
                  }}
                >
                  <span>{p.node.label}{p.hasHiddenChildren ? ` (${p.node.children!.length})` : ""}</span>
                  {isDetailOpen && p.node.detail && (
                    <span className="mt-1 font-normal" style={{ color: "var(--muted)" }}>{p.node.detail}</span>
                  )}
                </div>
              </foreignObject>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

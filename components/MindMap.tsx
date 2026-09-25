"use client";

import { useMemo, useState } from "react";
import type { MindNode } from "@/lib/mindmap";

// Les 3 branches de lessonMindMap (lib/mindmap.ts) ont des id fixes : c'est
// ce qui permet une couleur constante par catégorie, la même sur toute leçon
// et toute matière, plutôt qu'une teinte qui tournerait d'une leçon à
// l'autre. Volontairement indépendant de --h (la teinte du cours) : la
// racine garde --h pour rattacher la carte à la page, les branches gardent
// toujours la même couleur pour que l'association visuelle se construise
// avec le temps, quelle que soit la matière consultée.
type CategoryId = "keypoints" | "definitions" | "plan";
const CATEGORY: Record<CategoryId, { fg: string; soft: string; label: string }> = {
  keypoints: { fg: "var(--mm-keypoints)", soft: "var(--mm-keypoints-soft)", label: "Points clés" },
  definitions: { fg: "var(--mm-definitions)", soft: "var(--mm-definitions-soft)", label: "Définitions" },
  plan: { fg: "var(--mm-plan)", soft: "var(--mm-plan-soft)", label: "Plan d'examen" },
};
const CATEGORY_ORDER: CategoryId[] = ["keypoints", "definitions", "plan"];

// Hiérarchie visuelle : la taille de police, la graisse et le nombre de
// caractères admis avant troncature diminuent du centre vers les feuilles,
// pour que les branches principales pèsent visuellement plus que le détail.
const DEPTH_STYLE = [
  { font: 15, weight: 700, maxChars: 30, maxW: 176, minW: 96 },
  { font: 13, weight: 700, maxChars: 20, maxW: 140, minW: 80 },
  { font: 12, weight: 600, maxChars: 26, maxW: 128, minW: 70 },
  { font: 11, weight: 500, maxChars: 30, maxW: 118, minW: 64 },
  { font: 10.5, weight: 500, maxChars: 34, maxW: 112, minW: 60 },
];
function styleAt(depth: number) {
  return DEPTH_STYLE[Math.min(depth, DEPTH_STYLE.length - 1)];
}
function strokeAt(depth: number): number {
  return [0, 2.4, 1.7, 1.2, 1][Math.min(depth, 4)] ?? 1;
}

// Mot-clé plutôt que phrase : on coupe au dernier espace avant la limite
// pour ne jamais trancher un mot en deux.
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut;
  return base.trimEnd() + "…";
}

// Pas de mesure DOM (coûteuse et hors sujet en SSR) : on estime la boîte
// d'un libellé à partir de sa longueur, suffisant pour une carte qui n'a pas
// besoin d'être pixel-parfaite.
function estimateBox(text: string, font: number, maxW: number, minW: number) {
  const avgChar = font * 0.56;
  const naturalW = text.length * avgChar + 20;
  const w = Math.min(maxW, Math.max(minW, naturalW));
  const charsPerLine = Math.max(6, Math.floor((w - 18) / avgChar));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  const h = lines * (font * 1.3) + 14;
  return { w, h };
}

// Seule la racine (le titre de la leçon) est dépliée par défaut : les 3
// branches et tout ce qu'elles contiennent démarrent repliées, pour que la
// vue initiale tienne sans surcharge. On déplie ensuite au fil des taps.
function defaultCollapsed(node: MindNode, depth = 0, acc = new Set<string>()): Set<string> {
  if (depth >= 1 && node.children?.length) acc.add(node.id);
  node.children?.forEach((c) => defaultCollapsed(c, depth + 1, acc));
  return acc;
}

// Poids d'un nœud = nombre de feuilles visibles qu'il porte (un nœud replié
// compte pour 1, quel que soit ce qu'il cache) : c'est ce qui détermine la
// part du cercle que reçoit chaque branche, sans jamais se chevaucher.
function weightOf(node: MindNode, collapsed: Set<string>): number {
  const showChildren = Boolean(node.children?.length) && !collapsed.has(node.id);
  if (!showChildren) return 1;
  return Math.max(1, node.children!.reduce((sum, c) => sum + weightOf(c, collapsed), 0));
}

type Slot = {
  node: MindNode;
  depth: number;
  angleStart: number;
  angleEnd: number;
  category?: CategoryId;
  labelText: string;
  w: number;
  h: number;
  hasHiddenChildren: boolean;
  parentId?: string;
};

const SECTOR_GAP = 0.05;

function collectSlots(root: MindNode, collapsed: Set<string>, open: Set<string>): Slot[] {
  const slots: Slot[] = [];

  function walk(
    node: MindNode, depth: number, angleStart: number, angleEnd: number,
    category: CategoryId | undefined, parentId: string | undefined,
  ) {
    const st = styleAt(depth);
    const labelText = truncate(node.label, st.maxChars);
    const hasHiddenChildren = Boolean(node.children?.length) && collapsed.has(node.id);
    // La boîte doit mesurer ce qui sera vraiment affiché, suffixe "(N)"
    // inclus — sinon un libellé avec beaucoup d'enfants cachés déborde de
    // sa boîte et vient chevaucher l'anneau voisin.
    const displayText = labelText + (hasHiddenChildren ? ` (${node.children!.length})` : "");
    const labelBox = estimateBox(displayText, st.font, st.maxW, st.minW);
    let w = labelBox.w;
    let h = labelBox.h;
    if (node.detail && open.has(node.id)) {
      const db = estimateBox(node.detail, Math.max(9.5, st.font - 1), st.maxW + 20, st.minW);
      w = Math.max(w, db.w);
      h += db.h;
    }
    const showChildren = Boolean(node.children?.length) && !collapsed.has(node.id);
    slots.push({
      node, depth, angleStart, angleEnd, category, labelText, w, h,
      hasHiddenChildren,
      parentId,
    });

    if (showChildren) {
      const kids = node.children!;
      const weights = kids.map((k) => weightOf(k, collapsed));
      const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
      const fullWidth = angleEnd - angleStart;
      let cursor = angleStart;
      kids.forEach((k, i) => {
        const share = (weights[i] / totalWeight) * fullWidth;
        const gap = Math.min(SECTOR_GAP, share * 0.15);
        const kStart = cursor + gap / 2;
        const kEnd = cursor + share - gap / 2;
        const childCategory = depth === 0 ? (k.id as CategoryId) : category;
        walk(k, depth + 1, kStart, kEnd, childCategory, node.id);
        cursor += share;
      });
    }
  }

  // Départ en haut (-90°), plein cercle dans le sens horaire.
  walk(root, 0, -Math.PI / 2, (Math.PI * 3) / 2, undefined, undefined);
  return slots;
}

// Distance du centre d'une boîte (largeur w, hauteur h) jusqu'à son bord, le
// long d'un rayon partant à l'angle donné. Sur un angle oblique, ce n'est PAS
// la demi-hauteur : il faut diviser par |sin|/|cos| pour tenir compte du
// chemin plus long qu'emprunte un rayon incliné avant de sortir de la boîte.
function edgeReach(w: number, h: number, angle: number): number {
  const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle));
  const tx = c > 1e-6 ? w / 2 / c : Infinity;
  const ty = s > 1e-6 ? h / 2 / s : Infinity;
  return Math.min(tx, ty);
}

// Un rayon commun par profondeur (anneaux concentriques), assez grand pour
// deux choses : que la longueur d'arc de chaque nœud contienne sa boîte de
// texte (chevauchement entre nœuds voisins du même anneau), et que la
// distance à son parent dégage vraiment les deux boîtes (chevauchement avec
// l'anneau précédent) — calculé nœud par nœud via edgeReach, jamais avec une
// simple somme de demi-hauteurs qui sous-estime les angles obliques.
function computeRadii(slots: Slot[]): number[] {
  const maxDepth = slots.reduce((m, s) => Math.max(m, s.depth), 0);
  const byId = new Map(slots.map((s) => [s.node.id, s]));
  const radii: number[] = [0];
  for (let d = 1; d <= maxDepth; d++) {
    let candidate = radii[d - 1] + 24;
    for (const s of slots) {
      if (s.depth !== d) continue;
      const angle = (s.angleStart + s.angleEnd) / 2;

      // Chevauchement avec le parent (anneau précédent).
      const parent = s.parentId ? byId.get(s.parentId) : undefined;
      if (parent) {
        const parentReach = edgeReach(parent.w, parent.h, angle);
        const ownReach = edgeReach(s.w, s.h, angle);
        const radial = radii[d - 1] + parentReach + ownReach + 26;
        if (radial > candidate) candidate = radial;
      }

      // Chevauchement avec les voisins du même anneau (longueur d'arc).
      const angleWidth = Math.max(0.015, s.angleEnd - s.angleStart);
      const arc = (s.w + 30) / angleWidth;
      if (arc > candidate) candidate = arc;
    }
    radii[d] = candidate;
  }
  return radii;
}

type Placed = Slot & { angle: number; radius: number; x: number; y: number };

function layoutRadial(root: MindNode, collapsed: Set<string>, open: Set<string>) {
  const slots = collectSlots(root, collapsed, open);
  const radii = computeRadii(slots);

  const placed: Placed[] = slots.map((s) => {
    const angle = (s.angleStart + s.angleEnd) / 2;
    const radius = radii[s.depth];
    return { ...s, angle, radius, x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });

  const byId = new Map(placed.map((p) => [p.node.id, p]));
  const links = placed
    .filter((p) => p.parentId)
    .map((p) => ({ from: byId.get(p.parentId!)!, to: p }));

  let minX = 0, minY = 0, maxX = 0, maxY = 0;
  for (const p of placed) {
    minX = Math.min(minX, p.x - p.w / 2);
    maxX = Math.max(maxX, p.x + p.w / 2);
    minY = Math.min(minY, p.y - p.h / 2);
    maxY = Math.max(maxY, p.y + p.h / 2);
  }

  return { placed, links, minX, minY, maxX, maxY };
}

// Courbe organique façon lien radial : les deux points de contrôle sont
// posés à mi-rayon, chacun à l'angle de son extrémité — la ligne part donc
// vers l'extérieur avant de pivoter en douceur vers l'angle d'arrivée,
// plutôt qu'une ligne droite façon organigramme.
// Point où un rayon partant du centre d'une boîte, vers un angle donné,
// touche son bord (rectangle centré, demi-largeur/demi-hauteur connues).
function edgePoint(p: Placed, towardAngle: number): { x: number; y: number } {
  const dx = Math.cos(towardAngle), dy = Math.sin(towardAngle);
  const hw = p.w / 2, hh = p.h / 2;
  const tx = Math.abs(dx) > 1e-6 ? hw / Math.abs(dx) : Infinity;
  const ty = Math.abs(dy) > 1e-6 ? hh / Math.abs(dy) : Infinity;
  const t = Math.min(tx, ty);
  return { x: p.x + dx * t, y: p.y + dy * t };
}

function linkPath(from: Placed, to: Placed): string {
  const fromAngle = from.depth === 0 ? to.angle : from.angle;
  const rMid = from.radius + (to.radius - from.radius) * 0.5;
  const c1x = rMid * Math.cos(fromAngle), c1y = rMid * Math.sin(fromAngle);
  const c2x = rMid * Math.cos(to.angle), c2y = rMid * Math.sin(to.angle);
  // Le trait part et s'arrête au BORD des boîtes, pas à leur centre : sinon
  // il reste presque entièrement caché sous les nœuds voisins du centre.
  const dirToChild = Math.atan2(to.y - from.y, to.x - from.x);
  const start = edgePoint(from, dirToChild);
  const end = edgePoint(to, dirToChild + Math.PI);
  return `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;
}

export function MindMap({ root }: { root: MindNode }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => defaultCollapsed(root));
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const { placed, links, minX, minY, maxX, maxY } = useMemo(
    () => layoutRadial(root, collapsed, open),
    [root, collapsed, open],
  );

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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

  const PAD = 22;
  const vbX = minX - PAD, vbY = minY - PAD, vbW = maxX - minX + PAD * 2, vbH = maxY - minY + PAD * 2;

  return (
    <div className="card relative overflow-hidden" style={{ height: 440 }}>
      <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block">
        {links.map((l, i) => (
          <path
            key={i}
            d={linkPath(l.from, l.to)}
            fill="none"
            stroke={l.to.category ? CATEGORY[l.to.category].fg : "var(--h-strong, var(--line-strong))"}
            strokeWidth={strokeAt(l.to.depth)}
            strokeLinecap="round"
            opacity={0.8}
          />
        ))}
        {placed.map((p) => {
          const isRoot = p.depth === 0;
          const isBranch = p.depth === 1;
          const st = styleAt(p.depth);
          const clickable = Boolean(p.node.children?.length) || Boolean(p.node.detail);
          const isDetailOpen = open.has(p.node.id);
          const cat = p.category ? CATEGORY[p.category] : undefined;
          return (
            <foreignObject key={p.node.id} x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} overflow="visible">
              <div
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={() => {
                  if (p.node.children?.length) toggleCollapse(p.node.id);
                  else if (p.node.detail) toggleOpen(p.node.id);
                }}
                className="flex h-full flex-col justify-center rounded-xl border px-2.5 py-1.5 text-center leading-snug"
                style={{
                  background: isRoot ? "var(--h, var(--accent))" : cat ? cat.soft : "var(--surface-2)",
                  color: isRoot ? "var(--accent-ink)" : isBranch && cat ? cat.fg : "var(--ink)",
                  borderColor: isRoot ? "transparent" : cat ? cat.fg : "var(--line)",
                  borderWidth: isRoot ? 0 : isBranch ? 1.5 : 1,
                  fontSize: st.font,
                  fontWeight: st.weight,
                  cursor: clickable ? "pointer" : "default",
                }}
              >
                <span>{p.labelText}{p.hasHiddenChildren ? ` (${p.node.children!.length})` : ""}</span>
                {isDetailOpen && p.node.detail && (
                  <span className="mt-1 font-normal" style={{ color: "var(--muted)", fontSize: st.font - 1 }}>
                    {truncate(p.node.detail, 90)}
                  </span>
                )}
              </div>
            </foreignObject>
          );
        })}
      </svg>

      <div
        className="absolute bottom-2 right-2 flex flex-col gap-1 rounded-lg px-2 py-1.5 text-[10px]"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", opacity: 0.92 }}
      >
        {CATEGORY_ORDER.map((id) => (
          <div key={id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORY[id].fg }} />
            <span style={{ color: "var(--muted)" }}>{CATEGORY[id].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

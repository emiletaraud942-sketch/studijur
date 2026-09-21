import { chromium } from "playwright";
const glyphe = `<svg width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M7 21h10"/><path d="M5 7h14"/><path d="M5 7 2 14h6L5 7Z"/><path d="M19 7l-3 7h6l-3-7Z"/><path d="M2 14a3 3 0 0 0 6 0"/><path d="M16 14a3 3 0 0 0 6 0"/><circle cx="12" cy="4.5" r="1.4"/></svg>`;
const page = (size, pad, radius, bg, fg) => `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0}body{width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:transparent}
.b{width:${size}px;height:${size}px;border-radius:${radius}px;background:${bg};display:flex;align-items:center;justify-content:center}</style>
<div class="b">${glyphe.replace(/SIZE/g, String(Math.round(size * pad))).replace("COLOR", fg)}</div>`;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
for (const [nom, size, pad, radius] of [["icone-192.png",192,0.56,42],["icone-512.png",512,0.56,112],["icone-maskable.png",512,0.42,0]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(page(size, pad, radius, "#1F6F53", "#FFFFFF"));
  await p.waitForTimeout(150);
  await p.screenshot({ path: `public/${nom}`, omitBackground: true });
  await p.close();
}
await b.close();
console.log("icônes générées");

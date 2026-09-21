import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto("file:///tmp/og.html", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
await p.screenshot({ path: "public/og.png" });
await b.close();
console.log("og.png généré");

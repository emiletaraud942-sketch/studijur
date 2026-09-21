import { chromium } from "playwright";

const B = "https://lexio-roan.vercel.app";
const log = [];
const ok = (m) => log.push("  OK   " + m);
const ko = (m) => log.push("  ÉCHEC " + m);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: "fr-FR", ignoreHTTPSErrors: true });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 160)); });

// 1. Accueil
await page.goto(B + "/", { waitUntil: "networkidle" });
const heading = await page.locator("h1").first().innerText();
heading.includes("séance") || heading.includes("Bonjour") ? ok("accueil affiché : « " + heading + " »") : ko("titre accueil inattendu : " + heading);
const cta = page.getByRole("link", { name: /Commencer la séance/i });
(await cta.count()) ? ok("carte de la leçon du jour présente") : ko("pas de carte leçon du jour");
await page.screenshot({ path: "/tmp/shot-accueil.png", fullPage: false });

// 2. Étape 1 — le cours
await cta.click();
await page.waitForURL(/\/lecon\//);
await page.waitForTimeout(400);
(await page.locator("text=À retenir absolument").count()) ? ok("étape 1 : micro-cours et points clés") : ko("étape 1 incomplète");
await page.screenshot({ path: "/tmp/shot-lecon.png" });

// 3. Étape 2 — définitions (5 cartes)
await page.getByRole("button", { name: /Passer aux définitions/i }).click();
await page.waitForTimeout(400);
let cartes = 0;
for (let i = 0; i < 5; i++) {
  const reveal = page.getByRole("button", { name: /Récite la définition/i });
  if (!(await reveal.count())) break;
  await reveal.click();
  await page.waitForTimeout(220);
  if (i === 0) await page.screenshot({ path: "/tmp/shot-definition.png" });
  await page.getByRole("button", { name: /Je savais/i }).click();
  await page.waitForTimeout(260);
  cartes++;
}
cartes === 5 ? ok("étape 2 : les 5 définitions enchaînées") : ko("étape 2 : " + cartes + " cartes seulement");

// 4. Étape 3 — question de cours
await page.waitForTimeout(300);
const brouillon = page.locator("#brouillon");
(await brouillon.count()) ? ok("étape 3 : champ brouillon présent") : ko("étape 3 : pas de brouillon");
await brouillon.fill("I. Première partie\n  A. …\n  B. …\nII. Seconde partie");
await page.getByRole("button", { name: /Réponse concise/i }).click();
await page.waitForTimeout(250);
(await page.locator("h3:has-text('Réponse concise')").count()) ? ok("panneau réponse concise") : ko("panneau concise absent");
await page.getByRole("button", { name: /Plan détaillé/i }).click();
await page.waitForTimeout(250);
(await page.locator("h3:has-text('Plan détaillé')").count()) ? ok("panneau plan détaillé") : ko("panneau plan absent");
await page.screenshot({ path: "/tmp/shot-question.png", fullPage: true });

// 5. Étape 4 — quiz
await page.getByRole("button", { name: /Passer au quiz/i }).click();
await page.waitForTimeout(400);
let questions = 0;
for (let i = 0; i < 5; i++) {
  const choix = page.locator("button", { hasText: /./ });
  const cards = await page.locator("div.card button").all();
  if (!cards.length) break;
  await cards[0].click();
  await page.waitForTimeout(280);
  if (i === 0) await page.screenshot({ path: "/tmp/shot-quiz.png" });
  const suivant = page.getByRole("button", { name: /Question suivante|Terminer la séance/i });
  if (!(await suivant.count())) break;
  await suivant.click();
  await page.waitForTimeout(320);
  questions++;
}
questions === 5 ? ok("étape 4 : les 5 questions du quiz") : ko("étape 4 : " + questions + " questions seulement");

// 6. Écran de fin + série
await page.waitForTimeout(400);
(await page.locator("text=Séance terminée").count()) ? ok("écran de fin affiché") : ko("écran de fin absent");
await page.screenshot({ path: "/tmp/shot-fin.png" });

// 7. La série a été enregistrée
await page.goto(B + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const body = await page.locator("body").innerText();
body.includes("Séance du jour terminée") ? ok("progression persistée (accueil en mode terminé)") : ko("progression non persistée");

// 8. Progression et révisions
await page.goto(B + "/progression", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const prog = await page.locator("body").innerText();
prog.includes("Tes 12 dernières semaines") ? ok("page progression : calendrier de régularité") : ko("calendrier absent");
prog.includes("Où en sont tes définitions") ? ok("page progression : boîtes de révision") : ko("boîtes absentes");
await page.screenshot({ path: "/tmp/shot-progression.png", fullPage: true });

// 9. Bibliothèque
await page.goto(B + "/bibliotheque", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const nbMatieres = await page.locator("section[id]").count();
nbMatieres === 5 ? ok("bibliothèque : 5 matières") : ko("bibliothèque : " + nbMatieres + " matières");
await page.locator("section[id] button").first().click();
await page.waitForTimeout(350);
(await page.locator("section[id] ul li").count()) >= 4 ? ok("accordéon des leçons fonctionnel") : ko("accordéon vide");
await page.screenshot({ path: "/tmp/shot-bibliotheque.png", fullPage: true });

// 10. Mode sombre
await page.goto(B + "/reglages", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Sombre", exact: true }).click();
await page.waitForTimeout(400);
(await page.locator("html.dark").count()) ? ok("bascule en mode sombre") : ko("mode sombre non appliqué");
await page.goto(B + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/shot-sombre.png" });

// 11. Bureau
const wide = await ctx.newPage();
await wide.setViewportSize({ width: 1180, height: 860 });
await wide.goto(B + "/", { waitUntil: "networkidle" });
await wide.waitForTimeout(600);
const scrollX = await wide.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
scrollX <= 1 ? ok("aucun débordement horizontal en 1180 px") : ko("débordement horizontal de " + scrollX + " px");
await wide.screenshot({ path: "/tmp/shot-bureau.png" });

await browser.close();
console.log(log.join("\n"));
console.log("\nErreurs JavaScript : " + (errors.length ? errors.length : "aucune"));
errors.slice(0, 6).forEach((e) => console.log("   - " + e));
const failed = log.filter((l) => l.includes("ÉCHEC")).length;
console.log("\nRésultat : " + (log.length - failed) + "/" + log.length + " vérifications passées");
process.exit(failed || errors.length ? 1 : 0);

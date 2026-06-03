// ── bake-ulv-og.mjs ───────────────────────────────────────────
// Screenshot ULV_ShareCard at 1200×630 → a-ultima-vez/og/<slug>-<stage>.png,
// one per (nation × stage). Same Playwright approach as bake-og-image.mjs.
// Requires flags present (run check:flags first) and a local server.
//
//   npm run bake:ulv-og              → all 48 qualified-2026 nations × 3 stages
//   node scripts/bake-ulv-og.mjs all → every nation (83 × 3 = 249 cards)
//   node scripts/bake-ulv-og.mjs brasil → just one nation × 3 stages
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nations = JSON.parse(fs.readFileSync(path.join(root, "data", "nations.json"), "utf8"));
const STAGES = ["qf", "sf", "final"];
const URL_BASE = (process.env.URL || "http://localhost:8000/").replace(/\/?$/, "/");
const PAGE_URL = URL_BASE + "a-ultima-vez/";
const arg = process.argv[2];

let targets = nations.filter((n) => n.qualified2026);
if (arg === "all") targets = nations;
else if (arg) targets = nations.filter((n) => n.slug === arg);
if (!targets.length) { console.error(`no nation matches "${arg}"`); process.exit(1); }

const outDir = path.join(root, "a-ultima-vez", "og");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 30_000 });
await page.waitForFunction(() => window.NATIONS && window.ULV_ShareCard && window.React && window.ReactDOM, null, { timeout: 10_000 });

let count = 0;
for (const n of targets) {
  for (const stage of STAGES) {
    await page.evaluate(({ slug, stage }) => {
      document.body.innerHTML = '<div id="bake" style="position:fixed;top:0;left:0;width:1200px;height:630px"></div>';
      const nation = window.NATIONS.find((x) => x.slug === slug);
      window.ReactDOM.createRoot(document.getElementById("bake"))
        .render(window.React.createElement(window.ULV_ShareCard, { nation, stage }));
    }, { slug: n.slug, stage });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(600);
    const out = path.join(outDir, `${n.slug}-${stage}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
    count++;
  }
  process.stdout.write(`[bake] ${n.slug} ✓\n`);
}
console.log(`[bake] wrote ${count} cards to a-ultima-vez/og/`);
await browser.close();

// One-shot: screenshot ShareCard at 1200×630 and write a PNG.
// Re-run whenever the design or data changes meaningfully.
//
//   npm run bake:og                            → england, sem-ganhar-de-um-campeao/og/england.png
//   node scripts/bake-og-image.mjs brazil       → brazil, sem-ganhar-de-um-campeao/og/brazil.png
//   node scripts/bake-og-image.mjs brazil pt out.png  → explicit lang + out path
//
// Requires a local server already running on URL_BASE (default
// http://localhost:8000/). Navigates to URL_BASE + dashboard slug.
import { chromium } from "playwright";

const DASHBOARD_SLUG = "sem-ganhar-de-um-campeao";
const NATION = process.argv[2] || "england";
const LANG = process.argv[3] || "pt";
const OUT = process.argv[4] || `${DASHBOARD_SLUG}/og/${NATION}.png`;
const URL_BASE = process.env.URL || "http://localhost:8000/";
const URL = URL_BASE.replace(/\/?$/, "/") + DASHBOARD_SLUG + "/";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

console.log(`[bake] navigating to ${URL}`);
await page.goto(URL, { waitUntil: "networkidle", timeout: 30_000 });

await page.waitForFunction(
  () => window.DROUGHT && window.ShareCard && window.React && window.ReactDOM,
  null,
  { timeout: 10_000 }
);

await page.evaluate(({ nation, lang }) => {
  document.body.innerHTML = '<div id="bake" style="position:fixed;top:0;left:0;width:1200px;height:630px;background:#0C0820;overflow:hidden"></div>';
  const row = window.DROUGHT.find((r) => r.nation === nation);
  const root = window.ReactDOM.createRoot(document.getElementById("bake"));
  root.render(window.React.createElement(window.ShareCard, { row, lang }));
}, { nation: NATION, lang: LANG });

await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(1500);

await page.screenshot({
  path: OUT,
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
console.log(`[bake] wrote ${OUT}  (nation=${NATION}, lang=${LANG})`);
await browser.close();

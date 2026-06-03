// One-shot: screenshot ShareCard at 1200×630 and write og-image.png.
// Re-run whenever the design or data changes meaningfully.
//
//   npm run bake:og                           → england / en / og-image.png
//   node scripts/bake-og-image.mjs brazil pt og-image.png
//
// Requires a local server already running on URL (default http://localhost:8000/).
import { chromium } from "playwright";

const NATION = process.argv[2] || "england";
const LANG = process.argv[3] || "en";
const OUT = process.argv[4] || "og-image.png";
const URL = process.env.URL || "http://localhost:8000/";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

console.log(`[bake] navigating to ${URL}`);
await page.goto(URL, { waitUntil: "networkidle", timeout: 30_000 });

// Babel runs after DOMContentLoaded; wait for the globals it attaches.
await page.waitForFunction(
  () => window.DROUGHT && window.ShareCard && window.React && window.ReactDOM,
  null,
  { timeout: 10_000 }
);

// Replace the rendered board with ShareCard only.
await page.evaluate(({ nation, lang }) => {
  document.body.innerHTML = '<div id="bake" style="position:fixed;top:0;left:0;width:1200px;height:630px;background:#0C0820;overflow:hidden"></div>';
  const row = window.DROUGHT.find((r) => r.nation === nation);
  const root = window.ReactDOM.createRoot(document.getElementById("bake"));
  root.render(window.React.createElement(window.ShareCard, { row, lang }));
}, { nation: NATION, lang: LANG });

// Fonts + YearsNumber count-up settle.
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(1500);

await page.screenshot({
  path: OUT,
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
console.log(`[bake] wrote ${OUT}  (nation=${NATION}, lang=${LANG})`);
await browser.close();

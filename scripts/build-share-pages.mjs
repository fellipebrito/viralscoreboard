// Build /s/<nation>(.<lang>).html shells from data.js.
// Each is a tiny HTML with per-nation og:title + canonical, plus a
// meta-refresh + JS redirect to /?nation=&lang= so humans land on the
// live board with the right nation pre-selected.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "data.js"), "utf8");

// data.js attaches to a `window` object; give it a shim and capture.
const ctx = {};
new Function("window", src)(ctx);
const { DROUGHT, NATION } = ctx;
if (!DROUGHT || !NATION) throw new Error("data.js did not expose DROUGHT/NATION on the shim");

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function template(row, lang) {
  const nation = NATION[row.nation][lang];
  const yearWord = lang === "pt" ? "anos" : "years";
  const title = `${nation} — ${row.years} ${yearWord} · Champions' Drought Board`;
  const desc = lang === "pt"
    ? `${row.years} anos desde que ${nation} venceu um campeão mundial em Copa.`
    : `${row.years} years since ${nation} last beat a fellow World Cup champion.`;
  // Relative paths so it works under a project URL (e.g. fellipebrito.github.io/viralscoreboard/).
  const target = `../?nation=${encodeURIComponent(row.nation)}&lang=${lang}`;
  return `<!doctype html>
<html lang="${lang === "pt" ? "pt-BR" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(desc)}">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(desc)}">
<meta property="og:image" content="../og-image.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(desc)}">
<meta name="twitter:image" content="../og-image.png">
<link rel="canonical" href="${escape(target)}">
<meta http-equiv="refresh" content="0; url=${escape(target)}">
</head>
<body><script>location.replace(${JSON.stringify(target)});</script></body>
</html>`;
}

const outDir = path.join(root, "s");
fs.mkdirSync(outDir, { recursive: true });

let count = 0;
for (const row of DROUGHT) {
  for (const lang of ["en", "pt"]) {
    const file = lang === "en" ? `${row.nation}.html` : `${row.nation}.${lang}.html`;
    fs.writeFileSync(path.join(outDir, file), template(row, lang));
    count++;
  }
}
console.log(`Wrote ${count} share pages to /s/`);

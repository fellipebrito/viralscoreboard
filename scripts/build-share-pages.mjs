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

const SITE = "https://fellipebrito.github.io/viralscoreboard";
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function template(row, lang) {
  const nation = NATION[row.nation][lang];
  const beat = NATION[row.beat][lang];
  const yearWord = lang === "pt" ? "anos" : "years";
  const title = `${nation} — ${row.years} ${yearWord} · Champions' Drought Board`;
  const desc = lang === "pt"
    ? `Placar da Seca dos Campeões: ${nation} não vence outro campeão mundial em Copa há ${row.years} anos — desde ${row.wc}, contra ${beat}. Contadores avançam por dia.`
    : `Champions' Drought Board: ${nation} hasn't beaten a fellow World Cup champion in ${row.years} years — since the ${row.wc} World Cup, against ${beat}. Counters tick daily.`;
  const fileName = lang === "en" ? `${row.nation}.html` : `${row.nation}.${lang}.html`;
  const absoluteUrl = `${SITE}/s/${fileName}`;
  const absoluteImage = `${SITE}/og-image.png`;
  // Relative paths for the redirect so it works under a project URL.
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
<meta property="og:image" content="${escape(absoluteImage)}">
<meta property="og:url" content="${escape(absoluteUrl)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(desc)}">
<meta name="twitter:image" content="${escape(absoluteImage)}">
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

// Build /sem-ganhar-de-um-campeao/s/<nation>.html shells from the
// dashboard's data.js + write legacy /s/<nation>(.pt).html redirects
// that point at the new location (best Pages can do; no real 301).
//
// The dashboard is pt-BR by default; no per-lang share variants here.
// The engine still supports both langs (data.js#STR), so an English
// twin site can ship its own bake later.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DASHBOARD_SLUG = "sem-ganhar-de-um-campeao";
const dashboardDir = path.join(root, DASHBOARD_SLUG);
const src = fs.readFileSync(path.join(dashboardDir, "data.js"), "utf8");

// data.js attaches to a `window` object; give it a shim and capture.
const ctx = {};
new Function("window", src)(ctx);
const { DROUGHT, NATION } = ctx;
if (!DROUGHT || !NATION) throw new Error("data.js did not expose DROUGHT/NATION on the shim");

const SITE = "https://umtempao.com";
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function template(row) {
  const nation = NATION[row.nation].pt;
  const beat = NATION[row.beat].pt;
  const title = `${nation} — ${row.years} anos · Sem ganhar de um campeão`;
  const desc = `Sem ganhar de um campeão: ${nation} não vence outro campeão mundial em Copa há ${row.years} anos — desde ${row.wc}, contra ${beat}. Contadores avançam por dia.`;
  const absoluteUrl = `${SITE}/${DASHBOARD_SLUG}/s/${row.nation}.html`;
  const absoluteImage = `${SITE}/${DASHBOARD_SLUG}/og/${row.nation}.png`;
  // Relative redirect into the dashboard root with the right nation pre-selected.
  const target = `../?nation=${encodeURIComponent(row.nation)}`;
  return `<!doctype html>
<html lang="pt-BR">
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
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(desc)}">
<meta name="twitter:image" content="${escape(absoluteImage)}">
<link rel="canonical" href="${escape(absoluteUrl)}">
<meta http-equiv="refresh" content="0; url=${escape(target)}">
</head>
<body><script>location.replace(${JSON.stringify(target)});</script></body>
</html>`;
}

// Legacy /s/<nation>.html (and .pt.html) — soft-redirects to new path.
// Best we can do on raw Pages (no .htaccess / no edge config).
function legacyRedirect(row) {
  const target = `/${DASHBOARD_SLUG}/s/${row.nation}.html`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Movido — Sem ganhar de um campeão</title>
<link rel="canonical" href="${SITE}${target}">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body><script>location.replace(${JSON.stringify(target)});</script></body>
</html>`;
}

const outDir = path.join(dashboardDir, "s");
const legacyDir = path.join(root, "s");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(legacyDir, { recursive: true });

// Wipe the dashboard /s/ first so stale `.pt.html` from the bilingual era don't linger.
for (const f of fs.readdirSync(outDir)) fs.unlinkSync(path.join(outDir, f));

let count = 0;
for (const row of DROUGHT) {
  fs.writeFileSync(path.join(outDir, `${row.nation}.html`), template(row));
  fs.writeFileSync(path.join(legacyDir, `${row.nation}.html`), legacyRedirect(row));
  fs.writeFileSync(path.join(legacyDir, `${row.nation}.pt.html`), legacyRedirect(row));
  count++;
}
console.log(`Wrote ${count} share pages to /${DASHBOARD_SLUG}/s/`);
console.log(`Wrote ${count * 2} legacy redirect shells to /s/`);

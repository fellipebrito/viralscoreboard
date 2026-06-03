// ── build-ulv-share.mjs ───────────────────────────────────────
// Per-(nation × stage) share shells at /a-ultima-vez/s/<slug>-<stage>.html.
// Each carries its own OG meta (→ a-ultima-vez/og/<slug>-<stage>.png) and
// soft-redirects to the live country view (?n=<slug>). Mirrors
// build-share-pages.mjs for the champions board.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://umtempao.com";
const DASH = "a-ultima-vez";
const nations = JSON.parse(fs.readFileSync(path.join(root, "data", "nations.json"), "utf8"));
const STAGES = ["qf", "sf", "final"];
const STAGE_PT = { qf: "quartas de final", sf: "semifinal", final: "final" };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function copy(n, stage) {
  const a = n.anchors[stage];
  if (a && a.date) return { title: `${n.name} — última ${STAGE_PT[stage]}: ${a.year}`,
    desc: `${n.name} não chega à ${STAGE_PT[stage]} de Copa desde ${a.year}. Contador avança por dia.` };
  if (n.appearances === 0) return { title: `${n.name} — estreante na Copa de 2026`,
    desc: `${n.name} disputa sua primeira Copa do Mundo em 2026.` };
  return { title: `${n.name} — nunca jogou uma ${STAGE_PT[stage]}`,
    desc: `${n.name} nunca chegou à ${STAGE_PT[stage]} de Copa em ${n.appearances} participações desde ${n.firstAppearance.year}.` };
}

function shell(n, stage) {
  const { title, desc } = copy(n, stage);
  const url = `${SITE}/${DASH}/s/${n.slug}-${stage}.html`;
  const img = `${SITE}/${DASH}/og/${n.slug}-${stage}.png`;
  const target = `../?n=${encodeURIComponent(n.slug)}`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<link rel="canonical" href="${esc(url)}">
<meta http-equiv="refresh" content="0; url=${esc(target)}">
</head>
<body><script>location.replace(${JSON.stringify(target)});</script></body>
</html>`;
}

const outDir = path.join(root, DASH, "s");
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (f.endsWith(".html")) fs.unlinkSync(path.join(outDir, f));

let count = 0;
for (const n of nations) for (const stage of STAGES) {
  fs.writeFileSync(path.join(outDir, `${n.slug}-${stage}.html`), shell(n, stage));
  count++;
}
console.log(`Wrote ${count} share shells to /${DASH}/s/`);

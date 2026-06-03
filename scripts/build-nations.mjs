// ── build-nations.mjs ─────────────────────────────────────────
// "A Última Vez" data pipeline. Downloads the jfjelstul/worldcup
// matches.csv, derives last-quartas/semi/final + full run timeline
// per nation, joins the 2026-qualified flag, and writes
// data/nations.json. FAILS THE BUILD (exit 1) if any test gate fails.
//
// Derivation logic is a faithful port of reference-derivation.py
// (validated 2026-06-03) — DO NOT re-derive the rules here. Era →
// stage mapping lives in data/tournament-formats.json (data, not
// code branches). No stage year is written from memory; every number
// comes from the CSV.
//
//   node scripts/build-nations.mjs            → download (cached) + build + gate
//   node scripts/build-nations.mjs --offline  → use data/sources/matches.csv as-is
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const CSV_URL = "https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/matches.csv";
const CSV_PATH = path.join(dataDir, "sources", "matches.csv");

// ── PT-BR display name + slug per dataset (post-successor) nation ──
// Slug = lowercase, accents stripped, spaces → hyphens. Reference data,
// not derived — stage numbers never come from here.
const META = {
  "Brazil":               { pt: "Brasil",                          slug: "brasil" },
  "Germany":              { pt: "Alemanha",                        slug: "alemanha" },
  "Argentina":            { pt: "Argentina",                       slug: "argentina" },
  "Italy":                { pt: "Itália",                          slug: "italia" },
  "Mexico":               { pt: "México",                          slug: "mexico" },
  "England":              { pt: "Inglaterra",                      slug: "inglaterra" },
  "France":               { pt: "França",                          slug: "franca" },
  "Spain":                { pt: "Espanha",                         slug: "espanha" },
  "Belgium":              { pt: "Bélgica",                         slug: "belgica" },
  "Uruguay":              { pt: "Uruguai",                         slug: "uruguai" },
  "Serbia":               { pt: "Sérvia",                          slug: "servia" },
  "Sweden":               { pt: "Suécia",                          slug: "suecia" },
  "Switzerland":          { pt: "Suíça",                           slug: "suica" },
  "Netherlands":          { pt: "Holanda",                         slug: "holanda" },
  "Russia":               { pt: "Rússia",                          slug: "russia" },
  "South Korea":          { pt: "Coreia do Sul",                   slug: "coreia-do-sul" },
  "United States":        { pt: "Estados Unidos",                  slug: "estados-unidos" },
  "Chile":                { pt: "Chile",                           slug: "chile" },
  "Czech Republic":       { pt: "República Tcheca",                slug: "republica-tcheca" },
  "Hungary":              { pt: "Hungria",                         slug: "hungria" },
  "Poland":               { pt: "Polônia",                         slug: "polonia" },
  "Cameroon":             { pt: "Camarões",                        slug: "camaroes" },
  "Paraguay":             { pt: "Paraguai",                        slug: "paraguai" },
  "Portugal":             { pt: "Portugal",                        slug: "portugal" },
  "Scotland":             { pt: "Escócia",                         slug: "escocia" },
  "Austria":              { pt: "Áustria",                         slug: "austria" },
  "Bulgaria":             { pt: "Bulgária",                        slug: "bulgaria" },
  "Japan":                { pt: "Japão",                           slug: "japao" },
  "Romania":              { pt: "Romênia",                         slug: "romenia" },
  "Australia":            { pt: "Austrália",                       slug: "australia" },
  "Colombia":             { pt: "Colômbia",                        slug: "colombia" },
  "Costa Rica":           { pt: "Costa Rica",                      slug: "costa-rica" },
  "Croatia":              { pt: "Croácia",                         slug: "croacia" },
  "Denmark":              { pt: "Dinamarca",                       slug: "dinamarca" },
  "Iran":                 { pt: "Irã",                             slug: "ira" },
  "Morocco":              { pt: "Marrocos",                        slug: "marrocos" },
  "Nigeria":              { pt: "Nigéria",                         slug: "nigeria" },
  "Saudi Arabia":         { pt: "Arábia Saudita",                  slug: "arabia-saudita" },
  "Tunisia":              { pt: "Tunísia",                         slug: "tunisia" },
  "Peru":                 { pt: "Peru",                            slug: "peru" },
  "Algeria":              { pt: "Argélia",                         slug: "argelia" },
  "Ecuador":              { pt: "Equador",                         slug: "equador" },
  "Ghana":                { pt: "Gana",                            slug: "gana" },
  "Bolivia":              { pt: "Bolívia",                         slug: "bolivia" },
  "Egypt":                { pt: "Egito",                           slug: "egito" },
  "Greece":               { pt: "Grécia",                          slug: "grecia" },
  "Honduras":             { pt: "Honduras",                        slug: "honduras" },
  "Ivory Coast":          { pt: "Costa do Marfim",                 slug: "costa-do-marfim" },
  "Northern Ireland":     { pt: "Irlanda do Norte",               slug: "irlanda-do-norte" },
  "Norway":               { pt: "Noruega",                         slug: "noruega" },
  "Republic of Ireland":  { pt: "Irlanda",                         slug: "irlanda" },
  "Senegal":              { pt: "Senegal",                         slug: "senegal" },
  "South Africa":         { pt: "África do Sul",                   slug: "africa-do-sul" },
  "Canada":               { pt: "Canadá",                          slug: "canada" },
  "El Salvador":          { pt: "El Salvador",                     slug: "el-salvador" },
  "New Zealand":          { pt: "Nova Zelândia",                   slug: "nova-zelandia" },
  "North Korea":          { pt: "Coreia do Norte",                 slug: "coreia-do-norte" },
  "Slovenia":             { pt: "Eslovênia",                       slug: "eslovenia" },
  "Turkey":               { pt: "Turquia",                         slug: "turquia" },
  "Wales":                { pt: "País de Gales",                   slug: "pais-de-gales" },
  "Angola":               { pt: "Angola",                          slug: "angola" },
  "Bosnia and Herzegovina": { pt: "Bósnia e Herzegovina",         slug: "bosnia-e-herzegovina" },
  "China":                { pt: "China",                           slug: "china" },
  "Cuba":                 { pt: "Cuba",                            slug: "cuba" },
  "DR Congo":             { pt: "RD Congo",                        slug: "rd-congo" },
  "Haiti":                { pt: "Haiti",                           slug: "haiti" },
  "Iceland":              { pt: "Islândia",                        slug: "islandia" },
  "Indonesia":            { pt: "Indonésia",                       slug: "indonesia" },
  "Iraq":                 { pt: "Iraque",                          slug: "iraque" },
  "Israel":               { pt: "Israel",                          slug: "israel" },
  "Jamaica":              { pt: "Jamaica",                         slug: "jamaica" },
  "Kuwait":               { pt: "Kuwait",                          slug: "kuwait" },
  "Panama":               { pt: "Panamá",                          slug: "panama" },
  "Qatar":                { pt: "Catar",                           slug: "catar" },
  "Slovakia":             { pt: "Eslováquia",                      slug: "eslovaquia" },
  "Togo":                 { pt: "Togo",                            slug: "togo" },
  "Trinidad and Tobago":  { pt: "Trinidad e Tobago",               slug: "trinidad-e-tobago" },
  "Ukraine":              { pt: "Ucrânia",                         slug: "ucrania" },
  "United Arab Emirates": { pt: "Emirados Árabes Unidos",          slug: "emirados-arabes-unidos" },
};

// FIFA record inheritance (brief §3). East Germany has no successor → excluded.
const SUCC = {
  "West Germany": "Germany",
  "Soviet Union": "Russia",
  "Czechoslovakia": "Czech Republic",
  "Yugoslavia": "Serbia",
  "FR Yugoslavia": "Serbia",
  "Serbia and Montenegro": "Serbia",
  "Zaire": "DR Congo",
  "Dutch East Indies": "Indonesia",
};
const INHERITED = new Set(Object.keys(SUCC)); // for the footnote marker
const EXCLUDE = new Set(["East Germany"]);
const succTeam = (n) => SUCC[n] || n;

// FIFA tri-codes ≠ the dataset's ISO-3166 codes. Flags are keyed by FIFA
// code (public/flags/<fifa>.svg). Default = dataset code lowercased; the
// map below overrides every nation where FIFA differs from ISO.
const FIFA_OVERRIDE = {
  "Germany": "ger", "Netherlands": "ned", "Uruguay": "uru", "Switzerland": "sui",
  "Portugal": "por", "Denmark": "den", "Croatia": "cro", "Bulgaria": "bul",
  "Paraguay": "par", "Chile": "chi", "South Africa": "rsa", "Greece": "gre",
  "Honduras": "hon", "Costa Rica": "crc", "Trinidad and Tobago": "tri", "Haiti": "hai",
  "Algeria": "alg", "Angola": "ang", "Togo": "tog", "Saudi Arabia": "ksa",
  "Kuwait": "kuw", "United Arab Emirates": "uae",
};
const fifaOf = (team, isoCode) => FIFA_OVERRIDE[team] || isoCode;

// ── tiny RFC-4180-ish CSV parser (match names contain commas) ─────
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

async function loadCSV() {
  const offline = process.argv.includes("--offline");
  if (!offline) {
    process.stdout.write(`[build] downloading ${CSV_URL}\n`);
    const res = await fetch(CSV_URL);
    if (!res.ok) throw new Error(`CSV download failed: HTTP ${res.status}`);
    const text = await res.text();
    fs.mkdirSync(path.dirname(CSV_PATH), { recursive: true });
    fs.writeFileSync(CSV_PATH, text);
    return text;
  }
  process.stdout.write(`[build] --offline: reading ${CSV_PATH}\n`);
  return fs.readFileSync(CSV_PATH, "utf8");
}

// ── main ──────────────────────────────────────────────────────
const csvText = await loadCSV();
const formats = JSON.parse(fs.readFileSync(path.join(dataDir, "tournament-formats.json"), "utf8"));
const q2026 = JSON.parse(fs.readFileSync(path.join(dataDir, "qualified-2026.json"), "utf8"));

const TRACKED = formats.trackedBuckets;     // stage_name -> qf/sf/final
const FINE = formats.fineStages;            // stage_name -> group..final
const FORDER = formats.stageOrder;          // {group:1 ... champion:6}
const TORDER = { qf: 1, sf: 2, final: 3 };  // tracked-bucket order (matches reference)
const FNAME = Object.fromEntries(Object.entries(FORDER).map(([k, v]) => [v, k]));

// CRITICAL: the dataset includes women's World Cups — filter to Men's.
const rows = parseCSV(csvText).filter((r) => (r.tournament_name || "").includes("Men's"));

const deepest = new Map();     // "team|year" -> tracked level (qf/sf/final)
const finedeep = new Map();    // "team|year" -> fine level (group..champion)
const appearances = new Map(); // team -> Set<year>
const codeOf = new Map();      // team -> ISO code (most recent appearance)
const codeYear = new Map();
const inheritedRow = new Map();// team -> true if any contributing match used an old federation name
const firstDate = new Map();   // team -> earliest match date (first appearance anchor)
const stageDate = new Map();   // "team|year|stage_name" -> latest match date at that exact stage
const mx = (m, k, v) => m.set(k, Math.max(m.get(k) || 0, v));
const minDate = (m, k, d) => { if (!m.has(k) || d < m.get(k)) m.set(k, d); };
const maxDate = (m, k, d) => { if (!m.has(k) || d > m.get(k)) m.set(k, d); };

for (const r of rows) {
  const date = r.match_date;          // YYYY-MM-DD, day-accurate
  const year = parseInt(date.slice(0, 4), 10);
  const sides = [
    { raw: r.home_team_name, code: r.home_team_code },
    { raw: r.away_team_name, code: r.away_team_code },
  ];
  for (const { raw, code } of sides) {
    if (EXCLUDE.has(raw)) continue;
    const t = succTeam(raw);
    if (!appearances.has(t)) appearances.set(t, new Set());
    appearances.get(t).add(year);
    if (INHERITED.has(raw)) inheritedRow.set(t, true);
    if (year >= (codeYear.get(t) || 0)) { codeYear.set(t, year); codeOf.set(t, (code || "").toLowerCase()); }
    minDate(firstDate, t, date);
    maxDate(stageDate, `${t}|${year}|${r.stage_name}`, date);
  }
  const tb = TRACKED[r.stage_name];
  const fb = FINE[r.stage_name] || "group";
  for (const { raw } of sides) {
    if (EXCLUDE.has(raw)) continue;
    const t = succTeam(raw);
    if (tb) mx(deepest, `${t}|${year}`, TORDER[tb]);
    mx(finedeep, `${t}|${year}`, FORDER[fb]);
  }
}

// Champions: winner of the 'final' match each year (win flags encode pen
// shootouts), plus the 1950 special case from tournament-formats.json.
const champByYear = {};
for (const r of rows) {
  if (r.stage_name.toLowerCase() === "final") {
    const year = parseInt(r.match_date.slice(0, 4), 10);
    const winner = r.home_team_win === "1" ? r.home_team_name : r.away_team_name;
    champByYear[year] = succTeam(winner);
  }
}
Object.assign(champByYear, formats.specialCases.champions); // 1950 -> Uruguay
for (const [year, t] of Object.entries(champByYear)) {
  mx(finedeep, `${t}|${year}`, FORDER.champion);
}

// 1950: promote the two final-round finalists to 'final' in tracked logic.
for (const [year, finalists] of Object.entries(formats.specialCases.finalRoundFinalists)) {
  for (const t of finalists) mx(deepest, `${t}|${year}`, TORDER.final);
}

// Cumulative: a deeper tracked stage grants every shallower stage that year.
const lastStageOf = (team) => {
  const out = {};
  for (const y of appearances.get(team)) {
    const lvl = deepest.get(`${team}|${y}`) || 0;
    for (const [name, l] of Object.entries(TORDER)) {
      if (lvl >= l) out[name] = Math.max(out[name] || 0, y);
    }
  }
  return out; // {} when never top-8 → "Nunca" in the UI
};

// 1950 had no discrete final; the decisive Uruguay–Brazil match IS the final.
const decisive1950 = (() => {
  const m = rows.find((r) => r.stage_name.toLowerCase() === "final round" &&
    r.match_date.startsWith("1950") &&
    [r.home_team_name, r.away_team_name].includes("Uruguay") &&
    [r.home_team_name, r.away_team_name].includes("Brazil"));
  return m ? m.match_date : null;
})();

// Anchor each counter to the actual match date of the relevant stage (day-accurate).
// Preferred stage_name per bucket, with era fallbacks; takes the most recent qualifying year.
const ANCHOR_STAGES = {
  qf: ["quarter-finals", "second group stage"],
  sf: ["semi-finals", "final round", "third-place match"],
  final: ["final"],
};
const anchorsOf = (team, last) => {
  const out = {};
  for (const [bucket, year] of Object.entries(last)) {
    let date = null;
    for (const s of ANCHOR_STAGES[bucket]) {
      const d = stageDate.get(`${team}|${year}|${s}`);
      if (d) { date = d; break; }
    }
    if (!date && bucket === "final" && year === 1950) date = decisive1950; // 1950 Uru/Bra
    out[bucket] = { year, date };
  }
  return out;
};

const runsOf = (team) =>
  [...appearances.get(team)]
    .sort((a, b) => b - a)
    .map((y) => ({ year: y, deepest: FNAME[finedeep.get(`${team}|${y}`) || FORDER.group] }));

const bestOf = (team) => {
  const years = [...appearances.get(team)];
  const top = Math.max(...years.map((y) => finedeep.get(`${team}|${y}`) || FORDER.group));
  return { stage: FNAME[top], years: years.filter((y) => (finedeep.get(`${team}|${y}`) || 0) === top).sort((a, b) => a - b) };
};

// ── assemble nations (historical 79) ──────────────────────────
const qualifiedSet = new Set(q2026.qualified);
const nations = [];
for (const team of appearances.keys()) {
  const meta = META[team];
  if (!meta) throw new Error(`[build] missing PT-BR META for dataset nation "${team}"`);
  const fifa = fifaOf(team, codeOf.get(team));
  const last = lastStageOf(team);
  const firstYear = Math.min(...appearances.get(team));
  nations.push({
    slug: meta.slug,
    name: meta.pt,
    nameEn: team,
    code: codeOf.get(team),            // ISO-3166 alpha-3, lowercase (dataset's *_team_code)
    fifa,                              // FIFA tri-code, lowercase
    flag: fifa,                        // flags keyed by FIFA code → public/flags/<fifa>.svg
    appearances: appearances.get(team).size,
    qualified2026: qualifiedSet.has(team),
    inherited: inheritedRow.has(team) || undefined,
    firstAppearance: { year: firstYear, date: firstDate.get(team) },
    lastStage: last,
    anchors: anchorsOf(team, last), // day-accurate counter anchors per tracked stage
    best: bestOf(team),
    runs: runsOf(team),
  });
}

// ── 2026 debutants (no dataset history): appearances 0, all "Nunca" ──
for (const d of q2026.debutants) {
  if (appearances.has(d.name)) throw new Error(`[build] "${d.name}" listed as debutant but has dataset history`);
  nations.push({
    slug: d.slug, name: d.pt, nameEn: d.name, code: d.code, fifa: d.code, flag: d.code,
    appearances: 0, qualified2026: true, debutant2026: true,
    firstAppearance: { year: 2026, date: "2026-06-11" }, // tournament start; no dataset history
    lastStage: {}, anchors: {}, best: { stage: "none", years: [] }, runs: [],
  });
}

// Default sort: most Copas played, desc (tie → PT name).
nations.sort((a, b) => b.appearances - a.appearances || a.name.localeCompare(b.name, "pt"));

// ── TEST GATES (brief §validation + this prompt) ──────────────
// Faithful to reference-derivation.py. Build FAILS if any fails.
const byEn = Object.fromEntries(nations.map((n) => [n.nameEn, n]));
const bySlug = Object.fromEntries(nations.map((n) => [n.slug, n]));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const gates = [];
const gate = (name, ok, detail) => gates.push({ name, ok, detail });

gate("Brasil lastStage qf2022/sf2014/final2002", eq(byEn["Brazil"].lastStage, { qf: 2022, sf: 2014, final: 2002 }), byEn["Brazil"].lastStage);
gate("Inglaterra lastStage qf2022/sf2018/final1966", eq(byEn["England"].lastStage, { qf: 2022, sf: 2018, final: 1966 }), byEn["England"].lastStage);
gate("Peru lastStage qf=1978 only", eq(byEn["Peru"].lastStage, { qf: 1978 }), byEn["Peru"].lastStage);
gate("Áustria lastStage qf=1982 sf=1954", eq(byEn["Austria"].lastStage, { qf: 1982, sf: 1954 }), byEn["Austria"].lastStage);
gate("Brasil appearances = 22", byEn["Brazil"].appearances === 22, byEn["Brazil"].appearances);
gate("Total nations = 79 historical + 4 debutants = 83", nations.length === 83, nations.length);
gate("79 historical (with World Cup history)", nations.filter((n) => n.appearances > 0).length === 79, nations.filter((n) => n.appearances > 0).length);
// A never-top-8 nation renders "Nunca" without crashing: lastStage is {} and best.stage is a string.
const neverTop8 = nations.find((n) => n.appearances > 0 && Object.keys(n.lastStage).length === 0);
gate("Never-top-8 nation renders 'Nunca' (empty lastStage, valid best)", !!neverTop8 && typeof neverTop8.best.stage === "string", neverTop8 && neverTop8.nameEn);
gate("48 nations flagged qualified2026", nations.filter((n) => n.qualified2026).length === 48, nations.filter((n) => n.qualified2026).length);

const failed = gates.filter((g) => !g.ok);
for (const g of gates) process.stdout.write(`  ${g.ok ? "✓" : "✗"} ${g.name}${g.ok ? "" : `  → got ${JSON.stringify(g.detail)}`}\n`);
if (failed.length) {
  process.stderr.write(`\n[build] ${failed.length} GATE(S) FAILED — refusing to write nations.json\n`);
  process.exit(1);
}

const json = JSON.stringify(nations, null, 2);
fs.writeFileSync(path.join(dataDir, "nations.json"), json + "\n");
// Window-attached twin for the static SPA loader (same pattern as the
// champions board's data.js — avoids fetch/Babel ordering races).
fs.writeFileSync(path.join(root, "a-ultima-vez", "nations.data.js"),
  `// GENERATED by scripts/build-nations.mjs — do not edit. Canonical: data/nations.json\nwindow.NATIONS = ${json};\n`);
process.stdout.write(`\n[build] ✓ all ${gates.length} gates pass — wrote data/nations.json + a-ultima-vez/nations.data.js (${nations.length} nations)\n`);

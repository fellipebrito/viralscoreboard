/* global React */
// ── Counter Engine + i18n (PT-BR / EN) ────────────────────────
// Counts UP from an anchor match date (full YYYY-MM-DD from the CSV)
// to now, client-side. Shared by the table flip, country-page hero
// counters, and the share-card bake. Every UI string lives here in
// both languages; pt is the default (umtempao.com is pt-BR).

// Whole years + remaining days between an ISO date and now (UTC, day-accurate).
function elapsed(fromISO, now = new Date()) {
  const f = new Date(fromISO + "T00:00:00Z");
  let years = now.getUTCFullYear() - f.getUTCFullYear();
  const anniv = Date.UTC(now.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate());
  if (now.getTime() < anniv) years--;
  const last = Date.UTC(f.getUTCFullYear() + years, f.getUTCMonth(), f.getUTCDate());
  const days = Math.floor((now.getTime() - last) / 86400000);
  return { years, days };
}

const lz = (obj, lang) => (obj ? (obj[lang] || obj.pt) : "");

// Stage nouns (inline, e.g. "última vez nas quartas") and the
// "never reached ___" phrase, both languages.
const STAGE = {
  qf:    { pt: "quartas",    en: "quarterfinals" },
  sf:    { pt: "semifinal",  en: "semifinals" },
  final: { pt: "final",      en: "final" },
};
const STAGE_VERB = {
  qf:    { pt: "umas quartas de final", en: "the quarterfinals" },
  sf:    { pt: "uma semifinal",         en: "a semifinal" },
  final: { pt: "uma final",             en: "a final" },
};
const RUN_LABEL = {
  champion: { pt: "Campeão",         en: "Champion" },
  final:    { pt: "Final",           en: "Final" },
  sf:       { pt: "Semifinal",       en: "Semifinal" },
  qf:       { pt: "Quartas",         en: "Quarterfinals" },
  r16:      { pt: "Oitavas",         en: "Round of 16" },
  group:    { pt: "Fase de grupos",  en: "Group stage" },
};

// "23 anos, 361 dias" / "23 years, 361 days"
function fmt(fromISO, now, lang = "pt") {
  const { years, days } = elapsed(fromISO, now);
  if (lang === "en") return `${years} ${years === 1 ? "year" : "years"}, ${days} ${days === 1 ? "day" : "days"}`;
  return `${years} ${years === 1 ? "ano" : "anos"}, ${days} ${days === 1 ? "dia" : "dias"}`;
}

// Compact "23a 361d" / "23y 361d" for tight table cells.
function fmtShort(fromISO, now, lang = "pt") {
  const { years, days } = elapsed(fromISO, now);
  return lang === "en" ? `${years}y ${days}d` : `${years}a ${days}d`;
}

// ── UI strings ────────────────────────────────────────────────
const I18N = {
  title:      { pt: "A última vez", en: "The last time" },
  tagline:    { pt: "Toda seleção que já jogou uma Copa do Mundo — quão longe chegou e há quanto tempo. Toque num ano para o contador.",
                en: "Every nation that has ever played a World Cup — how far it went, and how long ago. Tap a year for the counter." },
  filterAll:  { pt: "Todas",                   en: "All" },
  filter2026: { pt: "Classificadas para 2026", en: "Qualified for 2026" },
  colTeam:    { pt: "Seleção", en: "Team" },
  colCups:    { pt: "Copas",   en: "World Cups" },
  colQf:      { pt: "Últimas quartas", en: "Last quarterfinal" },
  colSf:      { pt: "Última semi",     en: "Last semifinal" },
  colFinal:   { pt: "Última final",    en: "Last final" },
  never:      { pt: "Nunca", en: "Never" },
  tapCounter: { pt: "toque para o contador", en: "tap for the counter" },
  footnote:   { pt: "✻ herda o histórico da federação anterior (FIFA). Dados: Copas masculinas 1930–2022 · 48 classificadas para 2026.",
                en: "✻ inherits the predecessor federation's record (FIFA). Data: men's World Cups 1930–2022 · 48 qualified for 2026." },
  backAll:    { pt: "‹ Todas as seleções", en: "‹ All teams" },
  best:       { pt: "melhor", en: "best" },
  cupOne:     { pt: "Copa", en: "World Cup" },
  cupMany:    { pt: "Copas", en: "World Cups" },
  history:    { pt: "Histórico", en: "History" },
  // counter subtitles — {Y}=year, {S}=stage noun, {V}=stage verb, {N}=name, {A}=appearances
  since:      { pt: "desde {Y} — última vez nas {S}", en: "since {Y} — last time in the {S}" },
  neverSub:   { pt: "jogando Copas desde {Y} sem nunca chegar a {V}", en: "playing World Cups since {Y} without ever reaching {V}" },
  debutBig:   { pt: "Estreante", en: "Debutant" },
  debutSub:   { pt: "{N} estreia na Copa de 2026", en: "{N} makes its World Cup debut in 2026" },
};
const fill = (tpl, map) => Object.entries(map).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), tpl);

// Language-aware nation name (EN names live in nations.json as nameEn).
const nm = (nation, lang) => (lang === "en" ? nation.nameEn : nation.name);

// Live tick — re-render on an interval so the day rolls over without reload.
function useNow(intervalMs = 1000) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

Object.assign(window, { elapsed, fmt, fmtShort, lz, fill, nm, useNow, STAGE, STAGE_VERB, RUN_LABEL, I18N });

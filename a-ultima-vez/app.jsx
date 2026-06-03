/* global React, ReactDOM */
// ── A Última Vez — all-time World Cup stage-history board ──────
// Static SPA (React-UMD + Babel), same stack as the champions board.
// Routing: /a-ultima-vez/ shows the table; ?n=<slug> shows a country
// page. ?lang=en switches to English (default pt-BR).
const { Flag, fmt, fmtShort, useNow, lz, fill, nm, STAGE, STAGE_VERB, RUN_LABEL, I18N } = window;
const NATIONS = window.NATIONS;
const bySlug = Object.fromEntries(NATIONS.map((n) => [n.slug, n]));
const STAGES = ["qf", "sf", "final"];
const COL = { qf: I18N.colQf, sf: I18N.colSf, final: I18N.colFinal };

function readInitial() {
  const p = new URLSearchParams(location.search);
  return { lang: p.get("lang") === "en" ? "en" : "pt", slug: p.get("n") };
}

// ── EN / PT flag toggle, top-right (bra = pt, eng = en) ────────
function LangToggle({ lang, setLang }) {
  const btn = (val, code, label) => (
    <button onClick={() => setLang(val)} aria-label={label} aria-pressed={lang === val}
      style={{
        background: "transparent", border: "none", padding: 4, cursor: "pointer",
        opacity: lang === val ? 1 : 0.4, transition: "opacity 0.15s", lineHeight: 0,
        outline: lang === val ? "2px solid var(--sx-cyan)" : "2px solid transparent",
      }}>
      <Flag code={code} size={32} title={label} />
    </button>
  );
  return (
    <div style={{
      position: "fixed", top: 12, right: 12, zIndex: 50, display: "flex", gap: 6, padding: 6,
      background: "var(--sx-crt-900)", border: "2px solid var(--sx-crt-600)", boxShadow: "4px 4px 0 rgba(0,0,0,0.5)",
    }}>
      {btn("pt", "bra", "Português")}
      {btn("en", "eng", "English")}
    </div>
  );
}

// ── year ↔ live counter flip cell ─────────────────────────────
function FlipYear({ anchor, now, lang }) {
  const [flip, setFlip] = React.useState(false);
  if (!anchor || !anchor.date) {
    return <span style={{ color: "var(--sx-ink-faint)", fontWeight: 700 }}>{lz(I18N.never, lang)}</span>;
  }
  return (
    <span
      onMouseEnter={() => setFlip(true)} onMouseLeave={() => setFlip(false)}
      onClick={(e) => { e.stopPropagation(); setFlip((f) => !f); }}
      style={{
        cursor: "pointer", fontVariantNumeric: "tabular-nums", fontWeight: 700,
        color: flip ? "var(--sx-cyan)" : "var(--sx-ink)", whiteSpace: "nowrap",
      }}
      title={lz(I18N.tapCounter, lang)}>
      {flip ? fmtShort(anchor.date, now, lang) : anchor.year}
    </span>
  );
}

// ── sortable table ────────────────────────────────────────────
function Board({ lang }) {
  const now = useNow();
  const [only2026, setOnly2026] = React.useState(false);
  const [sort, setSort] = React.useState({ key: "appearances", dir: "desc" });

  const sortVal = (n, key) =>
    key === "name" ? nm(n, lang) :
    key === "appearances" ? n.appearances :
    (n.lastStage[key] || -1);

  const rows = React.useMemo(() => {
    const list = NATIONS.filter((n) => (only2026 ? n.qualified2026 : true));
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const va = sortVal(a, sort.key), vb = sortVal(b, sort.key);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return nm(a, lang).localeCompare(nm(b, lang), lang);
    });
  }, [only2026, sort, lang]);

  const onSort = (key) =>
    setSort((s) => s.key === key
      ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
      : { key, dir: key === "name" ? "asc" : "desc" });

  const Th = ({ k, children, align = "left" }) => (
    <th onClick={() => onSort(k)} style={{
      textAlign: align, padding: "10px 12px", cursor: "pointer", userSelect: "none",
      font: "var(--ttt-t-micro)", letterSpacing: "0.1em", textTransform: "uppercase",
      color: sort.key === k ? "var(--sx-cyan)" : "var(--sx-ink-dim)",
      borderBottom: "2px solid var(--sx-crt-600)", whiteSpace: "nowrap",
    }}>
      {children}{sort.key === k ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px 80px" }}>
      <h1 style={{ font: "700 38px/1.05 var(--ttt-font-display)", color: "var(--sx-ink)", letterSpacing: "-0.01em", margin: 0 }}>
        {lz(I18N.title, lang)}
      </h1>
      <p style={{ font: "400 16px/1.45 var(--ttt-font-ui)", color: "var(--sx-ink-dim)", marginTop: 12, maxWidth: 560 }}>
        {lz(I18N.tagline, lang)}
      </p>

      <div style={{ display: "flex", gap: 8, margin: "24px 0 16px" }}>
        {[[lz(I18N.filterAll, lang), false], [lz(I18N.filter2026, lang), true]].map(([label, val]) => (
          <button key={label} onClick={() => setOnly2026(val)} style={{
            font: "700 12px var(--ttt-font-ui)", letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "8px 14px", cursor: "pointer", color: only2026 === val ? "var(--sx-crt-900)" : "var(--sx-ink-dim)",
            background: only2026 === val ? "var(--sx-cyan)" : "transparent",
            border: "2px solid var(--sx-crt-600)", boxShadow: "3px 3px 0 rgba(0,0,0,0.4)",
          }}>{label}</button>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", font: "400 15px var(--ttt-font-ui)", color: "var(--sx-ink)" }}>
        <thead>
          <tr>
            <Th k="name">{lz(I18N.colTeam, lang)}</Th>
            <Th k="appearances" align="right">{lz(I18N.colCups, lang)}</Th>
            {STAGES.map((s) => <Th key={s} k={s} align="right">{lz(COL[s], lang)}</Th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n.slug}
              onClick={() => { location.href = `?n=${n.slug}${lang === "en" ? "&lang=en" : ""}`; }}
              style={{ cursor: "pointer", borderBottom: "1px solid var(--sx-crt-700)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sx-crt-800)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <td style={{ padding: "8px 12px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Flag code={n.flag} size={30} title={nm(n, lang)} />
                  <span style={{ fontWeight: 700 }}>{nm(n, lang)}{n.inherited ? <sup style={{ color: "var(--sx-ink-faint)" }}> ✻</sup> : null}</span>
                </span>
              </td>
              <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{n.appearances}</td>
              {STAGES.map((s) => (
                <td key={s} style={{ padding: "8px 12px", textAlign: "right" }}>
                  <FlipYear anchor={n.anchors[s]} now={now} lang={lang} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ font: "var(--ttt-t-micro)", color: "var(--sx-ink-faint)", letterSpacing: "0.08em", marginTop: 20 }}>
        {lz(I18N.footnote, lang)}
      </p>
    </div>
  );
}

// ── country page ──────────────────────────────────────────────
function StageCounter({ nation, stage, now, lang }) {
  const anchor = nation.anchors[stage];
  const label = lz(STAGE[stage], lang).toUpperCase();
  const debutant = nation.appearances === 0;

  let big, sub;
  if (anchor && anchor.date) {
    big = fmt(anchor.date, now, lang);
    sub = fill(lz(I18N.since, lang), { Y: anchor.year, S: lz(STAGE[stage], lang) });
  } else if (debutant) {
    big = lz(I18N.debutBig, lang);
    sub = fill(lz(I18N.debutSub, lang), { N: nm(nation, lang) });
  } else {
    big = fmt(nation.firstAppearance.date, now, lang); // anchored to first appearance
    sub = fill(lz(I18N.neverSub, lang), { Y: nation.firstAppearance.year, V: lz(STAGE_VERB[stage], lang) });
  }

  return (
    <a href={`s/${nation.slug}-${stage}.html`} style={{
      display: "block", textDecoration: "none", padding: "20px 18px",
      background: "var(--sx-card-bg)", border: "2px solid var(--sx-crt-600)", boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
    }}>
      <div style={{ font: "var(--ttt-t-micro)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sx-cyan)" }}>{label}</div>
      <div className="sx-number" style={{ fontSize: 40, marginTop: 8 }}>{big}</div>
      <div style={{ font: "400 13px/1.4 var(--ttt-font-ui)", color: "var(--sx-ink-dim)", marginTop: 8 }}>{sub}</div>
    </a>
  );
}

const RUN_COLOR = { champion: "var(--sx-yellow)", final: "var(--sx-magenta)", sf: "var(--sx-cyan)", qf: "var(--sx-ink)", r16: "var(--sx-ink-dim)", group: "var(--sx-ink-faint)" };

function CountryPage({ nation, lang }) {
  const now = useNow();
  const cups = `${nation.appearances} ${lz(nation.appearances === 1 ? I18N.cupOne : I18N.cupMany, lang)}`;
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px 80px" }}>
      <a href={`.${lang === "en" ? "?lang=en" : ""}`} style={{ font: "var(--ttt-t-micro)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sx-ink-faint)", textDecoration: "none" }}>{lz(I18N.backAll, lang)}</a>

      <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0 28px" }}>
        <Flag code={nation.flag} size={72} title={nm(nation, lang)} />
        <div>
          <h1 style={{ font: "700 34px/1.05 var(--ttt-font-display)", color: "var(--sx-ink)", margin: 0 }}>{nm(nation, lang)}</h1>
          <div style={{ font: "400 14px var(--ttt-font-ui)", color: "var(--sx-ink-dim)", marginTop: 6 }}>
            {cups} · {lz(I18N.best, lang)}: {lz(RUN_LABEL[nation.best.stage], lang) || "—"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {STAGES.map((s) => <StageCounter key={s} nation={nation} stage={s} now={now} lang={lang} />)}
      </div>

      {nation.runs.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ font: "var(--ttt-t-micro)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sx-ink-dim)", marginBottom: 12 }}>{lz(I18N.history, lang)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {nation.runs.map((r) => (
              <div key={r.year} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0", borderBottom: "1px solid var(--sx-crt-700)" }}>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "var(--sx-ink)", width: 52 }}>{r.year}</span>
                <span style={{ font: "700 13px var(--ttt-font-ui)", letterSpacing: "0.04em", textTransform: "uppercase", color: RUN_COLOR[r.deepest] }}>{lz(RUN_LABEL[r.deepest], lang)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── route ─────────────────────────────────────────────────────
function App() {
  const initial = React.useMemo(readInitial, []);
  const [lang, setLang] = React.useState(initial.lang);
  React.useEffect(() => { // keep ?lang in the URL so deep-links/shares carry it
    const p = new URLSearchParams(location.search);
    if (lang === "en") p.set("lang", "en"); else p.delete("lang");
    const qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }, [lang]);

  const nation = initial.slug && bySlug[initial.slug];
  return (
    <React.Fragment>
      {nation ? <CountryPage nation={nation} lang={lang} /> : <Board lang={lang} />}
      <LangToggle lang={lang} setLang={setLang} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

/* global React, ReactDOM */
// ── A Última Vez — all-time World Cup stage-history board ──────
// Static SPA (React-UMD + Babel), same stack as the champions board.
// Routing: /a-ultima-vez/ shows the table; ?n=<slug> shows a country
// page (mirrors the existing dashboard's ?nation= deep-link pattern,
// so pre-baked share shells can land straight on the right view).
const { Flag, fmt, fmtShort, useNow, STAGE_PT, STAGE_VERB } = window;
const NATIONS = window.NATIONS;
const bySlug = Object.fromEntries(NATIONS.map((n) => [n.slug, n]));

const STAGES = ["qf", "sf", "final"];
const COL_LABEL = { qf: "Últimas quartas", sf: "Última semi", final: "Última final" };

// ── year ↔ live counter flip cell ─────────────────────────────
function FlipYear({ anchor, now }) {
  const [flip, setFlip] = React.useState(false);
  if (!anchor || !anchor.date) {
    return <span style={{ color: "var(--sx-ink-faint)", fontWeight: 700 }}>Nunca</span>;
  }
  return (
    <span
      onMouseEnter={() => setFlip(true)}
      onMouseLeave={() => setFlip(false)}
      onClick={(e) => { e.stopPropagation(); setFlip((f) => !f); }}
      style={{
        cursor: "pointer", fontVariantNumeric: "tabular-nums", fontWeight: 700,
        color: flip ? "var(--sx-cyan)" : "var(--sx-ink)", whiteSpace: "nowrap",
      }}
      title="toque para o contador"
    >
      {flip ? fmtShort(anchor.date, now) : anchor.year}
    </span>
  );
}

// ── sortable table ────────────────────────────────────────────
function Board() {
  const now = useNow();
  const [only2026, setOnly2026] = React.useState(false);
  const [sort, setSort] = React.useState({ key: "appearances", dir: "desc" });

  const sortVal = (n, key) =>
    key === "name" ? n.name :
    key === "appearances" ? n.appearances :
    (n.lastStage[key] || -1); // Nunca sinks to the bottom

  const rows = React.useMemo(() => {
    const list = NATIONS.filter((n) => (only2026 ? n.qualified2026 : true));
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const va = sortVal(a, sort.key), vb = sortVal(b, sort.key);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return a.name.localeCompare(b.name, "pt"); // stable tiebreak
    });
  }, [only2026, sort]);

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
        A última vez
      </h1>
      <p style={{ font: "400 16px/1.45 var(--ttt-font-ui)", color: "var(--sx-ink-dim)", marginTop: 12, maxWidth: 560 }}>
        Toda seleção que já jogou uma Copa do Mundo — quão fundo chegou e <em>há quanto tempo</em>.
        Toque num ano para o contador.
      </p>

      <div style={{ display: "flex", gap: 8, margin: "24px 0 16px" }}>
        {[["Todas", false], ["Classificadas para 2026", true]].map(([label, val]) => (
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
            <Th k="name">Seleção</Th>
            <Th k="appearances" align="right">Copas</Th>
            {STAGES.map((s) => <Th key={s} k={s} align="right">{COL_LABEL[s]}</Th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n.slug}
              onClick={() => { location.href = `?n=${n.slug}`; }}
              style={{ cursor: "pointer", borderBottom: "1px solid var(--sx-crt-700)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sx-crt-800)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <td style={{ padding: "8px 12px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Flag code={n.flag} size={30} title={n.name} />
                  <span style={{ fontWeight: 700 }}>{n.name}{n.inherited ? <sup style={{ color: "var(--sx-ink-faint)" }}> ✻</sup> : null}</span>
                </span>
              </td>
              <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{n.appearances}</td>
              {STAGES.map((s) => (
                <td key={s} style={{ padding: "8px 12px", textAlign: "right" }}>
                  <FlipYear anchor={n.anchors[s]} now={now} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ font: "var(--ttt-t-micro)", color: "var(--sx-ink-faint)", letterSpacing: "0.08em", marginTop: 20 }}>
        ✻ herda o histórico da federação anterior (FIFA). Dados: Copas masculinas 1930–2022 · 48 classificadas para 2026.
      </p>
    </div>
  );
}

// ── country page ──────────────────────────────────────────────
function StageCounter({ nation, stage, now }) {
  const anchor = nation.anchors[stage];
  const label = STAGE_PT[stage].toUpperCase();
  const debutant = nation.appearances === 0;

  let big, sub;
  if (anchor && anchor.date) {
    big = fmt(anchor.date, now);
    sub = `desde ${anchor.year} — última vez nas ${STAGE_PT[stage]}`;
  } else if (debutant) {
    big = "Estreante";
    sub = `${nation.name} estreia na Copa de 2026`;
  } else {
    big = fmt(nation.firstAppearance.date, now); // anchored to first appearance
    sub = `jogando Copas desde ${nation.firstAppearance.year} sem nunca chegar a ${STAGE_VERB[stage]}`;
  }

  return (
    <a href={`s/${nation.slug}-${stage}.html`} style={{
      display: "block", textDecoration: "none", padding: "20px 18px",
      background: "var(--sx-card-bg)", border: "2px solid var(--sx-crt-600)",
      boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
    }}>
      <div style={{ font: "var(--ttt-t-micro)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sx-cyan)" }}>{label}</div>
      <div className="sx-number" style={{ fontSize: 40, marginTop: 8 }}>{big}</div>
      <div style={{ font: "400 13px/1.4 var(--ttt-font-ui)", color: "var(--sx-ink-dim)", marginTop: 8 }}>{sub}</div>
    </a>
  );
}

const RUN_LABEL = { champion: "Campeão", final: "Final", sf: "Semifinal", qf: "Quartas", r16: "Oitavas", group: "Fase de grupos" };
const RUN_COLOR = { champion: "var(--sx-yellow)", final: "var(--sx-magenta)", sf: "var(--sx-cyan)", qf: "var(--sx-ink)", r16: "var(--sx-ink-dim)", group: "var(--sx-ink-faint)" };

function CountryPage({ nation }) {
  const now = useNow();
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px 80px" }}>
      <a href="." style={{ font: "var(--ttt-t-micro)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sx-ink-faint)", textDecoration: "none" }}>‹ Todas as seleções</a>

      <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0 28px" }}>
        <Flag code={nation.flag} size={72} title={nation.name} />
        <div>
          <h1 style={{ font: "700 34px/1.05 var(--ttt-font-display)", color: "var(--sx-ink)", margin: 0 }}>{nation.name}</h1>
          <div style={{ font: "400 14px var(--ttt-font-ui)", color: "var(--sx-ink-dim)", marginTop: 6 }}>
            {nation.appearances} {nation.appearances === 1 ? "Copa" : "Copas"} · melhor: {RUN_LABEL[nation.best.stage] || "—"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {STAGES.map((s) => <StageCounter key={s} nation={nation} stage={s} now={now} />)}
      </div>

      {nation.runs.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ font: "var(--ttt-t-micro)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sx-ink-dim)", marginBottom: 12 }}>Histórico</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {nation.runs.map((r) => (
              <div key={r.year} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0", borderBottom: "1px solid var(--sx-crt-700)" }}>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "var(--sx-ink)", width: 52 }}>{r.year}</span>
                <span style={{ font: "700 13px var(--ttt-font-ui)", letterSpacing: "0.04em", textTransform: "uppercase", color: RUN_COLOR[r.deepest] }}>{RUN_LABEL[r.deepest]}</span>
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
  const slug = new URLSearchParams(location.search).get("n");
  const nation = slug && bySlug[slug];
  return nation ? <CountryPage nation={nation} /> : <Board />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

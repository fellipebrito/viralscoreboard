/* global React */
// ── ULV_ShareCard — 1200×630 OG card for one (nation × stage) ──
// Baked to PNG by scripts/bake-ulv-og.mjs (Playwright screenshot, same
// approach as the champions board). Counter values are frozen at bake
// time; re-bake when data changes meaningfully.
const { fmt, STAGE_PT, STAGE_VERB } = window;

function ULV_ShareCard({ nation, stage }) {
  const anchor = nation.anchors[stage];
  const debutant = nation.appearances === 0;

  let kicker, big, line;
  if (anchor && anchor.date) {
    const { years } = window.elapsed(anchor.date);
    kicker = `ÚLTIMA VEZ NAS ${STAGE_PT[stage].toUpperCase()}: ${anchor.year}`;
    big = `${years}`;
    line = `${nation.name} não chega ${STAGE_VERB[stage].replace(/^um[a]? /, "a ")} de Copa há ${fmt(anchor.date)}`;
  } else if (debutant) {
    kicker = `ESTREANTE · COPA 2026`;
    big = "1ª";
    line = `${nation.name} disputa sua primeira Copa do Mundo em 2026`;
  } else {
    const { years } = window.elapsed(nation.firstAppearance.date);
    kicker = `${STAGE_PT[stage].toUpperCase()} · NUNCA`;
    big = `${years}`;
    line = `${nation.name} nunca jogou ${STAGE_VERB[stage]} de Copa — ${nation.appearances} participações desde ${nation.firstAppearance.year}`;
  }

  return (
    <div style={{
      position: "relative", width: 1200, height: 630, background: "var(--sx-crt-900)",
      overflow: "hidden", fontFamily: "var(--ttt-font-ui)", color: "var(--sx-ink)",
      display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, boxSizing: "border-box",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--sx-scanline)", mixBlendMode: "multiply", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 28, zIndex: 1 }}>
        <window.Flag code={nation.flag} size={120} title={nation.name} />
        <div>
          <div style={{ font: "var(--ttt-t-micro)", letterSpacing: "0.16em", color: "var(--sx-cyan)", textTransform: "uppercase" }}>{kicker}</div>
          <div style={{ font: "700 56px/1 var(--ttt-font-display)", color: "var(--sx-ink)", marginTop: 8 }}>{nation.name}</div>
        </div>
      </div>

      <div style={{ zIndex: 1, display: "flex", alignItems: "flex-end", gap: 24 }}>
        <span className="sx-number" style={{ fontSize: 300, lineHeight: 0.8 }}>{big}</span>
        <span style={{ font: "700 64px/1 var(--ttt-font-display)", color: "var(--sx-ink-dim)", paddingBottom: 28 }}>
          {big === "1ª" ? "Copa" : "anos"}
        </span>
      </div>

      <div style={{ zIndex: 1 }}>
        <div style={{ font: "400 26px/1.35 var(--ttt-font-ui)", color: "var(--sx-ink-dim)", maxWidth: 1000 }}>{line}</div>
        <div style={{ font: "var(--ttt-t-micro)", letterSpacing: "0.16em", color: "var(--sx-ink-faint)", textTransform: "uppercase", marginTop: 18 }}>
          umtempao.com · a última vez
        </div>
      </div>
    </div>
  );
}

// ── ULV_BoardCard — default OG for the board (hub card + page) ──
function ULV_BoardCard() {
  const champs = ["bra", "ger", "ita", "arg", "fra", "eng", "esp", "uru"];
  return (
    <div style={{
      position: "relative", width: 1200, height: 630, background: "var(--sx-crt-900)",
      overflow: "hidden", fontFamily: "var(--ttt-font-ui)", color: "var(--sx-ink)",
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 36, padding: 80, boxSizing: "border-box",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--sx-scanline)", mixBlendMode: "multiply", opacity: 0.5, pointerEvents: "none" }} />
      <div style={{ zIndex: 1 }}>
        <div style={{ font: "var(--ttt-t-micro)", letterSpacing: "0.18em", color: "var(--sx-cyan)", textTransform: "uppercase" }}>umtempao.com</div>
        <div style={{ font: "700 96px/0.95 var(--ttt-font-display)", color: "var(--sx-ink)", letterSpacing: "-0.01em", marginTop: 12 }}>A última vez<span style={{ color: "var(--sx-ink-faint)" }}>…</span></div>
      </div>
      <div style={{ zIndex: 1, display: "flex", gap: 14 }}>
        {champs.map((c) => <window.Flag key={c} code={c} size={84} />)}
      </div>
      <div style={{ zIndex: 1, font: "400 30px/1.35 var(--ttt-font-ui)", color: "var(--sx-ink-dim)", maxWidth: 1000 }}>
        Toda seleção da história da Copa — quão fundo chegou, e há quanto tempo. Cada ano vira um contador ao vivo.
      </div>
    </div>
  );
}

Object.assign(window, { ULV_ShareCard, ULV_BoardCard });

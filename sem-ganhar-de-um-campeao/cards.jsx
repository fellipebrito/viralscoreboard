/* global React */
// ── Drought Board surfaces ────────────────────────────────────
// ShareCard (3 directions) · NationCard (mobile) · Board (mobile + full)
// All built on the TTT base + soccer theme. Space Mono, hard shadows,
// chunky pixel frames, neon-on-CRT, pitch motifs.

const { YearsNumber, Scanlines, PitchBand, Cap, FlagPair, useLang } = window;

// strip the leading "years"/"anos" word → "Since …" / "Desde que …"
// (the giant number + YEARS label already carry the count)
function tail(row, lang) {
  const t = window.headlineText(row, lang).replace(/^\S+\s/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// tiny chunky pixel ball mark
function PixelBall({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" shapeRendering="crispEdges" style={{ display: "block" }}>
      <rect x="2" y="0" width="6" height="10" fill="var(--sx-chalk)" />
      <rect x="0" y="2" width="10" height="6" fill="var(--sx-chalk)" />
      <rect x="1" y="1" width="8" height="8" fill="var(--sx-chalk)" />
      <rect x="4" y="3" width="2" height="2" fill="var(--sx-crt-900)" />
      <rect x="2" y="5" width="2" height="2" fill="var(--sx-crt-900)" />
      <rect x="6" y="5" width="2" height="2" fill="var(--sx-crt-900)" />
      <rect x="4" y="7" width="2" height="1" fill="var(--sx-crt-900)" />
    </svg>
  );
}

function Wordmark({ lang, small }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <PixelBall size={small ? 18 : 22} />
      <Cap style={{ fontSize: small ? 11 : 12, color: "var(--sx-ink-dim)" }}>
        {window.lz(window.STR.boardTitle, lang)}
      </Cap>
    </div>
  );
}

// rank ribbon (LONGEST / SHORTEST / #N) — label only, no duplicate prefix
function RankTag({ row, lang }) {
  const longest = row.rank === 1;
  const shortest = row.rank === 8;
  const label = longest ? window.lz(window.STR.longest, lang)
    : shortest ? window.lz(window.STR.shortest, lang)
    : `#${row.rank}`;
  const c = longest ? "var(--sx-magenta)" : shortest ? "var(--sx-cyan)" : "var(--sx-ink-faint)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      font: "var(--ttt-t-micro)", letterSpacing: "0.12em",
      color: "var(--sx-crt-900)", background: c,
      padding: "4px 10px", border: "2px solid var(--sx-crt-900)",
      boxShadow: "var(--sx-num-shadow-sm)",
    }}>{label}</span>
  );
}

// ── Credit · "BUILT BY FELLIPE BRITO · FELLIPEBRITO.COM" ──────
// onCard=true → baked into the share-card PNG (plain text, no <a>).
// onCard=false → clickable on the live board / detail pages.
function Credit({ onCard = false }) {
  const label = "BUILT BY FELLIPE BRITO · FELLIPEBRITO.COM";
  const baseStyle = { letterSpacing: "0.14em", fontSize: onCard ? 14 : 11, fontWeight: 700 };
  if (onCard) {
    return (
      <span style={{
        ...baseStyle, color: "var(--sx-ink-dim)",
        textTransform: "uppercase", fontFamily: "var(--ttt-font-ui)",
      }}>
        {label}
      </span>
    );
  }
  return (
    <a href="https://fellipebrito.com" target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
      <Cap color="var(--sx-ink-dim)" style={baseStyle}>{label}</Cap>
    </a>
  );
}

// ── Non-wins list (NationCard only) ───────────────────────────
// Loss = magenta tick; Draw = dim tick. Reads as the drought timeline.
function NonWinsList({ row, lang }) {
  const list = window.NONWINS[row.nation] || [];
  if (list.length === 0) {
    return (
      <div style={{
        margin: "6px 20px", padding: "12px 14px",
        background: "var(--sx-crt-800)", border: "2px solid var(--sx-crt-600)",
        boxShadow: "var(--sx-num-shadow-sm)",
      }}>
        <Cap style={{ color: "var(--sx-cyan)" }}>{window.lz(window.STR.nonWinsNone, lang)}</Cap>
      </div>
    );
  }
  return (
    <div style={{ margin: "10px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
      <Cap style={{ color: "var(--sx-ink-faint)" }}>{window.lz(window.STR.nonWinsTitle, lang)}</Cap>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {list.map((entry, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "32px 1fr", alignItems: "center", gap: 10,
            background: i % 2 ? "var(--sx-crt-800)" : "var(--sx-crt-700)",
            borderLeft: `4px solid ${entry.result === "L" ? "var(--sx-magenta)" : "var(--sx-ink-dim)"}`,
            padding: "8px 10px",
            boxShadow: "var(--sx-num-shadow-sm)",
          }}>
            <window.Flag code={entry.opp} size={28} />
            <span style={{ font: "var(--ttt-t-small)", color: "var(--sx-ink)", lineHeight: 1.3 }}>
              {window.nonWinLine(entry, lang)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SHARE CARD — 1200 × 630 (single direction, "Scoreboard")
// ════════════════════════════════════════════════════════════
function ShareCard({ row, lang: langProp }) {
  const ctx = useLang();
  const lang = langProp || ctx.lang;
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: "var(--sx-crt-800)", overflow: "hidden",
      fontFamily: "var(--ttt-font-ui)", color: "var(--sx-ink)",
      borderTop: "4px solid var(--sx-cyan)",
    }}>
      {/* faint pitch stripes wash on the left */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.06,
        background: "repeating-linear-gradient(90deg, transparent 0 64px, var(--sx-chalk) 64px 66px)" }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", padding: "48px 56px 0" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Wordmark lang={lang} />
          <RankTag row={row} lang={lang} />
        </div>

        {/* main */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 470px", gap: 40, alignItems: "center" }}>
          {/* left: relationship + sentence */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                <window.Flag code={row.nation} size={84} />
                <Cap style={{ color: "var(--sx-magenta)" }}>{window.lz(window.STR.drought, lang)}</Cap>
              </div>
              <span style={{ font: "700 56px var(--ttt-font-display)", color: "var(--sx-magenta)", lineHeight: 1, marginTop: -16 }}>›</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                <window.Flag code={row.beat} size={84} />
                <Cap style={{ color: "var(--sx-ink-faint)" }}>{window.lz(window.STR.beatLabel, lang)}</Cap>
              </div>
            </div>
            <div style={{ font: "700 34px/1.12 var(--ttt-font-display)", color: "var(--sx-ink)", letterSpacing: "-0.01em", textWrap: "pretty" }}>
              {tail(row, lang)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, font: "var(--ttt-t-large-b)", color: "var(--sx-cyan)" }}>
              <window.Flag code={row.beat} size={30} />
              <span style={{ letterSpacing: "0.01em" }}>{window.detailLine(row, lang)}</span>
            </div>
          </div>

          {/* right: the giant number panel */}
          <div style={{
            position: "relative", background: "var(--sx-crt-900)",
            border: "4px solid var(--sx-cyan)", boxShadow: "var(--sx-num-shadow)",
            padding: "26px 20px 22px", textAlign: "center",
          }}>
            <Scanlines opacity={0.55} />
            <YearsNumber value={row.years} size={300} />
            <div style={{ marginTop: 6, font: "700 40px var(--ttt-font-display)", letterSpacing: "0.18em", color: "var(--sx-ink)" }}>
              {window.lz(window.STR.years, lang)}
            </div>
            <div style={{ marginTop: 8, display: "inline-flex", gap: 8, alignItems: "center" }}>
              <Cap style={{ color: "var(--sx-ink-faint)", fontSize: 11 }}>{window.lz(window.STR.precise, lang)}</Cap>
              <span style={{ font: "var(--ttt-t-small-b)", color: "var(--sx-yellow)", letterSpacing: "0.04em" }}>{window.lz(row.precise, lang)}</span>
            </div>
          </div>
        </div>

      </div>
      <Scanlines opacity={0.22} />
      {/* credit, absolutely positioned to bottom — baked into PNG */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        padding: "12px 56px 14px", textAlign: "center",
        background: "linear-gradient(to top, rgba(12,8,32,0.95), rgba(12,8,32,0))",
      }}>
        <Credit onCard={true} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// NATION CARD — mobile portrait 390 × 844
// ════════════════════════════════════════════════════════════
function NationCard({ row, onBack }) {
  const { lang } = useLang();
  const nat = window.NATION[row.nation];
  return (
    <div style={{
      position: "relative", width: "100%", minHeight: "100%", background: "var(--sx-crt-800)",
      fontFamily: "var(--ttt-font-ui)", color: "var(--sx-ink)", display: "flex", flexDirection: "column",
    }}>
      <Scanlines opacity={0.16} />
      {/* top bar */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px 12px", borderBottom: "2px solid var(--sx-crt-600)" }}>
        <button onClick={onBack} aria-label="Back" style={{
          background: "transparent", border: "none", padding: "4px 10px", cursor: "pointer",
          font: "700 22px var(--ttt-font-display)", color: "var(--sx-cyan)",
        }}>‹</button>
        <Wordmark lang={lang} small />
        <span style={{ font: "var(--ttt-t-micro)", color: "var(--sx-ink-faint)", letterSpacing: "0.1em" }}>{lang.toUpperCase()}</span>
      </div>

      {/* hero */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "26px 20px 10px" }}>
        <window.Flag code={row.nation} size={108} />
        <div style={{ font: "700 30px var(--ttt-font-display)", color: "var(--sx-ink)", letterSpacing: "-0.01em" }}>
          {window.lz(nat, lang).toUpperCase()}
        </div>
        <RankTag row={row} lang={lang} />
      </div>

      {/* number panel */}
      <div style={{ position: "relative", margin: "12px 20px", background: "var(--sx-crt-900)",
        border: "3px solid var(--sx-yellow)", boxShadow: "var(--sx-num-shadow-sm)", padding: "18px 12px 16px", textAlign: "center" }}>
        <Scanlines opacity={0.5} />
        <YearsNumber value={row.years} size={150} />
        <div style={{ font: "700 26px var(--ttt-font-display)", letterSpacing: "0.18em", color: "var(--sx-ink)", marginTop: 2 }}>
          {window.lz(window.STR.years, lang)}
        </div>
        <div style={{ marginTop: 6, font: "var(--ttt-t-small-b)", color: "var(--sx-yellow)" }}>
          {window.lz(window.STR.precise, lang)} · {window.lz(row.precise, lang)}
        </div>
      </div>

      {/* last win — cream balloon (TTT dialog standard) */}
      <div style={{ position: "relative", margin: "6px 20px" }}>
        <Cap style={{ color: "var(--sx-ink-faint)", display: "block", marginBottom: 8 }}>{window.lz(window.STR.lastWin, lang)}</Cap>
        <div style={{ background: "var(--ttt-beige-400)", color: "var(--ttt-neutral-800)",
          border: "2px solid var(--ttt-neutral-800)", boxShadow: "var(--sx-num-shadow-sm)", padding: "16px 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <window.Flag code={row.nation} size={40} />
            <span style={{ font: "700 22px var(--ttt-font-display)", color: "var(--sx-magenta)" }}>›</span>
            <window.Flag code={row.beat} size={40} />
            <span style={{ marginLeft: "auto", font: "700 30px var(--ttt-font-display)", color: "var(--ttt-neutral-800)" }}>
              {lang === "pt" ? row.scorePt : row.score}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 12px", font: "var(--ttt-t-small)", color: "var(--ttt-neutral-700)" }}>
            <span style={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: 11 }}>{window.lz(window.STR.beatLabel, lang)}</span>
            <span style={{ fontWeight: 700, color: "var(--ttt-neutral-800)" }}>{window.lz(window.NATION[row.beat], lang)}</span>
            <span style={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: 11 }}>{window.lz(window.STR.worldCup, lang)}</span>
            <span style={{ fontWeight: 700, color: "var(--ttt-neutral-800)" }}>{window.lz(window.PHASE[row.phase], lang)} · {row.wc}</span>
          </div>
        </div>
      </div>

      {/* non-wins since last win over a champion */}
      <NonWinsList row={row} lang={lang} />

      {/* credit (clickable) */}
      <div style={{ position: "relative", marginTop: "auto", padding: "18px 20px 22px", textAlign: "center" }}>
        <Credit />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// BOARD ROWS
// ════════════════════════════════════════════════════════════
function MiniNum({ value, color }) {
  return <YearsNumber value={value} size={40} color={color} shadow="var(--sx-num-shadow-sm)" duration={900} />;
}

// mobile compact row
function BoardRowM({ row, lang, i, onClick }) {
  const accent = row.rank === 1 ? "var(--sx-magenta)" : "var(--sx-yellow)";
  const nonWins = (window.NONWINS[row.nation] || []).length;
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      style={{
        display: "grid", gridTemplateColumns: "26px 40px 1fr auto", alignItems: "center", gap: 12,
        background: i % 2 ? "var(--sx-crt-800)" : "var(--sx-crt-700)",
        borderLeft: `4px solid ${row.rank === 1 ? "var(--sx-magenta)" : "var(--sx-crt-600)"}`,
        padding: "12px 14px",
        cursor: onClick ? "pointer" : "default",
      }}>
      <span style={{ font: "700 18px var(--ttt-font-display)", color: "var(--sx-ink-faint)", textAlign: "center" }}>{row.rank}</span>
      <window.Flag code={row.nation} size={40} />
      <div style={{ minWidth: 0 }}>
        <div style={{ font: "var(--ttt-t-regular-b)", color: "var(--sx-ink)" }}>{window.lz(window.NATION[row.nation], lang)}</div>
        <div style={{ font: "var(--ttt-t-small)", color: "var(--sx-ink-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          › {window.lz(window.NATION[row.beat], lang)} · {row.score} · {row.wc}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <MiniNum value={row.years} color={accent} />
          <Cap style={{ color: "var(--sx-ink-faint)", fontSize: 10 }}>{window.lz(window.STR.years, lang)}</Cap>
        </div>
        {nonWins > 0 && (
          <span style={{
            font: "700 9px var(--ttt-font-ui)", letterSpacing: "0.1em",
            color: "var(--sx-ink-faint)", textTransform: "uppercase",
          }}>
            {nonWins} {window.lz(window.STR.nonWinsShort, lang)}
          </span>
        )}
      </div>
    </div>
  );
}

// mobile board 390 × 844 (grows beyond viewport on small screens; body scrolls)
function BoardMobile({ onSelectNation }) {
  const { lang } = useLang();
  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100%", background: "var(--sx-crt-900)",
      fontFamily: "var(--ttt-font-ui)", color: "var(--sx-ink)", display: "flex", flexDirection: "column" }}>
      <Scanlines opacity={0.14} />
      <div style={{ position: "relative", padding: "20px 16px 14px", borderBottom: "3px solid var(--sx-cyan)" }}>
        <Wordmark lang={lang} small />
        <div style={{ font: "700 22px/1.1 var(--ttt-font-display)", color: "var(--sx-ink)", marginTop: 12, textWrap: "balance" }}>
          {window.lz(window.STR.boardSub, lang)}
        </div>
        <Cap style={{ display: "block", marginTop: 8, color: "var(--sx-ink-faint)" }}>{window.lz(window.STR.asOf, lang)}</Cap>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6, padding: "12px 12px 8px", flex: 1 }}>
        {window.DROUGHT.map((row, i) => (
          <BoardRowM key={row.nation} row={row} lang={lang} i={i}
            onClick={onSelectNation ? () => onSelectNation(row.nation) : undefined} />
        ))}
      </div>
      <div style={{ position: "relative", textAlign: "center", padding: "10px 16px 4px" }}>
        <Cap style={{ color: "var(--sx-cyan)" }}>{window.lz(window.STR.tapDetail, lang)}</Cap>
      </div>
      <div style={{ position: "relative", textAlign: "center", padding: "4px 16px 16px" }}>
        <Credit />
      </div>
    </div>
  );
}

// full board row (table-like)
function BoardRowFull({ row, lang, i }) {
  const accent = row.rank === 1 ? "var(--sx-magenta)" : "var(--sx-yellow)";
  const nonWins = (window.NONWINS[row.nation] || []).length;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "64px 240px 150px 1fr", alignItems: "center", gap: 16,
      background: i % 2 ? "var(--sx-crt-800)" : "var(--sx-crt-700)",
      borderLeft: `5px solid ${row.rank === 1 ? "var(--sx-magenta)" : row.rank === 8 ? "var(--sx-cyan)" : "var(--sx-crt-600)"}`,
      padding: "16px 22px",
    }}>
      <span style={{ font: "700 30px var(--ttt-font-display)", color: "var(--sx-ink-faint)", textAlign: "center" }}>{row.rank}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <window.Flag code={row.nation} size={52} />
        <span style={{ font: "700 22px var(--ttt-font-display)", color: "var(--sx-ink)" }}>{window.lz(window.NATION[row.nation], lang)}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <MiniNum value={row.years} color={accent} />
          <span style={{ font: "var(--ttt-t-small-b)", color: "var(--sx-ink-faint)", letterSpacing: "0.06em" }}>{window.lz(window.STR.years, lang)}</span>
        </div>
        {nonWins > 0 && (
          <span style={{ font: "700 10px var(--ttt-font-ui)", letterSpacing: "0.1em", color: "var(--sx-ink-faint)", textTransform: "uppercase" }}>
            {nonWins} {window.lz(window.STR.nonWinsShort, lang)}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <window.Flag code={row.beat} size={34} />
        <span style={{ font: "var(--ttt-t-regular-b)", color: "var(--sx-cyan)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {window.detailLine(row, lang)}
        </span>
      </div>
    </div>
  );
}

// full board ~960 wide
function BoardFull() {
  const { lang } = useLang();
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "var(--sx-crt-900)",
      fontFamily: "var(--ttt-font-ui)", color: "var(--sx-ink)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Scanlines opacity={0.12} />
      {/* header */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        padding: "28px 22px 22px", borderBottom: "4px solid var(--sx-cyan)" }}>
        <div>
          <Wordmark lang={lang} />
          <div style={{ font: "700 30px var(--ttt-font-display)", color: "var(--sx-ink)", marginTop: 10 }}>
            {window.lz(window.STR.boardSub, lang)}
          </div>
        </div>
        <Cap style={{ color: "var(--sx-ink-faint)" }}>{window.lz(window.STR.asOf, lang)}</Cap>
      </div>
      {/* column heads */}
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "64px 240px 150px 1fr", gap: 16, padding: "12px 22px", borderBottom: "2px solid var(--sx-crt-600)" }}>
        {[window.STR.rank, window.STR.nation, window.STR.drought, window.STR.lastWin].map((s, k) => (
          <Cap key={k} style={{ color: "var(--sx-ink-faint)", textAlign: k === 0 ? "center" : "left" }}>{window.lz(s, lang)}</Cap>
        ))}
      </div>
      {/* rows */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4, padding: "8px 0", flex: 1 }}>
        {window.DROUGHT.map((row, i) => <BoardRowFull key={row.nation} row={row} lang={lang} i={i} />)}
      </div>
    </div>
  );
}

Object.assign(window, { ShareCard, NationCard, BoardMobile, BoardFull });

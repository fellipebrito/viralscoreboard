/* global React */
// ── Shared building blocks for the Drought Board ──────────────
// Language context, the count-up hero number, CRT/pitch texture
// wrappers, and the two-flag relationship piece.

const LangCtx = React.createContext({ lang: "en", replay: 0 });
const useLang = () => React.useContext(LangCtx);

// easing for the arcade count-up
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// ── Count-up hero number ──────────────────────────────────────
// Animates 0 → value when it first scrolls into view, and again
// whenever `replay` changes. Space Mono bold, huge, crisp, hard drop.
function YearsNumber({ value, size = 300, color, shadow, style = {}, duration = 1100 }) {
  const { replay } = useLang();
  const ref = React.useRef(null);
  const [n, setN] = React.useState(0);
  const seen = React.useRef(false);

  const run = React.useCallback(() => {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setN(Math.round(easeOutCubic(t) * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  // fire when visible
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && !seen.current) { seen.current = true; run(); }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [run]);

  // replay on global trigger
  React.useEffect(() => { if (replay > 0) { setN(0); run(); } }, [replay, run]);

  return (
    <span
      ref={ref}
      className="sx-number"
      style={{
        fontSize: size,
        color: color || "var(--sx-number)",
        textShadow: shadow || "var(--sx-num-shadow)",
        display: "inline-block",
        ...style,
      }}
    >
      {n}
    </span>
  );
}

// ── CRT scanline veil ─────────────────────────────────────────
function Scanlines({ opacity = 0.5, radius = 0 }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "var(--sx-scanline)",
        mixBlendMode: "multiply",
        opacity,
        borderRadius: radius,
      }}
    />
  );
}

// ── A short chalk-lined pitch band (mowed stripes) ────────────
function PitchBand({ height = 64, lines = true, style = {} }) {
  return (
    <div
      className="sx-pitch-band"
      style={{ position: "relative", height, width: "100%", overflow: "hidden", ...style }}
    >
      {lines && (
        <React.Fragment>
          {/* center spot + halfway hint as chalk */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: "var(--sx-chalk-soft)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 26, height: 26, transform: "translate(-50%,-50%)", border: "2px solid var(--sx-chalk-soft)", borderRadius: "50%" }} />
        </React.Fragment>
      )}
    </div>
  );
}

// ── micro-cap label ───────────────────────────────────────────
function Cap({ children, color = "var(--sx-accent)", style = {} }) {
  return (
    <span style={{
      font: "var(--ttt-t-micro)", letterSpacing: "0.14em", textTransform: "uppercase",
      color, ...style,
    }}>{children}</span>
  );
}

// ── Two-flag relationship: nation  ›  beaten champion ─────────
function FlagPair({ row, lang, size = 64, vs = true, stack = false }) {
  const nation = window.NATION[row.nation];
  const beat = window.NATION[row.beat];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: stack ? 10 : 14,
      flexDirection: stack ? "column" : "row",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <window.Flag code={row.nation} size={size} title={window.lz(nation, lang)} />
      </div>
      {vs && (
        <span style={{
          font: `700 ${Math.round(size * 0.28)}px var(--ttt-font-display)`,
          color: "var(--sx-magenta)", letterSpacing: "-0.02em",
          transform: stack ? "rotate(90deg)" : "none",
        }}>›</span>
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <window.Flag code={row.beat} size={size} title={window.lz(beat, lang)} />
      </div>
    </div>
  );
}

Object.assign(window, { LangCtx, useLang, YearsNumber, Scanlines, PitchBand, Cap, FlagPair });

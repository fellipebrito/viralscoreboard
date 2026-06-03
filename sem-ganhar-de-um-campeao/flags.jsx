/* global React */
// ── Pixel-art flags ───────────────────────────────────────────
// Eight World Cup champion nations, hand-built on a chunky 30×20 grid
// so they stay crisp and "16-bit" at any size. England uses the
// St George's cross (NOT the Union Jack). No federation crests.
// Each flag = an array of [x, y, w, h, color] cells, rendered as
// crisp <rect>s and wrapped in a chalk pixel frame with a hard drop.

const GW = 30, GH = 20;

// palette (kept saturated so they pop on the dark CRT field)
const F = {
  white:  "#F4F8F0",
  red:    "#ED2939",
  redE:   "#D4122A",   // england cross
  blueFr: "#2A37A0",
  blueUy: "#2C3F9E",
  blueAr: "#74B4E4",   // argentina celeste
  blueBr: "#243C8F",   // brazil disc
  green:  "#1FA85A",   // italy
  greenBr:"#2E9E50",   // brazil field
  black:  "#2A2A2A",
  gold:   "#FFCE2E",
  goldBr: "#FFD93B",
  sun:    "#F4C430",
};

// ── shape helpers (return arrays of cells) ────────────────────
function bandsH(stops) {
  // stops: [ [y,h,color], ... ]
  return stops.map(([y, h, c]) => [0, y, GW, h, c]);
}
function bandsV(stops) {
  return stops.map(([x, w, c]) => [x, 0, w, GH, c]);
}
function diamond(cx, cy, hx, hy, color) {
  const out = [];
  for (let y = 0; y < GH; y++) {
    const t = 1 - Math.abs((y + 0.5) - cy) / hy;
    if (t <= 0) continue;
    const hw = t * hx;
    out.push([+(cx - hw).toFixed(2), y, +(2 * hw).toFixed(2), 1, color]);
  }
  return out;
}
function disc(cx, cy, r, color) {
  const out = [];
  for (let y = 0; y < GH; y++) {
    const dy = (y + 0.5) - cy;
    const v = r * r - dy * dy;
    if (v <= 0) continue;
    const hw = Math.sqrt(v);
    out.push([+(cx - hw).toFixed(2), y, +(2 * hw).toFixed(2), 1, color]);
  }
  return out;
}
function sun(cx, cy, r, color) {
  // little disc + 8 stubby rays — reads as a sun at chunky scale
  const out = disc(cx, cy, r, color);
  const ray = r + 1.1, t = 0.9;
  out.push([cx - t / 2, cy - ray - 1, t, 1.4, color]);          // N
  out.push([cx - t / 2, cy + ray - 0.4, t, 1.4, color]);        // S
  out.push([cx - ray - 1, cy - t / 2, 1.4, t, color]);          // W
  out.push([cx + ray - 0.4, cy - t / 2, 1.4, t, color]);        // E
  out.push([cx + ray - 1.3, cy - ray - 0.0, 1.1, 1.1, color]);  // NE
  out.push([cx - ray + 0.2, cy - ray - 0.0, 1.1, 1.1, color]);  // NW
  out.push([cx + ray - 1.3, cy + ray - 1.1, 1.1, 1.1, color]);  // SE
  out.push([cx - ray + 0.2, cy + ray - 1.1, 1.1, 1.1, color]);  // SW
  return out;
}

// ── per-nation cell builders ──────────────────────────────────
const BUILD = {
  england() {
    return [
      [0, 0, GW, GH, F.white],
      [12.5, 0, 5, GH, F.redE],   // vertical bar
      [0, 7.5, GW, 5, F.redE],    // horizontal bar
    ];
  },
  brazil() {
    return [
      [0, 0, GW, GH, F.greenBr],
      ...diamond(15, 10, 12.5, 8.2, F.goldBr),
      ...disc(15, 10, 5, F.blueBr),
      [9.5, 9, 11, 1.9, F.white],   // straight chalk band across the disc
    ];
  },
  argentina() {
    return [
      ...bandsH([[0, 6.67, F.blueAr], [6.67, 6.66, F.white], [13.33, 6.67, F.blueAr]]),
      ...sun(15, 10, 1.7, F.sun),
    ];
  },
  germany() {
    return bandsH([[0, 6.8, F.black], [6.8, 6.4, F.red], [13.2, 6.8, F.gold]]);
  },
  spain() {
    return bandsH([[0, 5, F.red], [5, 10, F.gold], [15, 5, F.red]]);
  },
  italy() {
    return bandsV([[0, 10, F.green], [10, 10, F.white], [20, 10, F.red]]);
  },
  france() {
    return bandsV([[0, 10, F.blueFr], [10, 10, F.white], [20, 10, F.red]]);
  },
  uruguay() {
    const cells = [[0, 0, GW, GH, F.white]];
    // nine stripes; blue on even bands, but leave the top-left canton white
    const sh = GH / 9;
    for (let i = 0; i < 9; i++) {
      if (i % 2 === 0) {
        const y = +(i * sh).toFixed(2);
        // skip the canton region (x<11, y<11): clip stripe to the right of it
        if (y < 11) cells.push([11, y, GW - 11, +sh.toFixed(2), F.blueUy]);
        else cells.push([0, y, GW, +sh.toFixed(2), F.blueUy]);
      }
    }
    cells.push([0, 0, 11, 11, F.white]);     // canton
    cells.push(...sun(5.5, 5.5, 1.5, F.sun));
    return cells;
  },
};

function Flag({ code, size = 64, title, style = {} }) {
  const cells = (BUILD[code] || BUILD.england)();
  const w = size, h = +(size * (GH / GW)).toFixed(1);
  return (
    <span
      role="img"
      aria-label={title || code}
      style={{
        display: "inline-block",
        width: w,
        height: h,
        border: "var(--sx-frame, 2px) solid var(--sx-chalk)",
        boxShadow: "var(--sx-num-shadow-sm)",
        background: "var(--sx-crt-900)",
        lineHeight: 0,
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${GW} ${GH}`}
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        style={{ display: "block" }}
      >
        {cells.map((c, i) => (
          <rect key={i} x={c[0]} y={c[1]} width={c[2]} height={c[3]} fill={c[4]} />
        ))}
      </svg>
    </span>
  );
}

Object.assign(window, { Flag });

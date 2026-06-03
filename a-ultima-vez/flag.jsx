/* global React */
// ── Flag: FIFA-code SVG in the chalk pixel frame ──────────────
// Flags are flat SVGs produced by Claude Design, keyed by lowercase
// FIFA code at /flags/<fifa>.svg (3:2, same 30×20 viewBox as the
// original 8). Build-time flags-manifest check guarantees presence;
// here we render an <img> in the same frame as the champions board.
function Flag({ code, size = 36, title, style = {} }) {
  const w = size, h = +(size * (20 / 30)).toFixed(1); // 3:2 like the original grid
  return (
    <span
      role="img"
      aria-label={title || code}
      style={{
        display: "inline-block", width: w, height: h,
        border: "var(--sx-frame, 2px) solid var(--sx-chalk)",
        boxShadow: "var(--sx-num-shadow-sm)",
        background: "var(--sx-crt-900)", lineHeight: 0, ...style,
      }}
    >
      <img src={`/flags/${code}.svg`} alt="" width="100%" height="100%"
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", imageRendering: "auto" }} />
    </span>
  );
}

Object.assign(window, { Flag });

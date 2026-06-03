/* global React */
// ── Counter Engine: day-accurate "X anos, Y dias" tick ────────
// Counts UP from an anchor match date (full YYYY-MM-DD from the CSV)
// to now, client-side. Shared by the table flip, the country-page
// hero counters, and the share-card bake.

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

const STAGE_PT = { qf: "quartas", sf: "semifinal", final: "final" };
const STAGE_VERB = {            // "última vez que {nação} jogou {uma quarta/semi/final}"
  qf: "umas quartas de final",
  sf: "uma semifinal",
  final: "uma final",
};

// "23 anos, 361 dias"
function fmt(fromISO, now) {
  const { years, days } = elapsed(fromISO, now);
  const a = `${years} ${years === 1 ? "ano" : "anos"}`;
  const d = `${days} ${days === 1 ? "dia" : "dias"}`;
  return `${a}, ${d}`;
}

// Compact "23a 361d" for tight table cells.
function fmtShort(fromISO, now) {
  const { years, days } = elapsed(fromISO, now);
  return `${years}a ${days}d`;
}

// ── Live ticking counter ──────────────────────────────────────
// Re-renders on an interval so the day rolls over without a reload.
function useNow(intervalMs = 1000) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

Object.assign(window, { elapsed, fmt, fmtShort, useNow, STAGE_PT, STAGE_VERB });

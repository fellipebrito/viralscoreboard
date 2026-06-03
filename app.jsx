/* global React, ReactDOM */
// ── App: live board + tap-through nation card + EN/PT toggle ──

const { LangCtx } = window;
const rowOf = (nation) => window.DROUGHT.find((r) => r.nation === nation);

// ── EN / PT-BR flag toggle, top-right ─────────────────────────
// Two flag buttons (England / Brazil). Active flag is full opacity,
// inactive is faded. Click swaps language.
function LangToggle({ lang, setLang }) {
  const btn = (val, code, label) => (
    <button onClick={() => setLang(val)} aria-label={label} aria-pressed={lang === val}
      style={{
        background: "transparent", border: "none", padding: 4, cursor: "pointer",
        opacity: lang === val ? 1 : 0.4, transition: "opacity 0.15s",
        outline: lang === val ? "2px solid var(--sx-cyan)" : "2px solid transparent",
        lineHeight: 0,
      }}>
      <window.Flag code={code} size={36} title={label} />
    </button>
  );
  return (
    <div style={{
      position: "fixed", top: 12, right: 12, zIndex: 50,
      display: "flex", gap: 6, padding: 6,
      background: "var(--sx-crt-900)", border: "2px solid var(--sx-crt-600)",
      boxShadow: "4px 4px 0 rgba(0,0,0,0.5)",
    }}>
      {btn("en", "england", "English")}
      {btn("pt", "brazil", "Português")}
    </div>
  );
}

// Read ?nation= / ?lang= once on mount so /s/<nation>.html deep-links
// land on the live board with the right nation pre-selected.
function readInitialQuery() {
  const p = new URLSearchParams(window.location.search);
  const lang = p.get("lang") === "pt" ? "pt" : "en";
  const nation = p.get("nation");
  const valid = nation && window.DROUGHT.some((r) => r.nation === nation);
  return { lang, nation: valid ? nation : null };
}

// ── App ───────────────────────────────────────────────────────
function App() {
  const initial = React.useMemo(readInitialQuery, []);
  const [lang, setLang] = React.useState(initial.lang);
  const [selectedNation, setSelectedNation] = React.useState(initial.nation);
  const ctx = React.useMemo(() => ({ lang, replay: 0 }), [lang]);

  const onShare = React.useCallback((row, l) => {
    if (typeof window.shareNation === "function") window.shareNation(row.nation, l);
  }, []);

  return (
    <LangCtx.Provider value={ctx}>
      {selectedNation
        ? <window.NationCard
            row={rowOf(selectedNation)}
            onBack={() => setSelectedNation(null)}
            onShare={onShare}
          />
        : <window.BoardMobile onSelectNation={setSelectedNation} />}
      <LangToggle lang={lang} setLang={setLang} />
    </LangCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

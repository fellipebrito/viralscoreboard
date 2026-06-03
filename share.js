// ── Drought Board · share flow ────────────────────────────────
// Mounts ShareCard offscreen at 1200×630, snapshots to PNG via
// html-to-image, then either navigator.share()s the File (mobile)
// or downloads + opens wa.me (desktop fallback). Mirrors GPS.
// Loaded as type=module from index.html; exposes window.shareNation.

import { toPng } from "https://esm.sh/html-to-image@1.11.13";

const STAGE_W = 1200;
const STAGE_H = 630;
const COUNTUP_SETTLE_MS = 1300; // YearsNumber animates 1100ms

function rowOf(nation) { return window.DROUGHT.find((r) => r.nation === nation); }

window.shareNation = async function shareNation(nation, lang) {
  const row = rowOf(nation);
  if (!row) return;

  // Mount stage at viewport origin (IntersectionObserver needs it visible),
  // behind the body bg via z-index, and non-interactive.
  const stage = document.createElement("div");
  Object.assign(stage.style, {
    position: "fixed", top: "0", left: "0",
    width: STAGE_W + "px", height: STAGE_H + "px",
    zIndex: "-1", pointerEvents: "none",
  });
  document.body.appendChild(stage);

  const root = window.ReactDOM.createRoot(stage);
  root.render(window.React.createElement(window.ShareCard, { row, lang }));

  try {
    // Let fonts + count-up settle.
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await new Promise((r) => setTimeout(r, COUNTUP_SETTLE_MS));

    const dataUrl = await toPng(stage, {
      width: STAGE_W, height: STAGE_H,
      pixelRatio: 1, cacheBust: true,
      backgroundColor: "#0C0820",
    });

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `drought-${nation}-${lang}.png`, { type: "image/png" });

    const title = window.lz(window.STR.shareTitle, lang);
    const text = window.shareText(row, lang);

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title, text });
    } else {
      // Desktop fallback: download the PNG, then open wa.me with the deep-link.
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `drought-${nation}-${lang}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      // Resolve relative to the current page so it works under project URLs.
      const url = new URL(`s/${nation}${lang === "en" ? "" : "." + lang}.html`, location.href).href;
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank", "noopener");
    }
  } catch (err) {
    console.error("[share] failed", err);
  } finally {
    root.unmount();
    stage.remove();
  }
};

// Debug helper: bake the root og:image once during local dev.
// Open the site, run `window.bakeOgImage()` in the console, save the download.
window.bakeOgImage = function bakeOgImage(nation = "england", lang = "en") {
  return window.shareNation(nation, lang);
};

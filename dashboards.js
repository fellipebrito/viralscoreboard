// ── umtempao.com · dashboard registry ─────────────────────────
// Single source of truth: hub + future per-dashboard pages read from
// here. A new dashboard requires only a new entry + its own folder.
//
// SLUG STANDARD: lowercase, hyphen-separated, accent-stripped
// (e.g. campeão → campeao). The slug + domain compose a Portuguese
// sentence: "um tempão " + "/sem-ganhar-de-um-campeao".

const DASHBOARDS = [
  {
    slug: "sem-ganhar-de-um-campeao",
    sentence: "um tempão sem ganhar de um campeão",
    title: "Sem ganhar de um campeão",
    description: "Anos desde que cada seleção campeã venceu outra em Copa do Mundo.",
    image: "/sem-ganhar-de-um-campeao/og-image.png",
  },
  {
    slug: "a-ultima-vez",
    sentence: "um tempão desde a última vez na Copa",
    title: "A última vez",
    description: "Toda seleção da história da Copa: últimas quartas, semi e final — e há quanto tempo.",
    image: "/a-ultima-vez/og-image.png",
  },
];

Object.assign(window, { DASHBOARDS });

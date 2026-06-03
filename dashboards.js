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
];

Object.assign(window, { DASHBOARDS });

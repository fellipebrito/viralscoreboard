# Flags — handoff to Claude Design

Flat SVG flags for the **A Última Vez** board, **keyed by lowercase FIFA tri-code**.

- **Filename = FIFA code**: `bra.svg`, `ger.svg`, `ned.svg`, `uru.svg`, `ksa.svg`, … (NOT ISO-3166 — Germany is `ger`, not `deu`).
- **Aspect / viewBox**: identical to the existing champions-board flags — `viewBox="0 0 30 20"` (3:2). Visual consistency across the table beats per-flag fidelity.
- **Flat, self-contained SVG only**: no external refs, no embedded fonts, no `<image>` — required for the Satori-style screenshot bake.
- **Crest-heavy flags** (México `mex`, Arábia Saudita `ksa`, Espanha `esp`, Equador `ecu`, Sérvia `srb`, Portugal `por`) → simplify deliberately in the existing pixel style. Spot-check these.

The complete required code list is in `data/flags-manifest.json` after running `npm run check:flags`
(it lists every missing code). 83 nations total. The build **fails** until all are present.

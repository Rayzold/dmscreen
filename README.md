# dmscreen

A design handoff for **Overseer Studio** — a redesigned tabletop RPG game master's console
(a tiled canvas that *knows the state of the game*: initiative, HP, conditions, dice, generators,
a player-facing second screen, and more).

## Live prototype

▶ **https://rayzold.github.io/dmscreen/**

The prototype is a self-contained static app — it loads React from a CDN and renders entirely in
the browser, no build step or server required.

## What's here

- [`design_handoff_gm_console/`](design_handoff_gm_console/) — the handoff bundle:
  - `Overseer Studio.dc.html` — the interactive prototype (`<x-dc>` template + `DCLogic` state class).
  - `support.js` — the runtime that resolves the prototype format (needed to view the file).
  - `README.md` — the full design spec: tokens, layout, interactions, and state model.
  - `screenshots/` — reference captures (run mode, player view, command palette, prep mode).

See the [handoff README](design_handoff_gm_console/README.md) for the complete specification.

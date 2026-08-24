# Handoff: DM Screen (GM Console)

## Overview

A desktop application UI for a tabletop RPG game master's screen. Where a plain window
manager only tracks tiles (put a PDF, a VTT, a music player in a tile, then stack/pin/pop
them out), DM Screen keeps that tiled canvas but adds the thing a window manager lacks:
**the app knows the state of the game**, not just the positions of the windows.

The prototype depicts one specific moment — the party goes somewhere the GM didn't prep
(a roadside shrine), and the GM improvises a combat encounter live. Everything on screen
is wired to that moment.

Feature set added on top of the original product:

1. Initiative tracker that drives the canvas (advancing the turn rings the active token and opens its sheet)
2. Live HP + condition tracking for monsters and PCs, with automatic bloodied/down states
3. Dice roller with roll history
4. Random generators (NPC names, pocket loot, encounters)
5. Session log that writes itself from user actions
6. Player-facing second screen ("Show players" — casts only the map)
7. Layered soundscape mixer
8. Prep / Run mode switch
9. Rules search across all loaded PDFs, opening the hit inside the rulebook tile
10. Party sheet with passive stats always visible

## About the Design Files

The files in this bundle are **design references created in HTML** — a prototype showing
the intended look and behavior. They are not production code to copy directly.

`DM Screen.dc.html` is authored in a proprietary streaming-component format (`<x-dc>`
template + a `DCLogic` class, resolved by `support.js`). Do not port that runtime. Read the
file as a specification: the template is the DOM structure with inline styles, and the logic
class is the state model and the handlers.

The task is to **recreate this design in the target codebase's existing environment** —
React, Vue, Svelte, Electron + your framework of choice — using its established patterns,
component library, and styling approach. If no environment exists yet: this is a desktop app
(offline-capable, multi-window, native app embedding), so Electron or Tauri with React is the
natural target.

To view the prototype: open `DM Screen.dc.html` in a browser with `support.js` beside it.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and interactions. Every hex value,
font size, and radius in this README is taken from the prototype and should be matched.
The interactions described under "Interactions & Behavior" are all implemented and working
in the prototype — click through it before building.

Two deliberate stand-ins, both flagged inline in the prototype:
- The battle map is an abstract CSS composition (radial gradients + a grid overlay), not
  real map art. In production this is an image/VTT surface. The **tokens on top of it are
  real** and data-driven.
- PDF tiles render excerpt text, not an actual PDF renderer.

## Screens / Views

There is one screen: the full-window application shell. Everything else is overlays and
tile state changes within it.

### Application shell

Designed at **1440 × 900**. Minimum height 760px. `overflow: hidden` on the shell; scrolling
happens inside panels.

Root: `display: grid; grid-template-rows: 52px 1fr 30px` (header / body / status bar).
Body: `display: grid; grid-template-columns: 236px 1fr 306px` (left sidebar / canvas / right rail).

Background `#0d1013`. Text `#e6e9ee`. Base font `'Space Grotesk', system-ui, sans-serif` at 13px.

---

### 1. Header (52px)

`display: flex; align-items: center; gap: 18px; padding: 0 14px;`
Background `#12161b`, bottom border `1px solid #232a33`.

Left to right:

- **App mark** — 22×22, `border-radius: 6px`, `background: linear-gradient(150deg, #a78bfa, #6d5bb5)`, centered letter "O" at 12px/700 in `#14101f`.
- **Campaign title** — "Ashes of the Vell Road", 13px/600, `letter-spacing: -.01em`. Beside it "Session 14" at 11px in `#6f7987`. The whole cluster is `flex: none; white-space: nowrap`.
- **Mode switch** — a 2-item segmented control. Container: `background: #0d1013; border: 1px solid #262d36; border-radius: 8px; padding: 2px; gap: 2px`. Buttons "Prep" and "Run": `padding: 3px 12px; border-radius: 6px;` 11.5px/500. Selected: `background: #22192e; color: #c4b2ff`. Unselected: transparent, `color: #6f7987`, hover `color: #e6e9ee`.
- **Search field (button, not an input)** — `flex: 1; max-width: 420px; height: 30px; padding: 0 10px; background: #0d1013; border: 1px solid #262d36; border-radius: 8px;` 12px, `color: #6f7987`, hover border `#3a4351`. Contains a `⌕` glyph, the label "Search rules, screens, tiles, monsters…" (must be `min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis` — it overflows the header without this), and a `⌘K` keycap: `border: 1px solid #2b333d; border-radius: 4px; padding: 1px 5px;` 10px in `#8b95a3`.
- **Spacer** (`flex: 1`).
- **Status cluster** — 11px, `color: #8b95a3`, `font-variant-numeric: tabular-nums`. A 6px status dot (`#4fa88b` when running, `#d0b25a` in prep) animating `om-pulse 2.4s infinite`, then the mode label ("Running" / "Prep"), a `·` separator in `#4a5361`, then the session clock as `h:mm:ss`, ticking every second.
- **Show players button** — `height: 28px; padding: 0 12px; border-radius: 7px;` 11.5px/500. Off: `background: #171c22; border: 1px solid #2b333d; color: #c3cad4`, label "Show players". On: `background: #2c2140; border: 1px solid #6d5bb5; color: #c4b2ff`, label "Stop sharing".

---

### 2. Left sidebar (236px)

`background: #12161b`, right border `1px solid #232a33`, `display: flex; flex-direction: column`.

- **Filter input** — in a 10px padded box; `height: 28px; padding: 0 9px; background: #0d1013; border: 1px solid #262d36; border-radius: 7px;` 12px, placeholder "Filter screens…". Filters the screen list by substring, case-insensitive.
- **Section label** pattern used throughout the app: 10px/600, `letter-spacing: .09em; text-transform: uppercase; color: #5f6875`.
- **Screens list** — "SCREENS". Rows: `display: flex; align-items: center; gap: 7px; padding: 6px 8px; border-radius: 5px;` 12px, `color: #a7b0bc`, hover `background: #1a1f26`. The active screen ("Shrine ambush (live)") gets `background: #1c1730`, `border-left: 2px solid #8f7ad6`, `color: #e6e9ee`. Each row: name (ellipsised), an optional `♪` in `#4fa88b` animating `om-pulse 2s infinite` when that screen has audio playing, and a hotkey keycap at 10px in `#5f6875` with `border: 1px solid #2b333d; border-radius: 3px; padding: 0 4px`.
  Content: The Vell Road (v), Shrine ambush (live) (a, audio), The Drowned Bell (b), Tower approach (t), Campaign PDF (page) (p), Party & downtime (y).
- **Prefabs list** — "PREFABS". Rows: `padding: 6px 8px; background: #161b21; border: 1px solid #232a33; border-radius: 7px;` 12px `color: #c3cad4`; hover `border-color: #4a3f6b; color: #e6e9ee`. Each has a `◧` glyph in `#8f7ad6`, a name, and a tile count in `#5f6875` at 10px.
  Content: Roadside Ambush (5 tiles), Merv's Magic Shop (4 tiles), Any Tavern (6 tiles), The Citadel (9 tiles).
- **Spacer** (`flex: 1`).
- **Soundscape mixer** — a card: `margin: 10px; padding: 9px 10px; background: #161b21; border: 1px solid #232a33; border-radius: 8px`. Header row: "SOUNDSCAPE" left, layer count ("2 layers") right. Then one row per layer, `gap: 7px`: an 8px round toggle dot (on: `background: #4fa88b; border: 1px solid #4fa88b`, pulsing; off: transparent with `border: 1px solid #3a434e`), the layer name at 11px (`#c3cad4` on, `#6f7987` off), and an 84×3 `<input type=range>` 0–100 with `accent-color: #8f7ad6`.
  Content: Rain, light (58, on), Crows (24, on), Campfire (40, off), Low drone (16, off).

---

### 3. Canvas (center, fills remaining width)

`position: relative; overflow: auto;` background `#0d1013` with a 28px dot-grid drawn as two
crossing `linear-gradient(#161b22 1px, transparent 1px)` layers at `background-size: 28px 28px`.
Inner scroll surface is a fixed `1180 × 900` positioned container.

**Prep-mode banner** (only when mode = prep): `position: sticky; top: 0;` `padding: 7px 12px;`
`background: rgba(18,22,27,.94); backdrop-filter: blur(6px);` bottom border `1px solid #232a33`,
11px `color: #8b95a3`. Reads: "**Prep mode**" (in `#a78bfa`, 600) · "snap 28px · collision on ·
handles shown" · right-aligned "Drag any tile header to move it".

**Tile chrome** (shared by all tiles): `position: absolute` with px left/top;
`background: #14181d; border: 1px solid #262d36; border-radius: 11px; overflow: hidden;`
`box-shadow: 0 14px 34px rgba(0,0,0,.45);` `display: flex; flex-direction: column`.
Header bar: `height: 30px; padding: 0 10px; background: #171c22;` bottom border
`1px solid #232a33`, `cursor: grab`, 11px/600 title, an accent glyph on the left, and a
right-aligned meta note at 10px in `#5f6875`. Tabbed tiles replace the header with
full-height tab buttons instead (see tab spec below).

Tile positions and sizes as designed:

| Tile | left | top | w | h |
|---|---|---|---|---|
| Map | 20 | 18 | 540 | 404 |
| Statblock | 580 | 18 | 296 | 404 |
| Rulebook PDFs (tabbed) | 20 | 442 | 352 | 336 |
| Scene notes | 392 | 442 | 268 | 336 |
| Dice / Generators (tabbed) | 680 | 442 | 300 | 336 |

**Tab button** style (used by the PDF and tools tiles): `flex: 1; border: 0; border-bottom:
2px solid <#8f7ad6 | transparent>; background: <#14181d | transparent>; color: <#e6e9ee |
#6f7987>;` 11px/500.

#### 3a. Map tile — "Improvised — Vell Road Shrine"
Glyph `▢` in `#8f7ad6`; meta "pinned · m". Its border is `#46375f` when the active combatant
is hostile and `#2f3a46` when it's a PC — the frame itself signals whose turn it is.

Map body background: `#10151a` under three radial gradients —
`radial-gradient(120px 90px at 22% 30%, rgba(79,168,139,.16), transparent 70%)`,
`radial-gradient(160px 120px at 74% 68%, rgba(143,122,214,.14), transparent 70%)`,
`radial-gradient(90px 70px at 55% 22%, rgba(208,178,90,.10), transparent 70%)`.
Over it: a 34px grid in `rgba(255,255,255,.028)`, a road (`left: 46%; top: 8%; width: 8%;
height: 84%; background: rgba(120,132,150,.10); transform: rotate(6deg)`), and a shrine
footprint (88×88 centered at 50%/34%, `border: 1px solid rgba(208,178,90,.35);
border-radius: 4px; background: rgba(208,178,90,.07)`) labelled "SHRINE" at 10px
`#8a7f5f`, `letter-spacing: .06em`.

**Tokens** — 26px circles, `margin: -13px 0 0 -13px` so the stored x/y percentage is the
center. Initial letter at 11px/600 in `#0d1013`. Fill `#4fa88b` for PCs, `#c9573f` for
hostiles, `#232a33` at `opacity: .5` when at 0 hp. Border `2px solid rgba(0,0,0,.4)`, or
`#a78bfa` plus `animation: om-ring 1.6s infinite` for the active combatant. `title` attribute
is `"<name> · <hp>/<max>"`. Clicking a token selects that combatant (drives the statblock tile).
Footnote at bottom-left, 10px `#56606d`: "tokens follow the initiative order · click one to open its sheet".

#### 3b. Statblock tile
Glyph `✦` in `#c9573f`; meta "live". Shows the **selected** combatant (falls back to the
active one). Body `padding: 12px`, scrollable.

- Name — `'Crimson Pro', Georgia, serif` 21px/600, `letter-spacing: -.01em`.
- Meta line — 11px italic `#8b95a3`: `"player character · <class>"` or `"hostile · <badge> · AC 15"`.
- HP row — current hp in Crimson Pro 30px/600, colored by the HP color rule below, `tabular-nums`; then `/ <max> hp` at 12px `#6f7987`; then a right-aligned state tag: `padding: 2px 8px; border-radius: 5px;` 10px/600. Tag text is "down" at 0 hp, else the joined condition list if any, else "bloodied" at ≤50%, else "steady". Tag colors: bloodied/down `background: #211514; color: #e08d7c`; otherwise `background: #191f26; color: #8b95a3`.
- HP bar — 5px tall, track `#202730`, `border-radius: 3px`, fill colored by the HP rule, `transition: width .18s ease`.
- Damage/heal row — 4 buttons in a `repeat(4, 1fr)` grid, `gap: 5px`, `height: 28px`, `border-radius: 6px`, 12px. Damage (−5, −1): `background: #211514; border: 1px solid #452a26; color: #e08d7c`, hover `#2c1a18`. Heal (+1, +5): `background: #14201b; border: 1px solid #274539; color: #74c3a7`, hover `#182a23`.
- "CONDITIONS" — pill toggles, `padding: 3px 9px; border-radius: 12px;` 10.5px. Off: transparent, `border: 1px solid #2b333d`, `color: #8b95a3`. On: `background: #22192e; border: 1px solid #46375f; color: #c4b2ff`. Set: Prone, Frightened, Restrained, Blinded, Blessed.
- "ACTIONS" — Crimson Pro 14px, `line-height: 1.45`, `color: #c3cad4`, action names bold italic. Content: "*Scimitar.* +5 to hit, reach 5 ft. *Hit:* 6 (1d6+3) slashing." / "*Parry.* +2 AC against one melee attack."

#### 3c. Rulebook tile
Three tabs: Core Rules, Bestiary, Region Gazetteer. Body `padding: 13px 14px`, Crimson Pro.
Top meta row (Space Grotesk 10px `#6f7987`, uppercase, `letter-spacing: .06em`): book name
left, "p. <page>" right. Then the entry title at 17px/600, the body at 15px/`line-height: 1.5`
in `#c3cad4`, and a tail note separated by `padding-top: 10px; border-top: 1px solid #232a33`
at 14px in `#8b95a3`. Content is driven by whatever the command palette last opened.

#### 3d. Scene notes tile
Glyph `✎` in `#d0b25a`; meta "saved". Crimson Pro 15px/1.5.
Title "They took the shrine road" at 16px/600; subtitle "Nobody prepped this. Improvise from
the bandit table." in `#8b95a3`. Then a checklist: 14px square boxes, `border-radius: 4px`,
unchecked `border: 1px solid #3a434e`, checked `border-color: #4fa88b; background:
rgba(79,168,139,.15)` with a `✓` in `#4fa88b`; checked labels go `#6f7987` + line-through.
Items: "Captain talks first, fights second" (done), "Copper bowl is empty — someone took it",
"Wolf breaks if the captain drops", "Name the saint if anyone asks".
Footer hint, Space Grotesk 11px `#56606d`: "Type / for a table, roll, or callout".

#### 3e. Dice / Generators tile
Two tabs.

**Dice** — the last total in Crimson Pro 34px/600 `tabular-nums` (`#e6e9ee`, or `#d0b25a` on a
natural 20), beside a detail line at 11px `#8b95a3` reading `"<spec> → <individual rolls>"`.
Then a `repeat(4, 1fr)` grid of die buttons, `height: 30px; background: #191f26; border: 1px
solid #2b333d; border-radius: 6px;` 11px `#c3cad4`, hover `border-color: #4a3f6b; color:
#e6e9ee`. Dice: d4, d6, d8, d10, d12, d20, 2d6, d100. Then "HISTORY": scrolling rows at 11px
`tabular-nums` — spec (46px wide, `#5f6875`), detail (`#8b95a3`, flex), total (`#e6e9ee`, 600).

**Generators** — three cards, `padding: 9px 10px; background: #191f26; border: 1px solid
#232a33; border-radius: 8px`. Header row: generator name as a section label, plus a "roll"
button (`background: #22192e; border: 1px solid #46375f; border-radius: 5px; color: #c4b2ff;
padding: 2px 7px;` 10px, hover `#2c2140`). Result below in Crimson Pro 15px `#e6e9ee`.
Footer note 11px `#56606d`: "Results drop into scene notes with one click."
Pools — NPC name: Halvard Renn, Ysolde Fairwater, Bram Ockley, Nessa Vint, Corvin Ashgrove,
Tilda Rook. Pocket loot: A brass key, cold to the touch / 37 sp and a pawn ticket / Vial of
grave-moss tincture / Half a map, torn along the river / Signet ring, house unknown.
Encounter: Three bandits arguing over a corpse / A shrine swept clean this morning / Cart
wheel, blood on the axle / A pilgrim who won't give a name.

---

### 4. Right rail (306px)

`background: #12161b`, left border `1px solid #232a33`, column flex.

- **Header** — "INITIATIVE · ROUND <n>" section label, plus a "Next ⏎" button (`background: #22192e; border: 1px solid #46375f; border-radius: 6px; color: #c4b2ff; padding: 3px 9px;` 11px, hover `#2c2140`).
- **Initiative rows** — `display: flex; align-items: center; gap: 9px; padding: 6px 7px; border-radius: 7px`. Active: `background: #1c1730`. Selected (not active): `background: #191f26` plus `box-shadow: inset 0 0 0 1px #3a3352`. Downed: `opacity: .55`. Hover: `background: #1a1f26`.
  Each row: a 26×26 initiative box (`border-radius: 6px;` 11.5px/600 `tabular-nums`; active `background: #2c2140; color: #c4b2ff`, else `#191f26` / `#8b95a3`); a column with the name (12.5px, weight 600 when active, `#6f7987` + line-through at 0 hp) and a class/role badge at 10px `#6f7987`, above a 3px HP bar (track `#202730`, fill by the HP color rule, `transition: width .18s ease`); and a right-aligned hp label at 10px `#6f7987`, 42px wide — `"<hp>/<max>"`, or "down" for a hostile at 0.
  Clicking a row selects that combatant.
- **Party · passives** — separated by `padding-top: 10px; border-top: 1px solid #232a33`. A `1fr 34px 34px 34px` grid per row at 11px `tabular-nums`: name (`#c3cad4`), passive perception and insight (`#8b95a3`), AC (`#d0b25a`). Below the rows, a header strip of the same grid at 9px uppercase `#5f6875`: per / ins / ac.
  Content: Maerith 16/12/15, Dorn 11/10/18, Iskra 13/15/12, Pell 14/16/16.
- **Session log** — same top-border separation. Scrolling list, newest first, `gap: 5px`. Each entry: a timestamp at 11px `tabular-nums` `#4a5361`, then the text at 11px/1.35 in `#a7b0bc` (or `#e08d7c` for a "hot" entry — currently only "X is down").
  Seeded entries: 2:12 "Party left the marked road — no prep for this"; 2:13 "Dropped prefab “Roadside Ambush” (5 tiles)"; 2:14 "Round 1 — Maerith surprised the archers".

---

### 5. Status bar (30px)

`display: flex; align-items: center; gap: 14px; padding: 0 12px; background: #12161b;`
top border `1px solid #232a33`, 10.5px `color: #5f6875`.
Left: "<n> tiles · 6 screens", "saved <n>s ago", "offline". Right: cast status
("nothing shared" / "casting 1 tile to TV"), "⌘Z undo", "alt = free place".

---

### 6. Player view overlay (conditional)

`position: fixed; right: 22px; bottom: 46px; width: 320px; z-index: 60;`
`background: #0b0e12; border: 1px solid #46375f; border-radius: 11px;`
`box-shadow: 0 22px 60px rgba(0,0,0,.7)`.
Header (28px, `background: #191325`, bottom border `1px solid #2f2545`, `cursor: grab`): a
pulsing 6px `#a78bfa` dot, "Player view · living room TV" at 11px/600 `#c4b2ff`, and a `✕`
close button in `#6f7987`.
Body: 176px tall, the same map gradients minus the gold one, a 22px grid at
`rgba(255,255,255,.03)`, a 54×54 shrine footprint, and 18px tokens (PC green / hostile red /
`#3a434e` when down) — **no hp, no names, no conditions**.
Footer: 7px 10px, 10.5px `#6f7987` — "Map only. Notes, statblocks, and hp stay on your screen."

In production this is a real second window (Electron `BrowserWindow` / popout), not an
in-page panel. The panel is the prototype's stand-in for it.

---

### 7. Command palette overlay (conditional)

Scrim: `position: fixed; inset: 0; background: rgba(6,8,11,.62); backdrop-filter: blur(3px);
z-index: 90;` centered horizontally, `padding-top: 96px`. Clicking the scrim closes it;
clicks inside the dialog must stop propagation.
Dialog: `width: 620px; max-height: 460px; background: #14181d; border: 1px solid #333b47;
border-radius: 13px; box-shadow: 0 30px 80px rgba(0,0,0,.75)`.
Query input: `height: 46px; padding: 0 16px;` transparent, bottom border `1px solid #232a33`,
15px, autofocused on open. Placeholder: "Search across 9 loaded PDFs, screens, tiles and monsters…".
Result rows: `padding: 8px 10px; border-radius: 8px; gap: 10px;` hover `background: #1c222a`.
Each row: a kind chip (`padding: 2px 7px; border-radius: 5px;` 9.5px/600 uppercase,
`letter-spacing: .07em` — rule `#22192e`/`#c4b2ff`, screen `#132420`/`#74c3a7`, tile
`#241f13`/`#d0b25a`); a title at 13px/500 above a one-line ellipsised subtitle at 11px
`#6f7987`; and right meta at 10px `#4a5361` ("<book> p.<page>" or "open").
Empty state, centered, `padding: 22px`, 12px `#6f7987`: "Nothing matches. Everything else is
in the marketplace."
Footer: `padding: 8px 14px;` top border `1px solid #232a33`, 10.5px `#56606d`, four hints —
"↑↓ move", "⏎ open in tile", "⇧⏎ open as page", "esc close". (Arrow-key result navigation is
specified in the footer but **not** implemented in the prototype — implement it.)

Search matches, case-insensitively, across title + book + body + subtitle of the index, capped
at 7 results. The index in the prototype holds 8 rules (across three books), 2 screens, and 2
tiles; the real index is the loaded PDF corpus plus the user's screens and tiles.

## Interactions & Behavior

| Trigger | Behavior |
|---|---|
| "Next ⏎" or `Enter` (when palette closed) | Advance `turn` by 1, wrapping. On wrap, `round += 1`. If the new active combatant is hostile, select it (opens its statblock). Append a log entry: `"<name>’s turn"`, prefixed `"Round <n> — "` on a wrap. |
| Click a token or an initiative row | Set the selected combatant; the statblock tile follows it. |
| −5 / −1 / +1 / +5 | Clamp hp to 0…max. Log `"<name> took <n> → <hp>/<max>"` or `"<name> healed <n> → …"`. If hp just crossed to 0: `"<name> is down"`, flagged hot (red). If it just crossed ≤50%: `"<name> is bloodied (<hp>/<max>)"`. |
| Condition pill | Toggle on the selected combatant only. |
| Die button | Roll n dice of f faces, prepend `{spec, individual rolls, total}` to history (cap 24), log `"Rolled <spec> → <total>"`. A d20 total of 20 renders gold. |
| Generator "roll" | Pick uniformly from that pool, replace the card value, log `"<generator>: <value>"`. |
| Prefab row | Add its tile count to the tile counter, log `"Dropped prefab “<name>”"`. |
| Screen row | Log `"Switched to screen “<name>”"`. (In production: switch canvases, preserving each one's state exactly.) |
| Sidebar filter | Substring-filter the screen list, case-insensitive. |
| Sound toggle dot | Toggle that layer. Moving a slider above 0 also turns the layer on. |
| Show players | Toggle the player view. Log `"Shared the map to the TV"` / `"Stopped sharing"`. |
| `⌘K` / `Ctrl+K` / clicking the header search | Open the palette with an empty query, focus the input. |
| `Esc` | Close the palette. |
| Palette result (rule) | Load that excerpt into the rulebook tile, switch the tile to that book's tab, close the palette, log `"Opened “<title>” in a tile"`. |
| Drag a tile header | Move the tile. Snap left/top to a 28px grid; holding `Alt` places freely. Clamp to ≥0. Raise `z-index` to 40 while dragging. The player-view window is excluded from canvas dragging. |
| Prep / Run | Prep shows the prep banner and turns the header status dot gold; Run shows the green dot and the running clock. |
| Session clock | Increments every 1000ms from 8046s; rendered `h:mm:ss`. Log timestamps use `h:mm` from the same clock. |

Transitions: HP bars `width .18s ease`. Keyframes: `om-pulse` (opacity .35 → 1 → .35) for
audio/status dots; `om-ring` (`box-shadow: 0 0 0 0 rgba(167,139,250,.55)` → `0 0 0 12px
rgba(167,139,250,0)`) on the active token, 1.6s infinite.

Not designed: loading states, error states, form validation, responsive breakpoints. This is
a fixed-layout desktop app; below ~1200px the three-column body gets uncomfortable, and the
header search label must clip rather than wrap (see 1).

## State Management

```
mode          'prep' | 'play'
turn          index into combatants (initiative order, pre-sorted desc)
round         integer
secs          session seconds, ticking
castOn        boolean — player view open
paletteOpen   boolean
query         palette query string
navQuery      sidebar filter string
book          0..2 — active rulebook tab
excerpt       index into the rules corpus — what the rulebook tile shows
tool          'dice' | 'gen' — active tab of the tools tile
sel           combatant id shown in the statblock
tiles         tile count (status bar)
combatants    [{ id, name, init, hp, max, pc, badge, x, y, conds[] }]
sounds        [{ name, level, on }]
beats         [{ name, done }]
gens          [{ name, value }]
rolls         [{ die, detail, total, crit }]
log           [{ t, text, hot? }]
```

Derived, not stored: `active = combatants[turn]`; `sel` resolves to `active` if unset;
`pct = round(hp/max*100)`; HP color = `#5f6875` at 0 hp, else `#c9573f` at ≤50%, else
`#4fa88b` for PCs and `#8f7ad6` for hostiles.

Tile geometry is **not** in React state in the prototype — dragging writes `style.left/top`
imperatively via a delegated `pointerdown` handler, so a re-render doesn't fight the drag.
In production, persist tile geometry per screen (and debounce writes), but keep the drag
itself off the render path.

No data fetching in the prototype; everything is local. Production needs: campaign/screen/tile
persistence, a PDF index for search, the plugin/marketplace surface, and an audio engine for
the mixer.

## Design Tokens

Colors
```
canvas / app bg      #0d1013
panel bg             #12161b
tile bg              #14181d
tile header          #171c22
raised / inset       #191f26   #161b21
border               #232a33   (subtle)  #262d36 (control)  #2b333d (control 2)  #333b47 (dialog)
map bg               #10151a
text                 #e6e9ee
text secondary       #c3cad4   #a7b0bc
text muted           #8b95a3
text faint           #6f7987   #5f6875   #56606d   #4a5361
accent violet        #8f7ad6   bright #a78bfa   text #c4b2ff   deep #6d5bb5
accent surface       #22192e   hover #2c2140   active row #1c1730   inset ring #3a3352
hostile / danger     #c9573f   text #e08d7c   surface #211514   border #452a26
ally / ok            #4fa88b   text #74c3a7   surface #14201b   border #274539
gold                 #d0b25a   map label #8a7f5f
```

Spacing — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 18, 22px in use; the canvas snap grid is 28px.

Typography
```
UI          'Space Grotesk' — 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13px; weights 400/500/600/700
Prose       'Crimson Pro'   — 14, 15, 16, 17, 21, 30, 34px; weights 400/600, italic for action names
uppercase labels: 10px/600, letter-spacing .09em
chips:            9.5px/600, letter-spacing .07em
numerals:         font-variant-numeric: tabular-nums everywhere a number changes
```

Radius — 3, 4, 5, 6, 7, 8, 11, 12(pill), 13px. Border width 1px; 2px for token rings and tab underlines.

Shadows
```
tile        0 14px 34px rgba(0,0,0,.45)
popout      0 22px 60px rgba(0,0,0,.7)
dialog      0 30px 80px rgba(0,0,0,.75)
selected    inset 0 0 0 1px #3a3352
```

## Assets

None. No images, no icon library. Icons are single Unicode glyphs (`▢ ✦ ✎ ◧ ♪ ⌕ ✕ ✓ ⏎ ⌘`) —
replace them with your icon set in production. Fonts are Google Fonts: Crimson Pro
(400, 600, 400 italic) and Space Grotesk (400–700). The map and the player-view map are CSS
gradient compositions standing in for real map art or a VTT surface.

## Files

- `screenshots/01-run-mode.png` — the default state: Run mode, round 2, Bandit Captain's turn.
- `screenshots/02-player-view.png` — "Show players" on, player-view window bottom-right.
- `screenshots/03-command-palette.png` — the ⌘K palette over the app.
- `screenshots/04-prep-mode.png` — Prep mode, with the prep banner on the canvas.
  (Captured at ~916px wide, narrower than the 1440px design width — treat the layout
  proportions in this README as authoritative over the screenshots.)
- `DM Screen.dc.html` — the prototype. Template (markup + inline styles) then a logic class (state, handlers, derived styles).
- `support.js` — the runtime that resolves the prototype format. Needed only to open the file in a browser; not something to port.

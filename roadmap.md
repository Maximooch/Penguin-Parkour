# Roadmap: Echoes of Keru

Last updated: 2026-08-08

## North star

Echoes of Keru is a small, welcoming 2D exploration-platformer about a penguin courier following a living lantern through an ancient city beneath the ice. The player should feel clever because movement is expressive and the ruins reward curiosity—not because the game relies on punishment or opaque puzzles.

The target experience is a polished ten-minute vertical slice that can grow into a short campaign: readable controls, satisfying parkour, distinct ruin spaces, and a world with enough warmth to make the mystery matter.

## Current slice — playable now

- Three data-driven levels: The Drowned Steps, The Bell Gallery, and The Blue Archive.
- Responsive run, jump, double-jump, and air-dash movement.
- Lantern-shard collectibles, Keru glyphs, checkpoints, hazards, and an exit door.
- Level completion and progression back to the level picker.
- A distinct visual treatment and ambient music loop for each zone.
- Jump and landing sound effects from CC0 sources, with attribution in `credits.md`.
- A start screen, objective HUD, mute control, keyboard controls, and a lightweight static-server setup.

## Next — make the first ten minutes sing

### Movement feel

- Add a short coyote-time and jump-buffer window so near-misses feel fair.
- Add clearer landing feedback: a small squash, dust/snow puff, and a soft camera nudge.
- Give the dash a visible trail and a slightly stronger audio cue.
- Tune camera follow and level geometry from repeated playtests rather than adding more verbs immediately.

Acceptance: a new player can reach the first exit without explanation, and a missed jump is usually understandable rather than surprising.

### Level presentation

- Add a compact level-intro card when entering a zone, showing its name and one evocative line.
- Add a brief completion beat before loading the next zone so collecting shards and reaching the door feel consequential.
- Make the exit door, checkpoints, and optional glyphs visually distinct at a glance.
- Add one optional “high route” in each level for players who want a harder parkour line.

Acceptance: each zone has a recognizable rhythm—learn, improvise, recover, and discover—and no level is solved by simply holding right.

### Accessibility and resilience

- Add a reduced-motion option and a high-contrast player marker.
- Make all core actions rebindable or provide an on-screen control reference.
- Keep audio optional, local, and silent when a file cannot be loaded.
- Test keyboard-only play at common laptop viewport sizes.

Acceptance: the game remains playable without audio, with reduced motion, and after a refresh during any level.

## Later — campaign expansion

### Zone 4: The Observatory

A long final climb where reunited lantern shards reveal constellations between platforms. Introduce moving star platforms and a gentle wind current. The observatory should be a culmination of existing movement skills, not a new tutorial.

### World progression

- A small field journal with discovered glyph translations and postcard-style screenshots.
- Optional bell-crab encounters that change routes without becoming combat.
- A tide state that gently changes the Drowned Steps on repeat visits.
- A final lantern sequence that explains why Keru vanished and gives the rookery a reason to return.

### Tooling and shipping

- Move level data and audio metadata into clearly named modules if the single-file prototype becomes difficult to tune.
- Add automated smoke checks for asset paths, level IDs, and progression order.
- Add a production build and a hosted demo once the visual slice is stable.
- Keep third-party assets documented with source, creator, and license in `credits.md`.

## Milestones

| Milestone | Outcome | Exit criteria |
| --- | --- | --- |
| M0: Prototype | A playable movement toy | Start, move, jump, collect, and finish one room |
| M1: Vertical slice | Three memorable ruin zones | All current levels are completable, readable, and audio-safe |
| M2: Feel pass | Movement feels generous and expressive | Coyote time, jump buffering, landing feedback, and dash readability |
| M3: Campaign | A complete short expedition | Observatory, journal, shard arc, and a satisfying ending |
| M4: Release | Easy to play and easy to share | Build script, hosted demo, credits, smoke checks, and accessibility pass |

## Goal loop

For each pass, pick one small item from **Next**, make it observable in play, then verify it in a browser at desktop and narrow viewport sizes. Keep the loop short:

1. Choose the smallest change that improves player understanding or delight.
2. Implement it without introducing a new system unless the current one cannot support it.
3. Play the path from start to exit; check console output, asset requests, and reset behavior.
4. Record any new design decision here or in `brainstorm.md`.
5. Ship a coherent slice before starting the next item.

## Open questions

- Should the lantern shards unlock a persistent ability, or remain a narrative collection goal?
- Is the Observatory a final level or a hub that sends the player back through altered ruins?
- When the game grows beyond three levels, should the level picker become a map of the buried city?
- Which movement mechanic earns its complexity: wall-jump, snow-slide, or echo-jump?

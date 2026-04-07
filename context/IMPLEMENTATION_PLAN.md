# Voxel Penguin Parkour — Implementation Plan

**Updated:** 2026-04-07
**Status:** Phases 1-3 complete, Phase 4 in progress
**Live:** https://voxel-penguin-parkour.vercel.app

---

## Completed

- ✅ Phase 1: Vite + modular architecture
- ✅ Phase 2: Core systems (Game, Input, Physics, Penguin, Camera, Entity)
- ✅ Phase 3: Level system (JSON loading, InstancedMesh, platform friction)
- ✅ Bug fix: LevelManager key parsing NaN collision boxes
- ✅ Bug fix: PenguinController.resetPosition() Entity sync
- ✅ Deployed to Vercel

---

## Phase 4: UI, Settings & Audio

### Ship 1: SettingsManager (foundation for everything else)

**Files:** `src/core/SettingsManager.js`

**Scope:**
- localStorage persistence with JSON serialization
- Default settings with merge-on-load
- Settings schema:
  - `mouseSensitivity`: 0.1–5.0 (default 1.0)
  - `masterVolume`: 0.0–1.0 (default 0.8)
  - `musicVolume`: 0.0–1.0 (default 0.6)
  - `sfxVolume`: 0.0–1.0 (default 1.0)
  - `graphics.shadows`: boolean (default true)
  - `graphics.particles`: boolean (default true)
  - `graphics.fov`: 50–90 (default 60)
- `get(key)`, `set(key, value)`, `save()`, `load()`, `reset()`
- Emit change events so other managers can react

**Acceptance:**
- [ ] Settings survive page reload
- [ ] Mouse sensitivity actually changes camera rotation speed
- [ ] FOV setting changes camera FOV
- [ ] Invalid values clamp to allowed range

---

### Ship 2: UIManager (menus, HUD, controls display)

**Files:** `src/managers/UIManager.js`, updates to `index.html` + `styles.css`

**Scope:**
- **Controls overlay** — shown on first play, dismissible
  - WASD: Move, Space: Jump, Shift: Sprint, Esc: Pause
- **HUD** — always visible during PLAYING state
  - Level name (top-left)
  - Timer (top-center)
  - Collectibles counter (top-right, placeholder)
- **Pause menu** — Esc key, overlay on canvas
  - Resume / Settings / Restart / Quit to Menu
  - Pointer lock released on pause, re-acquired on resume
- **Victory screen** — shown on goal reach
  - Time, collectibles, Restart / Next Level buttons
- **Game over screen** — shown on fall (optional, currently auto-resets)
- **Settings panel** — accessible from pause menu
  - Mouse sensitivity slider
  - Volume sliders (master/music/sfx)
  - Graphics toggles (shadows, particles)
  - FOV slider

**Acceptance:**
- [ ] Esc opens pause menu, pointer lock releases
- [ ] Resume closes menu, re-locks pointer
- [ ] Controls overlay shows on first play
- [ ] HUD shows level name + timer
- [ ] Victory screen shows time + restart option
- [ ] Settings panel reads/writes via SettingsManager

---

### Ship 3: AudioManager (sound infrastructure)

**Files:** `src/managers/AudioManager.js`, `public/audio/` (placeholder)

**Scope:**
- Web Audio API wrapper
- `playSFX(name, volume)` — one-shot sounds with pitch variation
- `playMusic(name, loop)` — background music with fade
- `stopMusic()`, `stopAll()`
- Volume controls respect SettingsManager values
- Stub mode: if audio files missing, log silently (no errors)

**Acceptance:**
- [ ] No console errors when no audio files present
- [ ] Volume changes in settings immediately affect playback
- [ ] SFX plays with slight random pitch variation

---

### Ship 4: Key Rebinding

**Files:** Updates to `InputManager.js`, `UIManager.js`

**Scope:**
- InputManager reads key bindings from SettingsManager
- Default bindings: WASD, Space, Shift, Esc
- Settings panel shows current bindings
- Click binding → press new key → saved
- Support primary + alternate bindings

**Acceptance:**
- [ ] Can rebind movement keys
- [ ] Can rebind jump/sprint
- [ ] Rebinds persist across reloads
- [ ] Conflicting bindings show warning

---

## Phase 5: Gameplay Expansion

### Ship 5: Collectibles System

**Files:** `src/entities/Collectible.js`, updates to LevelManager, PhysicsWorld

**Scope:**
- Fish collectibles placed in level JSON
- Proximity-based pickup (no physics needed)
- Collect counter in HUD
- Pickup SFX + visual feedback

**Acceptance:**
- [ ] Fish appear at positions from level JSON
- [ ] Walking near fish picks it up
- [ ] HUD counter increments
- [ ] All fish collected shows in victory screen

---

### Ship 6: Level Progression

**Files:** `public/levels/level2.json`, updates to LevelManager, Game, UIManager

**Scope:**
- Level select screen (from menu)
- Auto-advance to next level on victory
- Level 2: harder jumps, ice emphasis
- Level 3: moving platforms (if physics supports)

**Acceptance:**
- [ ] Victory screen has "Next Level" button
- [ ] Level 2 loads and plays correctly
- [ ] Can return to level select from pause menu

---

### Ship 7: Advanced Movement

**Files:** Updates to PenguinController, PhysicsWorld

**Scope:**
- Variable jump height (hold space = higher)
- Wall collision detection (side faces, not just top)
- Wall slide (slow fall when against wall)
- Wall jump (jump off walls)
- Dash (E key, cooldown)

**Acceptance:**
- [ ] Tap jump = short hop, hold = full jump
- [ ] Penguin stops at wall edges (no phasing through)
- [ ] Can wall-slide and wall-jump
- [ ] Dash works with cooldown indicator

---

## Phase 6: Polish

- Landing particles
- Camera shake on hard landings
- Better speed lines
- Dash trail effect
- Wall-slide particles
- Mobile touch controls (stretch goal)
- Level creator tool (far future)

---

## Known Issues

1. **Physics is top-surface only** — no wall/side/bottom collision, penguin phases through walls
2. **GC pressure** — `getActions()` creates new Vector2 every frame
3. **Monkey-patched game.update** — goal animation added via binding override in main.js
4. **Memory leak** — `clearLevel()` doesn't dispose geometries/materials
5. **No camera collision** — camera can clip through platforms
6. **Legacy files** — `.bak` files and `Penguin-Parkour.html` monolith still in repo (gitignored)

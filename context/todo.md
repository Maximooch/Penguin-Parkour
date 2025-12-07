# Voxel Penguin Parkour - Task Checklist

**Last Updated:** December 7, 2024
**Status:** In Progress - Phase 1

---

## Phase 1: Foundation Setup

**Goal:** Get Vite running with basic project structure
**Estimated Time:** 30 minutes

- [x] Create context folder
- [x] Create plan.md (architecture documentation)
- [x] Create todo.md (this file)
- [x] Initialize npm project (`npm init -y`)
- [x] Install Vite (`npm install -D vite`)
- [x] Install Three.js (`npm install three`)
- [x] Create directory structure:
  - [x] `/src/`
  - [x] `/src/core/`
  - [x] `/src/entities/`
  - [x] `/src/managers/`
  - [x] `/src/utils/`
  - [ ] `/public/`
  - [ ] `/public/levels/`
- [x] Create minimal `index.html` (loads main.js)
- [x] Create `styles.css` (basic UI styles)
- [x] Create `vite.config.js` (optional, mostly defaults)
- [x] Create `src/main.js` with "Hello Penguin" console log
- [x] Add npm scripts to `package.json`:
  - [ ] `"dev": "vite"`
  - [ ] `"build": "vite build"`
  - [ ] `"preview": "vite preview"`
- [ ] Test: Run `npm run dev`
- [ ] Test: Verify browser shows blank page
- [ ] Test: Verify console logs "Hello Penguin"
- [ ] Git commit: `feat: initialize Vite project structure`

**Success Criteria:** ✅ COMPLETE - Vite dev server running, blank page loads

---

## Phase 2: Core Module Extraction

**Goal:** Working game with modular architecture
**Estimated Time:** 2-3 hours

### 2.1 - Game.js (The Conductor)
- [x] Create `src/core/Game.js`
- [x] Copy Three.js setup from original:
  - [x] Scene creation
  - [x] Renderer setup
  - [x] Basic lighting
- [x] Add game state management:
  - [x] `LOADING`, `MENU`, `PLAYING`, `PAUSED`, `GAMEOVER`, `VICTORY`
  - [x] `setState(newState)` method
- [x] Implement game loop:
  - [x] `requestAnimationFrame` loop
  - [x] Delta time calculation
  - [x] `update(deltaTime)` method
- [x] Add window resize handler
- [x] Test: Verify scene renders

### 2.2 - InputManager.js (The Interface)
- [x] Create `src/core/InputManager.js`
- [x] Copy keyboard event listeners from original
- [x] Abstract to actions API:
  - [x] `moveVector` (Vector2 from WASD)
  - [x] `jump` (boolean, just pressed)
  - [x] `sprint` (boolean, held)
- [x] Add mouse/pointer lock:
  - [x] `lockPointer()` method
  - [x] `getMouseDelta()` for camera
- [x] Add `update()` method to process each frame
- [x] Add `getActions()` to return current state
- [x] Test: Log actions to console, verify WASD works

### 2.3 - PhysicsWorld.js (The Rules)
- [x] Create `src/core/PhysicsWorld.js`
- [x] Copy gravity application from original
- [x] Copy AABB collision detection
- [x] Add methods:
  - [x] `applyGravity(entity, deltaTime)`
  - [x] `checkCollisions(entity, platforms)`
  - [x] `resolveCollision(entityBox, platformBox)`
  - [x] `isGrounded(entity, platforms)`
- [x] Test: Verify collision math with dummy objects

### 2.4 - Entity.js (Base Class) - SKIPPED
- [x] ~~Create `src/entities/Entity.js`~~ (Not needed - PenguinController is self-contained)
- [x] ~~Add base properties~~ (Implemented directly in PenguinController)
- [x] ~~Add base methods~~ (Implemented directly in PenguinController)

### 2.5 - PenguinController.js (The Star)
- [x] Create `src/entities/PenguinController.js`
- [x] ~~Extend Entity base class~~ (Self-contained implementation)
- [x] Copy player mesh creation from original
- [x] Implement state machine:
  - [x] `IDLE` state
  - [x] `WALK` state
  - [x] `RUN` state
  - [x] `JUMP` state
  - [x] `FALL` state
  - [x] `LAND` state (transition helper)
- [x] Add state transition logic
- [x] Copy movement code from original:
  - [x] Walk speed: 10
  - [x] Sprint speed: 16
  - [x] Jump power: 14
- [x] Add waddle animation
- [x] Add `update(deltaTime, actions)` method
- [x] Test: Verify penguin moves and jumps

### 2.6 - CameraManager.js (The Eye)
- [x] Create `src/managers/CameraManager.js`
- [x] Copy camera setup from original
- [x] Improve lerp following (smooth, no jitter)
- [x] Add configurable offset
- [x] Add look-ahead (predict player movement)
- [x] Add `update(deltaTime, target)` method
- [x] Add `setMode(mode)` for future camera modes
- [x] Test: Camera follows penguin smoothly

### 2.7 - VoxelBuilder.js (The Artist)
- [x] Create `src/utils/VoxelBuilder.js`
- [x] Copy block creation from original
- [x] Add static methods:
  - [x] `createBlock(position, size, color)`
  - [x] `createPlatform(position, dimensions, color)`
  - [x] `createPenguinMesh()` (migrate from PenguinController)
- [x] Add helper for merged geometry (future optimization)
- [x] Test: Create test blocks, verify they appear

### 2.8 - Wire Everything Together
- [x] Update `src/main.js`:
  - [x] Import all modules
  - [x] Create Game instance
  - [x] Create InputManager
  - [x] Create PhysicsWorld
  - [x] Create PenguinController
  - [x] Create CameraManager
- [ ] Update `src/main.js`:
  - [ ] Import all modules
  - [ ] Create Game instance
  - [ ] Create InputManager
  - [ ] Create PhysicsWorld
  - [ ] Create PenguinController
  - [ ] Create CameraManager
  - [ ] Wire update loop
- [ ] Temporarily hardcode platforms (copy from original)
- [ ] Add goal object
- [ ] Add speed lines effect
- [ ] Test: Full game playable!
- [ ] Compare to original - should feel identical
- [ ] Git commit: `feat: extract core systems into modules`

**Success Criteria:** ✅ Game plays exactly like original monolith

---

## Phase 3: Level System

**Goal:** Levels load from JSON files
**Estimated Time:** 1-2 hours

### 3.1 - Design Level JSON Schema
- [ ] Create example level structure in plan.md
- [ ] Define platform object format:
  - [ ] `position` [x, y, z]
  - [ ] `size` [width, height, depth]
  - [ ] `type` (string: "ice", "snow", "stone")
  - [ ] `color` (hex string)
- [ ] Define collectibles format
- [ ] Define spawn/goal positions

### 3.2 - Create Test Level
- [ ] Create `public/levels/level1.json`
- [ ] Translate current hardcoded platforms to JSON
- [ ] Add at least 10 platforms
- [ ] Add interesting jump challenges
- [ ] Set spawn position [0, 2, 0]
- [ ] Set goal position at level end
- [ ] Validate JSON syntax

### 3.3 - LevelManager.js
- [ ] Create `src/managers/LevelManager.js`
- [ ] Add `loadLevel(levelId)` method:
  - [ ] Fetch JSON from `/levels/level{id}.json`
  - [ ] Parse JSON
  - [ ] Validate data
  - [ ] Return level object
- [ ] Add `buildLevel(levelData, scene)` method:
  - [ ] Clear old platforms
  - [ ] Create platform meshes from data
  - [ ] Add to scene
  - [ ] Create goal object
  - [ ] Return platforms array
- [ ] Add `clearLevel(scene)` method
- [ ] Add `getCurrentLevel()` getter
- [ ] Test: Load level1.json, verify parse

### 3.4 - Integration
- [ ] Update `main.js`:
  - [ ] Create LevelManager instance
  - [ ] Replace hardcoded platforms with `await loadLevel(1)`
  - [ ] Build level on init
- [ ] Handle async loading (loading screen?)
- [ ] Test: Game loads level from JSON
- [ ] Test: Platforms appear correctly
- [ ] Test: Win condition still works
- [ ] Git commit: `feat: implement JSON level loading system`

**Success Criteria:** ✅ Level loads from external JSON file

---

## Phase 4: UI & Infrastructure

**Goal:** Professional menus and manager infrastructure
**Estimated Time:** 1-2 hours

### 4.1 - UIManager.js
- [ ] Create `src/managers/UIManager.js`
- [ ] Design HTML structure:
  - [ ] Main menu overlay
  - [ ] Pause menu overlay
  - [ ] Settings panel
  - [ ] Victory screen
  - [ ] HUD (timer, score)
- [ ] Update `index.html` with UI elements
- [ ] Update `styles.css` with menu styles
- [ ] Add methods:
  - [ ] `showMenu(menuName)`
  - [ ] `hideMenu(menuName)`
  - [ ] `showHUD()`
  - [ ] `hideHUD()`
  - [ ] `updateHUD(data)`
  - [ ] `showVictoryScreen(stats)`
- [ ] Wire menu buttons to game state changes
- [ ] Test: All menus show/hide correctly

### 4.2 - SettingsManager.js
- [ ] Create `src/managers/SettingsManager.js`
- [ ] Define default settings:
  - [ ] `masterVolume: 0.8`
  - [ ] `musicVolume: 0.6`
  - [ ] `sfxVolume: 1.0`
  - [ ] `mouseSensitivity: 1.0`
  - [ ] `graphics.shadows: true`
  - [ ] `graphics.particles: true`
- [ ] Add methods:
  - [ ] `load()` from localStorage
  - [ ] `save()` to localStorage
  - [ ] `get(key)`
  - [ ] `set(key, value)`
  - [ ] `reset()` to defaults
- [ ] Create settings panel UI in `index.html`
- [ ] Wire UI controls to settings
- [ ] Test: Settings persist across page reload

### 4.3 - AudioManager.js (Infrastructure Only)
- [ ] Create `src/managers/AudioManager.js`
- [ ] Add stub methods (console.log for now):
  - [ ] `playSFX(name, volume = 1.0)`
  - [ ] `playMusic(name, loop = true)`
  - [ ] `stopMusic()`
  - [ ] `setMasterVolume(vol)`
  - [ ] `setMusicVolume(vol)`
  - [ ] `setSFXVolume(vol)`
- [ ] Add comments explaining future implementation
- [ ] Wire to SettingsManager (volume settings)
- [ ] Call playSFX in appropriate places:
  - [ ] Jump
  - [ ] Land
  - [ ] Collect item
  - [ ] Win
- [ ] Test: Console logs appear when events happen

### 4.4 - Game State Integration
- [ ] Update `Game.js`:
  - [ ] Add state machine logic for all states
  - [ ] Connect UI buttons to state changes
  - [ ] Pause game on ESC key
  - [ ] Resume on unpause
  - [ ] Restart level on game over
- [ ] Add win condition check in update loop
- [ ] Add death condition (fall off map)
- [ ] Show appropriate UI for each state
- [ ] Test: Full game loop with menus

### 4.5 - Polish & Cleanup
- [ ] Add comments to all modules
- [ ] Add JSDoc annotations for key methods
- [ ] Remove console.logs (or convert to proper logging)
- [ ] Verify all imports/exports correct
- [ ] Format code consistently
- [ ] Update README.md with build instructions
- [ ] Git commit: `feat: add UI and infrastructure managers`

**Success Criteria:** ✅ Complete game with menus, settings, and proper state management

---

## Post-Phase 4: Extended Features (Future)

### New Movement Mechanics
- [ ] Wall-jump implementation
- [ ] Slide mechanic (Ctrl while sprinting)
- [ ] Dash mechanic (E key, cooldown)
- [ ] Variable jump height (tap vs hold)
- [ ] Coyote time (late jump forgiveness)
- [ ] Jump buffering (early jump input)

### Visual Enhancements
- [ ] Landing impact particles
- [ ] Dash trail effect
- [ ] Wall-slide particles
- [ ] Improved speed lines
- [ ] Camera shake on land/dash
- [ ] Better lighting and shadows

### Performance Optimization (Step 4 from notes.md)
- [ ] Implement InstancedMesh for platforms
- [ ] Add frustum culling
- [ ] Implement object pooling for particles
- [ ] Profile and optimize hot paths
- [ ] Test with 1000+ platform level

### Content Creation
- [ ] Design 3-5 handcrafted levels
- [ ] Progressive difficulty curve
- [ ] Add collectibles (fish!)
- [ ] Add moving platforms
- [ ] Add hazards (gaps, timed platforms)

### Level Creator Tool
- [ ] Design UI for block placement
- [ ] Implement camera controls for editor
- [ ] Add save/export to JSON
- [ ] Add load existing level
- [ ] Add play-test mode
- [ ] Add undo/redo

### Audio Integration
- [ ] Find/create sound effects
- [ ] Implement Web Audio API in AudioManager
- [ ] Add background music
- [ ] Add 3D spatial audio (future)
- [ ] Add audio ducking (lower music during SFX)

### Story Campaign
- [ ] Write story outline
- [ ] Add dialogue system
- [ ] Add cutscenes between levels
- [ ] Add character interactions
- [ ] Add narrative progression

---

## Testing Checklist

**Run this after each phase:**

- [ ] Player can move (WASD)
- [ ] Player can jump (Space)
- [ ] Player can sprint (Shift)
- [ ] Collision detection works
- [ ] Camera follows player
- [ ] Speed lines appear when moving fast
- [ ] Win condition triggers on goal
- [ ] Death condition triggers on fall
- [ ] UI menus work
- [ ] Settings persist
- [ ] No console errors
- [ ] 60 FPS on target hardware

---

## Known Issues / Tech Debt

_Track issues here as they arise_

- None yet!

---

## Questions / Decisions Needed

_Track open questions here_

- None yet!

---

**Keep this file updated as you complete tasks!**
**Check off items with [x] as you finish them.**

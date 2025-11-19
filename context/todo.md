# Voxel Penguin Parkour - Task Checklist

**Last Updated:** November 18, 2025
**Status:** In Progress - Phase 1

---

## Phase 1: Foundation Setup

**Goal:** Get Vite running with basic project structure
**Estimated Time:** 30 minutes

- [x] Create context folder
- [x] Create plan.md (architecture documentation)
- [x] Create todo.md (this file)
- [ ] Initialize npm project (`npm init -y`)
- [ ] Install Vite (`npm install -D vite`)
- [ ] Install Three.js (`npm install three`)
- [ ] Create directory structure:
  - [ ] `/src/`
  - [ ] `/src/core/`
  - [ ] `/src/entities/`
  - [ ] `/src/managers/`
  - [ ] `/src/utils/`
  - [ ] `/public/`
  - [ ] `/public/levels/`
- [ ] Create minimal `index.html` (loads main.js)
- [ ] Create `styles.css` (basic UI styles)
- [ ] Create `vite.config.js` (optional, mostly defaults)
- [ ] Create `src/main.js` with "Hello Penguin" console log
- [ ] Add npm scripts to `package.json`:
  - [ ] `"dev": "vite"`
  - [ ] `"build": "vite build"`
  - [ ] `"preview": "vite preview"`
- [ ] Test: Run `npm run dev`
- [ ] Test: Verify browser shows blank page
- [ ] Test: Verify console logs "Hello Penguin"
- [ ] Git commit: `feat: initialize Vite project structure`

**Success Criteria:** ✅ Vite dev server running, blank page loads

---

## Phase 2: Core Module Extraction

**Goal:** Working game with modular architecture
**Estimated Time:** 2-3 hours

### 2.1 - Game.js (The Conductor)
- [ ] Create `src/core/Game.js`
- [ ] Copy Three.js setup from original:
  - [ ] Scene creation
  - [ ] Renderer setup
  - [ ] Basic lighting
- [ ] Add game state management:
  - [ ] `LOADING`, `MENU`, `PLAYING`, `PAUSED`, `GAMEOVER`, `VICTORY`
  - [ ] `setState(newState)` method
- [ ] Implement game loop:
  - [ ] `requestAnimationFrame` loop
  - [ ] Delta time calculation
  - [ ] `update(deltaTime)` method
- [ ] Add window resize handler
- [ ] Test: Verify scene renders

### 2.2 - InputManager.js (The Interface)
- [ ] Create `src/core/InputManager.js`
- [ ] Copy keyboard event listeners from original
- [ ] Abstract to actions API:
  - [ ] `moveVector` (Vector2 from WASD)
  - [ ] `jump` (boolean, just pressed)
  - [ ] `sprint` (boolean, held)
- [ ] Add mouse/pointer lock:
  - [ ] `lockPointer()` method
  - [ ] `getMouseDelta()` for camera
- [ ] Add `update()` method to process each frame
- [ ] Add `getActions()` to return current state
- [ ] Test: Log actions to console, verify WASD works

### 2.3 - PhysicsWorld.js (The Rules)
- [ ] Create `src/core/PhysicsWorld.js`
- [ ] Copy gravity application from original
- [ ] Copy AABB collision detection
- [ ] Add methods:
  - [ ] `applyGravity(entity, deltaTime)`
  - [ ] `checkCollisions(entity, platforms)`
  - [ ] `resolveCollision(entityBox, platformBox)`
  - [ ] `isGrounded(entity, platforms)`
- [ ] Test: Verify collision math with dummy objects

### 2.4 - Entity.js (Base Class)
- [ ] Create `src/entities/Entity.js`
- [ ] Add base properties:
  - [ ] `position` (Vector3)
  - [ ] `velocity` (Vector3)
  - [ ] `mesh` (Three.js object)
  - [ ] `collider` (bounding box)
- [ ] Add base methods:
  - [ ] `update(deltaTime)`
  - [ ] `getPosition()`
  - [ ] `setPosition(x, y, z)`

### 2.5 - PenguinController.js (The Star)
- [ ] Create `src/entities/PenguinController.js`
- [ ] Extend Entity base class
- [ ] Copy player mesh creation from original
- [ ] Implement state machine:
  - [ ] `IDLE` state
  - [ ] `WALK` state
  - [ ] `RUN` state
  - [ ] `JUMP` state
  - [ ] `FALL` state
  - [ ] `LAND` state (transition helper)
- [ ] Add state transition logic
- [ ] Copy movement code from original:
  - [ ] Walk speed: 10
  - [ ] Sprint speed: 16
  - [ ] Jump power: 14
- [ ] Add waddle animation
- [ ] Add `update(deltaTime, actions)` method
- [ ] Test: Verify penguin moves and jumps

### 2.6 - CameraManager.js (The Eye)
- [ ] Create `src/managers/CameraManager.js`
- [ ] Copy camera setup from original
- [ ] Improve lerp following (smooth, no jitter)
- [ ] Add configurable offset
- [ ] Add look-ahead (predict player movement)
- [ ] Add `update(deltaTime, target)` method
- [ ] Add `setMode(mode)` for future camera modes
- [ ] Test: Camera follows penguin smoothly

### 2.7 - VoxelBuilder.js (The Artist)
- [ ] Create `src/utils/VoxelBuilder.js`
- [ ] Copy block creation from original
- [ ] Add static methods:
  - [ ] `createBlock(position, size, color)`
  - [ ] `createPlatform(position, dimensions, color)`
  - [ ] `createPenguinMesh()` (migrate from PenguinController)
- [ ] Add helper for merged geometry (future optimization)
- [ ] Test: Create test blocks, verify they appear

### 2.8 - Wire Everything Together
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

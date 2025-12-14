# Voxel Penguin Parkour - Task Checklist

**Last Updated:** January 9, 2025
**Status:** In Progress - Phase 2 Complete, Phase 3 Next

---

## Phase 1: Foundation Setup ✅ COMPLETE

**Goal:** Get Vite running with basic project structure
**Completed:** January 2025

- [x] Create context folder
- [x] Create plan.md (architecture documentation)
- [x] Create todo.md (this file)
- [x] Initialize npm project (`npm init -y`)
- [x] Install Vite (`npm install -D vite`) - v7.2.2
- [x] Install Three.js (`npm install three`) - v0.181.1
- [x] Create directory structure:
  - [x] `/src/`
  - [x] `/src/core/`
  - [x] `/src/entities/`
  - [x] `/src/managers/`
  - [x] `/src/utils/`
  - [x] `/public/`
  - [x] `/public/levels/`
- [x] Create minimal `index.html` (loads main.js)
- [x] Create `styles.css` (basic UI styles)
- [x] Create `vite.config.js`
- [x] Create `src/main.js` with "Hello Penguin" console log
- [x] Add npm scripts to `package.json`:
  - [x] `"dev": "vite"`
  - [x] `"build": "vite build"`
  - [x] `"preview": "vite preview"`
- [x] Test: Run `npm run dev` ✓
- [x] Test: Verify browser loads game ✓
- [x] Test: Verify console logs "🐧 Voxel Penguin Parkour" ✓

**Success Criteria:** ✅ Vite dev server running, game loads and plays

---

## Phase 2: Core Module Extraction ✅ COMPLETE

**Goal:** Working game with modular architecture
**Completed:** January 2025

### 2.1 - Game.js (The Conductor) ✅
- [x] Create `src/core/Game.js` (321 lines)
- [x] Three.js setup:
  - [x] Scene creation
  - [x] Renderer setup with shadows
  - [x] Basic lighting (ambient + directional)
- [x] Game state management:
  - [x] `LOADING`, `MENU`, `PLAYING`, `PAUSED`, `GAMEOVER`, `VICTORY`
  - [x] `setState(newState)` method
- [x] Game loop:
  - [x] `requestAnimationFrame` loop
  - [x] Delta time calculation
  - [x] `update(deltaTime)` method
- [x] Window resize handler
- [x] Test: Scene renders ✓

### 2.2 - InputManager.js (The Interface) ✅
- [x] Create `src/core/InputManager.js` (279 lines)
- [x] Keyboard event listeners (WASD, Space, Shift, Escape)
- [x] Actions API:
  - [x] `moveVector` (Vector2 from WASD)
  - [x] `jump` (boolean, just pressed)
  - [x] `sprint` (boolean, held)
- [x] Mouse/pointer lock:
  - [x] `lockPointer()` method
  - [x] `getMouseDelta()` for camera
- [x] `update()` method to process each frame
- [x] `getActions()` to return current state
- [x] Test: WASD works ✓

### 2.3 - PhysicsWorld.js (The Rules) ✅
- [x] Create `src/core/PhysicsWorld.js` (280 lines)
- [x] Gravity application
- [x] AABB collision detection
- [x] Methods:
  - [x] `applyGravity(entity, deltaTime)`
  - [x] `checkCollisions(entity, platforms)`
  - [x] `resolveCollision(entityBox, platformBox)`
  - [x] `isGrounded(entity, platforms)`
- [x] Test: Collision works ✓

### 2.4 - Entity.js (Base Class) ✅
- [x] Create `src/entities/Entity.js` (206 lines)
- [x] Base properties:
  - [x] `position` (Vector3)
  - [x] `velocity` (Vector3)
  - [x] `mesh` (Three.js object)
  - [x] `collider` (bounding box)
- [x] Base methods:
  - [x] `update(deltaTime)`
  - [x] `getPosition()`
  - [x] `setPosition(x, y, z)`

### 2.5 - PenguinController.js (The Star) ✅
- [x] Create `src/entities/PenguinController.js` (418 lines)
- [x] Extend Entity base class
- [x] Player mesh creation via VoxelBuilder
- [x] State machine:
  - [x] `IDLE` state
  - [x] `WALK` state
  - [x] `RUN` state
  - [x] `JUMP` state
  - [x] `FALL` state
  - [x] `LAND` state (transition helper)
- [x] State transition logic
- [x] Movement code:
  - [x] Walk speed: 8
  - [x] Sprint speed: 16
  - [x] Jump power: 17
- [x] Waddle animation
- [x] `update(deltaTime, actions)` method
- [x] Test: Penguin moves and jumps ✓

### 2.6 - CameraManager.js (The Eye) ✅
- [x] Create `src/managers/CameraManager.js` (221 lines)
- [x] Camera setup
- [x] Smooth lerp following
- [x] Configurable offset
- [x] Mouse look (yaw/pitch)
- [x] FOV effects (sprint = wider FOV)
- [x] `update(deltaTime, target)` method
- [x] `setMode(mode)` for future camera modes
- [x] Test: Camera follows penguin smoothly ✓

### 2.7 - VoxelBuilder.js (The Artist) ✅
- [x] Create `src/utils/VoxelBuilder.js` (278 lines)
- [x] Block creation
- [x] Static methods:
  - [x] `createVoxel(x, y, z, color, parent, scale)`
  - [x] `createPlatform(x, y, z, width, depth, color, parent)`
  - [x] `buildPenguin(parent)` - full penguin mesh
  - [x] `createWater(scene, yLevel)`
  - [x] `createGoal(scene, position)` - fish collectible
  - [x] `createSpeedLines(parent, count)`
- [x] Material caching for performance
- [x] Test: Blocks appear correctly ✓

### 2.8 - Wire Everything Together ✅
- [x] Update `src/main.js` (177 lines):
  - [x] Import all modules
  - [x] Create Game instance
  - [x] Create InputManager
  - [x] Create PhysicsWorld
  - [x] Create PenguinController
  - [x] Create CameraManager
  - [x] Wire update loop
- [x] Temporarily hardcode platforms
- [x] Add goal object (fish)
- [x] Add speed lines effect
- [x] Test: Full game playable! ✓
- [x] Compare to original - feels identical ✓

**Success Criteria:** ✅ Game plays exactly like original monolith

---

## Phase 3: Level System 🔄 IN PROGRESS

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

**Success Criteria:** ⏳ Level loads from external JSON file

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

**Success Criteria:** ⏳ Complete game with menus, settings, and proper state management

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

- [x] Player can move (WASD) ✓
- [x] Player can jump (Space) ✓
- [x] Player can sprint (Shift) ✓
- [x] Collision detection works ✓
- [x] Camera follows player ✓
- [x] Speed lines appear when moving fast ✓
- [x] Win condition triggers on goal ✓
- [x] Death condition triggers on fall ✓
- [ ] UI menus work (basic start button only)
- [ ] Settings persist
- [x] No console errors ✓
- [x] 60 FPS on target hardware ✓

---

## Known Issues / Tech Debt

_Track issues here as they arise_

- Levels are hardcoded in main.js (Phase 3 will fix)
- Start button UI is basic (Phase 4 will improve)

---

## Questions / Decisions Needed

_Track open questions here_

- None yet!

---

**Keep this file updated as you complete tasks!**
**Check off items with [x] as you finish them.**

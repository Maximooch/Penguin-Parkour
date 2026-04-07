# Voxel Penguin Parkour - Architecture Plan (Historical)

**Superseded by:** `context/IMPLEMENTATION_PLAN.md` — active roadmap lives there now.

**Project Start:** November 18, 2025
**Status:** Phases 1-3 COMPLETE ✅
**Goal:** ~~Transform monolith~~ → Now building features on modular base
## Project Vision

A voxel-based 3D parkour game featuring a penguin character with advanced movement mechanics (wall-jump, slide, dash). The architecture must support:
- Multiple handcrafted levels
- Future level creator tool
- Story campaign mode
- Performance at scale (large levels, many objects)

---

## Current State Analysis

### What We Have
- **Penguin-Parkour.html** (444 lines) - Working monolithic prototype
- Three.js-based 3D rendering
- Basic physics (custom AABB collision)
- Platform generation and collision
- Player movement (WASD + Space + Shift)
- Win condition system
- Speed lines visual effect

### What We Need
- Modular ES6 architecture
- JSON-based level system
- Manager classes for separation of concerns
- Full state machine for penguin animations
- Better camera system
- UI infrastructure (menus, settings)
- Audio infrastructure (ready for future sounds)
- Performance optimization (InstancedMesh)

---

## Architecture Overview

### Core Philosophy
1. **Separation of Concerns** - Each system has one responsibility
2. **Data-Driven Design** - Levels are JSON, settings are configurable
3. **Maintainability First** - Working game at every commit
4. **Progressive Enhancement** - Foundation → Features → Polish → Optimization

### Technology Stack
- **Runtime:** Browser (ES6 modules, native Three.js)
- **Dev Server:** Vite (fast HMR, zero config)
- **Language:** JavaScript (with JSDoc for type hints)
- **Physics:** Custom AABB (lightweight, perfect for voxels)
- **UI:** Plain HTML/CSS (fast, simple, zero dependencies)

---

## Directory Structure

```
/voxel-penguin/
  /context/              # Project documentation (this file!)
    plan.md              # Architecture & strategy
    todo.md              # Task checklist

  /src/                  # Modular source code
    /core/               # Core engine systems
      Game.js            # Main game loop, state management
      InputManager.js    # Keyboard/mouse abstraction
      PhysicsWorld.js    # AABB collision & resolution

    /entities/           # Game objects
      Entity.js          # Base class (position, mesh, collider)
      PenguinController.js  # Player controller with state machine

    /managers/           # High-level managers
      LevelManager.js    # Load/build levels from JSON
      UIManager.js       # Handle menu overlays
      SettingsManager.js # localStorage persistence
      AudioManager.js    # Sound playback (infrastructure only)
      CameraManager.js   # Improved camera follow system

    /utils/              # Helpers & utilities
      VoxelBuilder.js    # Geometry creation & optimization
      MathUtils.js       # Vector math helpers

    main.js              # Entry point - wires everything together

  /public/               # Static assets
    /levels/             # JSON level definitions
      level1.json        # Tutorial level
      level2.json        # Challenge level (future)
    /audio/              # Sound files (future)
    /textures/           # Images (future)

  index.html             # Minimal HTML shell
  styles.css             # Global styles for UI
  package.json           # npm configuration
  vite.config.js         # Vite settings

  Penguin-Parkour.html   # ORIGINAL (kept for reference)
  notes.md               # Architecture notes from Gemini
```

---

## Core Systems Design

### 1. Game.js - The Conductor

**Purpose:** Orchestrates all systems, manages game loop and state

**Responsibilities:**
- Initialize Three.js (scene, renderer, camera)
- Manage game states: `LOADING`, `MENU`, `PLAYING`, `PAUSED`, `GAMEOVER`, `VICTORY`
- Run game loop with `requestAnimationFrame`
- Calculate `deltaTime` for frame-independent physics
- Coordinate all managers

**Key Methods:**
```javascript
class Game {
  constructor()           // Initialize systems
  init()                  // Setup scene, load first level
  start()                 // Begin game loop
  update(deltaTime)       // Update all systems
  setState(newState)      // Transition game states
  resize()                // Handle window resize
}
```

**State Transitions:**
```
LOADING → MENU → PLAYING ⇄ PAUSED
             ↓                ↓
          GAMEOVER ←──────── VICTORY
```

---

### 2. InputManager.js - The Interface

**Purpose:** Abstract raw input into semantic actions

**Why?**
- Decouples controls from game logic
- Easy to add gamepad support later
- Rebindable controls in settings

**Actions API:**
```javascript
{
  moveVector: Vector2,    // Normalized WASD input
  jump: Boolean,          // Space (just pressed)
  sprint: Boolean,        // Shift (held)
  dash: Boolean,          // Future: E key
  interact: Boolean       // Future: F key
}
```

**Key Methods:**
```javascript
class InputManager {
  constructor()           // Setup event listeners
  update()                // Process input this frame
  getActions()            // Return current actions object
  lockPointer()           // Request pointer lock
  getMouseDelta()         // Camera rotation input
}
```

---

### 3. PhysicsWorld.js - The Rules

**Purpose:** Handle collision detection and resolution

**Current Implementation:**
- AABB (Axis-Aligned Bounding Box) collision
- Gravity application
- Platform collision with surface normals
- Ground detection

**Future Enhancements:**
- Moving platform support
- One-way platforms
- Slopes (with custom AABB extensions)

**Key Methods:**
```javascript
class PhysicsWorld {
  constructor(gravity = -30)
  applyGravity(entity, deltaTime)
  checkCollisions(entity, platforms)
  resolveCollision(entityBox, platformBox)
  isGrounded(entity, platforms)
}
```

---

### 4. PenguinController.js - The Star

**Purpose:** Player character with full state machine

**State Machine:**
```
IDLE ──→ WALK ──→ RUN
  ↑       ↓        ↓
  └──── JUMP ← ────┘
          ↓
        FALL
          ↓
    LAND (transition back to IDLE/WALK)
```

**Future States:**
- `SLIDE` - Low-friction ground movement
- `WALL_SLIDE` - Stick to walls, slow fall
- `WALL_JUMP` - Jump off walls
- `DASH` - Quick burst movement

**Key Properties:**
```javascript
{
  position: Vector3,
  velocity: Vector3,
  state: String,
  isGrounded: Boolean,
  moveSpeed: 10,
  sprintSpeed: 16,
  jumpPower: 14,
  // Animation timers
  waddlePhase: 0
}
```

---

### 5. LevelManager.js - The Architect

**Purpose:** Load and build levels from JSON data

**Level JSON Format:**
```json
{
  "id": 1,
  "name": "Tutorial",
  "startPosition": [0, 2, 0],
  "goalPosition": [0, 5, -50],
  "platforms": [
    {
      "position": [0, 0, 0],
      "size": [8, 1, 8],
      "type": "ice",
      "color": "#88ccff"
    },
    {
      "position": [0, 2, -10],
      "size": [4, 1, 4],
      "type": "snow",
      "color": "#ffffff"
    }
  ],
  "collectibles": [
    {"position": [0, 4, -10], "type": "fish"}
  ]
}
```

**Key Methods:**
```javascript
class LevelManager {
  async loadLevel(levelId)      // Fetch JSON
  buildLevel(data)               // Create meshes from data
  clearLevel()                   // Remove old level
  getCurrentLevel()              // Return current data
}
```

---

### 6. CameraManager.js - The Eye

**Purpose:** Improved camera following and positioning

**Features:**
- Smooth lerp following (no jitter)
- Multiple camera modes (third-person, cinematic)
- Configurable offset and look-ahead
- Collision avoidance (don't clip through walls)

**Key Methods:**
```javascript
class CameraManager {
  constructor(camera, target)
  update(deltaTime)
  setMode(mode)              // 'thirdPerson', 'firstPerson', 'cinematic'
  setOffset(x, y, z)         // Camera position offset
  shake(intensity, duration) // Screen shake effect
}
```

---

### 7. VoxelBuilder.js - The Artist

**Purpose:** Create optimized voxel geometry

**Optimization Strategy:**
- Use `InstancedMesh` for identical blocks
- Merge adjacent platforms into single geometry
- Greedy meshing (future optimization)

**Key Methods:**
```javascript
class VoxelBuilder {
  static createBlock(x, y, z, size, color)
  static createPlatform(position, dimensions, color)
  static createPenguinMesh()
  static createInstancedBlocks(positions, color) // Optimization
}
```

---

### 8. UIManager.js - The Interface

**Purpose:** Handle all HTML UI overlays

**Screens:**
- Main menu
- Pause menu
- Settings panel
- Victory screen
- Game HUD (timer, collectibles)

**Key Methods:**
```javascript
class UIManager {
  showMenu(menuName)
  hideMenu(menuName)
  updateHUD(data)
  showVictoryScreen(stats)
}
```

---

### 9. AudioManager.js - The Vibe

**Purpose:** Sound playback infrastructure (no-op for now)

**Future API:**
```javascript
class AudioManager {
  playSFX(name, volume = 1.0)     // jump.mp3, land.wav
  playMusic(name, loop = true)    // theme.mp3
  stopMusic()
  setMasterVolume(vol)
  setMusicVolume(vol)
  setSFXVolume(vol)
}
```

**Implementation:**
- For now: stub methods that log to console
- Later: Web Audio API or Three.js Audio

---

### 10. SettingsManager.js - The Memory

**Purpose:** Persist user preferences

**Settings:**
```javascript
{
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 1.0,
  mouseSensitivity: 1.0,
  graphics: {
    shadows: true,
    particles: true,
    antialias: true
  }
}
```

**Storage:** `localStorage` with JSON serialization

---

## Game Loop Architecture

**Single Frame Flow:**

```
1. Browser calls requestAnimationFrame
   ↓
2. Game.update(deltaTime)
   ↓
3. InputManager.update()
   ├─ Read keyboard state
   ├─ Read mouse delta
   └─ Update actions object
   ↓
4. PenguinController.update(deltaTime, actions)
   ├─ State machine transitions
   ├─ Apply movement input
   └─ Update animations
   ↓
5. PhysicsWorld.update(deltaTime)
   ├─ Apply gravity
   ├─ Check collisions
   └─ Resolve overlaps
   ↓
6. CameraManager.update(deltaTime)
   ├─ Follow player (lerp)
   └─ Update camera position
   ↓
7. UIManager.updateHUD()
   └─ Update HTML elements
   ↓
8. Renderer.render(scene, camera)
```

---

## Migration Strategy

### Phase 1: Foundation Setup
**Goal:** Get Vite running with blank page

1. Create directory structure
2. Initialize npm, install Vite + Three.js
3. Create minimal `index.html`
4. Create `main.js` that logs "Hello Penguin"
5. Run `npm run dev` and verify

**Success Criteria:** Browser shows blank page, console logs message

---

### Phase 2: Extract Core Systems
**Goal:** Working game with modular code

**Strategy:** Extract piece-by-piece while keeping game functional

1. **Game.js** - Copy scene/renderer/loop setup from original
2. **InputManager.js** - Copy keyboard handling, abstract to actions
3. **PhysicsWorld.js** - Copy collision logic into class
4. **PenguinController.js** - Copy player code, add state machine
5. **CameraManager.js** - Copy camera code, improve lerp
6. **VoxelBuilder.js** - Copy geometry creation functions
7. **main.js** - Wire everything together

**Testing:** After each file, run the game and verify it works

**Success Criteria:** Game plays identically to original HTML file

---

### Phase 3: Level System
**Goal:** Levels load from JSON

1. **Design JSON schema** - Define level data format
2. **Create level1.json** - Translate hardcoded platforms to JSON
3. **LevelManager.js** - Load JSON, build platforms
4. **Update main.js** - Use LevelManager instead of hardcoded build

**Success Criteria:** Level loads from external file, game still works

---

### Phase 4: UI & Infrastructure
**Goal:** Professional menus and settings

1. **UIManager.js** - Create menu HTML/CSS, show/hide logic
2. **SettingsManager.js** - localStorage save/load
3. **AudioManager.js** - Stub methods with console.log
4. **Wire to Game.js** - Connect menus to game states

**Success Criteria:** Full game with main menu, pause, settings, victory screen

---

## Technical Decisions & Tradeoffs

### ✅ Decisions Made

| Choice | Rationale |
|--------|-----------|
| **ES6 Modules + Vite** | Modern, fast, zero config, HMR |
| **JavaScript (not TypeScript)** | Faster iteration, easier migration from prototype |
| **JSDoc annotations** | 80% of TypeScript benefits, 20% effort |
| **Custom AABB Physics** | Lightweight, working, perfect for voxels |
| **Plain HTML/CSS UI** | Zero dependencies, fast to build |
| **localStorage** | Simple, no server needed |
| **InstancedMesh (Phase 4)** | Proven optimization for voxel games |

### 🤔 Future Decisions (Defer for Now)

- TypeScript migration (if project grows large)
- Physics library (if need advanced features)
- React/Vue (if building complex level creator)
- Backend/multiplayer (way future)

---

## New Features Roadmap

### Movement Mechanics (Priority)
1. **Wall Jump**
   - Detect wall collision with normal vector
   - Allow jump when against wall + not grounded
   - Push player away from wall on jump

2. **Slide**
   - Activate with Ctrl while sprinting
   - Lower hitbox, increase speed, reduce control
   - Can slide under obstacles (future)

3. **Dash**
   - Press E for quick burst in move direction
   - Cooldown timer (2 seconds)
   - Brief invincibility frames?

4. **Variable Jump Height**
   - Tap space = short hop
   - Hold space = full jump
   - More player expression

### Visual Enhancements
- Landing impact particles
- Dash trail effect
- Wall-slide particles
- Better speed lines
- Camera shake on land

### Level Features
- Moving platforms
- Disappearing platforms (timed)
- Ice blocks (reduced friction)
- Bounce pads (launch player)
- Wind zones (affect velocity)

---

## Performance Targets

### Current (Monolith)
- 60 FPS on modern hardware
- ~100 platforms max before slowdown

### Target (Post-Optimization)
- 60 FPS with 1000+ platforms
- Smooth on mid-range hardware
- Mobile-ready (future)

### Optimization Techniques
1. **InstancedMesh** - Batch identical geometry
2. **Frustum Culling** - Don't render off-screen
3. **LOD (Level of Detail)** - Simplify distant objects
4. **Object Pooling** - Reuse particle objects
5. **Lazy Loading** - Load levels on demand

---

## Testing Strategy

### Manual Testing Checkpoints
- [ ] After Phase 1: Vite serves a page
- [ ] After Phase 2: Game plays like original
- [ ] After Phase 3: Level loads from JSON
- [ ] After Phase 4: Menus and settings work

### Things to Test Each Time
1. Player movement (WASD)
2. Jumping and landing
3. Platform collision
4. Win condition (reach goal)
5. Camera following
6. Speed lines appear when moving

### Future: Automated Tests
- Unit tests for physics calculations
- Integration tests for level loading
- E2E tests for full game flow

---

## Git Workflow

### Commit Strategy
**Incremental commits at each phase:**

1. `feat: initialize Vite project structure`
2. `feat: extract core Game and Input systems`
3. `feat: add Physics and Penguin controller`
4. `feat: implement Camera manager`
5. `feat: create VoxelBuilder utilities`
6. `feat: add JSON level loading system`
7. `feat: implement UI and Settings managers`
8. `feat: add Audio manager infrastructure`
9. `chore: cleanup and documentation`

### Branch Strategy
- **modular-refactor** - Main development branch
- Merge to main when stable and tested

---

## Next Steps

1. ✅ Create this plan.md
2. ✅ Create todo.md with task checklist
3. 🚧 Initialize npm and install Vite
4. ⏳ Create directory structure
5. ⏳ Build Phase 1: Foundation
6. ⏳ Build Phase 2: Core Systems
7. ⏳ Build Phase 3: Level System
8. ⏳ Build Phase 4: UI & Infrastructure

---

## Resources & References

- **Three.js Docs:** https://threejs.org/docs/
- **Vite Guide:** https://vitejs.dev/guide/
- **Original Prototype:** `Penguin-Parkour.html`
- **Architecture Notes:** `notes.md`

---

**Let's build something great! 🐧**

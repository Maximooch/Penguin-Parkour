# Voxel Penguin Parkour - Architecture Plan

**Project Start:** November 18, 2025
**Status:** Phases 1-3 COMPLETE ✅
**Active Roadmap:** `context/todo.md`
**Goal:** Modular architecture complete — now building features on top

## Project Vision

A voxel-based 3D parkour game featuring a penguin character with advanced movement mechanics (wall-jump, slide, dash). The architecture must support:
- Multiple handcrafted levels
- Future level creator tool
- Story campaign mode
- Performance at scale (large levels, many objects)

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
  /context/              # Project documentation
    plan.md              # Architecture reference (this file)
    todo.md              # Active roadmap & acceptance criteria

  /src/                  # Modular source code
    /core/               # Core engine systems
      Game.js            # Main game loop, state management
      InputManager.js    # Keyboard/mouse abstraction
      PhysicsWorld.js    # AABB collision & resolution
      SettingsManager.js # localStorage persistence

    /entities/           # Game objects
      Entity.js          # Base class (position, mesh, collider)
      PenguinController.js  # Player controller with state machine

    /managers/           # High-level managers
      LevelManager.js    # Load/build levels from JSON
      UIManager.js       # Menus, HUD, pause, victory, settings
      CameraManager.js   # Third-person follow, mouse look, FOV effects

    /utils/              # Helpers & utilities
      VoxelBuilder.js    # Geometry creation & optimization

    main.js              # Entry point - wires everything together

  /public/               # Static assets
    /levels/             # JSON level definitions
      level1.json        # Tutorial level
    /audio/              # Sound files (future)
    /textures/           # Images (future)

  index.html             # Minimal HTML shell
  styles.css             # Global styles for UI
  package.json           # npm configuration
  vite.config.js         # Vite settings
```

---

## Core Systems Design

### 1. Game.js - The Conductor

**Purpose:** Orchestrates all systems, manages game loop and state

**State Transitions:**
```
LOADING → MENU → PLAYING ⇄ PAUSED
             ↓                ↓
          GAMEOVER ←──────── VICTORY
```

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

---

### 2. InputManager.js - The Interface

**Purpose:** Abstract raw input into semantic actions

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

---

### 3. PhysicsWorld.js - The Rules

**Purpose:** Handle collision detection and resolution

- AABB (Axis-Aligned Bounding Box) collision
- Gravity application
- Platform collision with surface normals
- Ground detection

**Future:** Moving platforms, one-way platforms, slopes

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

**Future States:** SLIDE, WALL_SLIDE, WALL_JUMP, DASH

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
    {"position": [0, 0, 0], "size": [8, 1, 8], "type": "ice", "color": "#88ccff"}
  ],
  "collectibles": [
    {"position": [0, 4, -10], "type": "fish"}
  ]
}
```

---

### 6. CameraManager.js - The Eye

**Purpose:** Third-person camera with smooth follow and mouse look

- Smooth lerp following (no jitter)
- Multiple camera modes (third-person, cinematic)
- Configurable offset and look-ahead
- FOV effects (sprint widens FOV)

---

### 7. VoxelBuilder.js - The Artist

**Purpose:** Create optimized voxel geometry

- Material caching for performance
- InstancedMesh for identical blocks
- Static methods: createVoxel, createPlatform, buildPenguin, createWater, createGoal, createSpeedLines

---

### 8. UIManager.js - The Interface

**Purpose:** Handle all HTML UI overlays

**Screens:** Main menu, pause menu, settings panel, victory screen, HUD (timer, collectibles)

---

### 9. AudioManager.js - The Vibe (Future)

**Purpose:** Sound playback infrastructure

**Planned API:** playSFX, playMusic, stopMusic, volume controls

---

### 10. SettingsManager.js - The Memory

**Purpose:** Persist user preferences via localStorage

**Settings:** masterVolume, musicVolume, sfxVolume, mouseSensitivity, graphics.shadows, graphics.particles, graphics.fov

---

## Game Loop Architecture

```
1. requestAnimationFrame
2. Game.update(deltaTime)
3. InputManager.update() → actions object
4. PenguinController.update(deltaTime, actions) → state machine, movement
5. PhysicsWorld.update(deltaTime) → gravity, collisions, resolution
6. CameraManager.update(deltaTime) → follow, mouse look
7. UIManager.updateHUD() → HTML updates
8. Renderer.render(scene, camera)
```

---

## Technical Decisions

| Choice | Rationale |
|--------|----------|
| **ES6 Modules + Vite** | Modern, fast, zero config, HMR |
| **JavaScript (not TypeScript)** | Faster iteration, easier migration from prototype |
| **JSDoc annotations** | 80% of TypeScript benefits, 20% effort |
| **Custom AABB Physics** | Lightweight, working, perfect for voxels |
| **Plain HTML/CSS UI** | Zero dependencies, fast to build |
| **localStorage** | Simple, no server needed |
| **InstancedMesh** | Proven optimization for voxel games |

**Deferred:** TypeScript migration, physics library, React/Vue (level creator), backend/multiplayer

---

## Planned Features

### Movement Mechanics
- Wall jump (wall collision + jump away)
- Slide (Ctrl while sprinting, lower hitbox)
- Dash (E key, cooldown timer)
- Variable jump height (tap vs hold)

### Visual Enhancements
- Landing impact particles, dash trail, wall-slide particles
- Better speed lines, camera shake on land

### Level Features
- Moving platforms, disappearing platforms, ice blocks
- Bounce pads, wind zones

---

## Performance Targets

- **Current:** 60 FPS, ~100 platforms
- **Target:** 60 FPS with 1000+ platforms
- **Techniques:** InstancedMesh, frustum culling, LOD, object pooling, lazy loading

---

## Resources

- **Three.js Docs:** https://threejs.org/docs/
- **Vite Guide:** https://vitejs.dev/guide/

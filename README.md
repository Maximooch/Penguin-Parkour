# 🐧 Voxel Penguin Parkour

A voxel-based 3D parkour game built with Three.js and Vite. Guide a penguin across icy platforms, collect fish, and reach the goal.

**Play it:** [https://voxel-penguin-parkour.vercel.app](https://voxel-penguin-parkour.vercel.app)

## Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Space | Jump |
| Shift | Sprint |
| Esc | Pause |
| Mouse | Look around |

## Architecture

```
src/
├── core/
│   ├── Game.js            # Scene, renderer, game loop, state machine
│   ├── InputManager.js    # Keyboard + pointer lock, action mapping
│   ├── PhysicsWorld.js    # Gravity, AABB collision, ground detection
│   └── SettingsManager.js # localStorage persistence, change events
├── entities/
│   ├── Entity.js           # Base class: position, velocity, collider
│   └── PenguinController.js # Player: state machine, movement, waddle anim
├── managers/
│   ├── CameraManager.js   # Third-person follow, mouse look, FOV effects
│   ├── LevelManager.js    # JSON level loading, InstancedMesh building
│   └── UIManager.js       # Menus, HUD, pause, victory, settings panel
└── utils/
    └── VoxelBuilder.js    # Block meshes, penguin model, water, goal, speed lines
```

Levels are JSON files in `public/levels/` — currently just `level1.json`.

## 2D ruins prototype

This repository also includes a self-contained 2D exploration-platformer prototype in [`prototype-2d/`](prototype-2d/). Echoes of Keru follows a penguin through three ancient ruin zones with parkour movement, lantern-shard collectibles, local ambient music, and CC0 sound effects.

```bash
cd prototype-2d
npm run dev
```

The shared product direction and next milestones live in [`roadmap.md`](roadmap.md). The prototype's story notes and asset attributions are in [`prototype-2d/lore.md`](prototype-2d/lore.md), [`prototype-2d/brainstorm.md`](prototype-2d/brainstorm.md), and [`prototype-2d/credits.md`](prototype-2d/credits.md).

## Getting Started

```bash
npm install
npm run dev      # Dev server at localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Debug Console

Available in browser DevTools via the `debug` object:

```js
debug.teleport(x, y, z)         // Warp the penguin
debug.showCollision()           // Visualize AABB boxes
debug.win()                     // Trigger victory
debug.setState('PLAYING')       // Force game state
debug.settings.all()            // Show all settings
debug.settings.set('key', val)  // Change a setting
debug.reloadLevel()             // Reload current level
```

## Status

Phases 1–3 complete (core systems, modular architecture, JSON level loading). Phase 4 (UI/Settings/Audio) partially shipped — UIManager and SettingsManager exist, AudioManager is stub-only. See `context/IMPLEMENTATION_PLAN.md` for the full roadmap.

### Known Issues

- **Top-surface collision only** — penguin phases through walls/sides
- **GC pressure** — `getActions()` allocates a new Vector2 every frame
- **Monkey-patched update loop** — goal animation wired via binding override in main.js
- **Memory leak** — `clearLevel()` doesn't dispose geometries/materials
- **No camera collision** — camera can clip through platforms

## License

ISC

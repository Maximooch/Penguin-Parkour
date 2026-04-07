/**
 * Voxel Penguin Parkour - Main Entry Point
 *
 * This file wires together all the modular systems and starts the game.
 *
 * Phase 2: Core Systems with Hardcoded Level
 * Phase 3: Level System with JSON loading
 * Phase 4: Will add UI and Audio managers
 */

import * as THREE from 'three';
import { Game, GameState } from './core/Game.js';
import { InputManager } from './core/InputManager.js';
import { PhysicsWorld } from './core/PhysicsWorld.js';
import { PenguinController } from './entities/PenguinController.js';
import { CameraManager } from './managers/CameraManager.js';
import { LevelManager } from './managers/LevelManager.js';

console.log('%c🐧 Voxel Penguin Parkour 🐧', 'font-size: 24px; font-weight: bold; color: #00aaff;');
console.log('Phase 3: Level System with JSON loading');

// Create game instance
const game = new Game();
game.init();

// Create input manager
const inputManager = new InputManager(game);
game.inputManager = inputManager;

// Create physics world
const physicsWorld = new PhysicsWorld({
  gravity: 50,
  friction: 10
});
game.physicsWorld = physicsWorld;

// Create penguin controller
const penguinController = new PenguinController(game.scene);
game.penguinController = penguinController;

// Create camera manager
const cameraManager = new CameraManager(game.camera, penguinController, inputManager);
game.cameraManager = cameraManager;

// Create level manager
const levelManager = new LevelManager(game);
game.levelManager = levelManager;

// --- Loading Screen Management ---
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');

/**
 * Show loading screen
 */
function showLoading(message = 'Loading...') {
  if (loadingText) loadingText.textContent = message;
  if (loadingScreen) loadingScreen.classList.remove('hidden');
}

/**
 * Hide loading screen
 */
function hideLoading() {
  if (loadingScreen) loadingScreen.classList.add('hidden');
}

/**
 * Initialize and load the first level
 */
async function initGame() {
  try {
    showLoading('Loading level...');

    // Load level 1
    const levelData = await levelManager.loadLevel(1);

    // Build the level
    levelManager.buildLevel(levelData);

    // Reset penguin to spawn position
    const spawnPos = levelManager.getSpawnPosition();
    penguinController.resetPosition(spawnPos);

    // Reset camera
    cameraManager.reset();

    // Show menu
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) uiOverlay.classList.remove('hidden');

    // Hide loading screen
    hideLoading();

    console.log('[Main] Game initialized successfully!');
    console.log(`[Main] Loaded level: ${levelData.name}`);
    console.log('Press START to begin playing');
  } catch (error) {
    console.error('[Main] Failed to initialize game:', error);
    showLoading('Error loading level!');
  }
}

// --- UI Setup ---
const startButton = document.getElementById('start-button');
const overlay = document.getElementById('ui-overlay');

if (startButton && overlay) {
  startButton.addEventListener('click', () => {
    // Hide overlay
    overlay.classList.add('hidden');

    // Start game
    game.setState(GameState.PLAYING);

    // Request pointer lock
    inputManager.requestPointerLock();

    console.log('[Game] Started!');
  });
}

// --- Animation Loop for Goal Object ---
function animateGoal() {
  const goalPos = levelManager.getGoalPosition();
  if (goalPos && game.isPlaying()) {
    const time = Date.now() * 0.001;
    goalPos.y = 12.5 + Math.sin(time * 5) * 0.5;
    
    // Rotate goal if it exists
    if (levelManager.goalObject) {
      levelManager.goalObject.rotation.y = time * 2;
      levelManager.goalObject.position.y = goalPos.y;
    }
  }
}

// Hook into game update
const originalUpdate = game.update.bind(game);
game.update = function(deltaTime) {
  originalUpdate(deltaTime);
  animateGoal();
};

// --- Start the game ---
initGame().then(() => {
  // Start the game loop after level is loaded
  game.start();
});

// Make game available globally for debugging
window.game = game;
window.penguin = penguinController;
window.physics = physicsWorld;
window.levelManager = levelManager;

// Debug helpers
window.debug = {
  showCollision: () => physicsWorld.debugVisualize(game.scene),
  teleport: (x, y, z) => penguinController.resetPosition(new THREE.Vector3(x, y, z)),
  setState: (state) => game.setState(state),
  win: () => game.winGame(),
  reloadLevel: () => {
    showLoading('Reloading level...');
    levelManager.clearLevel();
    levelManager.loadLevel(1).then(data => {
      levelManager.buildLevel(data);
      penguinController.resetPosition(levelManager.getSpawnPosition());
      hideLoading();
    });
  }
};

console.log('%cDebug commands available:', 'color: #00ff00; font-weight: bold;');
console.log('  debug.showCollision() - Visualize collision boxes');
console.log('  debug.teleport(x, y, z) - Teleport penguin');
console.log('  debug.setState(state) - Change game state');
console.log('  debug.win() - Trigger victory');
console.log('  debug.reloadLevel() - Reload current level');

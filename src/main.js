/**
 * Voxel Penguin Parkour - Main Entry Point
 *
 * Wires together all modular systems and starts the game.
 */

import * as THREE from 'three';
import { Game, GameState } from './core/Game.js';
import { InputManager } from './core/InputManager.js';
import { PhysicsWorld } from './core/PhysicsWorld.js';
import { SettingsManager } from './core/SettingsManager.js';
import { PenguinController } from './entities/PenguinController.js';
import { CameraManager } from './managers/CameraManager.js';
import { LevelManager } from './managers/LevelManager.js';
import { UIManager } from './managers/UIManager.js';

console.log('%c🐧 Voxel Penguin Parkour 🐧', 'font-size: 24px; font-weight: bold; color: #00aaff;');

// Create game instance
const game = new Game();
game.init();

// Create settings manager (before other managers that depend on it)
const settingsManager = new SettingsManager();
game.settingsManager = settingsManager;

// Apply shadow setting from saved preferences
if (!settingsManager.get('shadows')) {
  game.renderer.shadowMap.enabled = false;
}
settingsManager.addEventListener('settingChanged', (e) => {
  if (e.detail.key === 'shadows') {
    game.renderer.shadowMap.enabled = e.detail.value;
    game.renderer.shadowMap.needsUpdate = true;
  }
});

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
const cameraManager = new CameraManager(game.camera, penguinController, inputManager, settingsManager);
game.cameraManager = cameraManager;

// Create level manager
const levelManager = new LevelManager(game);
game.levelManager = levelManager;

// Create UI manager
const uiManager = new UIManager(game, settingsManager, inputManager);
game.uiManager = uiManager;

// --- Loading Screen Management ---
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');

function showLoading(message = 'Loading...') {
  if (loadingText) loadingText.textContent = message;
  if (loadingScreen) loadingScreen.classList.remove('hidden');
}

function hideLoading() {
  if (loadingScreen) loadingScreen.classList.add('hidden');
}

// --- Initialize Game ---
async function initGame() {
  try {
    showLoading('Loading level...');

    const levelData = await levelManager.loadLevel(1);
    levelManager.buildLevel(levelData);

    penguinController.resetPosition(levelManager.getSpawnPosition());
    cameraManager.reset();

    // Show main menu
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) uiOverlay.classList.remove('hidden');

    // Set HUD level name
    const hudLevel = document.getElementById('hud-level');
    if (hudLevel) hudLevel.textContent = levelData.name || 'Tutorial';

    hideLoading();
    console.log('[Main] Game initialized — loaded level:', levelData.name);
  } catch (error) {
    console.error('[Main] Failed to initialize game:', error);
    showLoading('Error loading level!');
  }
}

// --- Start Button ---
const startButton = document.getElementById('start-button');
const overlay = document.getElementById('ui-overlay');

if (startButton && overlay) {
  startButton.addEventListener('click', () => {
    // Hide overlay and main menu
    overlay.classList.add('hidden');
    const mainMenu = document.getElementById('menu-main');
    if (mainMenu) mainMenu.classList.add('hidden');

    // Do NOT request pointer lock yet.
    // UIManager will show the controls overlay first, then lock after dismissal.
    game.setState(GameState.PLAYING);
    console.log('[Game] Started!');
  });
}

// --- Animation Loop for Goal Object ---
function animateGoal() {
  const goalPos = levelManager.getGoalPosition();
  if (goalPos && game.isPlaying()) {
    const time = Date.now() * 0.001;
    goalPos.y = 12.5 + Math.sin(time * 5) * 0.5;

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
  if (uiManager) uiManager.updateHUD();
};

// --- Wire game state changes to UI ---
const originalSetState = game.setState.bind(game);
game.setState = function(newState) {
  originalSetState(newState);
  if (uiManager) uiManager.onGameStateChanged(newState);
};

// --- Start ---
initGame().then(() => {
  game.start();
});

// --- Debug ---
window.game = game;
window.penguin = penguinController;
window.physics = physicsWorld;
window.levelManager = levelManager;
window.settingsManager = settingsManager;
window.uiManager = uiManager;

window.debug = {
  showCollision: () => physicsWorld.debugVisualize(game.scene),
  teleport: (x, y, z) => penguinController.resetPosition(new THREE.Vector3(x, y, z)),
  setState: (state) => game.setState(state),
  win: () => game.winGame(),
  settings: {
    get: (key) => settingsManager.get(key),
    set: (key, val) => settingsManager.set(key, val),
    reset: () => settingsManager.reset(),
    all: () => settingsManager.getAll()
  },
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
console.log('  debug.settings.get(key) - Get setting value');
console.log('  debug.settings.set(key, val) - Set setting value');
console.log('  debug.settings.reset() - Reset all settings');
console.log('  debug.settings.all() - Show all settings');
console.log('  debug.reloadLevel() - Reload current level');

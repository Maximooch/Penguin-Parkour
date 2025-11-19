/**
 * Voxel Penguin Parkour - Main Entry Point
 *
 * This file wires together all the modular systems and starts the game.
 *
 * Phase 2: Core Systems with Hardcoded Level
 * Phase 3: Will add LevelManager with JSON loading
 * Phase 4: Will add UI and Audio managers
 */

import * as THREE from 'three';
import { Game, GameState } from './core/Game.js';
import { InputManager } from './core/InputManager.js';
import { PhysicsWorld } from './core/PhysicsWorld.js';
import { PenguinController } from './entities/PenguinController.js';
import { CameraManager } from './managers/CameraManager.js';
import { SettingsManager } from './managers/SettingsManager.js';
import { VoxelBuilder } from './utils/VoxelBuilder.js';

console.log('%c🐧 Voxel Penguin Parkour 🐧', 'font-size: 24px; font-weight: bold; color: #00aaff;');
console.log('Phase 2.5: Core Systems + Settings');

// Create game instance
const game = new Game();
game.init();

// Create input manager
const inputManager = new InputManager(game);
game.inputManager = inputManager;

// Create physics world
const physicsWorld = new PhysicsWorld({
  gravity: 50,
  friction: 10,
  airFriction: 0.5  // Low air friction preserves jump momentum
});
game.physicsWorld = physicsWorld;

// Create penguin controller
const penguinController = new PenguinController(game.scene);
game.penguinController = penguinController;

// Create camera manager
const cameraManager = new CameraManager(game.camera, penguinController, inputManager);
game.cameraManager = cameraManager;

// Create settings manager
const settingsManager = new SettingsManager();
game.settingsManager = settingsManager;

// Apply settings to game systems
settingsManager.applyToGame(game);

// --- Temporary Level Building (until we have LevelManager) ---
const levelGroup = new THREE.Group();
game.scene.add(levelGroup);

const platforms = [];
let goalObject = null;

/**
 * Add a platform to the level
 */
function addPlatform(x, y, z, width, depth, color = 0xA5D6E8) {
  const height = 1;

  // Create visual mesh
  VoxelBuilder.createPlatform(x, y, z, width, depth, color, levelGroup);

  // Add collision box
  platforms.push({
    minX: x - width / 2,
    maxX: x + width / 2,
    minY: y - height,
    maxY: y,
    minZ: z - depth / 2,
    maxZ: z + depth / 2
  });
}

/**
 * Build the test level
 */
function buildLevel() {
  // Clear existing level
  while (levelGroup.children.length > 0) {
    levelGroup.remove(levelGroup.children[0]);
  }
  platforms.length = 0;

  // Build platforms (same as original)
  addPlatform(0, 0, 0, 8, 8);
  addPlatform(0, 1.5, -8, 3, 3);
  addPlatform(0, 3.0, -14, 3, 3);
  addPlatform(-5, 4.0, -14, 4, 3);
  addPlatform(-10, 5.0, -14, 3, 3);
  addPlatform(-10, 6.0, -9, 2, 2);
  addPlatform(-10, 7.0, -5, 2, 2);
  addPlatform(-10, 8.0, -1, 2, 2);
  addPlatform(-5, 8.0, 3, 4, 4);
  addPlatform(2, 9.5, 3, 2.5, 2.5);
  addPlatform(7, 11.0, 3, 4, 4, 0xFFD700); // Gold platform

  // Create water
  VoxelBuilder.createWater(game.scene, -5);

  // Create goal (fish)
  goalObject = VoxelBuilder.createGoal(game.scene, new THREE.Vector3(7, 12.5, 3));

  // Set platforms in physics world
  physicsWorld.setPlatforms(platforms);

  console.log(`[Level] Built with ${platforms.length} platforms`);
}

// Build the level
buildLevel();

// Create temporary level manager API for Game.js
game.levelManager = {
  getGoalPosition: () => goalObject ? goalObject.position : null,
  getSpawnPosition: () => new THREE.Vector3(0, 2, 0)
};

// --- UI Setup ---
const startButton = document.getElementById('start-button');
const settingsButton = document.getElementById('settings-button');
const settingsBackButton = document.getElementById('settings-back');
const settingsResetButton = document.getElementById('settings-reset');
const overlay = document.getElementById('ui-overlay');
const menu = document.getElementById('menu');
const settingsPanel = document.getElementById('settings-panel');

// Settings sliders
const mouseSensitivitySlider = document.getElementById('mouse-sensitivity');
const mouseSensitivityValue = document.getElementById('mouse-sensitivity-value');
const masterVolumeSlider = document.getElementById('master-volume');
const masterVolumeValue = document.getElementById('master-volume-value');
const musicVolumeSlider = document.getElementById('music-volume');
const musicVolumeValue = document.getElementById('music-volume-value');
const sfxVolumeSlider = document.getElementById('sfx-volume');
const sfxVolumeValue = document.getElementById('sfx-volume-value');

// Load settings into UI
function updateUIFromSettings() {
  if (mouseSensitivitySlider) {
    mouseSensitivitySlider.value = settingsManager.get('mouseSensitivity');
    mouseSensitivityValue.textContent = settingsManager.get('mouseSensitivity').toFixed(1);
  }
  if (masterVolumeSlider) {
    masterVolumeSlider.value = settingsManager.get('masterVolume');
    masterVolumeValue.textContent = Math.round(settingsManager.get('masterVolume') * 100) + '%';
  }
  if (musicVolumeSlider) {
    musicVolumeSlider.value = settingsManager.get('musicVolume');
    musicVolumeValue.textContent = Math.round(settingsManager.get('musicVolume') * 100) + '%';
  }
  if (sfxVolumeSlider) {
    sfxVolumeSlider.value = settingsManager.get('sfxVolume');
    sfxVolumeValue.textContent = Math.round(settingsManager.get('sfxVolume') * 100) + '%';
  }
}

updateUIFromSettings();

// Start button
if (startButton && overlay) {
  startButton.addEventListener('click', () => {
    overlay.classList.add('hidden');
    game.setState(GameState.PLAYING);
    inputManager.requestPointerLock();
    console.log('[Game] Started!');
  });
}

// Settings button
if (settingsButton && menu && settingsPanel) {
  settingsButton.addEventListener('click', () => {
    menu.classList.add('hidden');
    settingsPanel.classList.remove('hidden');
  });
}

// Settings back button
if (settingsBackButton && menu && settingsPanel) {
  settingsBackButton.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
    menu.classList.remove('hidden');
  });
}

// Settings reset button
if (settingsResetButton) {
  settingsResetButton.addEventListener('click', () => {
    settingsManager.reset();
    updateUIFromSettings();
    settingsManager.applyToGame(game);
  });
}

// Mouse Sensitivity slider
if (mouseSensitivitySlider) {
  mouseSensitivitySlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    mouseSensitivityValue.textContent = value.toFixed(1);
    settingsManager.set('mouseSensitivity', value);
    settingsManager.applyToGame(game);
  });
}

// Volume sliders
if (masterVolumeSlider) {
  masterVolumeSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    masterVolumeValue.textContent = Math.round(value * 100) + '%';
    settingsManager.set('masterVolume', value);
  });
}

if (musicVolumeSlider) {
  musicVolumeSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    musicVolumeValue.textContent = Math.round(value * 100) + '%';
    settingsManager.set('musicVolume', value);
  });
}

if (sfxVolumeSlider) {
  sfxVolumeSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    sfxVolumeValue.textContent = Math.round(value * 100) + '%';
    settingsManager.set('sfxVolume', value);
  });
}

// --- Animation Loop for Goal Object ---
function animateGoal() {
  if (goalObject && game.isPlaying()) {
    const time = Date.now() * 0.001;
    goalObject.rotation.y = time * 2;
    goalObject.position.y = 12.5 + Math.sin(time * 5) * 0.5;
  }
}

// Hook into game update
const originalUpdate = game.update.bind(game);
game.update = function(deltaTime) {
  originalUpdate(deltaTime);
  animateGoal();
};

// Start the game loop
game.start();

// Reset penguin to spawn
penguinController.resetPosition(new THREE.Vector3(0, 2, 0));

console.log('[Main] Game initialized successfully!');
console.log('Press START to begin playing');

// Make game available globally for debugging
window.game = game;
window.penguin = penguinController;
window.physics = physicsWorld;

// Debug helpers
window.debug = {
  showCollision: () => physicsWorld.debugVisualize(game.scene),
  teleport: (x, y, z) => penguinController.resetPosition(new THREE.Vector3(x, y, z)),
  setState: (state) => game.setState(state),
  win: () => game.winGame()
};

console.log('%cDebug commands available:', 'color: #00ff00; font-weight: bold;');
console.log('  debug.showCollision() - Visualize collision boxes');
console.log('  debug.teleport(x, y, z) - Teleport penguin');
console.log('  debug.setState(state) - Change game state');
console.log('  debug.win() - Trigger victory');

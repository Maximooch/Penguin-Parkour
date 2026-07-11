/**
 * Game.js - The Conductor
 *
 * Orchestrates all game systems, manages the game loop and state transitions.
 * This is the central hub that initializes Three.js and coordinates all managers.
 */

import * as THREE from 'three';

// Game states
export const GameState = {
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  VICTORY: 'victory',
  GAMEOVER: 'gameover'
};

/**
 * Main Game class
 */
export class Game {
  constructor() {
    this.state = GameState.LOADING;
    this.clock = new THREE.Clock();

    // Three.js core
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Will be set by external managers
    this.inputManager = null;
    this.physicsWorld = null;
    this.penguinController = null;
    this.cameraManager = null;
    this.levelManager = null;
    this.settingsManager = null;
    this.uiManager = null;
    this.audioManager = null;
    // Configuration
    this.config = {
      backgroundColor: 0xAADDFF,
      fogNear: 20,
      fogFar: 80,
      shadowMapSize: 2048,
      baseFov: 60
    };

    // Animation frame ID (for cleanup)
    this.animationId = null;
  }

  /**
   * Initialize the game
   * Sets up Three.js scene, renderer, lighting
   */
  init() {
    console.log('[Game] Initializing...');

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);
    this.scene.fog = new THREE.Fog(
      this.config.backgroundColor,
      this.config.fogNear,
      this.config.fogFar
    );

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      this.config.baseFov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Append to DOM
    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(this.renderer.domElement);
    } else {
      document.body.appendChild(this.renderer.domElement);
    }

    // Setup lighting
    this.setupLighting();

    // Handle window resize
    window.addEventListener('resize', () => this.onResize());

    this.setState(GameState.MENU);
    console.log('[Game] Initialization complete');
  }

  /**
   * Setup scene lighting
   */
  setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    // Directional light (sun)
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;

    // Shadow camera setup
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;
    sun.shadow.mapSize.width = this.config.shadowMapSize;
    sun.shadow.mapSize.height = this.config.shadowMapSize;

    this.scene.add(sun);
  }

  /**
   * Start the game loop
   */
  start() {
    console.log('[Game] Starting game loop');
    this.clock.start();
    this.animate();
  }

  /**
   * Main game loop (called every frame)
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Calculate delta time (capped at 50ms to prevent physics explosions)
    const deltaTime = Math.min(this.clock.getDelta(), 0.05);

    // Update all systems
    this.update(deltaTime);

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Update all game systems
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Only update game logic when playing
    if (this.state !== GameState.PLAYING) {
      return;
    }

    // Update input manager
    if (this.inputManager) {
      this.inputManager.update();
    }

    // Update penguin controller
    if (this.penguinController) {
      const actions = this.inputManager ? this.inputManager.getActions() : null;
      this.penguinController.update(deltaTime, actions);
    }

    // Update physics
    if (this.physicsWorld && this.penguinController) {
      this.physicsWorld.update(deltaTime, this.penguinController);
    }

    // Update camera
    if (this.cameraManager && this.penguinController) {
      this.cameraManager.update(deltaTime, this.penguinController.getPosition());
    }

    // Check win/lose conditions
    this.checkGameConditions();
  }

  /**
   * Check for win/lose conditions
   */
  checkGameConditions() {
    if (!this.penguinController || !this.levelManager) return;

    const penguinPos = this.penguinController.getPosition();

    // Check win condition (near goal)
    const goalPos = this.levelManager.getGoalPosition();
    if (goalPos && penguinPos.distanceTo(goalPos) < 1.5) {
      this.winGame();
      return;
    }

    // Check lose condition (fell off map)
    if (penguinPos.y < -5) {
      this.resetPosition();
    }
  }

  /**
   * Change game state
   * @param {string} newState - One of GameState values
   */
  setState(newState) {
    console.log(`[Game] State: ${this.state} -> ${newState}`);
    this.state = newState;

    // Handle state-specific logic
    switch (newState) {
      case GameState.PLAYING:
        if (this.audioManager) {
          this.audioManager.playMusic('theme');
        }
        break;

      case GameState.PAUSED:
        // Could add pause menu logic here
        break;

      case GameState.VICTORY:
        if (this.audioManager) {
          this.audioManager.playSFX('win');
        }
        break;
    }
  }

  /**
   * Win the game
   */
  winGame() {
    console.log('[Game] Victory!');
    this.setState(GameState.VICTORY);

    if (this.uiManager) {
      this.uiManager.showVictoryScreen();
    }

    this.resetPosition();
  }

  /**
   * Reset player position to spawn point
   */
  resetPosition() {
    if (this.penguinController) {
      const spawnPos = this.levelManager ?
        this.levelManager.getSpawnPosition() :
        new THREE.Vector3(0, 2, 0);

      this.penguinController.resetPosition(spawnPos);
    }

    if (this.cameraManager) {
      this.cameraManager.reset();
    }
  }

  /**
   * Handle window resize
   */
  onResize() {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    console.log('[Game] Destroying...');

    // Stop animation loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.audioManager?.destroy();

    // Remove event listeners
    window.removeEventListener('resize', this.onResize);

    // Dispose Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    console.log('[Game] Destroyed');
  }

  /**
   * Get current game state
   * @returns {string}
   */
  getState() {
    return this.state;
  }

  /**
   * Check if game is currently playing
   * @returns {boolean}
   */
  isPlaying() {
    return this.state === GameState.PLAYING;
  }
}

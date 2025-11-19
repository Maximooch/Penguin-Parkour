/**
 * InputManager.js - The Interface
 *
 * Abstracts raw keyboard and mouse input into semantic game actions.
 * This decouples input handling from game logic and makes it easy to:
 * - Add gamepad support later
 * - Rebind controls in settings
 * - Handle pointer lock with fallback
 */

import * as THREE from 'three';

/**
 * InputManager class
 * Handles all input and provides a clean actions API
 */
export class InputManager {
  constructor(game) {
    this.game = game;

    // Raw input state
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      space: false,
      shift: false,
      escape: false
    };

    // Mouse state
    this.mouseSensitivity = 0.002;
    this.mouseDelta = { x: 0, y: 0 };
    this.isDragging = false; // Fallback when pointer lock fails

    // Pointer lock state
    this.isPointerLocked = false;

    // Bind event handlers
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);

    // Setup event listeners
    this.setupListeners();
  }

  /**
   * Setup all input event listeners
   */
  setupListeners() {
    // Keyboard events
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Mouse events
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);

    // Pointer lock events
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
  }

  /**
   * Handle keydown events
   */
  onKeyDown(event) {
    const key = event.key.toLowerCase();

    // Map keys
    if (key === ' ') {
      this.keys.space = true;
    } else if (key === 'shift') {
      this.keys.shift = true;
    } else if (key === 'escape') {
      this.keys.escape = true;
      this.handleEscape();
    } else if (this.keys.hasOwnProperty(key)) {
      this.keys[key] = true;
    }
  }

  /**
   * Handle keyup events
   */
  onKeyUp(event) {
    const key = event.key.toLowerCase();

    if (key === ' ') {
      this.keys.space = false;
    } else if (key === 'shift') {
      this.keys.shift = false;
    } else if (key === 'escape') {
      this.keys.escape = false;
    } else if (this.keys.hasOwnProperty(key)) {
      this.keys[key] = false;
    }
  }

  /**
   * Handle mouse movement
   */
  onMouseMove(event) {
    // Only track mouse delta if pointer is locked OR we're dragging (fallback)
    if (this.isPointerLocked || (this.game.isPlaying() && this.isDragging)) {
      this.mouseDelta.x = event.movementX;
      this.mouseDelta.y = event.movementY;
    } else {
      this.mouseDelta.x = 0;
      this.mouseDelta.y = 0;
    }
  }

  /**
   * Handle mouse down (for drag fallback)
   */
  onMouseDown() {
    if (this.game.isPlaying() && !this.isPointerLocked) {
      this.isDragging = true;
    }
  }

  /**
   * Handle mouse up (for drag fallback)
   */
  onMouseUp() {
    this.isDragging = false;
  }

  /**
   * Handle pointer lock state changes
   */
  onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === document.body;

    if (this.isPointerLocked) {
      this.isDragging = false;
    }
  }

  /**
   * Handle Escape key press
   */
  handleEscape() {
    if (this.game.isPlaying()) {
      this.game.setState('paused');
      this.exitPointerLock();

      // Show pause menu if UIManager exists
      if (this.game.uiManager) {
        this.game.uiManager.showMenu('pause');
      }
    }
  }

  /**
   * Request pointer lock
   */
  requestPointerLock() {
    try {
      document.body.requestPointerLock();
    } catch (e) {
      console.warn('[Input] Pointer lock failed, using drag fallback');
    }
  }

  /**
   * Exit pointer lock
   */
  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  /**
   * Update input state (called every frame)
   */
  update() {
    // Reset mouse delta each frame after it's been read
    // This prevents camera from continuing to rotate
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }

  /**
   * Get current actions (semantic game actions)
   * @returns {Object} actions object
   */
  getActions() {
    // Calculate movement vector from WASD
    const moveVector = new THREE.Vector2(0, 0);

    if (this.keys.w) moveVector.y += 1;
    if (this.keys.s) moveVector.y -= 1;
    if (this.keys.d) moveVector.x += 1;
    if (this.keys.a) moveVector.x -= 1;

    // Normalize if moving diagonally
    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
    }

    return {
      // Movement
      moveVector: moveVector,
      jump: this.keys.space,
      sprint: this.keys.shift,

      // Future actions
      dash: false,      // Future: E key
      interact: false,  // Future: F key

      // Mouse look
      mouseDelta: { ...this.mouseDelta },
      mouseSensitivity: this.mouseSensitivity
    };
  }

  /**
   * Get mouse delta and reset
   * @returns {Object} {x, y}
   */
  getMouseDelta() {
    const delta = { ...this.mouseDelta };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }

  /**
   * Set mouse sensitivity
   * @param {number} sensitivity
   */
  setMouseSensitivity(sensitivity) {
    this.mouseSensitivity = sensitivity;
  }

  /**
   * Check if a specific key is pressed
   * @param {string} key
   * @returns {boolean}
   */
  isKeyPressed(key) {
    return this.keys[key] || false;
  }

  /**
   * Reset all input state
   */
  reset() {
    // Clear all keys
    for (const key in this.keys) {
      this.keys[key] = false;
    }

    // Clear mouse state
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.isDragging = false;
  }

  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);

    this.exitPointerLock();
  }
}

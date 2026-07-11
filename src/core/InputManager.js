/**
 * InputManager.js - The Interface
 *
 * Abstracts raw keyboard and mouse input into semantic game actions. Keyboard
 * bindings are persisted by SettingsManager and use KeyboardEvent.code so the
 * player's physical control layout remains stable across keyboard layouts.
 */

import * as THREE from 'three';

export const INPUT_ACTIONS = {
  moveForward: 'moveForward',
  moveBackward: 'moveBackward',
  moveLeft: 'moveLeft',
  moveRight: 'moveRight',
  jump: 'jump',
  sprint: 'sprint',
  pause: 'pause'
};

export const INPUT_ACTION_LABELS = {
  [INPUT_ACTIONS.moveForward]: 'Move Forward',
  [INPUT_ACTIONS.moveBackward]: 'Move Backward',
  [INPUT_ACTIONS.moveLeft]: 'Move Left',
  [INPUT_ACTIONS.moveRight]: 'Move Right',
  [INPUT_ACTIONS.jump]: 'Jump',
  [INPUT_ACTIONS.sprint]: 'Sprint',
  [INPUT_ACTIONS.pause]: 'Pause'
};

/**
 * Handles all input and provides a clean actions API.
 */
export class InputManager {
  constructor(game) {
    this.game = game;
    this.pressedCodes = new Set();
    this.keyBindings = this.game.settingsManager?.get('keyBindings') || {};

    this.mouseSensitivity = 0.002;
    this.mouseDelta = { x: 0, y: 0 };
    this.isDragging = false;
    this.isPointerLocked = false;
    this.isRebinding = false;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    this.onSettingChanged = this.onSettingChanged.bind(this);

    this.setupListeners();

    if (this.game.settingsManager) {
      this.applySensitivity(this.game.settingsManager.get('mouseSensitivity'));
      this.game.settingsManager.addEventListener('settingChanged', this.onSettingChanged);
    }
  }

  applySensitivity(multiplier) {
    this.mouseSensitivity = 0.002 * multiplier;
  }

  onSettingChanged(event) {
    if (event.detail.key === 'mouseSensitivity') {
      this.applySensitivity(event.detail.value);
    } else if (event.detail.key === 'keyBindings') {
      this.keyBindings = event.detail.value;
      this.pressedCodes.clear();
    }
  }

  setupListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
  }

  onKeyDown(event) {
    if (this.isRebinding) return;

    this.pressedCodes.add(event.code);

    if (this.isActionPressed(INPUT_ACTIONS.pause) && !event.repeat) {
      event.preventDefault();
      this.handlePause();
    }
  }

  onKeyUp(event) {
    if (this.isRebinding) return;

    this.pressedCodes.delete(event.code);
  }

  onMouseMove(event) {
    if (this.isPointerLocked || (this.game.isPlaying() && this.isDragging)) {
      this.mouseDelta.x = event.movementX;
      this.mouseDelta.y = event.movementY;
    } else {
      this.mouseDelta.x = 0;
      this.mouseDelta.y = 0;
    }
  }

  onMouseDown() {
    if (this.game.isPlaying() && !this.isPointerLocked) {
      this.isDragging = true;
    }
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === document.body;
    if (this.isPointerLocked) {
      this.isDragging = false;
    }
  }

  handlePause() {
    if (this.game.isPlaying()) {
      this.game.setState('paused');
      this.exitPointerLock();
      this.game.uiManager?.showMenu('pause');
    }
  }

  requestPointerLock() {
    try {
      document.body.requestPointerLock();
    } catch (error) {
      console.warn('[Input] Pointer lock failed, using drag fallback');
    }
  }

  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  update() {}

  /** Temporarily suppress gameplay input while the settings UI captures a key. */
  setRebindingActive(active) {
    this.isRebinding = active;
    if (active) this.pressedCodes.clear();
  }

  /**
   * Return bindings for an action as [primary, alternate].
   * @param {string} action
   * @returns {Array<string|null>}
   */
  getBindings(action) {
    const bindings = this.keyBindings[action];
    return Array.isArray(bindings) ? [...bindings] : [null, null];
  }

  /**
   * Update one action slot and persist it through SettingsManager.
   * @param {string} action
   * @param {number} slot
   * @param {string|null} code
   */
  setBinding(action, slot, code) {
    if (!(action in INPUT_ACTIONS) || !Number.isInteger(slot) || slot < 0 || slot > 1) {
      return;
    }

    const bindings = this.game.settingsManager?.get('keyBindings') || { ...this.keyBindings };
    bindings[action] = Array.isArray(bindings[action]) ? [...bindings[action]] : [null, null];
    bindings[action][slot] = code;
    this.game.settingsManager?.set('keyBindings', bindings);
  }

  /**
   * Find every action/slot using a code, excluding an optional target slot.
   * @param {string} code
   * @param {{action: string, slot: number}} target
   * @returns {Array<{action: string, slot: number}>}
   */
  findBindingConflicts(code, target = {}) {
    if (!code) return [];

    return Object.keys(INPUT_ACTIONS).flatMap((action) => this.getBindings(action)
      .map((binding, slot) => ({ action, slot, binding }))
      .filter(({ action, slot, binding }) => (
        binding === code && (action !== target.action || slot !== target.slot)
      ))
      .map(({ action, slot }) => ({ action, slot })));
  }

  isActionPressed(action) {
    return this.getBindings(action).some((code) => code && this.pressedCodes.has(code));
  }

  getActions() {
    const moveVector = new THREE.Vector2(0, 0);

    if (this.isActionPressed(INPUT_ACTIONS.moveForward)) moveVector.y += 1;
    if (this.isActionPressed(INPUT_ACTIONS.moveBackward)) moveVector.y -= 1;
    if (this.isActionPressed(INPUT_ACTIONS.moveRight)) moveVector.x += 1;
    if (this.isActionPressed(INPUT_ACTIONS.moveLeft)) moveVector.x -= 1;

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
    }

    return {
      moveVector,
      jump: this.isActionPressed(INPUT_ACTIONS.jump),
      sprint: this.isActionPressed(INPUT_ACTIONS.sprint),
      dash: false,
      interact: false,
      mouseDelta: { ...this.mouseDelta },
      mouseSensitivity: this.mouseSensitivity
    };
  }

  getMouseDelta() {
    const delta = { ...this.mouseDelta };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }

  setMouseSensitivity(sensitivity) {
    this.mouseSensitivity = sensitivity;
  }

  isKeyPressed(code) {
    return this.pressedCodes.has(code);
  }

  reset() {
    this.pressedCodes.clear();
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.isDragging = false;
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    this.game.settingsManager?.removeEventListener('settingChanged', this.onSettingChanged);
    this.exitPointerLock();
  }
}

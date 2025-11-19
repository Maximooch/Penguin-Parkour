/**
 * SettingsManager.js - The Memory
 *
 * Manages game settings and persists them to localStorage.
 * Provides an easy API for getting/setting configuration values.
 */

/**
 * SettingsManager class
 * Handles settings persistence and retrieval
 */
export class SettingsManager {
  constructor() {
    this.storageKey = 'penguinParkour_settings';

    // Default settings
    this.defaults = {
      // Audio
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 1.0,

      // Controls
      mouseSensitivity: 1.0,

      // Graphics
      shadows: true,
      particles: true,
      antialias: true,
      fov: 60
    };

    // Current settings (loaded from localStorage or defaults)
    this.settings = this.load();

    console.log('[Settings] Loaded:', this.settings);
  }

  /**
   * Load settings from localStorage
   * @returns {Object} settings object
   */
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (stored) {
        const parsed = JSON.parse(stored);

        // Merge with defaults (in case new settings were added)
        return { ...this.defaults, ...parsed };
      }
    } catch (error) {
      console.warn('[Settings] Failed to load from localStorage:', error);
    }

    // Return defaults if loading failed or no data exists
    return { ...this.defaults };
  }

  /**
   * Save settings to localStorage
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      console.log('[Settings] Saved to localStorage');
    } catch (error) {
      console.error('[Settings] Failed to save to localStorage:', error);
    }
  }

  /**
   * Get a setting value
   * @param {string} key - Setting key (supports dot notation: 'graphics.shadows')
   * @returns {*} setting value
   */
  get(key) {
    // Support dot notation (e.g., 'graphics.shadows')
    const keys = key.split('.');
    let value = this.settings;

    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        console.warn(`[Settings] Unknown key: ${key}`);
        return undefined;
      }
    }

    return value;
  }

  /**
   * Set a setting value
   * @param {string} key - Setting key
   * @param {*} value - New value
   * @param {boolean} saveImmediately - Whether to save to localStorage immediately (default true)
   */
  set(key, value, saveImmediately = true) {
    // Support dot notation
    const keys = key.split('.');
    let target = this.settings;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }

    target[keys[keys.length - 1]] = value;

    console.log(`[Settings] Set ${key} = ${value}`);

    if (saveImmediately) {
      this.save();
    }
  }

  /**
   * Reset all settings to defaults
   */
  reset() {
    this.settings = { ...this.defaults };
    this.save();
    console.log('[Settings] Reset to defaults');
  }

  /**
   * Reset a specific category to defaults
   * @param {string} category - 'audio', 'controls', 'graphics'
   */
  resetCategory(category) {
    const categoryDefaults = {};

    // Extract defaults for this category
    for (const key in this.defaults) {
      if (this.defaults.hasOwnProperty(key)) {
        categoryDefaults[key] = this.defaults[key];
      }
    }

    // Apply to current settings
    Object.assign(this.settings, categoryDefaults);
    this.save();

    console.log(`[Settings] Reset ${category} to defaults`);
  }

  /**
   * Get all settings
   * @returns {Object} complete settings object
   */
  getAll() {
    return { ...this.settings };
  }

  /**
   * Apply settings to game systems
   * @param {Object} game - Game instance
   */
  applyToGame(game) {
    console.log('[Settings] Applying to game systems...');

    // Apply mouse sensitivity
    if (game.cameraManager) {
      const sensitivity = this.get('mouseSensitivity') * 0.002; // Base sensitivity
      game.cameraManager.setMouseSensitivity(sensitivity);
    }

    if (game.inputManager) {
      game.inputManager.setMouseSensitivity(this.get('mouseSensitivity') * 0.002);
    }

    // Apply graphics settings
    if (game.renderer) {
      game.renderer.shadowMap.enabled = this.get('shadows');
    }

    if (game.camera) {
      const baseFov = this.get('fov') || 60;
      game.camera.fov = baseFov;
      game.camera.updateProjectionMatrix();

      // Update camera manager's base FOV
      if (game.cameraManager) {
        game.cameraManager.config.baseFov = baseFov;
      }
    }

    // Apply audio settings (when audioManager exists)
    if (game.audioManager) {
      game.audioManager.setMasterVolume(this.get('masterVolume'));
      game.audioManager.setMusicVolume(this.get('musicVolume'));
      game.audioManager.setSFXVolume(this.get('sfxVolume'));
    }

    console.log('[Settings] Applied successfully');
  }

  /**
   * Export settings as JSON string
   * @returns {string} JSON settings
   */
  export() {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON string
   * @param {string} jsonString - JSON settings
   */
  import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.settings = { ...this.defaults, ...imported };
      this.save();
      console.log('[Settings] Imported successfully');
      return true;
    } catch (error) {
      console.error('[Settings] Import failed:', error);
      return false;
    }
  }
}

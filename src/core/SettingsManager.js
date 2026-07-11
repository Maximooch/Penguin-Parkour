/**
 * SettingsManager.js - The Memory
 *
 * Persists user preferences to localStorage.
 * Emits 'settingChanged' events so other managers can react.
 * All values are clamped to valid ranges on set.
 */

/**
 * Settings schema with defaults and constraints
 */
const SETTINGS_SCHEMA = {
  mouseSensitivity: { default: 1.0, min: 0.1, max: 5.0, step: 0.1 },
  masterVolume: { default: 0.8, min: 0.0, max: 1.0, step: 0.05 },
  musicVolume: { default: 0.6, min: 0.0, max: 1.0, step: 0.05 },
  sfxVolume: { default: 1.0, min: 0.0, max: 1.0, step: 0.05 },
  fov: { default: 60, min: 50, max: 90, step: 1 },
  shadows: { default: true },
  particles: { default: true },
  keyBindings: {
    default: {
      moveForward: ['KeyW', null],
      moveBackward: ['KeyS', null],
      moveLeft: ['KeyA', null],
      moveRight: ['KeyD', null],
      jump: ['Space', null],
      sprint: ['ShiftLeft', 'ShiftRight'],
      pause: ['Escape', null]
    }
  }
};

const STORAGE_KEY = 'penguinParkour_settings';

export class SettingsManager extends EventTarget {
  constructor() {
    super();
    this.settings = {};
    this.load();
  }

  /**
   * Get a setting value (returned objects are safe to mutate locally).
   * @param {string} key
   * @returns {*} Current value or default
   */
  get(key) {
    if (key in this.settings) {
      return this.cloneValue(this.settings[key]);
    }
    const schema = SETTINGS_SCHEMA[key];
    return schema ? this.cloneValue(schema.default) : undefined;
  }

  /**
   * Set a setting value (clamped to valid range).
   * @param {string} key
   * @param {*} value
   * @param {boolean} silent - If true, don't emit change event
   */
  set(key, value, silent = false) {
    const schema = SETTINGS_SCHEMA[key];
    if (!schema) {
      console.warn(`[Settings] Unknown key: ${key}`);
      return;
    }

    if (key === 'keyBindings') {
      value = this.normalizeKeyBindings(value);
    }

    // Clamp numeric values
    if (schema.min !== undefined) {
      value = Math.max(schema.min, Math.min(schema.max, value));
      if (schema.step) {
        value = Math.round(value / schema.step) * schema.step;
        value = parseFloat(value.toFixed(4));
      }
    }

    const oldValue = this.settings[key];
    this.settings[key] = this.cloneValue(value);
    this.save();

    if (!silent && JSON.stringify(oldValue) !== JSON.stringify(value)) {
      this.dispatchEvent(new CustomEvent('settingChanged', {
        detail: { key, value: this.cloneValue(value), oldValue: this.cloneValue(oldValue) }
      }));
    }
  }

  /** Load settings from localStorage (merges with defaults). */
  load() {
    this.settings = {};
    for (const [key, schema] of Object.entries(SETTINGS_SCHEMA)) {
      this.settings[key] = this.cloneValue(schema.default);
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        for (const [key, value] of Object.entries(parsed)) {
          if (key in SETTINGS_SCHEMA) {
            this.settings[key] = key === 'keyBindings'
              ? this.normalizeKeyBindings(value)
              : value;
          }
        }
      }
    } catch (error) {
      console.warn('[Settings] Failed to load, using defaults:', error);
    }
  }

  /** Save current settings to localStorage. */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('[Settings] Failed to save:', error);
    }
  }

  /** Reset all settings to defaults. */
  reset() {
    for (const [key, schema] of Object.entries(SETTINGS_SCHEMA)) {
      const oldValue = this.settings[key];
      const value = this.cloneValue(schema.default);
      this.settings[key] = value;
      if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
        this.dispatchEvent(new CustomEvent('settingChanged', {
          detail: { key, value: this.cloneValue(value), oldValue: this.cloneValue(oldValue) }
        }));
      }
    }
    this.save();
  }

  /** @returns {Object} */
  getSchema() {
    return SETTINGS_SCHEMA;
  }

  /** @returns {Object} */
  getAll() {
    return this.cloneValue(this.settings);
  }

  cloneValue(value) {
    return value && typeof value === 'object'
      ? JSON.parse(JSON.stringify(value))
      : value;
  }

  /**
   * Merge saved bindings onto the supported action list and discard malformed
   * entries. Each action supports a primary and alternate physical key code.
   * @param {*} bindings
   * @returns {Object}
   */
  normalizeKeyBindings(bindings) {
    const defaults = SETTINGS_SCHEMA.keyBindings.default;
    const normalized = {};

    Object.entries(defaults).forEach(([action, defaultBindings]) => {
      const savedBindings = Array.isArray(bindings?.[action])
        ? bindings[action]
        : defaultBindings;
      normalized[action] = [
        typeof savedBindings[0] === 'string' ? savedBindings[0] : null,
        typeof savedBindings[1] === 'string' ? savedBindings[1] : null
      ];

      if (!normalized[action][0]) {
        normalized[action][0] = defaultBindings[0];
      }
    });

    return normalized;
  }
}

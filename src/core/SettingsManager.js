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
};

const STORAGE_KEY = 'penguinParkour_settings';

export class SettingsManager extends EventTarget {
  constructor() {
    super();
    this.settings = {};
    this.load();
  }

  /**
   * Get a setting value
   * @param {string} key - Setting key (e.g., 'mouseSensitivity')
   * @returns {*} Current value or default
   */
  get(key) {
    if (key in this.settings) {
      return this.settings[key];
    }
    const schema = SETTINGS_SCHEMA[key];
    return schema ? schema.default : undefined;
  }

  /**
   * Set a setting value (clamped to valid range)
   * @param {string} key - Setting key
   * @param {*} value - New value
   * @param {boolean} silent - If true, don't emit change event
   */
  set(key, value, silent = false) {
    const schema = SETTINGS_SCHEMA[key];
    if (!schema) {
      console.warn(`[Settings] Unknown key: ${key}`);
      return;
    }

    // Clamp numeric values
    if (schema.min !== undefined) {
      value = Math.max(schema.min, Math.min(schema.max, value));
      // Round to step
      if (schema.step) {
        value = Math.round(value / schema.step) * schema.step;
        value = parseFloat(value.toFixed(4));
      }
    }

    const oldValue = this.settings[key];
    this.settings[key] = value;

    // Auto-save
    this.save();

    // Emit change event
    if (!silent && oldValue !== value) {
      this.dispatchEvent(new CustomEvent('settingChanged', {
        detail: { key, value, oldValue }
      }));
    }
  }

  /**
   * Load settings from localStorage (merges with defaults)
   */
  load() {
    // Start with defaults
    this.settings = {};
    for (const [key, schema] of Object.entries(SETTINGS_SCHEMA)) {
      this.settings[key] = schema.default;
    }

    // Overlay saved values
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        for (const [key, value] of Object.entries(parsed)) {
          if (key in SETTINGS_SCHEMA) {
            this.settings[key] = value;
          }
        }
      }
    } catch (e) {
      console.warn('[Settings] Failed to load, using defaults:', e);
    }
  }

  /**
   * Save current settings to localStorage
   */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[Settings] Failed to save:', e);
    }
  }

  /**
   * Reset all settings to defaults
   */
  reset() {
    for (const [key, schema] of Object.entries(SETTINGS_SCHEMA)) {
      const oldValue = this.settings[key];
      this.settings[key] = schema.default;
      if (oldValue !== schema.default) {
        this.dispatchEvent(new CustomEvent('settingChanged', {
          detail: { key, value: schema.default, oldValue }
        }));
      }
    }
    this.save();
  }

  /**
   * Get the full schema (for UI to build controls)
   * @returns {Object}
   */
  getSchema() {
    return SETTINGS_SCHEMA;
  }

  /**
   * Get all current settings as a flat object
   * @returns {Object}
   */
  getAll() {
    return { ...this.settings };
  }
}

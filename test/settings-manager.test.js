import assert from 'node:assert/strict';
import test from 'node:test';
import { SettingsManager } from '../src/core/SettingsManager.js';

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.get(key) || null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

globalThis.localStorage = new MemoryStorage();
globalThis.CustomEvent = class CustomEvent extends Event {
  constructor(type, init = {}) {
    super(type);
    this.detail = init.detail;
  }
};

test('persists and reloads normalized key bindings without shared references', () => {
  localStorage.values.clear();
  const first = new SettingsManager();
  const bindings = first.get('keyBindings');
  bindings.jump[0] = 'KeyQ';
  first.set('keyBindings', bindings);

  const second = new SettingsManager();
  assert.deepEqual(second.get('keyBindings').jump, ['KeyQ', null]);

  const detached = second.get('keyBindings');
  detached.jump[0] = 'KeyP';
  assert.deepEqual(second.get('keyBindings').jump, ['KeyQ', null]);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { AudioManager } from '../src/managers/AudioManager.js';

class FakeGain {
  constructor() {
    this.gain = { value: 1 };
    this.connections = [];
  }

  connect(destination) {
    this.connections.push(destination);
    return destination;
  }
}

class FakeSource {
  constructor() {
    this.playbackRate = { value: 1 };
    this.loop = false;
    this.started = false;
    this.stopped = false;
  }

  connect(destination) {
    this.destination = destination;
    return destination;
  }

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
  }
}

class FakeAudioContext {
  constructor() {
    this.state = 'running';
    this.destination = {};
    this.sources = [];
  }

  createGain() {
    return new FakeGain();
  }

  createBufferSource() {
    const source = new FakeSource();
    this.sources.push(source);
    return source;
  }

  async decodeAudioData() {
    return { decoded: true };
  }
}

class FakeSettings extends EventTarget {
  constructor() {
    super();
    this.values = { masterVolume: 0.8, musicVolume: 0.6, sfxVolume: 1 };
  }

  get(key) {
    return this.values[key];
  }
}

function settingChange(key) {
  const event = new Event('settingChanged');
  Object.defineProperty(event, 'detail', { value: { key } });
  return event;
}

test('runs silently without a browser audio context or registered asset', async () => {
  const manager = new AudioManager();
  assert.equal(await manager.playSFX('jump'), null);
  assert.equal(await manager.playMusic('theme'), null);
});

test('routes live setting updates and varies registered SFX pitch', async () => {
  const context = new FakeAudioContext();
  const settings = new FakeSettings();
  const manager = new AudioManager(settings, {
    audioContext: context,
    fetchFn: async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }),
    random: () => 0
  });

  manager.registerSFX('jump', '/audio/jump.ogg');
  const source = await manager.playSFX('jump', 0.5);

  assert.equal(source.started, true);
  assert.equal(source.playbackRate.value, 0.94);
  assert.equal(source.destination.gain.value, 0.5);
  assert.equal(manager.masterGain.gain.value, 0.8);
  assert.equal(manager.musicGain.gain.value, 0.6);
  assert.equal(manager.sfxGain.gain.value, 1);

  settings.values.masterVolume = 0.25;
  settings.values.musicVolume = 0.5;
  settings.values.sfxVolume = 0.75;
  settings.dispatchEvent(settingChange('masterVolume'));
  assert.equal(manager.masterGain.gain.value, 0.25);
  assert.equal(manager.musicGain.gain.value, 0.5);
  assert.equal(manager.sfxGain.gain.value, 0.75);
});

test('stops the active music track before replacing it', async () => {
  const context = new FakeAudioContext();
  const manager = new AudioManager(null, {
    audioContext: context,
    fetchFn: async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) })
  });

  manager.registerMusic('theme', '/audio/theme.ogg');
  manager.registerMusic('victory', '/audio/victory.ogg');
  const first = await manager.playMusic('theme');
  const second = await manager.playMusic('victory');

  assert.equal(first.stopped, true);
  assert.equal(second.started, true);
  assert.equal(manager.currentMusic, 'victory');
});

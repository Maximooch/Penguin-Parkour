/**
 * AudioManager.js - The DJ
 *
 * Owns Web Audio routing and optional sound playback. The game currently has
 * no committed audio assets, so unregistered sounds are intentionally silent.
 * Assets can be registered later without changing gameplay call sites.
 */

export class AudioManager {
  /**
   * @param {SettingsManager|null} settingsManager
   * @param {Object} options
   * @param {AudioContext|null} options.audioContext - Injectable for tests
   * @param {Function} options.fetchFn - Injectable fetch implementation
   * @param {Function} options.random - Injectable random source for tests
   */
  constructor(settingsManager = null, options = {}) {
    this.settingsManager = settingsManager;
    this.audioContext = options.audioContext || null;
    this.AudioContextClass = options.AudioContextClass ||
      globalThis.AudioContext || globalThis.webkitAudioContext || null;
    this.fetchFn = options.fetchFn || globalThis.fetch?.bind(globalThis);
    this.random = options.random || Math.random;

    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicSource = null;
    this.currentMusic = null;
    this.musicRequestId = 0;

    this.sfxAssets = new Map();
    this.musicAssets = new Map();
    this.bufferCache = new Map();

    this.onSettingChanged = this.onSettingChanged.bind(this);
    this.settingsManager?.addEventListener('settingChanged', this.onSettingChanged);
  }

  /**
   * Register an optional one-shot sound asset.
   * @param {string} name
   * @param {string} url
   */
  registerSFX(name, url) {
    this.sfxAssets.set(name, url);
  }

  /**
   * Register an optional looping music asset.
   * @param {string} name
   * @param {string} url
   */
  registerMusic(name, url) {
    this.musicAssets.set(name, url);
  }

  /**
   * Play a registered sound effect with subtle pitch variation.
   * Returns null when audio is unavailable or the asset is not registered.
   * @param {string} name
   * @param {number} volume
   * @returns {Promise<AudioBufferSourceNode|null>}
   */
  async playSFX(name, volume = 1) {
    const url = this.sfxAssets.get(name);
    if (!url || !(await this.ensureContext())) return null;

    const buffer = await this.loadBuffer(url);
    if (!buffer) return null;

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    source.buffer = buffer;
    source.playbackRate.value = 0.94 + this.random() * 0.12;
    gain.gain.value = Math.max(0, Math.min(1, volume));
    source.connect(gain).connect(this.sfxGain);
    source.start();
    return source;
  }

  /**
   * Start a registered music track. Repeating calls for the active track are
   * intentionally no-ops, so pause/resume does not layer duplicate music.
   * @param {string} name
   * @param {boolean} loop
   * @returns {Promise<AudioBufferSourceNode|null>}
   */
  async playMusic(name, loop = true) {
    const url = this.musicAssets.get(name);
    if (!url || this.currentMusic === name || !(await this.ensureContext())) return null;

    const requestId = ++this.musicRequestId;
    const buffer = await this.loadBuffer(url);
    if (!buffer || requestId !== this.musicRequestId) return null;

    this.stopMusic();

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(this.musicGain);
    source.onended = () => {
      if (this.musicSource === source) {
        this.musicSource = null;
        this.currentMusic = null;
      }
    };
    source.start();

    this.musicSource = source;
    this.currentMusic = name;
    return source;
  }

  /** Stop the active music track. */
  stopMusic() {
    this.musicRequestId += 1;
    if (!this.musicSource) return;

    this.musicSource.onended = null;
    this.musicSource.stop();
    this.musicSource = null;
    this.currentMusic = null;
  }

  /** Stop active music and invalidate any pending playback request. */
  stopAll() {
    this.stopMusic();
  }

  /** Remove listeners and close the owned Web Audio context. */
  destroy() {
    this.settingsManager?.removeEventListener('settingChanged', this.onSettingChanged);
    this.stopAll();
    this.audioContext?.close?.();
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
  }

  /**
   * Lazily create the AudioContext to comply with autoplay restrictions.
   * @returns {Promise<boolean>}
   */
  async ensureContext() {
    if (!this.audioContext) {
      if (!this.AudioContextClass) return false;

      try {
        this.audioContext = new this.AudioContextClass();
        this.createGainNodes();
      } catch {
        this.audioContext = null;
        return false;
      }
    } else if (!this.masterGain) {
      this.createGainNodes();
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  createGainNodes() {
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    this.applyVolumes();
  }

  /** Apply the persisted volume controls immediately to the mixer graph. */
  applyVolumes() {
    if (!this.masterGain || !this.settingsManager) return;

    this.masterGain.gain.value = this.settingsManager.get('masterVolume');
    this.musicGain.gain.value = this.settingsManager.get('musicVolume');
    this.sfxGain.gain.value = this.settingsManager.get('sfxVolume');
  }

  onSettingChanged(event) {
    if (['masterVolume', 'musicVolume', 'sfxVolume'].includes(event.detail.key)) {
      this.applyVolumes();
    }
  }

  /**
   * Fetch and decode an audio asset. Failures are intentionally silent so
   * missing optional assets never break gameplay or pollute the console.
   * @param {string} url
   * @returns {Promise<AudioBuffer|null>}
   */
  async loadBuffer(url) {
    if (this.bufferCache.has(url)) return this.bufferCache.get(url);

    const promise = (async () => {
      if (!this.fetchFn) return null;

      try {
        const response = await this.fetchFn(url);
        if (!response.ok) return null;
        const data = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(data);
      } catch {
        return null;
      }
    })();

    this.bufferCache.set(url, promise);
    const buffer = await promise;
    if (!buffer) this.bufferCache.delete(url);
    return buffer;
  }
}

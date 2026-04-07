/**
 * UIManager.js - The Interface
 *
 * Manages HTML overlays: pause menu, settings panel, HUD,
 * controls overlay, and victory screen.
 */

export class UIManager {
  constructor(game, settingsManager, inputManager) {
    this.game = game;
    this.settingsManager = settingsManager;
    this.inputManager = inputManager;

    this.elements = {};
    this.currentMenu = null;
    this.controlsShown = false;

    this.timerStart = 0;
    this.timerElapsed = 0;
    this.timerRunning = false;

    this.onResume = this.onResume.bind(this);
    this.onSettings = this.onSettings.bind(this);
    this.onRestart = this.onRestart.bind(this);
    this.onQuitToMenu = this.onQuitToMenu.bind(this);
    this.onSettingsBack = this.onSettingsBack.bind(this);
    this.onSettingsReset = this.onSettingsReset.bind(this);
    this.onVictoryRestart = this.onVictoryRestart.bind(this);
    this.onDismissControls = this.onDismissControls.bind(this);

    this.setupButtons();
    this.setupSettingsControls();
    this.syncSettingsControls();
    this.bindSettingsUpdates();
  }

  el(id) {
    if (!this.elements[id]) {
      this.elements[id] = document.getElementById(id);
    }
    return this.elements[id];
  }

  setupButtons() {
    const bindings = [
      ['btn-resume', this.onResume],
      ['btn-settings', this.onSettings],
      ['btn-restart', this.onRestart],
      ['btn-quit', this.onQuitToMenu],
      ['btn-settings-back', this.onSettingsBack],
      ['btn-settings-reset', this.onSettingsReset],
      ['btn-victory-restart', this.onVictoryRestart],
      ['btn-controls-dismiss', this.onDismissControls]
    ];

    bindings.forEach(([id, handler]) => {
      const element = this.el(id);
      if (element) {
        element.addEventListener('click', handler);
      }
    });
  }

  setupSettingsControls() {
    const schema = this.settingsManager.getSchema();

    Object.entries(schema).forEach(([key, config]) => {
      const input = this.el(`setting-${key}`);
      if (!input) return;

      if (typeof config.default === 'boolean') {
        input.addEventListener('change', () => {
          this.settingsManager.set(key, input.checked);
        });
        return;
      }

      input.min = config.min;
      input.max = config.max;
      input.step = config.step;
      input.addEventListener('input', () => {
        const value = parseFloat(input.value);
        this.settingsManager.set(key, value);
      });
    });
  }

  bindSettingsUpdates() {
    this.settingsManager.addEventListener('settingChanged', () => {
      this.syncSettingsControls();
    });
  }

  syncSettingsControls() {
    const schema = this.settingsManager.getSchema();

    Object.keys(schema).forEach((key) => {
      const input = this.el(`setting-${key}`);
      const valueEl = this.el(`setting-${key}-value`);
      const value = this.settingsManager.get(key);

      if (!input) return;

      if (typeof value === 'boolean') {
        input.checked = value;
      } else {
        input.value = value;
        if (valueEl) {
          valueEl.textContent = this.formatValue(key, value);
        }
      }
    });
  }

  formatValue(key, value) {
    if (key === 'fov') return `${Math.round(value)}°`;
    if (key === 'mouseSensitivity') return value.toFixed(1);
    if (typeof value === 'number' && value <= 1) return `${Math.round(value * 100)}%`;
    return String(value);
  }

  hideAllMenus() {
    ['main', 'pause', 'settings', 'victory'].forEach((name) => {
      const element = this.el(`menu-${name}`);
      if (element) {
        element.classList.add('hidden');
      }
    });
    this.currentMenu = null;
  }

  showOverlay() {
    const overlay = this.el('ui-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }

  hideOverlay() {
    const overlay = this.el('ui-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  showMenu(name) {
    this.hideAllMenus();
    this.showOverlay();

    const menu = this.el(`menu-${name}`);
    if (menu) {
      menu.classList.remove('hidden');
      this.currentMenu = name;
    }
  }

  hideMenu() {
    this.hideAllMenus();
    this.hideOverlay();
  }

  showHUD() {
    const hud = this.el('hud');
    if (hud) {
      hud.classList.remove('hidden');
    }
  }

  hideHUD() {
    const hud = this.el('hud');
    if (hud) {
      hud.classList.add('hidden');
    }
  }

  showControls() {
    if (this.controlsShown) return;
    const controls = this.el('controls-overlay');
    if (controls) {
      controls.classList.remove('hidden');
    }
  }

  hideControls() {
    const controls = this.el('controls-overlay');
    if (controls) {
      controls.classList.add('hidden');
    }
  }

  showVictoryScreen(stats = {}) {
    const timeEl = this.el('victory-time');
    const collectiblesEl = this.el('victory-collectibles');

    if (timeEl && stats.time !== undefined) {
      timeEl.textContent = this.formatTime(stats.time);
    }

    if (collectiblesEl && stats.collectibles !== undefined) {
      collectiblesEl.textContent = stats.collectibles;
    }

    this.showMenu('victory');
  }

  startTimer() {
    this.timerStart = performance.now();
    this.timerElapsed = 0;
    this.timerRunning = true;
  }

  stopTimer() {
    if (this.timerRunning) {
      this.timerElapsed = performance.now() - this.timerStart;
      this.timerRunning = false;
    }
  }

  getElapsedTime() {
    if (this.timerRunning) {
      return performance.now() - this.timerStart;
    }
    return this.timerElapsed;
  }

  formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }

  updateHUD() {
    const timerEl = this.el('hud-timer');
    if (timerEl && this.timerRunning) {
      timerEl.textContent = this.formatTime(this.getElapsedTime());
    }
  }

  onResume() {
    this.hideMenu();
    this.game.setState('playing');

    if (this.controlsShown && this.inputManager) {
      this.inputManager.requestPointerLock();
    }
  }

  onSettings() {
    this.showMenu('settings');
  }

  onSettingsBack() {
    this.showMenu('pause');
  }

  onSettingsReset() {
    this.settingsManager.reset();
    this.syncSettingsControls();
  }

  onRestart() {
    this.hideMenu();
    this.hideControls();
    this.game.setState('playing');

    if (this.game.levelManager) {
      this.game.levelManager.clearLevel();
      this.game.levelManager.loadLevel(1).then((data) => {
        this.game.levelManager.buildLevel(data);

        if (this.game.penguinController) {
          this.game.penguinController.resetPosition(this.game.levelManager.getSpawnPosition());
        }

        if (this.game.cameraManager) {
          this.game.cameraManager.reset();
        }

        this.startTimer();

        if (this.controlsShown && this.inputManager) {
          this.inputManager.requestPointerLock();
        }
      });
    }
  }

  onQuitToMenu() {
    this.hideControls();
    this.hideHUD();
    this.stopTimer();

    if (this.inputManager) {
      this.inputManager.exitPointerLock();
    }

    this.game.setState('menu');
    this.showMenu('main');
  }

  onVictoryRestart() {
    this.hideMenu();
    this.onRestart();
  }

  onDismissControls() {
    this.hideControls();
    this.controlsShown = true;

    if (this.game.isPlaying() && this.inputManager) {
      this.inputManager.requestPointerLock();
    }
  }

  onGameStateChanged(newState) {
    switch (newState) {
      case 'playing':
        this.showHUD();

        if (!this.timerRunning) {
          this.startTimer();
        }

        if (!this.controlsShown) {
          this.showControls();
        }
        break;

      case 'paused':
        this.stopTimer();
        this.hideControls();

        if (this.inputManager) {
          this.inputManager.exitPointerLock();
        }

        this.showMenu('pause');
        break;

      case 'victory':
        this.stopTimer();
        this.hideControls();

        if (this.inputManager) {
          this.inputManager.exitPointerLock();
        }

        this.showVictoryScreen({
          time: this.timerElapsed,
          collectibles: 0
        });
        break;

      case 'menu':
        this.hideHUD();
        this.hideControls();
        this.stopTimer();

        if (this.inputManager) {
          this.inputManager.exitPointerLock();
        }

        this.showMenu('main');
        break;

      default:
        break;
    }
  }
}

/**
 * UIManager.js - The Interface
 *
 * Manages all HTML UI overlays: pause menu, HUD, victory screen,
 * settings panel, and controls overlay.
 */

export class UIManager {
  constructor(game, settingsManager, inputManager) {
    this.game = game;
    this.settingsManager = settingsManager;
    this.inputManager = inputManager;

    // UI elements (cached on first access)
    this.elements = {};

    // Timer state
    this.timerStart = 0;
    this.timerElapsed = 0;
    this.timerRunning = false;

    // Controls overlay shown flag
    this.controlsShown = false;

    // Current visible menu
    this.currentMenu = null;

    // Bind methods
    this.onResume = this.onResume.bind(this);
    this.onSettings = this.onSettings.bind(this);
    this.onRestart = this.onRestart.bind(this);
    this.onQuitToMenu = this.onQuitToMenu.bind(this);
    this.onSettingsBack = this.onSettingsBack.bind(this);
    this.onSettingsReset = this.onSettingsReset.bind(this);
    this.onVictoryRestart = this.onVictoryRestart.bind(this);
    this.onDismissControls = this.onDismissControls.bind(this);

    // Setup once DOM is ready
    this.setupButtons();
    this.setupSettingsControls();
  }

  /**
   * Get or query a DOM element (cached)
   */
  el(id) {
    if (!this.elements[id]) {
      this.elements[id] = document.getElementById(id);
    }
    return this.elements[id];
  }

  /**
   * Wire up button click handlers
   */
  setupButtons() {
    const resumeBtn = this.el('btn-resume');
    const settingsBtn = this.el('btn-settings');
    const restartBtn = this.el('btn-restart');
    const quitBtn = this.el('btn-quit');
    const settingsBackBtn = this.el('btn-settings-back');
    const settingsResetBtn = this.el('btn-settings-reset');
    const victoryRestartBtn = this.el('btn-victory-restart');
    const controlsDismiss = this.el('btn-controls-dismiss');

    if (resumeBtn) resumeBtn.addEventListener('click', this.onResume);
    if (settingsBtn) settingsBtn.addEventListener('click', this.onSettings);
    if (restartBtn) restartBtn.addEventListener('click', this.onRestart);
    if (quitBtn) quitBtn.addEventListener('click', this.onQuitToMenu);
    if (settingsBackBtn) settingsBackBtn.addEventListener('click', this.onSettingsBack);
    if (settingsResetBtn) settingsResetBtn.addEventListener('click', this.onSettingsReset);
    if (victoryRestartBtn) victoryRestartBtn.addEventListener('click', this.onVictoryRestart);
    if (controlsDismiss) controlsDismiss.addEventListener('click', this.onDismissControls);
  }

  /**
   * Wire up settings sliders/toggles to SettingsManager
   */
  setupSettingsControls() {
    const schema = this.settingsManager.getSchema();

    for (const [key, config] of Object.entries(schema)) {
      const slider = this.el(`setting-${key}`);
      const valueDisplay = this.el(`setting-${key}-value`);

      if (!slider) continue;

      // Set initial value
      const currentVal = this.settingsManager.get(key);

      if (typeof config.default === 'boolean') {
        // Toggle checkbox
        slider.checked = currentVal;
        slider.addEventListener('change', () => {
          this.settingsManager.set(key, slider.checked);
        });
      } else {
        // Range slider
        slider.min = config.min;
        slider.max = config.max;
        slider.step = config.step;
        slider.value = currentVal;

        if (valueDisplay) {
          valueDisplay.textContent = this.formatValue(key, currentVal);
        }

        slider.addEventListener('input', () => {
          const val = parseFloat(slider.value);
          this.settingsManager.set(key, val);
          if (valueDisplay) {
            valueDisplay.textContent = this.formatValue(key, val);
          }
        });
      }
    }

    // Listen for external settings changes (e.g., debug.settings.set)
    this.settingsManager.addEventListener('settingChanged', (e) => {
      const { key, value } = e.detail;
      const slider = this.el(`setting-${key}`);
      const valueDisplay = this.el(`setting-${key}-value`);

      if (slider) {
        if (typeof value === 'boolean') {
          slider.checked = value;
        } else {
          slider.value = value;
          if (valueDisplay) {
            valueDisplay.textContent = this.formatValue(key, value);
          }
        }
      }
    });
  }

  /**
   * Format a setting value for display
   */
  formatValue(key, value) {
    if (key === 'fov') return `${Math.round(value)}°`;
    if (key === 'mouseSensitivity') return value.toFixed(1);
    if (typeof value === 'number' && value <= 1) return `${Math.round(value * 100)}%`;
    return value;
  }

  // --- Menu Show/Hide ---

  /**
   * Show a menu by name
   */
  showMenu(name) {
    this.hideMenu(); // Close any open menu first

    const menuEl = this.el(`menu-${name}`);
    if (menuEl) {
      menuEl.classList.remove('hidden');
      this.currentMenu = name;
    }

    // Show the overlay container if not visible
    const overlay = this.el('ui-overlay');
    if (overlay) overlay.classList.remove('hidden');
  }

  /**
   * Hide current menu
   */
  hideMenu() {
    if (this.currentMenu) {
      const menuEl = this.el(`menu-${this.currentMenu}`);
      if (menuEl) menuEl.classList.add('hidden');
      this.currentMenu = null;
    }
  }

  /**
   * Show the HUD
   */
  showHUD() {
    const hud = this.el('hud');
    if (hud) hud.classList.remove('hidden');
  }

  /**
   * Hide the HUD
   */
  hideHUD() {
    const hud = this.el('hud');
    if (hud) hud.classList.add('hidden');
  }

  /**
   * Show controls overlay (first play only)
   */
  showControls() {
    if (this.controlsShown) return;
    const controls = this.el('controls-overlay');
    if (controls) {
      controls.classList.remove('hidden');
    }
  }

  /**
   * Show victory screen
   */
  showVictoryScreen(stats = {}) {
    this.stopTimer();

    const timeEl = this.el('victory-time');
    if (timeEl && stats.time !== undefined) {
      timeEl.textContent = this.formatTime(stats.time);
    }

    const collectEl = this.el('victory-collectibles');
    if (collectEl && stats.collectibles !== undefined) {
      collectEl.textContent = stats.collectibles;
    }

    this.showMenu('victory');
  }

  // --- Timer ---

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

  /**
   * Update HUD (called every frame)
   */
  updateHUD() {
    const timerEl = this.el('hud-timer');
    if (timerEl && this.timerRunning) {
      timerEl.textContent = this.formatTime(this.getElapsedTime());
    }
  }

  // --- Button Handlers ---

  onResume() {
    this.hideMenu();
    this.game.setState('playing');
    this.inputManager.requestPointerLock();
  }

  onSettings() {
    this.hideMenu();
    this.showMenu('settings');
  }

  onSettingsBack() {
    this.hideMenu();
    this.showMenu('pause');
  }

  onSettingsReset() {
    this.settingsManager.reset();
    // Re-initialize slider values
    this.setupSettingsControls();
  }

  onRestart() {
    this.hideMenu();
    this.game.setState('playing');
    this.inputManager.requestPointerLock();

    // Trigger level reload
    if (this.game.levelManager) {
      this.game.levelManager.clearLevel();
      this.game.levelManager.loadLevel(1).then(data => {
        this.game.levelManager.buildLevel(data);
        if (this.game.penguinController) {
          this.game.penguinController.resetPosition(this.game.levelManager.getSpawnPosition());
        }
        if (this.game.cameraManager) {
          this.game.cameraManager.reset();
        }
        this.startTimer();
      });
    }
  }

  onQuitToMenu() {
    this.hideMenu();
    this.hideHUD();
    this.stopTimer();
    this.game.setState('menu');

    // Show main menu
    const overlay = this.el('ui-overlay');
    if (overlay) overlay.classList.remove('hidden');
    const mainMenu = this.el('menu-main');
    if (mainMenu) mainMenu.classList.remove('hidden');
  }

  onVictoryRestart() {
    this.hideMenu();
    this.onRestart();
  }

  onDismissControls() {
    const controls = this.el('controls-overlay');
    if (controls) controls.classList.add('hidden');
    this.controlsShown = true;
  }

  // --- Game State Integration ---

  /**
   * Called when game state changes
   */
  onGameStateChanged(newState) {
    switch (newState) {
      case 'playing':
        this.showHUD();
        if (!this.timerRunning) this.startTimer();
        // Show controls on first play
        if (!this.controlsShown) this.showControls();
        break;
      case 'paused':
        this.stopTimer();
        this.showMenu('pause');
        break;
      case 'victory':
        this.stopTimer();
        this.showVictoryScreen({
          time: this.timerElapsed
        });
        break;
      case 'menu':
        this.hideHUD();
        this.stopTimer();
        break;
    }
  }
}

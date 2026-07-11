import assert from 'node:assert/strict';
import test from 'node:test';
import { InputManager, INPUT_ACTIONS } from '../src/core/InputManager.js';

const eventTarget = () => new EventTarget();
globalThis.window = eventTarget();
globalThis.document = eventTarget();
document.pointerLockElement = null;
document.body = { requestPointerLock: () => {} };
document.exitPointerLock = () => {};

const bindings = {
  moveForward: ['KeyW', null],
  moveBackward: ['KeyS', null],
  moveLeft: ['KeyA', null],
  moveRight: ['KeyD', null],
  jump: ['Space', null],
  sprint: ['ShiftLeft', 'ShiftRight'],
  pause: ['Escape', null]
};

function createManager() {
  const settings = new EventTarget();
  settings.get = (key) => key === 'keyBindings' ? structuredClone(bindings) : 1;
  settings.set = (key, value) => {
    Object.assign(bindings, structuredClone(value));
    const event = new Event('settingChanged');
    Object.defineProperty(event, 'detail', { value: { key, value: structuredClone(value) } });
    settings.dispatchEvent(event);
  };

  const game = {
    settingsManager: settings,
    isPlaying: () => false,
    setState: () => {},
    uiManager: null
  };

  const manager = new InputManager(game);
  return { manager, settings };
}

test('maps persisted key codes to movement, jump, and sprint actions', () => {
  const { manager } = createManager();
  manager.pressedCodes.add('KeyW');
  manager.pressedCodes.add('KeyD');
  manager.pressedCodes.add('Space');
  manager.pressedCodes.add('ShiftRight');

  const actions = manager.getActions();
  assert.equal(actions.moveVector.x > 0, true);
  assert.equal(actions.moveVector.y > 0, true);
  assert.equal(actions.jump, true);
  assert.equal(actions.sprint, true);
});

test('persists a binding update and reports duplicate bindings', () => {
  const { manager } = createManager();
  manager.setBinding(INPUT_ACTIONS.jump, 0, 'KeyQ');

  assert.deepEqual(manager.getBindings(INPUT_ACTIONS.jump), ['KeyQ', null]);
  assert.deepEqual(manager.findBindingConflicts('KeyQ'), [{ action: 'jump', slot: 0 }]);
  assert.deepEqual(
    manager.findBindingConflicts('KeyW', { action: 'jump', slot: 0 }),
    [{ action: 'moveForward', slot: 0 }]
  );
});

test('suppresses gameplay input while the settings UI captures a new key', () => {
  const { manager } = createManager();
  manager.setRebindingActive(true);
  manager.onKeyDown({ code: 'KeyW' });
  assert.equal(manager.isActionPressed(INPUT_ACTIONS.moveForward), false);

  manager.setRebindingActive(false);
  manager.onKeyDown({ code: 'KeyW', repeat: false, preventDefault: () => {} });
  assert.equal(manager.isActionPressed(INPUT_ACTIONS.moveForward), true);
});

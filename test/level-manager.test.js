import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { LevelManager } from '../src/managers/LevelManager.js';

function createGame() {
  return {
    scene: new THREE.Scene(),
    physicsWorld: {
      platforms: [],
      setPlatforms(platforms) {
        this.platforms = platforms;
      },
      clearPlatforms() {
        this.platforms = [];
      }
    }
  };
}

test('clears and disposes level-owned render resources exactly once', () => {
  const game = createGame();
  const levelManager = new LevelManager(game);
  const level = {
    id: 1,
    name: 'Cleanup test',
    platforms: [
      { position: [0, 0, 0], size: [2, 1, 2], type: 'snow' },
      { position: [4, 0, 0], size: [2, 1, 2], type: 'snow' }
    ]
  };

  levelManager.buildLevel(level);

  const instancedPlatform = levelManager.platformMeshes[0];
  const water = levelManager.waterPlane;
  let instancedGeometryDisposals = 0;
  let instancedMaterialDisposals = 0;
  let waterGeometryDisposals = 0;
  let waterMaterialDisposals = 0;

  instancedPlatform.geometry.addEventListener('dispose', () => { instancedGeometryDisposals += 1; });
  instancedPlatform.material.addEventListener('dispose', () => { instancedMaterialDisposals += 1; });
  water.geometry.addEventListener('dispose', () => { waterGeometryDisposals += 1; });
  water.material.addEventListener('dispose', () => { waterMaterialDisposals += 1; });

  levelManager.clearLevel();
  levelManager.clearLevel();

  assert.equal(instancedGeometryDisposals, 1);
  assert.equal(instancedMaterialDisposals, 1);
  assert.equal(waterGeometryDisposals, 1);
  assert.equal(waterMaterialDisposals, 1);
  assert.equal(levelManager.levelGroup.children.length, 0);
  assert.equal(game.physicsWorld.platforms.length, 0);
});

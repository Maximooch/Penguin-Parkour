import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { PhysicsWorld } from '../src/core/PhysicsWorld.js';

function createEntity(position, velocity) {
  return {
    position: new THREE.Vector3(...position),
    velocity: new THREE.Vector3(...velocity),
    collider: null,
    onGround: false,
    getPosition() {
      return this.position.clone();
    },
    getVelocity() {
      return this.velocity;
    },
    updateCollider() {
      this.collider = {
        minX: this.position.x - 0.5,
        maxX: this.position.x + 0.5,
        minY: this.position.y,
        maxY: this.position.y + 1,
        minZ: this.position.z - 0.5,
        maxZ: this.position.z + 0.5
      };
    },
    setPosition(position) {
      this.position.copy(position);
      this.updateCollider();
    },
    setOnGround(onGround) {
      this.onGround = onGround;
    }
  };
}

const wall = {
  minX: 2,
  maxX: 3,
  minY: 0,
  maxY: 4,
  minZ: -1,
  maxZ: 1
};

test('blocks movement into a platform side on both horizontal axes', () => {
  const xWorld = new PhysicsWorld({ gravity: 0, friction: 0 });
  xWorld.setPlatforms([wall]);
  const fromX = createEntity([0, 0, 0], [10, 0, 0]);
  xWorld.update(0.2, fromX);
  assert.equal(fromX.position.x, 1.5);
  assert.equal(fromX.velocity.x, 0);

  const zWorld = new PhysicsWorld({ gravity: 0, friction: 0 });
  zWorld.setPlatforms([{
    minX: -1,
    maxX: 1,
    minY: 0,
    maxY: 4,
    minZ: 2,
    maxZ: 3
  }]);
  const fromZ = createEntity([0, 0, 0], [0, 0, 10]);
  zWorld.update(0.2, fromZ);
  assert.equal(fromZ.position.z, 1.5);
  assert.equal(fromZ.velocity.z, 0);
});

test('lands on tops and stops on platform undersides', () => {
  const platform = {
    minX: -2,
    maxX: 2,
    minY: -1,
    maxY: 0,
    minZ: -2,
    maxZ: 2,
    friction: 0
  };

  const landingWorld = new PhysicsWorld({ gravity: 0, friction: 0 });
  landingWorld.setPlatforms([platform]);
  const falling = createEntity([0, 2, 0], [0, -10, 0]);
  landingWorld.update(0.2, falling);
  assert.equal(falling.position.y, 0);
  assert.equal(falling.velocity.y, 0);
  assert.equal(falling.onGround, true);

  const ceilingWorld = new PhysicsWorld({ gravity: 0, friction: 0 });
  ceilingWorld.setPlatforms([platform]);
  const rising = createEntity([0, -2, 0], [0, 10, 0]);
  ceilingWorld.update(0.2, rising);
  assert.equal(rising.position.y, -2);
  assert.equal(rising.velocity.y, 0);
  assert.equal(rising.onGround, false);
});

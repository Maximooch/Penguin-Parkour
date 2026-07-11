/**
 * PhysicsWorld.js - The Rules
 *
 * Handles collision detection and physics simulation.
 * Uses custom AABB (Axis-Aligned Bounding Box) collision detection
 * which is perfect for voxel-based platforms.
 *
 * This is intentionally simple and lightweight - no heavy physics library needed!
 */

import * as THREE from 'three';

/**
 * PhysicsWorld class
 * Manages gravity, collision detection, and physics resolution
 */
export class PhysicsWorld {
  constructor(config = {}) {
    // Physics configuration
    this.gravity = config.gravity || 50;
    this.friction = config.friction || 10;

    // Active platforms for collision
    this.platforms = [];

    // Temp vectors for calculations (reused to avoid garbage collection)
    this.tempPos = new THREE.Vector3();
    this.tempVel = new THREE.Vector3();
  }

  /**
   * Set platforms for collision detection
   * @param {Array} platforms - Array of platform collision boxes
   */
  setPlatforms(platforms) {
    this.platforms = platforms;
  }

  /**
   * Add a platform to the physics world
   * @param {Object} platform - Platform with minX, maxX, minY, maxY, minZ, maxZ
   */
  addPlatform(platform) {
    this.platforms.push(platform);
  }

  /**
   * Clear all platforms
   */
  clearPlatforms() {
    this.platforms = [];
  }

  /**
   * Update physics for an entity
   * @param {number} deltaTime - Time since last frame
   * @param {Object} entity - Entity with position, velocity, onGround properties
   */
  update(deltaTime, entity) {
    if (!entity) return;

    const position = entity.getPosition();
    const velocity = entity.getVelocity();

    // Keep the entity collider in sync before using its extents to resolve
    // movement. Player positions represent their feet, not their center.
    entity.updateCollider();
    const collider = entity.collider;
    const offsets = {
      minX: collider.minX - position.x,
      maxX: collider.maxX - position.x,
      minY: collider.minY - position.y,
      maxY: collider.maxY - position.y,
      minZ: collider.minZ - position.z,
      maxZ: collider.maxZ - position.z
    };

    // Apply gravity
    velocity.y -= this.gravity * deltaTime;

    // Resolve each axis separately. This prevents the player from entering
    // platform sides while retaining the existing top-surface landing behavior.
    let onGround = false;
    let platformFriction = this.friction; // Default to global friction

    this.tempPos.copy(position);

    this.resolveHorizontalAxis('x', position, velocity, deltaTime, offsets);
    this.resolveHorizontalAxis('z', position, velocity, deltaTime, offsets);

    const verticalCollision = this.resolveVerticalAxis(
      position,
      velocity,
      deltaTime,
      offsets
    );

    this.tempPos.y = verticalCollision.position;
    onGround = verticalCollision.onGround;
    if (verticalCollision.platform?.friction !== undefined) {
      platformFriction = verticalCollision.platform.friction;
    }

    // Apply friction to horizontal movement
    velocity.x -= velocity.x * platformFriction * deltaTime;
    velocity.z -= velocity.z * platformFriction * deltaTime;

    // Update entity
    entity.setPosition(this.tempPos);
    entity.setOnGround(onGround);
  }

  /**
   * Resolve movement against platform faces on one horizontal axis.
   * @param {'x'|'z'} axis
   * @param {THREE.Vector3} startPosition
   * @param {THREE.Vector3} velocity
   * @param {number} deltaTime
   * @param {Object} offsets - Collider extents relative to entity position
   */
  resolveHorizontalAxis(axis, startPosition, velocity, deltaTime, offsets) {
    const isX = axis === 'x';
    const minKey = isX ? 'minX' : 'minZ';
    const maxKey = isX ? 'maxX' : 'maxZ';
    const otherMinKey = isX ? 'minZ' : 'minX';
    const otherMaxKey = isX ? 'maxZ' : 'maxX';
    const startAxis = startPosition[axis];
    const nextAxis = startAxis + velocity[axis] * deltaTime;
    const startMin = startAxis + offsets[minKey];
    const startMax = startAxis + offsets[maxKey];

    let resolvedPosition = nextAxis;

    for (const platform of this.platforms) {
      const verticalOverlap =
        startPosition.y + offsets.minY < platform.maxY &&
        startPosition.y + offsets.maxY > platform.minY;
      const otherPosition = this.tempPos[isX ? 'z' : 'x'];
      const otherOverlap =
        otherPosition + offsets[otherMinKey] < platform[otherMaxKey] &&
        otherPosition + offsets[otherMaxKey] > platform[otherMinKey];

      if (!verticalOverlap || !otherOverlap) continue;

      if (
        velocity[axis] > 0 &&
        startMax <= platform[minKey] &&
        nextAxis + offsets[maxKey] >= platform[minKey]
      ) {
        resolvedPosition = Math.min(resolvedPosition, platform[minKey] - offsets[maxKey]);
        velocity[axis] = 0;
      } else if (
        velocity[axis] < 0 &&
        startMin >= platform[maxKey] &&
        nextAxis + offsets[minKey] <= platform[maxKey]
      ) {
        resolvedPosition = Math.max(resolvedPosition, platform[maxKey] - offsets[minKey]);
        velocity[axis] = 0;
      }
    }

    this.tempPos[axis] = resolvedPosition;
  }

  /**
   * Resolve landing on platform tops and impacts with platform undersides.
   * @returns {{position: number, onGround: boolean, platform: Object|null}}
   */
  resolveVerticalAxis(startPosition, velocity, deltaTime, offsets) {
    const nextPosition = startPosition.y + velocity.y * deltaTime;
    const startMin = startPosition.y + offsets.minY;
    const startMax = startPosition.y + offsets.maxY;
    const nextMin = nextPosition + offsets.minY;
    const nextMax = nextPosition + offsets.maxY;
    const horizontalOverlap = (platform) => (
      this.tempPos.x + offsets.minX < platform.maxX &&
      this.tempPos.x + offsets.maxX > platform.minX &&
      this.tempPos.z + offsets.minZ < platform.maxZ &&
      this.tempPos.z + offsets.maxZ > platform.minZ
    );

    if (velocity.y < 0) {
      let landingPlatform = null;

      for (const platform of this.platforms) {
        if (
          horizontalOverlap(platform) &&
          startMin >= platform.maxY &&
          nextMin <= platform.maxY &&
          (!landingPlatform || platform.maxY > landingPlatform.maxY)
        ) {
          landingPlatform = platform;
        }
      }

      if (landingPlatform) {
        velocity.y = 0;
        return {
          position: landingPlatform.maxY - offsets.minY,
          onGround: true,
          platform: landingPlatform
        };
      }
    } else if (velocity.y > 0) {
      let ceilingPlatform = null;

      for (const platform of this.platforms) {
        if (
          horizontalOverlap(platform) &&
          startMax <= platform.minY &&
          nextMax >= platform.minY &&
          (!ceilingPlatform || platform.minY < ceilingPlatform.minY)
        ) {
          ceilingPlatform = platform;
        }
      }

      if (ceilingPlatform) {
        velocity.y = 0;
        return {
          position: ceilingPlatform.minY - offsets.maxY,
          onGround: false,
          platform: ceilingPlatform
        };
      }
    }

    return { position: nextPosition, onGround: false, platform: null };
  }

  /**
   * Check if a point is grounded
   * @param {THREE.Vector3} position
   * @param {number} threshold - How close to ground to check (default 0.1)
   * @returns {boolean}
   */
  isGrounded(position, threshold = 0.1) {
    for (const platform of this.platforms) {
      if (
        position.x > platform.minX &&
        position.x < platform.maxX &&
        position.z > platform.minZ &&
        position.z < platform.maxZ &&
        Math.abs(position.y - platform.maxY) < threshold
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the ground Y position at a given XZ coordinate
   * @param {number} x
   * @param {number} z
   * @returns {number|null} Y position of ground, or null if no ground
   */
  getGroundY(x, z) {
    let highestY = null;

    for (const platform of this.platforms) {
      if (
        x > platform.minX &&
        x < platform.maxX &&
        z > platform.minZ &&
        z < platform.maxZ
      ) {
        if (highestY === null || platform.maxY > highestY) {
          highestY = platform.maxY;
        }
      }
    }

    return highestY;
  }

  /**
   * Raycast down from a position to find ground
   * @param {THREE.Vector3} position
   * @param {number} maxDistance
   * @returns {Object|null} {distance, platform} or null
   */
  raycastDown(position, maxDistance = 100) {
    let closest = null;
    let closestDist = maxDistance;

    for (const platform of this.platforms) {
      if (
        position.x > platform.minX &&
        position.x < platform.maxX &&
        position.z > platform.minZ &&
        position.z < platform.maxZ &&
        platform.maxY < position.y
      ) {
        const dist = position.y - platform.maxY;
        if (dist < closestDist) {
          closestDist = dist;
          closest = {
            distance: dist,
            platform: platform,
            point: new THREE.Vector3(position.x, platform.maxY, position.z)
          };
        }
      }
    }

    return closest;
  }

  /**
   * Check AABB collision between two boxes
   * @param {Object} box1 - {minX, maxX, minY, maxY, minZ, maxZ}
   * @param {Object} box2 - {minX, maxX, minY, maxY, minZ, maxZ}
   * @returns {boolean}
   */
  checkAABBCollision(box1, box2) {
    return (
      box1.minX < box2.maxX &&
      box1.maxX > box2.minX &&
      box1.minY < box2.maxY &&
      box1.maxY > box2.minY &&
      box1.minZ < box2.maxZ &&
      box1.maxZ > box2.minZ
    );
  }

  /**
   * Get all platforms within a radius
   * @param {THREE.Vector3} position
   * @param {number} radius
   * @returns {Array}
   */
  getPlatformsInRadius(position, radius) {
    return this.platforms.filter(platform => {
      // Quick check using center point
      const centerX = (platform.minX + platform.maxX) / 2;
      const centerY = (platform.minY + platform.maxY) / 2;
      const centerZ = (platform.minZ + platform.maxZ) / 2;

      const dx = position.x - centerX;
      const dy = position.y - centerY;
      const dz = position.z - centerZ;

      const distSq = dx * dx + dy * dy + dz * dz;
      return distSq < radius * radius;
    });
  }

  /**
   * Set gravity strength
   * @param {number} gravity
   */
  setGravity(gravity) {
    this.gravity = gravity;
  }

  /**
   * Set friction amount
   * @param {number} friction
   */
  setFriction(friction) {
    this.friction = friction;
  }

  /**
   * Get platform count
   * @returns {number}
   */
  getPlatformCount() {
    return this.platforms.length;
  }

  /**
   * Debug: visualize collision boxes (useful for development)
   * @param {THREE.Scene} scene
   */
  debugVisualize(scene) {
    // Remove old debug visuals
    scene.children
      .filter(child => child.userData.debugPhysics)
      .forEach(child => scene.remove(child));

    // Create new debug visuals
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });

    for (const platform of this.platforms) {
      const width = platform.maxX - platform.minX;
      const height = platform.maxY - platform.minY;
      const depth = platform.maxZ - platform.minZ;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        (platform.minX + platform.maxX) / 2,
        (platform.minY + platform.maxY) / 2,
        (platform.minZ + platform.maxZ) / 2
      );

      mesh.userData.debugPhysics = true;
      scene.add(mesh);
    }
  }
}

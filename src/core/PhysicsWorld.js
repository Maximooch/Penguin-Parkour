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

    // Apply gravity
    velocity.y -= this.gravity * deltaTime;

    // Apply friction to horizontal movement
    velocity.x -= velocity.x * this.friction * deltaTime;
    velocity.z -= velocity.z * this.friction * deltaTime;

    // Calculate next position
    this.tempPos.copy(position);
    this.tempPos.addScaledVector(velocity, deltaTime);

    // Check collisions
    let onGround = false;

    for (const platform of this.platforms) {
      // Check if entity is above the platform (in XZ plane)
      if (
        this.tempPos.x > platform.minX &&
        this.tempPos.x < platform.maxX &&
        this.tempPos.z > platform.minZ &&
        this.tempPos.z < platform.maxZ
      ) {
        // Check if entity is falling onto the platform
        if (position.y >= platform.maxY && this.tempPos.y <= platform.maxY) {
          // Land on platform
          this.tempPos.y = platform.maxY;
          velocity.y = 0;
          onGround = true;
        }
      }
    }

    // Update entity
    entity.setPosition(this.tempPos);
    entity.setOnGround(onGround);
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

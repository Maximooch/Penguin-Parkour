/**
 * LevelManager.js - The Architect
 *
 * Handles loading, building, and managing game levels from JSON data.
 * Supports different platform types with varying physics properties.
 * Uses InstancedMesh for performance optimization.
 */

import * as THREE from 'three';
import { VoxelBuilder } from '../utils/VoxelBuilder.js';

/**
 * Platform type definitions with physics properties
 */
const PLATFORM_TYPES = {
  ice: {
    friction: 5,        // Slippery
    restitution: 0.1,   // Low bounce
    color: '#A5D6E8'
  },
  snow: {
    friction: 10,       // Normal
    restitution: 0.2,
    color: '#FFFFFF'
  },
  stone: {
    friction: 15,       // High grip
    restitution: 0.0,
    color: '#888888'
  },
  gold: {
    friction: 10,       // Normal (decorative)
    restitution: 0.3,
    color: '#FFD700'
  }
};

/**
 * LevelManager class
 * Manages level loading and building
 */
export class LevelManager {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;

    // Current level data
    this.currentLevel = null;
    this.currentLevelId = null;

    // Level objects
    this.levelGroup = new THREE.Group();
    this.scene.add(this.levelGroup);

    this.platforms = [];
    this.platformMeshes = [];
    this.goalObject = null;
    this.waterPlane = null;

    // InstancedMesh groups for optimization
    this.instancedMeshes = new Map(); // key: "color_sizeType", value: InstancedMesh
  }

  /**
   * Load a level from JSON file
   * @param {number} levelId - Level ID to load
   * @returns {Promise<Object>} Level data
   */
  async loadLevel(levelId) {
    console.log(`[LevelManager] Loading level ${levelId}...`);

    try {
      const response = await fetch(`/levels/level${levelId}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load level: ${response.status}`);
      }

      const levelData = await response.json();
      
      console.log(`[LevelManager] Loaded level "${levelData.name}"`);
      return levelData;
    } catch (error) {
      console.error('[LevelManager] Error loading level:', error);
      throw error;
    }
  }

  /**
   * Build a level from data
   * @param {Object} levelData - Level data object
   */
  buildLevel(levelData) {
    console.log(`[LevelManager] Building level...`);

    // Clear previous level
    this.clearLevel();

    // Store level data
    this.currentLevel = levelData;
    this.currentLevelId = levelData.id;

    // Group platforms by type for InstancedMesh optimization
    const platformGroups = new Map();

    levelData.platforms.forEach((platform, index) => {
      const type = platform.type || 'snow';
      const size = `${platform.size[0]}x${platform.size[1]}x${platform.size[2]}`;
      const key = `${type}|${size}`;

      if (!platformGroups.has(key)) {
        platformGroups.set(key, []);
      }

      platformGroups.get(key).push({
        ...platform,
        index
      });
    });

    // Build platforms using InstancedMesh where possible
    platformGroups.forEach((platforms, key) => {
      const [type, sizeKey] = key.split('|');
      const [width, height, depth] = sizeKey.split('x').map(Number);

      if (platforms.length > 1) {
        // Use InstancedMesh for multiple identical platforms
        this.buildInstancedPlatforms(platforms, type, width, height, depth);
      } else {
        // Use individual mesh for single platform
        this.buildIndividualPlatform(platforms[0], type, width, height, depth);
      }
    });

    // Create water
    this.waterPlane = VoxelBuilder.createWater(this.scene, -5);

    // Create goal
    if (levelData.goalPosition) {
      const goalPos = new THREE.Vector3(...levelData.goalPosition);
      this.goalObject = VoxelBuilder.createGoal(this.scene, goalPos);
    }

    // Update physics world
    if (this.game.physicsWorld) {
      this.game.physicsWorld.setPlatforms(this.platforms);
    }

    console.log(`[LevelManager] Built ${this.platforms.length} platforms`);
  }

  /**
   * Build multiple platforms using InstancedMesh (optimization)
   * @param {Array} platforms - Array of platform data
   * @param {string} type - Platform type
   * @param {number} width - Platform width
   * @param {number} height - Platform height
   * @param {number} depth - Platform depth
   */
  buildInstancedPlatforms(platforms, type, width, height, depth) {
    const typeConfig = PLATFORM_TYPES[type] || PLATFORM_TYPES.snow;
    const color = typeConfig.color;

    // Create InstancedMesh
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, platforms.length);

    const matrix = new THREE.Matrix4();

    platforms.forEach((platform, i) => {
      const position = new THREE.Vector3(...platform.position);
      
      // Position platform (center Y is at top surface)
      matrix.identity();
      matrix.makeScale(1, 1, 1);
      matrix.setPosition(position.x, position.y - height / 2, position.z);
      instancedMesh.setMatrixAt(i, matrix);

      // Add to physics platforms
      this.platforms.push({
        minX: position.x - width / 2,
        maxX: position.x + width / 2,
        minY: position.y - height,
        maxY: position.y,
        minZ: position.z - depth / 2,
        maxZ: position.z + depth / 2,
        type: type,
        friction: typeConfig.friction,
        restitution: typeConfig.restitution
      });
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    this.levelGroup.add(instancedMesh);
    this.platformMeshes.push(instancedMesh);
  }

  /**
   * Build a single platform (no InstancedMesh needed)
   * @param {Object} platform - Platform data
   * @param {string} type - Platform type
   * @param {number} width - Platform width
   * @param {number} height - Platform height
   * @param {number} depth - Platform depth
   */
  buildIndividualPlatform(platform, type, width, height, depth) {
    const typeConfig = PLATFORM_TYPES[type] || PLATFORM_TYPES.snow;
    const position = new THREE.Vector3(...platform.position);

    // Create mesh
    const mesh = VoxelBuilder.createPlatform(
      position.x,
      position.y,
      position.z,
      width,
      depth,
      typeConfig.color,
      this.levelGroup
    );

    this.platformMeshes.push(mesh);

    // Add to physics platforms
    this.platforms.push({
      minX: position.x - width / 2,
      maxX: position.x + width / 2,
      minY: position.y - height,
      maxY: position.y,
      minZ: position.z - depth / 2,
      maxZ: position.z + depth / 2,
      type: type,
      friction: typeConfig.friction,
      restitution: typeConfig.restitution
    });
  }

  /**
   * Clear the current level
   */
  clearLevel() {
    console.log('[LevelManager] Clearing level...');

    // Remove all level meshes
    this.levelGroup.clear();

    // Clear arrays
    this.platforms = [];
    this.platformMeshes = [];

    // Remove goal
    if (this.goalObject) {
      this.scene.remove(this.goalObject);
      this.goalObject = null;
    }

    // Remove water
    if (this.waterPlane) {
      this.scene.remove(this.waterPlane);
      this.waterPlane = null;
    }

    // Clear instanced meshes
    this.instancedMeshes.clear();

    // Clear physics world
    if (this.game.physicsWorld) {
      this.game.physicsWorld.clearPlatforms();
    }
  }

  /**
   * Get current level data
   * @returns {Object|null}
   */
  getCurrentLevel() {
    return this.currentLevel;
  }

  /**
   * Get current level ID
   * @returns {number|null}
   */
  getCurrentLevelId() {
    return this.currentLevelId;
  }

  /**
   * Get goal position
   * @returns {THREE.Vector3|null}
   */
  getGoalPosition() {
    return this.goalObject ? this.goalObject.position : null;
  }

  /**
   * Get spawn position
   * @returns {THREE.Vector3}
   */
  getSpawnPosition() {
    if (this.currentLevel && this.currentLevel.spawnPoint) {
      return new THREE.Vector3(...this.currentLevel.spawnPoint);
    }
    return new THREE.Vector3(0, 2, 0);
  }

  /**
   * Get platform at position
   * @param {THREE.Vector3} position
   * @returns {Object|null}
   */
  getPlatformAt(position) {
    for (const platform of this.platforms) {
      if (
        position.x > platform.minX &&
        position.x < platform.maxX &&
        position.z > platform.minZ &&
        position.z < platform.maxZ &&
        Math.abs(position.y - platform.maxY) < 0.5
      ) {
        return platform;
      }
    }
    return null;
  }

  /**
   * Get all platforms
   * @returns {Array}
   */
  getPlatforms() {
    return this.platforms;
  }

  /**
   * Get platform type configuration
   * @param {string} type
   * @returns {Object}
   */
  getPlatformType(type) {
    return PLATFORM_TYPES[type] || PLATFORM_TYPES.snow;
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.clearLevel();
    this.scene.remove(this.levelGroup);
  }
}

/**
 * Entity.js - Base Class for All Game Entities
 * 
 * Provides common properties and methods for all game entities.
 * This is the foundation for PenguinController and future entity types.
 */

import * as THREE from 'three';

/**
 * Base Entity class
 * 
 * All game entities (player, enemies, collectibles, etc.) should extend this class.
 */
export class Entity {
  /**
   * Create a new entity
   * @param {Object} options - Entity configuration
   * @param {THREE.Vector3} options.position - Initial position
   * @param {THREE.Vector3} options.velocity - Initial velocity
   * @param {THREE.Mesh} options.mesh - Three.js mesh
   * @param {Object} options.collider - Collision box
   */
  constructor(options = {}) {
    // Position in 3D space
    this.position = options.position || new THREE.Vector3(0, 0, 0);
    
    // Movement velocity
    this.velocity = options.velocity || new THREE.Vector3(0, 0, 0);
    
    // Three.js visual representation
    this.mesh = options.mesh || null;
    
    // Collision box for physics
    this.collider = options.collider || {
      minX: 0, maxX: 0,
      minY: 0, maxY: 0,
      minZ: 0, maxZ: 0
    };
    
    // Entity state
    this.isActive = true;
    this.isVisible = true;
    this.tags = new Set();
    
    // Reference to scene (set externally)
    this.scene = null;
  }

  /**
   * Update entity state
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Base update - can be overridden by subclasses
    if (this.mesh && this.position) {
      this.mesh.position.copy(this.position);
    }
  }

  /**
   * Get current position
   * @returns {THREE.Vector3} Current position
   */
  getPosition() {
    return this.position.clone();
  }

  /**
   * Set position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   */
  setPosition(x, y, z) {
    this.position.set(x, y, z);
    if (this.mesh) {
      this.mesh.position.set(x, y, z);
    }
    
    // Update collider position
    this.updateCollider();
  }

  /**
   * Update collider position based on entity position
   */
  updateCollider() {
    // Default implementation - subclasses should override
    // This assumes collider is centered at position
    const size = this.getSize();
    if (size) {
      this.collider = {
        minX: this.position.x - size.x / 2,
        maxX: this.position.x + size.x / 2,
        minY: this.position.y - size.y / 2,
        maxY: this.position.y + size.y / 2,
        minZ: this.position.z - size.z / 2,
        maxZ: this.position.z + size.z / 2
      };
    }
  }

  /**
   * Get entity size (should be overridden by subclasses)
   * @returns {THREE.Vector3|null} Size vector or null
   */
  getSize() {
    return null; // Subclasses should implement
  }

  /**
   * Add entity to scene
   * @param {THREE.Scene} scene - Three.js scene
   */
  addToScene(scene) {
    this.scene = scene;
    if (this.mesh && !this.mesh.parent) {
      scene.add(this.mesh);
    }
  }

  /**
   * Remove entity from scene
   */
  removeFromScene() {
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
    }
    this.scene = null;
  }

  /**
   * Set entity visibility
   * @param {boolean} visible - Visibility state
   */
  setVisible(visible) {
    this.isVisible = visible;
    if (this.mesh) {
      this.mesh.visible = visible;
    }
  }

  /**
   * Add a tag to the entity
   * @param {string} tag - Tag to add
   */
  addTag(tag) {
    this.tags.add(tag);
  }

  /**
   * Check if entity has a tag
   * @param {string} tag - Tag to check
   * @returns {boolean} True if entity has the tag
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }

  /**
   * Remove a tag from the entity
   * @param {string} tag - Tag to remove
   */
  removeTag(tag) {
    this.tags.delete(tag);
  }

  /**
   * Clean up entity resources
   */
  destroy() {
    this.removeFromScene();
    this.isActive = false;
    
    // Clean up Three.js resources
    if (this.mesh) {
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(mat => mat.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
    }
  }

  /**
   * Check if entity is grounded (should be overridden by physics entities)
   * @returns {boolean} True if entity is grounded
   */
  isGrounded() {
    return false; // Subclasses should implement
  }

  /**
   * Apply force to entity
   * @param {THREE.Vector3} force - Force vector to apply
   */
  applyForce(force) {
    this.velocity.add(force);
  }
}
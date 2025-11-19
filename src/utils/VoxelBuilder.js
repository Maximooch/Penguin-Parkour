/**
 * VoxelBuilder.js - The Artist
 *
 * Utility class for creating voxel geometry.
 * Provides helper methods for building blocks, platforms, and characters.
 *
 * Future optimization: InstancedMesh for repeated blocks
 */

import * as THREE from 'three';

/**
 * VoxelBuilder class
 * Static utility methods for creating voxel meshes
 */
export class VoxelBuilder {
  // Shared geometry (reused for all blocks)
  static boxGeometry = new THREE.BoxGeometry(1, 1, 1);

  // Material cache (avoid creating duplicate materials)
  static materials = {};

  /**
   * Get or create a material for a color
   * @param {number} color - Hex color
   * @returns {THREE.Material}
   */
  static getMaterial(color) {
    if (!this.materials[color]) {
      this.materials[color] = new THREE.MeshStandardMaterial({ color });
    }
    return this.materials[color];
  }

  /**
   * Create a single voxel block
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   * @param {number} color - Hex color
   * @param {THREE.Object3D} parent - Parent object to add to
   * @param {number} scaleX - X scale (default 1)
   * @param {number} scaleY - Y scale (default 1)
   * @param {number} scaleZ - Z scale (default 1)
   * @returns {THREE.Mesh}
   */
  static createVoxel(
    x, y, z,
    color,
    parent,
    scaleX = 1,
    scaleY = 1,
    scaleZ = 1
  ) {
    const mesh = new THREE.Mesh(
      this.boxGeometry,
      this.getMaterial(color)
    );

    mesh.position.set(x, y, z);
    mesh.scale.set(scaleX, scaleY, scaleZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (parent) {
      parent.add(mesh);
    }

    return mesh;
  }

  /**
   * Create a platform (large flat block)
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} z - Center Z
   * @param {number} width - X dimension
   * @param {number} depth - Z dimension
   * @param {number} color - Hex color
   * @param {THREE.Object3D} parent - Parent object
   * @returns {THREE.Mesh}
   */
  static createPlatform(x, y, z, width, depth, color, parent) {
    const height = 1; // Standard platform height
    return this.createVoxel(
      x,
      y - height / 2,
      z,
      color,
      parent,
      width,
      height,
      depth
    );
  }

  /**
   * Build a penguin character model
   * @param {THREE.Object3D} parent - Parent group to add penguin parts to
   */
  static buildPenguin(parent) {
    const S = 0.2; // Scale factor
    const C = {
      BLACK: 0x2C2C2C,
      WHITE: 0xF0F0F0,
      ORANGE: 0xFFAA00
    };

    // Feet (orange)
    this.createVoxel(-1.5 * S, 0, 0.5 * S, C.ORANGE, parent, S, S, S);
    this.createVoxel(1.5 * S, 0, 0.5 * S, C.ORANGE, parent, S, S, S);

    // Body (black)
    this.createVoxel(0, 3.5 * S, 0, C.BLACK, parent, 5 * S, 6 * S, 3 * S);

    // Belly (white)
    this.createVoxel(0, 3.5 * S, 0.6 * S, C.WHITE, parent, 3.2 * S, 5 * S, 2 * S);

    // Head (black)
    this.createVoxel(0, 7 * S, 0, C.BLACK, parent, 5 * S, 2 * S, 4 * S);

    // Eyes (white)
    this.createVoxel(-1 * S, 7 * S, 2.1 * S, C.WHITE, parent, 1.2 * S, 1.2 * S, 0.2 * S);
    this.createVoxel(1 * S, 7 * S, 2.1 * S, C.WHITE, parent, 1.2 * S, 1.2 * S, 0.2 * S);

    // Pupils (black)
    this.createVoxel(-1 * S, 7 * S, 2.25 * S, C.BLACK, parent, 0.4 * S, 0.4 * S, 0.2 * S);
    this.createVoxel(1 * S, 7 * S, 2.25 * S, C.BLACK, parent, 0.4 * S, 0.4 * S, 0.2 * S);

    // Beak (orange)
    this.createVoxel(0, 6.2 * S, 2.2 * S, C.ORANGE, parent, 1 * S, 0.5 * S, 1.5 * S);

    // Wings/Flippers (black)
    this.createVoxel(-2.8 * S, 3.5 * S, 0, C.BLACK, parent, 0.5 * S, 3 * S, 1.5 * S);
    this.createVoxel(2.8 * S, 3.5 * S, 0, C.BLACK, parent, 0.5 * S, 3 * S, 1.5 * S);
  }

  /**
   * Create speed lines effect
   * @param {THREE.Object3D} parent - Parent to add speed lines to
   * @param {number} count - Number of speed lines
   * @returns {Array} Array of speed line objects
   */
  static createSpeedLines(parent, count = 10) {
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0
    });

    const speedLines = [];

    for (let i = 0; i < count; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.05, 2),
        lineMaterial.clone()
      );

      line.position.set(
        (Math.random() - 0.5) * 3,
        Math.random() * 2,
        (Math.random() - 0.5) * 3
      );

      parent.add(line);

      speedLines.push({
        mesh: line,
        speed: Math.random() * 0.5 + 0.5
      });
    }

    return speedLines;
  }

  /**
   * Create a goal/collectible object (fish)
   * @param {THREE.Scene} scene - Scene to add to
   * @param {THREE.Vector3} position - Position
   * @returns {THREE.Group}
   */
  static createGoal(scene, position) {
    const fishGroup = new THREE.Group();

    // Fish body (red)
    this.createVoxel(0, 0, 0, 0xFF4444, fishGroup, 0.5, 0.3, 0.1);
    // Fish tail
    this.createVoxel(-0.4, 0, 0, 0xFF4444, fishGroup, 0.2, 0.3, 0.1);

    fishGroup.position.copy(position);
    scene.add(fishGroup);

    return fishGroup;
  }

  /**
   * Create water plane
   * @param {THREE.Scene} scene - Scene to add to
   * @param {number} y - Y position (default -5)
   * @returns {THREE.Mesh}
   */
  static createWater(scene, y = -5) {
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshBasicMaterial({
        color: 0x226699,
        transparent: true,
        opacity: 0.8
      })
    );

    water.rotation.x = -Math.PI / 2;
    water.position.y = y;
    scene.add(water);

    return water;
  }

  /**
   * Create a simple skybox
   * @param {THREE.Scene} scene
   * @param {number} color - Sky color
   */
  static createSkybox(scene, color = 0xAADDFF) {
    scene.background = new THREE.Color(color);
    scene.fog = new THREE.Fog(color, 20, 80);
  }

  /**
   * Future: Create instanced blocks for optimization
   * @param {Array} positions - Array of {x, y, z, scaleX, scaleY, scaleZ}
   * @param {number} color - Hex color
   * @param {THREE.Object3D} parent
   * @returns {THREE.InstancedMesh}
   */
  static createInstancedBlocks(positions, color, parent) {
    const count = positions.length;
    const instancedMesh = new THREE.InstancedMesh(
      this.boxGeometry,
      this.getMaterial(color),
      count
    );

    const matrix = new THREE.Matrix4();

    positions.forEach((pos, i) => {
      matrix.identity();
      matrix.makeScale(
        pos.scaleX || 1,
        pos.scaleY || 1,
        pos.scaleZ || 1
      );
      matrix.setPosition(pos.x, pos.y, pos.z);
      instancedMesh.setMatrixAt(i, matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    if (parent) {
      parent.add(instancedMesh);
    }

    return instancedMesh;
  }

  /**
   * Clear material cache (useful when changing quality settings)
   */
  static clearMaterialCache() {
    // Dispose all cached materials
    Object.values(this.materials).forEach(material => {
      material.dispose();
    });
    this.materials = {};
  }
}

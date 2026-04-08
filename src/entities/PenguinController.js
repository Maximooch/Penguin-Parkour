/**
 * PenguinController.js - The Star
 *
 * Player character controller with full state machine.
 * Handles movement, jumping, animations, and visual effects.
 *
 * State Machine:
 * IDLE -> WALK -> RUN -> JUMP -> FALL -> LAND -> (back to IDLE/WALK)
 *
 * Future states: SLIDE, WALL_SLIDE, WALL_JUMP, DASH
 */

import * as THREE from 'three';
import { Entity } from './Entity.js';
import { VoxelBuilder } from '../utils/VoxelBuilder.js';

// Penguin states
export const PenguinState = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
  JUMP: 'jump',
  FALL: 'fall',
  LAND: 'land'
};

/**
 * PenguinController class
 * Controls the player penguin character
 * Extends Entity base class
 */
export class PenguinController extends Entity {
  constructor(scene) {
    // Initialize Entity base class
    const position = new THREE.Vector3(0, 0, 0);
    const velocity = new THREE.Vector3(0, 0, 0);
    
    super({ position, velocity });
    
    this.scene = scene;
    this.addToScene(scene);

    // Create penguin groups
    this.penguinGroup = new THREE.Group();
    this.penguinBody = new THREE.Group();
    this.penguinGroup.add(this.penguinBody);
    this.penguinGroup.position.copy(position);
    scene.add(this.penguinGroup);

    // Build penguin mesh
    VoxelBuilder.buildPenguin(this.penguinBody);
    this.mesh = this.penguinGroup; // Set mesh for Entity base class

    // Create speed lines
    this.linesGroup = new THREE.Group();
    this.penguinGroup.add(this.linesGroup);
    this.speedLines = VoxelBuilder.createSpeedLines(this.linesGroup, 10);

    // Physics state
    this.onGround = false;

    // Movement configuration
    this.config = {
      walkSpeed: 8,
      sprintSpeed: 16,
      jumpForce: 17,
      acceleration: 8, // How fast to reach target speed
      airControl: 0.5 // Movement control while in air
    };

    // Animation state
    this.state = PenguinState.IDLE;
    this.waddlePhase = 0;
    this.landingTimer = 0;

    // Camera-related
    this.cameraYaw = 0; // Must match CameraManager default yaw
    
    // Set entity tags
    this.addTag('player');
    this.addTag('penguin');
  }

  /**
   * Update penguin (called every frame)
   * @param {number} deltaTime - Time since last frame
   * @param {Object} actions - Input actions from InputManager
   */
  update(deltaTime, actions) {
    if (!actions) return;

    // Call base Entity update
    super.update(deltaTime);

    // Update movement
    this.updateMovement(deltaTime, actions);

    // Update state machine
    this.updateState(deltaTime, actions);

    // Update animations
    this.updateAnimations(deltaTime, actions);

    // Update visual effects
    this.updateVisualEffects(deltaTime, actions);
  }

  /**
   * Update movement based on input
   */
  updateMovement(deltaTime, actions) {
    // Get camera direction (forward/right relative to camera)
    const camDir = new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
    const camRight = new THREE.Vector3(1, 0, 0)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

    // Calculate move direction from input
    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(camDir, actions.moveVector.y);
    moveDir.addScaledVector(camRight, actions.moveVector.x);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
    }

    // Determine target speed
    const targetSpeed = actions.sprint ? this.config.sprintSpeed : this.config.walkSpeed;
    const acceleration = this.onGround ? this.config.acceleration : this.config.acceleration * this.config.airControl;

    // Apply acceleration
    if (moveDir.lengthSq() > 0) {
      this.velocity.x += moveDir.x * targetSpeed * deltaTime * acceleration;
      this.velocity.z += moveDir.z * targetSpeed * deltaTime * acceleration;
    }

    // Jump
    if (actions.jump && this.onGround) {
      this.velocity.y = this.config.jumpForce;
      this.onGround = false;
      this.setState(PenguinState.JUMP);
    }
  }

  /**
   * Update state machine
   */
  updateState(deltaTime, actions) {
    const horizontalSpeed = Math.sqrt(
      this.velocity.x * this.velocity.x +
      this.velocity.z * this.velocity.z
    );

    switch (this.state) {
      case PenguinState.IDLE:
        if (!this.onGround) {
          this.setState(PenguinState.FALL);
        } else if (horizontalSpeed > 0.5) {
          this.setState(actions.sprint ? PenguinState.RUN : PenguinState.WALK);
        }
        break;

      case PenguinState.WALK:
        if (!this.onGround) {
          this.setState(PenguinState.FALL);
        } else if (horizontalSpeed < 0.1) {
          this.setState(PenguinState.IDLE);
        } else if (actions.sprint && horizontalSpeed > 5) {
          this.setState(PenguinState.RUN);
        }
        break;

      case PenguinState.RUN:
        if (!this.onGround) {
          this.setState(PenguinState.FALL);
        } else if (horizontalSpeed < 0.1) {
          this.setState(PenguinState.IDLE);
        } else if (!actions.sprint) {
          this.setState(PenguinState.WALK);
        }
        break;

      case PenguinState.JUMP:
        if (this.velocity.y < 0) {
          this.setState(PenguinState.FALL);
        }
        break;

      case PenguinState.FALL:
        if (this.onGround) {
          this.setState(PenguinState.LAND);
          this.landingTimer = 0.1; // Brief landing state
        }
        break;

      case PenguinState.LAND:
        this.landingTimer -= deltaTime;
        if (this.landingTimer <= 0) {
          if (horizontalSpeed > 0.5) {
            this.setState(actions.sprint ? PenguinState.RUN : PenguinState.WALK);
          } else {
            this.setState(PenguinState.IDLE);
          }
        }
        break;
    }
  }

  /**
   * Update visual animations
   */
  updateAnimations(deltaTime, actions) {
    const horizontalSpeed = Math.sqrt(
      this.velocity.x * this.velocity.x +
      this.velocity.z * this.velocity.z
    );

    // Rotate penguin to face movement direction
    if (horizontalSpeed > 1.0) {
      const targetRot = Math.atan2(this.velocity.x, this.velocity.z);
      let rotDiff = targetRot - this.penguinBody.rotation.y;

      // Normalize rotation difference
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;

      // Smooth rotation
      this.penguinBody.rotation.y += rotDiff * deltaTime * 10;
    }

    // Waddle animation (when moving on ground)
    if (this.onGround && horizontalSpeed > 0.5) {
      const waddleSpeed = actions.sprint ? 25 : 15;
      this.waddlePhase += deltaTime * waddleSpeed;
      this.penguinBody.rotation.z = Math.sin(this.waddlePhase) * 0.1;
    } else {
      // Dampen waddle when not moving
      this.penguinBody.rotation.z *= 0.8;
    }

    // Landing squash effect
    if (this.state === PenguinState.LAND && this.landingTimer > 0.05) {
      const squash = THREE.MathUtils.lerp(1, 0.9, this.landingTimer / 0.1);
      this.penguinBody.scale.y = squash;
      this.penguinBody.scale.x = THREE.MathUtils.lerp(1, 1.1, this.landingTimer / 0.1);
      this.penguinBody.scale.z = THREE.MathUtils.lerp(1, 1.1, this.landingTimer / 0.1);
    } else {
      // Return to normal scale
      this.penguinBody.scale.lerp(new THREE.Vector3(1, 1, 1), deltaTime * 10);
    }
  }

  /**
   * Update visual effects (speed lines, etc.)
   */
  updateVisualEffects(deltaTime, actions) {
    const horizontalSpeed = Math.sqrt(
      this.velocity.x * this.velocity.x +
      this.velocity.z * this.velocity.z
    );

    // Speed lines when sprinting
    if (this.state === PenguinState.RUN && actions.sprint) {
      this.linesGroup.visible = true;

      this.speedLines.forEach(line => {
        line.mesh.position.z += line.speed;
        line.mesh.material.opacity = 0.5;

        // Loop speed lines
        if (line.mesh.position.z > 2) {
          line.mesh.position.z = -3;
        }
      });
    } else {
      this.linesGroup.visible = false;
    }
  }

  /**
   * Set penguin state
   */
  setState(newState) {
    if (this.state !== newState) {
      console.log(`[Penguin] State: ${this.state} -> ${newState}`);
      this.state = newState;

      // State entry actions
      switch (newState) {
        case PenguinState.JUMP:
          // Could play jump sound here
          break;
        case PenguinState.LAND:
          // Could play land sound here
          break;
      }
    }
  }

  /**
   * Set camera yaw (for movement direction)
   */
  setCameraYaw(yaw) {
    this.cameraYaw = yaw;
  }

  /**
   * Reset position
   */
  resetPosition(position) {
    // Update Entity base position (used by PhysicsWorld)
    super.setPosition(position.x, position.y, position.z);
    this.velocity.set(0, 0, 0);
    this.onGround = false;
    this.setState(PenguinState.IDLE);
  }

  /**
   * Get position (override Entity method)
   */
  getPosition() {
    return super.getPosition();
  }

  /**
   * Set position
   */
  setPosition(position) {
    super.setPosition(position.x, position.y, position.z);
  }

  /**
   * Get velocity
   */
  getVelocity() {
    return this.velocity;
  }

  /**
   * Set velocity
   */
  setVelocity(velocity) {
    this.velocity.copy(velocity);
  }

  /**
   * Set on ground state
   */
  setOnGround(onGround) {
    // Detect landing (transition from air to ground)
    if (!this.onGround && onGround && this.state === PenguinState.FALL) {
      this.setState(PenguinState.LAND);
    }

    this.onGround = onGround;
  }

  /**
   * Get on ground state
   */
  isOnGround() {
    return this.onGround;
  }

  /**
   * Get mesh for camera to follow
   */
  getMesh() {
    return this.penguinGroup;
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get entity size (implement Entity method)
   * @returns {THREE.Vector3} Size vector
   */
  getSize() {
    // Penguin is roughly 1x1x1 units
    return new THREE.Vector3(1, 1, 1);
  }

  /**
   * Check if entity is grounded (implement Entity method)
   * @returns {boolean} True if entity is grounded
   */
  isGrounded() {
    return this.onGround;
  }

  /**
   * Update collider (implement Entity method)
   */
  updateCollider() {
    // Penguin collider is centered at position with 0.5 radius
    const radius = 0.5;
    this.collider = {
      minX: this.position.x - radius,
      maxX: this.position.x + radius,
      minY: this.position.y - 1, // Height is 1 unit
      maxY: this.position.y,
      minZ: this.position.z - radius,
      maxZ: this.position.z + radius
    };
  }

  /**
   * Destroy and cleanup (override Entity method)
   */
  destroy() {
    super.destroy();
    this.scene.remove(this.penguinGroup);
  }
}

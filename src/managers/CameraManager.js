/**
 * CameraManager.js - The Eye
 *
 * Manages camera positioning, following, and look-at behavior.
 * Features:
 * - Smooth lerp following
 * - Mouse look (yaw/pitch)
 * - FOV effects (sprint = wider FOV)
 * - Camera shake (future)
 * - Multiple camera modes (future: first-person, cinematic)
 */

import * as THREE from 'three';

/**
 * CameraManager class
 * Handles all camera behavior and positioning
 */
export class CameraManager {
  constructor(camera, penguinController, inputManager, settingsManager = null) {
    this.camera = camera;
    this.penguinController = penguinController;
    this.inputManager = inputManager;
    this.settingsManager = settingsManager;

    // Camera state
    // Default yaw 0 positions the camera behind the penguin for Level 1,
    // which starts by moving toward negative Z.
    this.yaw = 0;
    this.pitch = 0.3;
    this.distance = 10;

    // Configuration
    this.config = {
      baseFov: settingsManager ? settingsManager.get('fov') : 60,
      sprintFov: 70,
      mouseSensitivity: 0.002,
      followSpeed: 0.5,     // How fast camera catches up (0-1, higher = faster)
      minPitch: 0.1,        // Look up limit
      maxPitch: Math.PI / 2 - 0.1, // Look down limit
      targetOffset: new THREE.Vector3(0, 1.5, 0) // Look at point above penguin feet
    };

    // State
    this.currentFov = this.config.baseFov;

    // Temp vectors (to avoid GC)
    this.tempTarget = new THREE.Vector3();
    this.tempPosition = new THREE.Vector3();

    // Listen for settings changes
    if (settingsManager) {
      settingsManager.addEventListener('settingChanged', (e) => {
        const { key, value } = e.detail;
        if (key === 'fov') {
          this.config.baseFov = value;
          this.currentFov = value;
          this.camera.fov = value;
          this.camera.updateProjectionMatrix();
        }
      });
    }
  }
  /**
   * Update camera (called every frame)
   * @param {number} deltaTime
   * @param {THREE.Vector3} targetPosition - Position to follow
   */
  update(deltaTime, targetPosition) {
    if (!targetPosition) return;

    // Update mouse look
    this.updateMouseLook(deltaTime);

    // Update FOV based on sprint
    this.updateFOV(deltaTime);

    // Update position
    this.updatePosition(deltaTime, targetPosition);

    // Sync camera yaw to penguin for movement calculations
    if (this.penguinController) {
      this.penguinController.setCameraYaw(this.yaw);
    }
  }

  /**
   * Update camera rotation from mouse input
   */
  updateMouseLook(deltaTime) {
    if (!this.inputManager) return;

    const actions = this.inputManager.getActions();
    if (!actions || !actions.mouseDelta) return;

    // Apply mouse movement to yaw/pitch
    this.yaw -= actions.mouseDelta.x * actions.mouseSensitivity;
    this.pitch += actions.mouseDelta.y * actions.mouseSensitivity;

    // Clamp pitch to prevent flipping
    this.pitch = Math.max(
      this.config.minPitch,
      Math.min(this.config.maxPitch, this.pitch)
    );
  }

  /**
   * Update FOV based on movement state
   */
  updateFOV(deltaTime) {
    let targetFov = this.config.baseFov;

    // Wider FOV when sprinting
    if (this.penguinController) {
      const actions = this.inputManager ? this.inputManager.getActions() : null;
      if (actions && actions.sprint && this.penguinController.isOnGround()) {
        const velocity = this.penguinController.getVelocity();
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);

        if (speed > 5) {
          targetFov = this.config.sprintFov;
        }
      }
    }

    // Smooth FOV transition
    this.currentFov = THREE.MathUtils.lerp(
      this.currentFov,
      targetFov,
      deltaTime * 5
    );

    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Update camera position to follow target
   */
  updatePosition(deltaTime, targetPosition) {
    // Calculate camera position based on yaw/pitch/distance
    const y = Math.sin(this.pitch) * this.distance;
    const horizontalDistance = Math.cos(this.pitch) * this.distance;
    const x = Math.sin(this.yaw) * horizontalDistance;
    const z = Math.cos(this.yaw) * horizontalDistance;

    // Target is above penguin's feet
    this.tempTarget.copy(targetPosition).add(this.config.targetOffset);

    // Desired camera position
    this.tempPosition.set(
      this.tempTarget.x + x,
      this.tempTarget.y + y,
      this.tempTarget.z + z
    );

    // Smooth follow with lerp
    this.camera.position.lerp(this.tempPosition, this.config.followSpeed);

    // Look at target
    this.camera.lookAt(this.tempTarget);
  }

  /**
   * Set camera distance from target
   */
  setDistance(distance) {
    this.distance = distance;
  }

  /**
   * Set mouse sensitivity
   */
  setMouseSensitivity(sensitivity) {
    this.config.mouseSensitivity = sensitivity;
  }

  /**
   * Set follow speed
   */
  setFollowSpeed(speed) {
    this.config.followSpeed = Math.max(0, Math.min(1, speed));
  }

  /**
   * Reset camera to default position/rotation
   */
  reset() {
    this.yaw = 0;
    this.pitch = 0.3;
    this.currentFov = this.config.baseFov;
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Shake camera (for impact effects)
   * @param {number} intensity - Shake strength
   * @param {number} duration - How long to shake
   */
  shake(intensity, duration) {
    // TODO: Implement camera shake
    // This would add random offset to camera position for duration
    console.log(`[Camera] Shake: ${intensity} for ${duration}s`);
  }

  /**
   * Get current yaw (for other systems that need camera direction)
   */
  getYaw() {
    return this.yaw;
  }

  /**
   * Get current pitch
   */
  getPitch() {
    return this.pitch;
  }

  /**
   * Get camera forward direction
   */
  getForwardDirection() {
    return new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
  }

  /**
   * Get camera right direction
   */
  getRightDirection() {
    return new THREE.Vector3(1, 0, 0)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
  }
}

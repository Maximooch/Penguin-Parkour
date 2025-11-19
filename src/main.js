/**
 * Voxel Penguin Parkour - Main Entry Point
 *
 * This is the entry point for the game. It will eventually:
 * - Initialize all managers (Game, Input, Physics, Level, UI, Audio, Settings)
 * - Wire everything together
 * - Start the game loop
 *
 * For now, we're just testing that Vite works correctly.
 */

console.log('Hello Penguin! Vite is running correctly.');
console.log('Phase 1 Complete: Foundation setup successful!');
console.log('Next: Building core game systems...');

// Test Three.js import
import * as THREE from 'three';
console.log('Three.js version:', THREE.REVISION);

// Simple test scene to verify Three.js works
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb); // Sky blue
document.body.appendChild(renderer.domElement);

// Create a simple test cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff6600 }); // Orange penguin!
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Simple animation loop
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();

console.log('Test scene rendered: rotating orange cube (future penguin!)');

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

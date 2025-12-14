/**
 * Vite Configuration for Voxel Penguin Parkour
 * 
 * Basic configuration for Three.js game development
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base public path
  base: '/',
  
  // Project root
  root: '.',
  
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    
    // Optimize for Three.js
    rollupOptions: {
      output: {
        // Keep Three.js imports as separate chunks for better caching
        manualChunks: {
          three: ['three']
        }
      }
    }
  },
  
  // Server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Preview configuration
  preview: {
    port: 4000,
    open: true
  },
  
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@managers': resolve(__dirname, 'src/managers'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['three']
  }
});
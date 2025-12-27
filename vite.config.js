import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages deployment
  base: '/Mlff-evidencina-opreme/',

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',

    // Preserve file structure
    rollupOptions: {
      input: {
        main: './index.html',
        migration: './migration.html'
      },
      output: {
        // Keep JS files in js/ directory
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep CSS in css/, images in images/, etc.
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'images/[name][extname]';
          } else if (ext === 'css') {
            return 'css/[name][extname]';
          }
          return 'assets/[name][extname]';
        }
      }
    }
  },

  // Server configuration for local development
  server: {
    port: 5500,
    open: true
  },

  // Environment variable prefix
  envPrefix: 'VITE_'
});

import { defineConfig, loadEnv } from 'vite';
import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Base path for GitHub Pages deployment
    base: '/Mlff-evidencina-opreme/',

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: join(process.cwd(), 'index.html')
        }
      }
    },

    // Server configuration for local development
    server: {
      port: 5500,
      open: true
    },

    // Environment variable prefix
    envPrefix: 'VITE_',

    // Plugins
    plugins: [
      {
        name: 'copy-legacy-js-files',
        closeBundle() {
          // Copy non-module JS files from root js/ to dist/js/
          // (analytics.js, router.js, app.js still use global scope)
          const jsFolderSrc = join(process.cwd(), 'js');
          const jsFolderDist = join(process.cwd(), 'dist', 'js');

          try {
            // Create dist/js folder if it doesn't exist
            mkdirSync(jsFolderDist, { recursive: true });

            // Copy legacy JS files (non-ES modules)
            const jsFiles = ['analytics.js', 'router.js', 'app.js'];
            jsFiles.forEach(file => {
              const srcPath = join(jsFolderSrc, file);
              const destPath = join(jsFolderDist, file);
              copyFileSync(srcPath, destPath);
            });

            console.log('✅ Copied legacy JS files to dist/js/');
          } catch (e) {
            console.error(`❌ Failed to copy legacy JS files:`, e.message);
          }
        }
      }
    ]
  };
});

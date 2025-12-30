import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

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
      name: 'copy-js-files',
      closeBundle() {
        // Copy JS files to dist/js folder after build
        const jsFolderDist = join(process.cwd(), 'dist', 'js');
        const jsFolderSrc = join(process.cwd(), 'js');

        // Create dist/js folder if it doesn't exist
        try {
          mkdirSync(jsFolderDist, { recursive: true });
        } catch (e) {
          // Folder already exists
        }

        // Copy all JS files
        const jsFiles = ['supabase-config.js', 'supabase-service.js', 'router.js', 'app.js'];
        jsFiles.forEach(file => {
          try {
            copyFileSync(join(jsFolderSrc, file), join(jsFolderDist, file));
            console.log(`✅ Copied ${file} to dist/js/`);
          } catch (e) {
            console.error(`❌ Failed to copy ${file}:`, e.message);
          }
        });
      }
    }
  ]
});

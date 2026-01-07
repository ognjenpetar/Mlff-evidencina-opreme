import { defineConfig, loadEnv } from 'vite';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
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
      assetsDir: 'assets'
      // Removed rollupOptions.input - let Vite copy public/index.html without processing
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
          // Copy JS files from root js/ to dist/js/
          const jsFolderSrc = join(process.cwd(), 'js');
          const jsFolderDist = join(process.cwd(), 'dist', 'js');

          try {
            // Create dist/js folder if it doesn't exist
            mkdirSync(jsFolderDist, { recursive: true });

            // Copy all JS files
            const jsFiles = ['supabase-config.js', 'supabase-service.js', 'analytics.js', 'router.js', 'app.js'];
            jsFiles.forEach(file => {
              const srcPath = join(jsFolderSrc, file);
              const destPath = join(jsFolderDist, file);
              copyFileSync(srcPath, destPath);
            });

            console.log('✅ Copied JS files to dist/js/');
          } catch (e) {
            console.error(`❌ Failed to copy JS files:`, e.message);
          }
        }
      },
      {
        name: 'inject-env-vars',
        closeBundle() {
          // Inject environment variables into supabase-config.js in dist folder (AFTER copy)
          const distJsPath = join(process.cwd(), 'dist', 'js', 'supabase-config.js');

          try {
            let content = readFileSync(distJsPath, 'utf-8');

            // Replace import.meta.env.VITE_SUPABASE_URL with actual value
            content = content.replace(
              /import\.meta\.env\.VITE_SUPABASE_URL/g,
              `'${(env.VITE_SUPABASE_URL || '').trim()}'`
            );
            // Replace import.meta.env.VITE_SUPABASE_ANON_KEY with actual value
            content = content.replace(
              /import\.meta\.env\.VITE_SUPABASE_ANON_KEY/g,
              `'${(env.VITE_SUPABASE_ANON_KEY || '').trim()}'`
            );

            writeFileSync(distJsPath, content, 'utf-8');
            console.log('🔧 Injected environment variables into dist/js/supabase-config.js');
          } catch (e) {
            console.error(`❌ Failed to inject env vars:`, e.message);
          }
        }
      }
    ]
  };
});

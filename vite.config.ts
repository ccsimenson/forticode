import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  root: 'src/renderer',
  base: './',
  publicDir: resolve(__dirname, 'public'),
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    }),
    electron([
      {
        // Main process entry file
        entry: 'src/main/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron', 'module-alias/register', 'module-alias']
            },
            // Ensure module-alias is properly bundled
            commonjsOptions: {
              ignoreTryCatch: false
            },
            // Explicitly include shared modules
            lib: {
              entry: 'src/main/main.ts',
              formats: ['cjs']
            },
            outDir: 'dist/main',
            minify: process.env.NODE_ENV === 'production',
            emptyOutDir: true
          },
          resolve: {
            alias: [
              { find: '@', replacement: resolve(__dirname, 'src') },
              { find: '@shared', replacement: resolve(__dirname, 'src/shared') },
              { find: /^@shared\/(.*)\.js$/, replacement: resolve(__dirname, 'src/shared/$1.ts') }
            ]
          }
        }
      },
      // Preload script configuration
      {
        entry: 'src/main/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist/main',
            rollupOptions: {
              external: ['electron']
            },
            lib: {
              entry: 'src/main/preload.ts',
              formats: ['cjs'],
              fileName: () => 'preload.js'
            }
          },
          resolve: {
            alias: [
              { find: '@', replacement: resolve(__dirname, 'src') },
              { find: '@shared', replacement: resolve(__dirname, 'src/shared') },
              { find: /^@shared\/(.*)\.js$/, replacement: resolve(__dirname, 'src/shared/$1.ts') }
            ]
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@shared', replacement: resolve(__dirname, 'src/shared') },
      { find: /^@shared\/(.*)\.js$/, replacement: resolve(__dirname, 'src/shared/$1.ts') }
    ],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.platform': JSON.stringify(process.platform)
  },
  server: {
    port: 3001,
    strictPort: true,
    cors: true,
    watch: {
      // Reduce file system events for better performance
      usePolling: false,
      // Don't watch node_modules
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  build: {
    emptyOutDir: false, // Required for electron-builder
    rollupOptions: {
      external: [
        'electron',
        'module-alias/register',
        'module-alias',
        /^node:.*/,
      ]
    },
    commonjsOptions: {
      esmExternals: true
    }
  },
  optimizeDeps: {
    include: ['@mantine/core', '@mantine/hooks', '@mantine/notifications']
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/renderer/styles/variables.scss";'
      }
    }
  }
});

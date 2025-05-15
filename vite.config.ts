import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173, // Initial port
    strictPort: false,
    host: 'localhost',
    hmr: {
      host: 'localhost',
      port: 5173
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: '../renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/renderer/main.ts')
      }
    },
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@main': path.resolve(__dirname, './src/main'),
      '@renderer': path.resolve(__dirname, './src/renderer'),
      '@modules': path.resolve(__dirname, './src/modules'),
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/renderer/styles/variables.scss";'
      }
    }
  }
});

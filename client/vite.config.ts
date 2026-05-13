import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Set base to './' so it works on GitHub Pages subfolders
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  }
});

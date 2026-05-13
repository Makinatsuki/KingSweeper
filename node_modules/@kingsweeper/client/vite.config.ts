import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Set base to the repository name for GitHub Pages
  base: '/KingSweeper/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  }
});

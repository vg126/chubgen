import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for building the character-stage as a static site.
// The `base` option ensures that all asset URLs are prefixed with the
// repository path when served via GitHub Pages (e.g. https://vg126.github.io/chubgen/character-stage/).
export default defineConfig({
  plugins: [react()],
  // When deploying to GitHub Pages we need to set the base path so that
  // links to JavaScript and CSS assets are resolved correctly.
  base: '/chubgen/character-stage/',
  build: {
    outDir: 'dist'
  }
});
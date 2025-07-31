import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  if (mode !== 'lib') {
    return { plugins: [react()] };
  }
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'index',
        formats: ['umd', 'es', 'cjs', 'iife'],
        fileName: 'index'
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } }
      }
    }
  };
});

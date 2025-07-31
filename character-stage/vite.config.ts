import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const base = process.env.BASE_URL || '/chubgen/character-stage/'
  if (mode !== 'lib') {
    return {
      plugins: [react()],
      base,
      build: {
        outDir: 'dist'
      }
    }
  } else {
    return {
      plugins: [
        react(),
        dts({
          outDir: ['dist'],
          include: ['src/**/*.ts*'],
          staticImport: true,
          rollupTypes: true,
          insertTypesEntry: true
        })
      ],
      base,
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'index',
          formats: ['umd', 'es', 'cjs', 'iife'],
          fileName: 'index'
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        }
      }
    }
  }
})

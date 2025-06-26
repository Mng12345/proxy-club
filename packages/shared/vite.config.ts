import { getNodeMajorVersion } from '@app/electron-versions'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: 'inline',
    outDir: 'dist',
    target: `node${getNodeMajorVersion()}`,
    lib: {
      entry: ['src/index.ts', 'src/IProxy.ts'],
      // name: '@app/shared'
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
})

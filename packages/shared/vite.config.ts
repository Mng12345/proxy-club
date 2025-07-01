import { getNodeMajorVersion } from '@app/electron-versions'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: 'inline',
    outDir: 'dist',
    target: `node${getNodeMajorVersion()}`,
    lib: {
      entry: ['src/index.ts'],
    },
    rollupOptions: {
      output: [
        {
          entryFileNames: '[name].mjs'
        }
      ]
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  }
})

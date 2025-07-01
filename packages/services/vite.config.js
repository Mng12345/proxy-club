import {resolveModuleExportNames} from 'mlly';
import {getChromeMajorVersion} from '@app/electron-versions';
import {copyFile} from 'fs/promises';
import {join} from 'path';
import {fileURLToPath} from 'url';

export default /**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
({
  build: {
    ssr: true,
    sourcemap: 'inline',
    outDir: 'dist',
    target: `chrome${getChromeMajorVersion()}`,
    assetsDir: '.',
    lib: {
      entry: {
        api: 'src/api/index.ts',
        worker: 'src/proxy/SimpleBackendServerWorker.ts'
      },
    },
    rollupOptions: {
      output: [
        {
          // ESM preload scripts must have the .mjs extension
          entryFileNames: '[name].mjs',
          format: 'es',
        },
        {
          // Worker script needs to be CommonJS
          entryFileNames: 'SimpleBackendServerWorker.js',
          format: 'cjs',
          exports: 'named',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      ],
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  plugins: [
    {
      name: 'copy-worker-file',
      async writeBundle() {
        try {
          const __dirname = fileURLToPath(new URL('.', import.meta.url));
          const srcPath = join(__dirname, 'dist/worker.mjs');
          const destPath = join(__dirname, '../worker.mjs');
          
          await copyFile(srcPath, destPath);
          console.log(`Successfully copied worker.mjs to ${destPath}`);
        } catch (err) {
          console.error('Error copying worker.mjs:', err.message);
        }
      }
    },
    handleHotReload()
  ],
});


/**
 * Implement Electron webview reload when some file was changed
 * @return {import('vite').Plugin}
 */
function handleHotReload() {
  /** @type {import('vite').ViteDevServer|null} */
  let rendererWatchServer = null;

  return {
    name: '@app/preload-process-hot-reload',

    config(config, env) {
      if (env.mode !== 'development') {
        return;
      }

      const rendererWatchServerProvider = config.plugins.find(p => p.name === '@app/renderer-watch-server-provider');
      if (!rendererWatchServerProvider) {
        throw new Error('Renderer watch server provider not found');
      }

      rendererWatchServer = rendererWatchServerProvider.api.provideRendererWatchServer();

      return {
        build: {
          watch: {},
        },
      };
    },

    writeBundle() {
      if (!rendererWatchServer) {
        return;
      }

      rendererWatchServer.ws.send({
        type: 'full-reload',
      });
    },
  };
}

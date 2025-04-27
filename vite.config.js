import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: ''
        },
        {
          src: 'src/assets/icons',
          dest: ''
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        settings: resolve(__dirname, 'settings.html'),
        background: resolve(__dirname, 'src/core/background/background.ts'),
        inspector: resolve(__dirname, 'src/core/devmode/InspectorService.ts'),
        autohunt: resolve(__dirname, 'src/core/devmode/AutoScrapeService.ts'),
      },
      output: {
        entryFileNames: chunk => {
          if (chunk.name === 'background') {
            return 'background.js'
          } else if (chunk.name === 'inspector') {
            return 'inspector.js'
          } else if (chunk.name === 'autohunt') {
            return 'autohunt.js'
          }
          return 'assets/[name].[hash].js'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'esnext'
  }
})

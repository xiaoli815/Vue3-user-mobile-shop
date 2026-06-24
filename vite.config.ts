import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { viteMockServe } from 'vite-plugin-mock'
import viteCompression from 'vite-plugin-compression'

import { fileURLToPath } from 'url'
import { resolve } from 'path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [VantResolver()]
    }),
    Components({
      resolvers: [VantResolver()]
    }),
    ViteImageOptimizer({
      jpg: {
        quality: 70,
        mozjpeg: true
      },
      png: {
        quality: 70,
        compressionLevel: 9
      },
      webp: {
        quality: 70,
        lossless: false
      },
      avif: {
        quality: 55,
        lossless: false
      },
      cache: true,
      silent: true,
      generateWebp: true,
      generateAvif: false
    }),
    viteMockServe({
      mockPath: 'src/mock',
      localEnabled: true,
      prodEnabled: true,
      injectCode: `
        import { setupProdMockServer } from '../mock/index'
        setupProdMockServer()
      `
    }),
    viteCompression({
      algorithm: 'gzip',
      threshold: 1024,
      minRatio: 0.8,
      deleteOriginalAssets: false
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    
    warmup: {
      clientFiles: [
        './src/main.ts',
        './src/views/home/Home.vue',
        './src/App.vue',
        './src/router/index.ts',
      ]
    }
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'vant',
      '@vant/area-data'
    ],
    exclude: ['mockjs']
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vant: ['vant'],
          axios: ['axios'],
          mock: ['mockjs'],
          areaData: ['@vant/area-data'],
          pinia: ['pinia', 'pinia-plugin-persistedstate']
        },
        chunkFileNames: 'assets/js/[name]-[hash:8].js',
        entryFileNames: 'assets/js/[name]-[hash:8].js',
        assetFileNames: 'assets/[ext]/[name]-[hash:8].[ext]'
      }
    }
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : []
  }
}))
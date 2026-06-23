import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

import { fileURLToPath } from 'url'
import { resolve } from 'path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // 相对路径，适配 GitHub Pages 子目录部署
  base: './',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [VantResolver()]
    }),
    Components({
      resolvers: [VantResolver()]
    }),
    // 图片压缩：构建时自动优化 JPG/PNG/WebP
    ViteImageOptimizer({
      jpg: {
        quality: 75          // 75% 画质，体积可减少 60-80%
      },
      png: {
        quality: 75
      },
      webp: {
        quality: 75,
        lossless: false
      },
      avif: {
        quality: 60,
        lossless: false
      }
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
  //  优化依赖预构建，减少浏览器请求数
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'vant',
      '@vant/area-data'
    ]
  },
  //  生产构建层面优化
  build: {
    // 目标现代浏览器，减少 polyfill 体积
    target: 'es2020',
    // CSS 代码分割（默认开启，显式声明）
    cssCodeSplit: true,
    // 资源内联阈值：小于 4KB 的资源内联为 base64，减少请求数
    assetsInlineLimit: 4096,
    // chunk 大小警告阈值（KB）
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          vant: ['vant'],
          axios: ['axios'],
          mock: ['mockjs']
        },
        //  优化 chunk 文件名，利于浏览器缓存
        chunkFileNames: 'assets/js/[name]-[hash:8].js',
        entryFileNames: 'assets/js/[name]-[hash:8].js',
        assetFileNames: 'assets/[ext]/[name]-[hash:8].[ext]'
      }
    }
  },
  //  生产环境移除 console/debugger，减小体积
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})
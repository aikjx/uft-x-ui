import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import { TDesignResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    }),
    Components({
      resolvers: [
        TDesignResolver({
          library: 'vue-next'
        })
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 更精细的代码分割策略
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue-vendor'
            } else if (id.includes('three')) {
              return 'three-vendor'
            } else if (id.includes('gsap') || id.includes('anime')) {
              return 'animation-vendor'
            } else if (id.includes('babel')) {
              return 'parser-vendor'
            } else {
              return 'vendor'
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['three', 'gsap', 'animejs']
  },
  define: {
    // 为 Babel types 提供基础 process 环境变量
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis'
  },
})
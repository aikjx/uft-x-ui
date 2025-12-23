import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        }
      }),
      
      // HTML 模板处理
      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            title: env.VITE_APP_TITLE || 'UTF Star',
            description: env.VITE_APP_DESCRIPTION || '统一场论可视化平台'
          }
        }
      }),
      
      // 打包分析
      isProduction && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true
      })
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@composables': resolve(__dirname, 'src/composables'),
        '@stores': resolve(__dirname, 'src/stores'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@types': resolve(__dirname, 'src/types'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@styles': resolve(__dirname, 'src/styles')
      }
    },
    
    // 开发服务器配置
    server: {
      port: 3000,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    
    // 构建配置
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: !isProduction,
      
      // 代码分割
      rollupOptions: {
        output: {
          manualChunks: {
            // 第三方库分离
            'vendor-vue': ['vue', 'vue-router', 'pinia'],
            'vendor-ui': ['@headlessui/vue', '@heroicons/vue'],
            'vendor-math': ['mathjax'],
            'vendor-utils': ['lodash-es', 'dayjs']
          },
          
          // 文件命名
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              return `media/[name]-[hash].${ext}`
            }
            if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              return `images/[name]-[hash].${ext}`
            }
            if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              return `fonts/[name]-[hash].${ext}`
            }
            return `assets/[name]-[hash].${ext}`
          }
        }
      },
      
      // 压缩配置
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction
        }
      },
      
      // 资源内联阈值
      assetsInlineLimit: 4096,
      
      // CSS 代码分割
      cssCodeSplit: true
    },
    
    // 优化配置
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'lodash-es',
        'dayjs'
      ],
      exclude: ['@vueuse/core']
    },
    
    // CSS 配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      },
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
          ...(isProduction ? [require('cssnano')] : [])
        ]
      }
    },
    
    // 环境变量
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: !isProduction,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    },
    
    // 预览配置
    preview: {
      port: 4173,
      open: true
    }
  }
})
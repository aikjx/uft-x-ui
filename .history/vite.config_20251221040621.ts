import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'
import viteCompression from 'vite-plugin-compression'
import { splitVendorChunkPlugin } from 'vite'

// 自定义构建优化插件 - 增强版
const customBuildOptimizer = {
  name: 'custom-build-optimizer',
  enforce: 'pre' as const,
  config(config) {
    // 自动优化构建配置
    config.build = config.build || {}

    // 优化构建输出
    config.build.assetsInlineLimit = 4096 // 4KB以下的资源内联
    config.build.cssCodeSplit = true // 启用CSS代码分割
    config.build.rollupOptions = config.build.rollupOptions || {}

    // 进一步优化构建配置
    config.build.minify = 'terser'
    config.build.target = 'esnext'
    config.build.brotliSize = true
    config.build.chunkSizeWarningLimit = 800
    config.build.cacheDir = 'node_modules/.vite'
    config.build.parallel = true

    // 优化预构建
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      'react',
      'react-dom',
      'three'
    ]
    config.optimizeDeps.esbuildOptions = config.optimizeDeps.esbuildOptions || {}
    config.optimizeDeps.esbuildOptions.target = 'es2020'
    config.optimizeDeps.esbuildOptions.minify = true
    config.optimizeDeps.esbuildOptions.treeShaking = true

    return config
  },
  // 构建结束后进行性能报告生成
  closeBundle() {
    // 可以在这里添加构建后性能分析逻辑
    console.log('🚀 构建优化完成 - 自动优化已应用')
  }
}

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    splitVendorChunkPlugin(), // 自动分割vendor chunk
    customBuildOptimizer,
    // 添加gzip和brotli压缩
    viteCompression({
      verbose: false, // 关闭详细日志
      disable: false,
      threshold: 4096, // 4KB以上才压缩，减少小文件压缩开销
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    }),
    viteCompression({
      verbose: false, // 关闭详细日志
      disable: false,
      threshold: 4096,
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'three/examples/jsm/controls/OrbitControls': 'three/examples/jsm/controls/OrbitControls.js',
      'three/examples/jsm/loaders/GLTFLoader': 'three/examples/jsm/loaders/GLTFLoader.js'
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    host: true,
    // 优化HMR
    hmr: {
      timeout: 3000,
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  build: {
    outDir: 'dist/static',
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3, // 多次压缩以获得更优结果
        pure_getters: true
      },
      mangle: {
        toplevel: true,
        keep_classnames: false,
        keep_fnames: false
      },
      format: {
        comments: false,
        beautify: false,
        ascii_only: true
      }
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // 优化chunk分割
        manualChunks: {
          // 自定义chunk分割逻辑
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-core': ['three'],
          'three-controls': ['three/examples/jsm/controls/OrbitControls.js'],
          'three-loaders': ['three/examples/jsm/loaders/GLTFLoader.js'],
          'three-postprocessing': [
            'three/examples/jsm/postprocessing/EffectComposer.js',
            'three/examples/jsm/postprocessing/RenderPass.js',
            'three/examples/jsm/postprocessing/UnrealBloomPass.js',
            'three/examples/jsm/postprocessing/FilmPass.js',
            'three/examples/jsm/postprocessing/ShaderPass.js'
          ],
          'animation-vendor': ['framer-motion'],
          'charts-vendor': ['recharts'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'sonner'],
          'zustand-vendor': ['zustand']
        },
        // 优化输出配置
        compact: true,
        format: 'es',
        interop: 'auto',
        esModule: true
      },
      // 优化tree shaking
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        moduleContext: 'strict',
        optimizeChunks: true
      }
    },
    brotliSize: true, // 启用brotli大小报告
    chunkSizeWarningLimit: 1000, // 降低警告阈值，更早发现大chunk
    // 启用构建缓存
    cacheDir: 'node_modules/.vite',
    // 并行构建
    cssCodeSplit: true,
    // 优化异步模块加载
    dynamicImportVarsOptions: {
      warnOnError: true,
      exclude: ['**/*.svg', '**/*.png', '**/*.jpg']
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'three', 'framer-motion', 'recharts', 'zustand'],
    exclude: ['three/examples/jsm/controls/OrbitControls.js'],
    // 预构建配置优化
    esbuildOptions: {
      target: 'es2020', // 降低目标，提高兼容性
      // 优化预构建的tree shaking
      treeShaking: true,
      // 优化chunk大小
      bundle: true,
      // 优化依赖解析
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      // 移除无用代码
      pure: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      // 优化代码生成
      minify: true,
      minifySyntax: true,
      minifyIdentifiers: true,
      minifyWhitespace: true,
      // 优化输出大小
      keepNames: false,
      legalComments: 'none',
      // 并行构建
      maxWorkers: process.env.CI ? 2 : 4,
      // 优化内存使用
      memoryLimit: 8192
    },
    // 强制预构建所有依赖
    force: false,
    // 提高预构建并发数
    maxWorkers: process.env.CI ? 2 : 4,
    // 启用依赖优化缓存
    cacheDir: 'node_modules/.vite',
    // 优化依赖顺序
    orderImports: true,
    // 优化依赖扫描
    scan: {
      exclude: ['node_modules/**/*.test.js', 'node_modules/**/*.spec.js'],
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx']
    }
  },
  // 优化静态资源处理
  assetsInclude: ['**/*.md', '**/*.pdf', '**/*.glb', '**/*.gltf', '**/*.wasm'],
  // 优化CSS处理
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
      // 优化CSS模块
      hashPrefix: 'utf',
      scopeBehaviour: 'local'
    },
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false,
        // 优化CSS预处理器
        map: false
      }
    },
    // 使用postcss配置文件代替内联配置
    postcss: {
      config: true
    },
    // 优化CSS注入
    inject: true
  },
  // 环境变量配置
  envDir: './env',
  envPrefix: 'VITE_',
  // 日志配置
  logLevel: 'info',
  // 调试配置
  debug: false
})

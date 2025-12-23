import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import viteCompression from 'vite-plugin-compression';
import { splitVendorChunkPlugin } from 'vite';

// 自定义构建优化插件
const customBuildOptimizer = {
  name: 'custom-build-optimizer',
  enforce: 'pre' as const,
  config(config) {
    // 自动优化构建配置
    config.build = config.build || {};
    return config;
  }
};

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    splitVendorChunkPlugin(), // 自动分割vendor chunk
    customBuildOptimizer,
    // 添加gzip和brotli压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 10KB以上才压缩
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
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
        // 优化代码分割策略
        codeSplit: true,
        // 优化tree shaking
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
          'mathjax-vendor': ['mathjax'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'zod', 'sonner']
        }
      },
      // 优化tree shaking
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
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
    include: ['react', 'react-dom', 'react-router-dom', 'three', 'framer-motion', 'recharts', 'mathjax'],
    exclude: [],
    // 预构建配置优化
    esbuildOptions: {
      target: 'esnext',
      // 优化预构建的tree shaking
      treeShaking: true,
      // 优化chunk大小
      bundle: true,
      // 优化依赖解析
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    // 强制预构建所有依赖
    force: false,
    // 提高预构建并发数
    maxWorkers: process.env.CI ? 2 : undefined
  },
  // 优化静态资源处理
  assetsInclude: ['**/*.md', '**/*.pdf', '**/*.glb', '**/*.gltf'],
  // 优化CSS处理
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    },
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    // 使用postcss配置文件代替内联配置
    postcss: {
      config: true
    }
  },
  // 环境变量配置
  envDir: './env',
  envPrefix: 'VITE_',
  // 日志配置
  logLevel: 'info',
  // 调试配置
  debug: false
});
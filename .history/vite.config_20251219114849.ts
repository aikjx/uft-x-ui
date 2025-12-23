import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import viteCompression from 'vite-plugin-compression';
import { splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          ['@babel/plugin-proposal-private-methods', { loose: true }]
        ]
      }
    }),
    tsconfigPaths(),
    splitVendorChunkPlugin(),
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 4096,
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    }),
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 4096,
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false
    }),
    process.env.NODE_ENV === 'production' && visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    }),
    process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      sourcemaps: {
        assets: ['dist/**/*.js', 'dist/**/*.css']
      },
      release: {
        name: process.env.SENTRY_RELEASE || `${process.env.npm_package_name}@${process.env.npm_package_version}`
      }
    })
  ].filter(Boolean),
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'three/examples/jsm': 'three/examples/jsm'
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.wasm']
  },
  
  server: {
    port: Number(process.env.PORT) || 3000,
    open: process.env.NODE_ENV === 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    },
    host: true,
    hmr: {
      timeout: 3000,
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'terser',
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : 'inline',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
        pure_getters: true,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true
      },
      mangle: {
        toplevel: true,
        keep_classnames: false,
        keep_fnames: false,
        safari10: true
      },
      format: {
        comments: false,
        beautify: false,
        ascii_only: true,
        ecma: 2020
      }
    },
    
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]',
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'three-core': ['three'],
          'three-extras': [
            'three/examples/jsm/controls/OrbitControls.js',
            'three/examples/jsm/loaders/GLTFLoader.js',
            'three/examples/jsm/postprocessing/EffectComposer.js',
            'three/examples/jsm/postprocessing/RenderPass.js',
            'three/examples/jsm/postprocessing/UnrealBloomPass.js',
            'three/examples/jsm/postprocessing/FilmPass.js',
            'three/examples/jsm/postprocessing/ShaderPass.js'
          ],
          'animation': ['framer-motion'],
          'charts': ['recharts'],
          'math': ['mathjax'],
          'utils': ['clsx', 'tailwind-merge', 'zod', 'sonner'],
          'state': ['zustand']
        },
        compact: true,
        manualChunksSortMode: 'size'
      },
      
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false
      },
      
      external: []
    },
    
    brotliSize: true,
    chunkSizeWarningLimit: 1000,
    cacheDir: 'node_modules/.vite',
    cssCodeSplit: true,
    dynamicImportVarsOptions: {
      warnOnError: true,
      exclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif', '**/*.webp']
    },
    manifest: true,
    ssrManifest: false,
    copyPublicDir: true,
    reportCompressedSize: true
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'three', 'framer-motion', 'recharts', 'mathjax', 'zustand'],
    exclude: ['@types/three', '@types/react', '@types/react-dom'],
    
    esbuildOptions: {
      target: 'es2022',
      treeShaking: true,
      bundle: true,
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.wasm'],
      pure: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      minify: true,
      minifySyntax: true,
      minifyIdentifiers: true,
      minifyWhitespace: true,
      keepNames: false,
      legalComments: 'none',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
      },
      loader: {
        '.wasm': 'file'
      }
    },
    
    force: false,
    maxWorkers: process.env.CI ? 2 : '50%',
    cacheDir: 'node_modules/.vite',
    orderImports: true,
    preBundleCSS: true
  },
  
  assetsInclude: ['**/*.md', '**/*.pdf', '**/*.glb', '**/*.gltf', '**/*.wasm', '**/*.mp4', '**/*.webm'],
  
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: process.env.NODE_ENV === 'production' 
        ? '[hash:base64:6]' 
        : '[name]__[local]__[hash:base64:5]'
    },
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    postcss: {
      config: true
    },
    transformer: 'postcss'
  },
  
  envDir: '.',
  envPrefix: 'VITE_',
  
  logLevel: process.env.DEBUG ? 'debug' : 'info',
  debug: process.env.DEBUG === 'true',
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.git'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/App.tsx', 'src/**/*.d.ts', 'src/types/**/*', 'src/constants/**/*'],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
});
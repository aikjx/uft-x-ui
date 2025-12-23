import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],

    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}'
    ],

    exclude: [
      'node_modules/',
      'dist/',
      '.git/',
      '.idea/',
      '.cache/',
      'tests/e2e/',
      'tests/benchmark/',
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**'
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', ['cobertura', { file: 'coverage/cobertura.xml' }]],

      include: [
        'src/**/*.{ts,tsx}',
        '!src/main.tsx',
        '!src/App.tsx',
        '!src/**/*.d.ts',
        '!src/types/**/*',
        '!src/constants/**/*',
        '!src/**/index.ts',
        '!src/**/index.tsx'
      ],

      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/index.ts',
        '**/index.tsx',
        '**/main.tsx',
        '**/App.tsx',
        '**/types/**/*',
        '**/constants/**/*'
      ],

      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      },

      all: true,
      clean: true,
      enabled: true,
      reportOnFailure: true
    },

    testTimeout: 15000,
    hookTimeout: 10000,
    teardownTimeout: 10000,

    deps: {
      interopDefault: true,
      fallbackCJS: true,
      optimizer: {
        web: {
          enabled: true
        }
      }
    },

    globalsSetup: './tests/global-setup.ts',
    reporters: [
      'default',
      ['html', { outputFile: 'test-results/index.html' }],
      ['junit', { outputFile: 'test-results/junit.xml' }]
    ],

    outputFile: {
      html: 'test-results/index.html',
      junit: 'test-results/junit.xml'
    },

    sequence: {
      concurrent: true,
      shuffle: process.env['CI'] !== 'true'
    },

    threads: process.env['CI'] !== 'true',
    maxWorkers: process.env['CI'] ? '50%' : '100%',

    open: false,
    ui: false,

    browser:
      process.env['BROWSER'] === 'true'
        ? {
            enabled: true,
            name: 'chrome',
            provider: 'playwright',
            headless: process.env['CI'] === 'true',
            viewport: { width: 1280, height: 720 }
          }
        : undefined
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'three/examples/jsm': 'three/examples/jsm'
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },

  env: {
    NODE_ENV: 'test',
    TEST: 'true',
    VITE_APP_TITLE: 'Test - UTF Star'
  }
})

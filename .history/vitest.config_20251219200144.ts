import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()] as any,

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],

    include: ['tests/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],

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

    server: {
      deps: {
        interopDefault: true,
        fallbackCJS: true,
        optimizer: {
          web: {
            enabled: true
          }
        }
      }
    },

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

    open: false,
    ui: false,

    env: {
      NODE_ENV: 'test',
      TEST: 'true',
      VITE_APP_TITLE: 'Test - UTF Star'
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'three/examples/jsm': 'three/examples/jsm'
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  }
})

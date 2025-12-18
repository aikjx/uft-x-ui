import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/components/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'tests/services/**/*.{test,spec}.{ts}',
      'tests/utils/**/*.{test,spec}.{ts}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'tests/e2e/**',
      'tests/benchmark/**'
    ],
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        'src/main.tsx',
        'src/App.tsx',
        '**/index.ts'
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      },
      all: true,
      clean: true
    },
    
    testTimeout: 15000,
    hookTimeout: 10000,
    
    deps: {
      interopDefault: true
    },
    
    reporters: ['default'],
    outputFile: { html: 'test-results/index.html' },
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
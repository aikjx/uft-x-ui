import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // 基础配置
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    
    // 测试文件匹配
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
      include: ['src/**/*.{ts,tsx}']
    },
    
    // 超时配置
    testTimeout: 10000,
    
    // 基础路径别名
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  
  // 项目级路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})

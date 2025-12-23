// Process polyfill for browser environment
declare global {
  interface Window {
    process?: any
  }
}

// 创建 process polyfill
const createProcessPolyfill = () => {
  if (typeof window !== 'undefined' && !window.process) {
    window.process = {
      env: {
        NODE_ENV: import.meta.env.MODE || 'development'
      },
      version: 'v16.0.0',
      platform: 'browser',
      arch: 'browser',
      nextTick: (fn: () => void) => setTimeout(fn, 0),
      hrtime: (start?: [number, number]): [number, number] => {
        const now = performance.now() * 1e-3
        const seconds = Math.floor(now)
        const nanoseconds = Math.floor((now - seconds) * 1e9)
        if (start) {
          return [seconds - start[0], nanoseconds - start[1]]
        }
        return [seconds, nanoseconds]
      }
    }
  }
}

export default createProcessPolyfill

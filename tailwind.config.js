/** @type {import('tailwindcss').Config} */
export default {
  // 启用JIT模式，提高构建速度和减少CSS体积
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
  // 性能优化配置
  optimize: {
    // 移除未使用的CSS
    unused: true,
    // 合并重复的CSS规则
    merge: true,
    // 压缩CSS
    minify: true,
  },
  // 减少生成的CSS体积
  corePlugins: {
    // 移除不需要的核心插件
    preflight: true,
    container: true,
    accessibility: true,
    // 保留必要的核心插件
    flexbox: true,
    grid: true,
    backgroundImage: false,
  }
}
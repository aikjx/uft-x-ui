import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 合并CSS类名的工具函数
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// 格式化公式显示
export const formatFormula = (expression: string): string => {
  // 确保公式格式正确，处理一些常见的转义问题
  return expression
    .replace(/\\\\/g, '\\')
    .trim();
};

// 生成随机颜色
export const generateRandomColor = (baseColor: number = 0x3b82f6): number => {
  const hue = (baseColor >> 16) & 0xff;
  const saturation = (baseColor >> 8) & 0xff;
  const lightness = baseColor & 0xff;
  
  // 在基础颜色附近随机变化
  const newHue = Math.max(0, Math.min(255, hue + (Math.random() - 0.5) * 50));
  const newSaturation = Math.max(0, Math.min(255, saturation + (Math.random() - 0.5) * 30));
  const newLightness = Math.max(0, Math.min(255, lightness + (Math.random() - 0.5) * 40));
  
  return (Math.round(newHue) << 16) | (Math.round(newSaturation) << 8) | Math.round(newLightness);
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// 显示通知
export const showNotification = {
  success: (message: string) => {
    toast.success(message, {
      position: 'top-right',
      duration: 3000,
      style: {
        backgroundColor: '#0c4a6e',
        color: '#93c5fd',
        borderColor: '#1d4ed8'
      }
    });
  },
  error: (message: string) => {
    toast.error(message, {
      position: 'top-right',
      duration: 3000,
      style: {
        backgroundColor: '#7f1d1d',
        color: '#fca5a5',
        borderColor: '#b91c1c'
      }
    });
  },
  info: (message: string) => {
    toast.info(message, {
      position: 'top-right',
      duration: 3000,
      style: {
        backgroundColor: '#1e3a8a',
        color: '#93c5fd',
        borderColor: '#3b82f6'
      }
    });
  }
};

// 验证公式格式
export const validateFormula = (formula: string): boolean => {
  // 简单的公式验证逻辑
  if (!formula || formula.trim().length === 0) {
    return false;
  }
  // 检查括号是否匹配
  const brackets = formula.match(/[\\[\\]\\(\\)\\{\\}]/g);
  if (brackets) {
    const stack: string[] = [];
    const pairs: Record<string, string> = {
      '\\[': '\\]',
      '\\(': '\\)',
      '{': '}'
    };
    
    for (const bracket of brackets) {
      if (pairs[bracket]) {
        stack.push(bracket);
      } else {
        const last = stack.pop();
        if (!last || pairs[last] !== bracket) {
          return false;
        }
      }
    }
    
    if (stack.length > 0) {
      return false;
    }
  }
  
  return true;
};

// 深度合并对象
export const deepMerge = <T extends Record<string, any>, U extends Record<string, any>>(target: T, source: U): T & U => {
  // 使用类型断言确保output是T & U类型
  const output = { ...target } as T & U;
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          // 使用Object.assign来避免索引赋值的类型问题
          Object.assign(output, { [key]: deepMerge(target[key] as Record<string, any>, source[key] as Record<string, any>) });
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

// 判断是否为对象
const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// 生成模拟数据点
export const generateSimulationData = (count: number, amplitude: number = 1, frequency: number = 0.1) => {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    value: Math.sin(i * frequency) * amplitude + (Math.random() - 0.5) * 0.2
  }));
};
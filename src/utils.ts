import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

/**
 * 合并CSS类名的工具函数，结合clsx和tailwind-merge的功能
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 格式化数字显示
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  } else if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

/**
 * 安全地解析JSON
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    console.error('JSON解析错误:', error);
    return fallback;
  }
}

/**
 * 检查是否在浏览器环境中
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * 通知工具对象
 */
export const showNotification = {
  /**
   * 显示成功通知
   */
  success: (message: string, options: { duration?: number; title?: string } = {}): void => {
    if (!isBrowser()) return;
    toast.success(message, { duration: 3000, ...options });
  },
  
  /**
   * 显示错误通知
   */
  error: (message: string, options: { duration?: number; title?: string } = {}): void => {
    if (!isBrowser()) return;
    toast.error(message, { duration: 3000, ...options });
  },
  
  /**
   * 显示警告通知
   */
  warning: (message: string, options: { duration?: number; title?: string } = {}): void => {
    if (!isBrowser()) return;
    toast.warning(message, { duration: 3000, ...options });
  },
  
  /**
   * 显示信息通知
   */
  info: (message: string, options: { duration?: number; title?: string } = {}): void => {
    if (!isBrowser()) return;
    toast.info(message, { duration: 3000, ...options });
  }
};
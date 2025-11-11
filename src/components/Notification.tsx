import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// 通知属性接口
interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
  index?: number;
  playSound?: boolean;
}

// 通知动画变体
const notificationVariants = {
  initial: {
    x: '100%',
    opacity: 0,
    scale: 0.95,
  },
  animate: (custom: number) => ({
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      delay: custom * 0.1,
    },
  }),
  exit: {
    x: '100%',
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
};

// 通知类型样式映射
const NOTIFICATION_STYLES = {
  success: {
    bgColor: 'bg-green-900/40',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-300',
    icon: '✅',
    sound: 'success',
  },
  error: {
    bgColor: 'bg-red-900/40',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-300',
    icon: '❌',
    sound: 'error',
  },
  info: {
    bgColor: 'bg-blue-900/40',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-300',
    icon: 'ℹ️',
    sound: 'info',
  },
  warning: {
    bgColor: 'bg-yellow-900/40',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-300',
    icon: '⚠️',
    sound: 'warning',
  },
};

// 简单的通知声音系统
const playNotificationSound = useCallback((soundType: string) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 根据通知类型设置不同的声音频率
    switch (soundType) {
      case 'success':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        break;
      case 'error':
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.2;
        break;
      case 'warning':
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.15;
        break;
      default:
        oscillator.frequency.value = 700;
        gainNode.gain.value = 0.1;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    // 忽略浏览器不支持音频或用户未交互的情况
  }
}, []);

const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  index = 0,
  playSound = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controls = useAnimation();
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const style = NOTIFICATION_STYLES[type];

  // 初始化动画和定时器
  useEffect(() => {
    controls.start('animate');
    
    // 播放通知声音
    if (playSound) {
      playNotificationSound(style.sound);
    }

    // 设置自动关闭定时器
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, index, controls, playSound, style.sound]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, duration / 2); // 鼠标离开后等待一半时间再关闭
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={notificationRef}
          className={`relative p-4 rounded-lg border ${style.bgColor} ${style.borderColor} backdrop-blur-sm shadow-lg shadow-blue-900/20 cursor-pointer`}
          custom={index}
          variants={notificationVariants}
          initial="initial"
          animate={controls}
          exit="exit"
          whileHover="hover"
          onClick={handleClose}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseEnter}
          onTouchEnd={handleMouseLeave}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="flex items-start gap-3">
            <motion.div 
              className="text-xl mt-0.5 flex-shrink-0" 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {style.icon}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${style.textColor} leading-relaxed break-words`}>{message}</p>
            </div>
            <button
              className="text-blue-200/50 hover:text-blue-200 transition-colors ml-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50 p-1 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              aria-label="关闭通知"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 通知管理上下文
interface NotificationContextType {
  showNotification: (message: string, options?: {
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    playSound?: boolean;
  }) => void;
  clearAllNotifications: () => void;
}

export const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

// 自定义Hook方便使用通知
interface NotificationHookReturn {
  showNotification: (message: string, options?: {
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    playSound?: boolean;
  }) => void;
  clearAllNotifications: () => void;
}

export const useNotification = (): NotificationHookReturn => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// 通知数据接口
interface NotificationData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  playSound: boolean;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  maxVisible?: number; // 最大可见通知数量
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'; // 通知位置
}

// 通知位置映射
const NOTIFICATION_POSITIONS = {
  'top-right': 'top-20 right-4 flex flex-col gap-3 items-end',
  'top-left': 'top-20 left-4 flex flex-col gap-3 items-start',
  'bottom-right': 'bottom-4 right-4 flex flex-col-reverse gap-3 items-end',
  'bottom-left': 'bottom-4 left-4 flex flex-col-reverse gap-3 items-start',
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxVisible = 5,
  position = 'top-right',
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const notificationQueueRef = useRef<NotificationData[]>([]);
  
  // 唯一ID生成
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // 显示通知
  const showNotification = useCallback((
    message: string, 
    options?: {
      type?: 'success' | 'error' | 'info' | 'warning';
      duration?: number;
      playSound?: boolean;
    }
  ) => {
    const { type = 'info', duration = 3000, playSound = true } = options || {};
    const id = generateId();
    
    const newNotification: NotificationData = { 
      id, 
      message, 
      type, 
      duration, 
      playSound 
    };
    
    setNotifications(prev => {
      if (prev.length >= maxVisible) {
        // 如果超过最大显示数量，加入队列
        notificationQueueRef.current.push(newNotification);
        return prev;
      }
      return [...prev, newNotification];
    });
  }, [maxVisible, generateId]);
  
  // 清除所有通知
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    notificationQueueRef.current = [];
  }, []);
  
  // 移除通知并从队列中补充
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      
      // 如果队列中有通知且未达到最大显示数量，则从队列中取出一个
      if (notificationQueueRef.current.length > 0 && updated.length < maxVisible) {
        const nextNotification = notificationQueueRef.current.shift();
        if (nextNotification) {
          return [...updated, nextNotification];
        }
      }
      
      return updated;
    });
  }, [maxVisible]);

  return (
    <NotificationContext.Provider value={{ showNotification, clearAllNotifications }}>
      {children}
      <div 
        className={`fixed z-50 max-w-sm w-full pointer-events-none ${NOTIFICATION_POSITIONS[position]}`}
        role="region"
        aria-live="polite"
      >
        {notifications.map((notification, index) => (
          <div 
            key={notification.id} 
            className="pointer-events-auto w-full"
            style={{
              // 使用类型断言来支持CSS变量
              ['--notification-index' as any]: notifications.length - index
            }}
          >
            <Notification
              message={notification.message}
              type={notification.type}
              duration={notification.duration}
              playSound={notification.playSound}
              index={index}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default Notification;

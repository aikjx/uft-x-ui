import { ref, reactive, readonly } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
  timestamp: number
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary'
}

export interface NotificationOptions {
  title?: string
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
  position?: NotificationPosition
}

const notifications = ref<Notification[]>([])
const defaultDuration = 5000
const maxNotifications = 5

export function useNotification() {
  
  // 创建通知
  const createNotification = (
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ): Notification => {
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: options.title,
      message,
      duration: options.duration ?? defaultDuration,
      persistent: options.persistent ?? false,
      actions: options.actions,
      timestamp: Date.now()
    }
    
    return notification
  }
  
  // 显示通知
  const show = (
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ) => {
    const notification = createNotification(type, message, options)
    
    // 添加到通知列表
    notifications.value.unshift(notification)
    
    // 限制通知数量
    if (notifications.value.length > maxNotifications) {
      notifications.value = notifications.value.slice(0, maxNotifications)
    }
    
    // 自动移除（如果不是持久化的）
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        remove(notification.id)
      }, notification.duration)
    }
    
    return notification
  }
  
  // 成功通知
  const success = (message: string, options?: NotificationOptions) => {
    return show('success', message, options)
  }
  
  // 错误通知
  const error = (message: string, options?: NotificationOptions) => {
    return show('error', message, {
      ...options,
      duration: options?.duration ?? 8000 // 错误通知显示更久
    })
  }
  
  // 警告通知
  const warning = (message: string, options?: NotificationOptions) => {
    return show('warning', message, options)
  }
  
  // 信息通知
  const info = (message: string, options?: NotificationOptions) => {
    return show('info', message, options)
  }
  
  // 移除通知
  const remove = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  // 清除所有通知
  const clear = () => {
    notifications.value = []
  }
  
  // 清除特定类型的通知
  const clearByType = (type: NotificationType) => {
    notifications.value = notifications.value.filter(n => n.type !== type)
  }
  
  // 获取通知数量
  const count = computed(() => notifications.value.length)
  
  // 获取特定类型的通知数量
  const getCountByType = (type: NotificationType) => {
    return notifications.value.filter(n => n.type === type).length
  }
  
  // 批量通知
  const batch = (items: Array<{
    type: NotificationType
    message: string
    options?: NotificationOptions
  }>) => {
    return items.map(item => show(item.type, item.message, item.options))
  }
  
  // 确认对话框样式的通知
  const confirm = (
    message: string,
    options: {
      title?: string
      confirmText?: string
      cancelText?: string
      onConfirm?: () => void
      onCancel?: () => void
    } = {}
  ) => {
    return show('warning', message, {
      title: options.title || '确认操作',
      persistent: true,
      actions: [
        {
          label: options.confirmText || '确认',
          style: 'primary',
          action: () => {
            options.onConfirm?.()
          }
        },
        {
          label: options.cancelText || '取消',
          style: 'secondary',
          action: () => {
            options.onCancel?.()
          }
        }
      ]
    })
  }
  
  // 进度通知
  const progress = (
    message: string,
    options: {
      title?: string
      progress?: number
      onComplete?: () => void
    } = {}
  ) => {
    const notification = show('info', message, {
      title: options.title,
      persistent: true
    })
    
    // 返回更新进度的方法
    return {
      id: notification.id,
      update: (newMessage: string, progress?: number) => {
        const index = notifications.value.findIndex(n => n.id === notification.id)
        if (index > -1) {
          notifications.value[index].message = newMessage
          // 这里可以添加进度条逻辑
        }
      },
      complete: (finalMessage?: string) => {
        if (finalMessage) {
          const index = notifications.value.findIndex(n => n.id === notification.id)
          if (index > -1) {
            notifications.value[index].message = finalMessage
            notifications.value[index].type = 'success'
          }
        }
        
        setTimeout(() => {
          remove(notification.id)
          options.onComplete?.()
        }, 2000)
      },
      error: (errorMessage: string) => {
        const index = notifications.value.findIndex(n => n.id === notification.id)
        if (index > -1) {
          notifications.value[index].message = errorMessage
          notifications.value[index].type = 'error'
        }
        
        setTimeout(() => {
          remove(notification.id)
        }, 5000)
      }
    }
  }
  
  return {
    notifications: readonly(notifications),
    count,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear,
    clearByType,
    getCountByType,
    batch,
    confirm,
    progress
  }
}

// 全局通知实例
export const globalNotification = useNotification()

// 便捷的全局方法
export const notify = globalNotification
export const $notify = globalNotification
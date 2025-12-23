<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click="handleOverlayClick"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="scale-95 translate-y-4 opacity-0"
          enter-to-class="scale-100 translate-y-0 opacity-100"
          leave-active-class="transition-all duration-300"
          leave-from-class="scale-100 translate-y-0 opacity-100"
          leave-to-class="scale-95 translate-y-4 opacity-0"
        >
          <div
            v-if="modelValue"
            :class="modalClasses"
            @click.stop
          >
            <!-- 模态框头部 -->
            <div v-if="$slots.header || title || closable" class="modal-header">
              <slot name="header">
                <div class="flex items-center justify-between">
                  <h3 v-if="title" class="modal-title">{{ title }}</h3>
                  <button
                    v-if="closable"
                    @click="close"
                    class="modal-close-btn"
                    aria-label="关闭"
                  >
                    ✕
                  </button>
                </div>
              </slot>
            </div>
            
            <!-- 模态框内容 -->
            <div class="modal-content">
              <slot />
            </div>
            
            <!-- 模态框底部 -->
            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'

export interface ModalProps {
  modelValue: boolean
  title?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  closeOnOverlay?: boolean
  persistent?: boolean
  centered?: boolean
}

const props = withDefaults(defineProps<ModalProps>(), {
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  persistent: false,
  centered: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'open': []
}>()

const modalClasses = computed(() => {
  const baseClasses = [
    'modal',
    'relative',
    'bg-white',
    'dark:bg-gray-800',
    'rounded-lg',
    'shadow-xl',
    'max-h-[90vh]',
    'overflow-hidden',
    'flex',
    'flex-col'
  ]
  
  // 尺寸样式
  const sizeClasses = {
    xs: ['w-80', 'max-w-xs'],
    sm: ['w-96', 'max-w-sm'],
    md: ['w-[32rem]', 'max-w-md'],
    lg: ['w-[48rem]', 'max-w-2xl'],
    xl: ['w-[64rem]', 'max-w-4xl'],
    full: ['w-full', 'h-full', 'max-w-none', 'max-h-none', 'rounded-none']
  }
  
  return [
    ...baseClasses,
    ...sizeClasses[props.size]
  ]
})

const close = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

// 监听模态框状态变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    emit('open')
    // 防止背景滚动
    document.body.style.overflow = 'hidden'
    
    nextTick(() => {
      // 聚焦到模态框
      const modal = document.querySelector('.modal') as HTMLElement
      modal?.focus()
    })
  } else {
    // 恢复背景滚动
    document.body.style.overflow = ''
  }
})

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue && props.closable) {
    close()
  }
}

// 添加键盘监听
document.addEventListener('keydown', handleKeydown)

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm;
}

.modal {
  @apply focus:outline-none;
}

.modal-header {
  @apply flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100;
}

.modal-close-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700;
}

.modal-content {
  @apply flex-1 px-6 py-4 overflow-y-auto;
}

.modal-footer {
  @apply flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50;
}

/* 全屏模式调整 */
.modal.w-full.h-full {
  @apply m-0;
}

.modal.w-full.h-full .modal-overlay {
  @apply p-0;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .modal-overlay {
    @apply p-2;
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    @apply px-4 py-3;
  }
  
  .modal {
    @apply w-full max-w-none mx-2;
  }
}

/* 动画优化 */
.modal-overlay {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
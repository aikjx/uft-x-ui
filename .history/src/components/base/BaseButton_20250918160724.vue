<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <div v-if="loading" class="btn-loading">
      <div class="animate-spin">⟳</div>
    </div>
    
    <div v-if="icon && !loading" class="btn-icon">
      <component :is="icon" />
    </div>
    
    <span v-if="$slots.default" class="btn-text">
      <slot />
    </span>
    
    <div v-if="badge" class="btn-badge">
      {{ badge }}
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  icon?: any
  badge?: string | number
  block?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = [
    'btn',
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed'
  ]
  
  // 变体样式
  const variantClasses = {
    primary: [
      'bg-gradient-to-r',
      'from-blue-500',
      'to-blue-600',
      'text-white',
      'hover:from-blue-600',
      'hover:to-blue-700',
      'focus:ring-blue-500',
      'shadow-lg',
      'hover:shadow-xl'
    ],
    secondary: [
      'bg-gray-100',
      'text-gray-900',
      'hover:bg-gray-200',
      'focus:ring-gray-500',
      'dark:bg-gray-800',
      'dark:text-gray-100',
      'dark:hover:bg-gray-700'
    ],
    outline: [
      'border-2',
      'border-blue-500',
      'text-blue-500',
      'hover:bg-blue-500',
      'hover:text-white',
      'focus:ring-blue-500'
    ],
    ghost: [
      'text-gray-700',
      'hover:bg-gray-100',
      'focus:ring-gray-500',
      'dark:text-gray-300',
      'dark:hover:bg-gray-800'
    ],
    danger: [
      'bg-gradient-to-r',
      'from-red-500',
      'to-red-600',
      'text-white',
      'hover:from-red-600',
      'hover:to-red-700',
      'focus:ring-red-500',
      'shadow-lg',
      'hover:shadow-xl'
    ]
  }
  
  // 尺寸样式
  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs'],
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-6', 'py-3', 'text-base'],
    xl: ['px-8', 'py-4', 'text-lg']
  }
  
  const classes = [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...sizeClasses[props.size]
  ]
  
  if (props.block) {
    classes.push('w-full')
  }
  
  if (props.loading) {
    classes.push('cursor-wait')
  }
  
  return classes
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn-loading {
  @apply absolute inset-0 flex items-center justify-center;
}

.btn-icon {
  @apply flex-shrink-0;
}

.btn-text {
  @apply truncate;
}

.btn-badge {
  @apply absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center;
}

/* 特殊效果 */
.btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.btn:not(:disabled):active {
  transform: translateY(0);
}

/* 主题特定样式 */
.theme-dark .btn {
  --tw-ring-offset-color: #0a0a0f;
}

/* 加载动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
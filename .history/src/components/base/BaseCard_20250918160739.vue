<template>
  <div :class="cardClasses" v-bind="$attrs">
    <!-- 卡片头部 -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <div v-if="$slots.actions" class="card-actions">
            <slot name="actions" />
          </div>
        </div>
      </slot>
    </div>
    
    <!-- 卡片内容 -->
    <div v-if="$slots.default" class="card-content">
      <slot />
    </div>
    
    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CardProps {
  title?: string
  variant?: 'default' | 'outlined' | 'elevated' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  size: 'md',
  hoverable: false,
  clickable: false,
  loading: false
})

const cardClasses = computed(() => {
  const baseClasses = [
    'card',
    'relative',
    'overflow-hidden',
    'transition-all',
    'duration-200'
  ]
  
  // 变体样式
  const variantClasses = {
    default: [
      'bg-white',
      'dark:bg-gray-800',
      'border',
      'border-gray-200',
      'dark:border-gray-700'
    ],
    outlined: [
      'bg-transparent',
      'border-2',
      'border-gray-300',
      'dark:border-gray-600'
    ],
    elevated: [
      'bg-white',
      'dark:bg-gray-800',
      'shadow-lg',
      'border-0'
    ],
    filled: [
      'bg-gray-50',
      'dark:bg-gray-900',
      'border-0'
    ]
  }
  
  // 尺寸样式
  const sizeClasses = {
    sm: ['rounded-md'],
    md: ['rounded-lg'],
    lg: ['rounded-xl']
  }
  
  const classes = [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...sizeClasses[props.size]
  ]
  
  // 交互样式
  if (props.hoverable) {
    classes.push(
      'hover:shadow-lg',
      'hover:-translate-y-1',
      'dark:hover:shadow-2xl'
    )
  }
  
  if (props.clickable) {
    classes.push(
      'cursor-pointer',
      'hover:shadow-md',
      'active:scale-98'
    )
  }
  
  if (props.loading) {
    classes.push('animate-pulse')
  }
  
  return classes
})
</script>

<style scoped>
.card-header {
  @apply px-6 py-4 border-b border-gray-200 dark:border-gray-700;
}

.card-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100;
}

.card-actions {
  @apply flex items-center gap-2;
}

.card-content {
  @apply px-6 py-4;
}

.card-footer {
  @apply px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50;
}

/* 特殊效果 */
.card::before {
  content: '';
  @apply absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300;
}

.card:hover::before {
  @apply opacity-100;
}

/* 加载状态 */
.card.animate-pulse .card-content {
  @apply space-y-3;
}

.card.animate-pulse .card-content::after {
  content: '';
  @apply block h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .card-header,
  .card-content,
  .card-footer {
    @apply px-4 py-3;
  }
}
</style>
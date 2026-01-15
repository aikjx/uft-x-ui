import React, { useEffect, useRef, useState } from 'react'
import { cn } from '../utils'
import { MathJax as MathJaxService } from '../utils/mathjax'

interface MathJaxProps {
  formula: string
  className?: string
  inline?: boolean
  fontSize?: number | string
  color?: string
}

export const MathJax: React.FC<MathJaxProps> = React.memo(
  ({ formula, className = '', inline = false, fontSize, color }) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [isReady, setIsReady] = useState(false)
    const [hasError, setHasError] = useState(false)

    // 初始化MathJax服务
    useEffect(() => {
      // 确保在客户端环境中初始化
      if (typeof window !== 'undefined') {
        MathJaxService.initialize()

        // 监听MathJax就绪状态
        const handleReady = () => {
          setIsReady(true)
          setHasError(false)
        }

        MathJaxService.onReady(handleReady)
        
        // 检查是否已经就绪
        if (MathJaxService.isReadyState) {
          setIsReady(true)
        }

        return () => {
          MathJaxService.offReady(handleReady)
        }
      }
    }, [])

    // 渲染公式 - 优化性能，避免频繁调用Typeset
    useEffect(() => {
      if (isReady && wrapperRef.current) {
        // 当formula属性变化时总是重新渲染公式
        const newContent = inline ? `$${formula}$` : `$$${formula}$$`
        
        // 清空容器并设置新内容
        wrapperRef.current.innerHTML = newContent
        wrapperRef.current.removeAttribute('data-mjx-error')

        // 使用MathJaxService进行渲染
        try {
          MathJaxService.queueTypeset(wrapperRef.current)
          setHasError(false)
        } catch (err) {
          console.warn('MathJax渲染错误:', err)
          setHasError(true)
        }
      }
    }, [formula, isReady, inline])

    // 动态样式计算
    const containerStyle = React.useMemo(() => {
      const style: React.CSSProperties = {
        fontWeight: 'normal',
      }
      
      if (fontSize) {
        style.fontSize = typeof fontSize === 'number' ? `${fontSize}px` : fontSize
      } else {
        style.fontSize = '1.1em' // 默认值
      }
      
      if (color) {
        style.color = color
      } else {
        style.color = '#3b82f6' // 默认值
      }
      
      return style
    }, [fontSize, color])

    if (hasError) {
      return (
        <span className={cn('mathjax-error text-red-400 font-mono text-sm', className)} style={containerStyle}>
          {formula}
        </span>
      )
    }

    return (
      <div
        ref={wrapperRef}
        className={cn('mathjax-wrapper', 'font-math', className)}
        style={containerStyle}
      >
        {!isReady && (
          <span className="text-blue-300 opacity-70 animate-pulse">
            {inline ? '...' : '正在加载公式...'}
          </span>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
      prevProps.formula === nextProps.formula &&
      prevProps.className === nextProps.className &&
      prevProps.inline === nextProps.inline &&
      prevProps.fontSize === nextProps.fontSize &&
      prevProps.color === nextProps.color
    )
  }
)

export default MathJax

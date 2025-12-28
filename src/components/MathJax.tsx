import React, { useEffect, useRef, useState } from 'react'
import { cn } from '../utils'
import { MathJax as MathJaxService } from '../utils/mathjax'

interface MathJaxProps {
  formula: string
  className?: string
  inline?: boolean
}

export const MathJax: React.FC<MathJaxProps> = React.memo(
  ({ formula, className = '', inline = false }) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [isReady, setIsReady] = useState(false)

    // 初始化MathJax服务
    useEffect(() => {
      // 确保在客户端环境中初始化
      if (typeof window !== 'undefined') {
        MathJaxService.initialize()

        // 监听MathJax就绪状态
        const handleReady = () => {
          setIsReady(true)
        }

        MathJaxService.onReady(handleReady)

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

        // 使用MathJaxService进行渲染
        try {
          MathJaxService.queueTypeset(wrapperRef.current)
        } catch (err) {
          console.warn('MathJax渲染错误:', err)
        }
      }
    }, [formula, isReady, inline])

    // 优化：使用useMemo缓存容器元素的样式，避免每次渲染都重新计算
    const containerStyle = React.useMemo(
      () => ({
        fontSize: '1.1em',
        color: '#3b82f6',
        fontWeight: 'normal'
      }),
      []
    )

    return (
      <div
        ref={wrapperRef}
        className={cn('mathjax-wrapper', 'font-math', className)}
        style={containerStyle}
      >
        {!isReady && <span className="text-blue-300 opacity-70">加载中...</span>}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
      prevProps.formula === nextProps.formula &&
      prevProps.className === nextProps.className &&
      prevProps.inline === nextProps.inline
    )
  }
)

export default MathJax

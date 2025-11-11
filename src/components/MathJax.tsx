import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../utils';
import { MathJax as MathJaxService } from '../utils/mathjax';

interface MathJaxProps {
  formula: string;
  className?: string;
  inline?: boolean;
}

export const MathJax: React.FC<MathJaxProps> = ({ formula, className = '', inline = false }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // 初始化MathJax服务
  useEffect(() => {
    // 确保在客户端环境中初始化
    if (typeof window !== 'undefined') {
      MathJaxService.initialize();
      
      // 监听MathJax就绪状态
      const handleReady = () => {
        setIsReady(true);
      };
      
      MathJaxService.onReady(handleReady);
      
      return () => {
        MathJaxService.offReady(handleReady);
      };
    }
  }, []);

  // 渲染公式
  useEffect(() => {
    if (isReady && wrapperRef.current) {
      // 清空容器
      wrapperRef.current.innerHTML = inline ? `$${formula}$` : `$$${formula}$$`;
      
      // 使用MathJaxService进行渲染
      try {
        MathJaxService.queueTypeset(wrapperRef.current);
      } catch (err) {
        console.warn('MathJax渲染错误:', err);
      }
    }
  }, [formula, isReady, inline]);

  return (
    <div 
      ref={wrapperRef} 
      className={cn(
        'mathjax-wrapper',
        'font-math',
        className
      )}
      style={{
        fontSize: '1.1em',
        color: '#3b82f6',
        fontWeight: 'normal'
      }}
    >
      {!isReady && (
        <span className="text-blue-300 opacity-70">加载中...</span>
      )}
    </div>
  );
};

export default MathJax;
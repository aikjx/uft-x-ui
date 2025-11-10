import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../utils';

// 声明MathJax全局对象
declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathJaxProps {
  formula: string;
  className?: string;
  inline?: boolean;
}

export const MathJax: React.FC<MathJaxProps> = ({ formula, className = '', inline = false }) => {
  const scriptRef = useRef<HTMLScriptElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // 加载MathJax库
  useEffect(() => {
    if (window.MathJax) {
      setIsReady(true);
      return;
    }

    // 创建MathJax配置
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.text = `
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          packages: ['base', 'ams', 'noerrors', 'noundefined']
        },
        svg: {
          fontCache: 'global',
          scale: 1.1
        },
        startup: {
          typeset: false
        }
      };
    `;
    document.head.appendChild(configScript);

    // 加载MathJax脚本
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    script.onload = () => {
      setIsReady(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(configScript);
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 渲染公式
  useEffect(() => {
    if (isReady && wrapperRef.current && window.MathJax) {
      // 清空容器
      wrapperRef.current.innerHTML = inline ? `$${formula}$` : `$$${formula}$$`;
      
      // 触发MathJax渲染
      window.MathJax.typesetClear();
      window.MathJax.typesetPromise([wrapperRef.current]).catch((err: any) => {
        console.warn('MathJax渲染错误:', err);
      });
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
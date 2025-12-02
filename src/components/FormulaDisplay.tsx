import React, { useState, useEffect } from 'react';
import MathJax from './MathJax';
import { motion } from 'framer-motion';

/**
 * 公式数据接口
 */
export interface FormulaData {
  id: string;
  name: string;
  category: string;
  formula: string;
  description: string;
  variables: Array<{
    name: string;
    description: string;
    unit: string;
  }>;
  applications: string[];
}

/**
 * 公式显示配置
 */
export interface FormulaDisplayConfig {
  showName: boolean;
  showDescription: boolean;
  showVariables: boolean;
  showApplications: boolean;
  showCopyButton: boolean;
  theme: 'dark' | 'light' | 'neon';
  animationEnabled: boolean;
  fontSize: number;
  formulaAlign: 'left' | 'center' | 'right';
}

/**
 * 公式显示组件
 */
const FormulaDisplay: React.FC<{
  formula: FormulaData;
  config?: Partial<FormulaDisplayConfig>;
  onFormulaSelect?: (formulaId: string) => void;
}> = ({
  formula,
  config = {},
  onFormulaSelect
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 合并默认配置
  const displayConfig: FormulaDisplayConfig = {
    showName: true,
    showDescription: true,
    showVariables: true,
    showApplications: true,
    showCopyButton: true,
    theme: 'dark',
    animationEnabled: true,
    fontSize: 16,
    formulaAlign: 'center',
    ...config
  };

  // 主题颜色映射
  const themeColors = {
    dark: {
      background: '#1e1b4b',
      border: '#4f46e5',
      text: '#e2e8f0',
      title: '#ffffff',
      formula: '#f0abfc',
      variable: '#60a5fa',
      application: '#86efac'
    },
    light: {
      background: '#ffffff',
      border: '#4f46e5',
      text: '#374151',
      title: '#1f2937',
      formula: '#7c3aed',
      variable: '#2563eb',
      application: '#16a34a'
    },
    neon: {
      background: '#0f172a',
      border: '#ec4899',
      text: '#e2e8f0',
      title: '#ffffff',
      formula: '#f472b6',
      variable: '#60a5fa',
      application: '#10b981'
    }
  };

  const colors = themeColors[displayConfig.theme];

  // 复制公式到剪贴板
  const copyFormula = () => {
    navigator.clipboard.writeText(formula.formula)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const formulaVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  // 渲染变量列表
  const renderVariables = () => {
    if (!displayConfig.showVariables || !formula.variables || formula.variables.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-variable" style={{ color: colors.variable }}>变量说明</h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
          {formula.variables.map((variable, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="font-mono font-medium" style={{ color: colors.variable }}>{variable.name}</span>
              <span className="flex-1" style={{ color: colors.text }}>{variable.description}</span>
              <span className="text-xs font-mono opacity-75" style={{ color: colors.text }}>({variable.unit})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染应用场景
  const renderApplications = () => {
    if (!displayConfig.showApplications || !formula.applications || formula.applications.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-application" style={{ color: colors.application }}>应用场景</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {formula.applications.map((app, index) => (
            <li key={index} style={{ color: colors.text }}>{app}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border shadow-lg cursor-pointer transition-all duration-300`}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={() => onFormulaSelect?.(formula.id)}
    >
      {/* 公式卡片头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: colors.border }}>
        {/* 公式名称 */}
        {displayConfig.showName && (
          <h3 className="text-lg font-bold" style={{ color: colors.title }}>
            {formula.name}
          </h3>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 复制按钮 */}
          {displayConfig.showCopyButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyFormula();
              }}
              className="p-1.5 rounded-full hover:bg-gray-700/50 transition-colors"
              title="复制公式"
            >
              {isCopied ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#86efac' }}>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.text }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}

          {/* 展开/折叠按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 rounded-full hover:bg-gray-700/50 transition-colors"
            title={isExpanded ? '折叠详情' : '展开详情'}
          >
            <svg className={`w-4 h-4 transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.text }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={`M19 9l-7 7-7-7 ${isExpanded ? 'M5 15l7 7 7-7' : 'M19 15l-7-7-7 7'}`} />
            </svg>
          </button>
        </div>
      </div>

      {/* 公式主体 */}
      <div className="p-6">
        {/* 公式 */}
        <motion.div
          className={`mb-4 overflow-x-auto`}
          variants={formulaVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: displayConfig.formulaAlign }}
        >
          <MathJax formula={formula.formula} fontSize={displayConfig.fontSize} color={colors.formula} />
        </motion.div>

        {/* 公式描述 */}
        {displayConfig.showDescription && (
          <p className="mb-4 text-sm" style={{ color: colors.text }}>
            {formula.description}
          </p>
        )}

        {/* 展开内容 */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {/* 变量说明 */}
          {renderVariables()}

          {/* 应用场景 */}
          {renderApplications()}
        </motion.div>

        {/* 分类标签 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: `${colors.border}20`, color: colors.border }}>
            {formula.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default FormulaDisplay;

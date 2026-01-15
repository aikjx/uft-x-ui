import React, { useState, useEffect } from 'react'
import MathJax from './MathJax'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 公式数据接口
 */
export interface FormulaData {
  id: string
  name: string
  category: string
  formula: string
  description: string
  variables: Array<{
    name: string
    description: string
    unit: string
  }>
  applications: string[]
}

/**
 * 公式显示配置
 */
export interface FormulaDisplayConfig {
  showName: boolean
  showDescription: boolean
  showVariables: boolean
  showApplications: boolean
  showCopyButton: boolean
  showCategory: boolean
  theme: 'dark' | 'light' | 'neon' | 'space'
  animationEnabled: boolean
  fontSize: number
  formulaAlign: 'left' | 'center' | 'right'
  cardShadow: boolean
  borderEffect: boolean
}

/**
 * 公式显示组件
 */
const FormulaDisplay: React.FC<{
  formula: FormulaData
  config?: Partial<FormulaDisplayConfig>
  onFormulaSelect?: (formulaId: string) => void
  isSelected?: boolean
}> = ({ formula, config = {}, onFormulaSelect, isSelected = false }) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // 合并默认配置
  const displayConfig: FormulaDisplayConfig = {
    showName: true,
    showDescription: true,
    showVariables: true,
    showApplications: true,
    showCopyButton: true,
    showCategory: true,
    theme: 'dark',
    animationEnabled: true,
    fontSize: 18,
    formulaAlign: 'center',
    cardShadow: true,
    borderEffect: true,
    ...config
  }

  // 主题颜色映射 - 新增space主题
  const themeColors = {
    dark: {
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      border: '#4f46e5',
      text: '#e2e8f0',
      title: '#ffffff',
      formula: '#f0abfc',
      variable: '#60a5fa',
      application: '#86efac',
      glow: '#4f46e5'
    },
    light: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
      border: '#4f46e5',
      text: '#374151',
      title: '#1f2937',
      formula: '#7c3aed',
      variable: '#2563eb',
      application: '#16a34a',
      glow: '#4f46e5'
    },
    neon: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: '#ec4899',
      text: '#e2e8f0',
      title: '#ffffff',
      formula: '#f472b6',
      variable: '#60a5fa',
      application: '#10b981',
      glow: '#ec4899'
    },
    space: {
      background: 'linear-gradient(135deg, #050508 0%, #0a0a1a 50%, #151530 100%)',
      border: '#3b82f6',
      text: '#bfdbfe',
      title: '#ffffff',
      formula: '#93c5fd',
      variable: '#60a5fa',
      application: '#34d399',
      glow: '#3b82f6'
    }
  }

  const colors = themeColors[displayConfig.theme]

  // 复制公式到剪贴板
  const copyFormula = () => {
    navigator.clipboard
      .writeText(formula.formula)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => {
        console.error('复制失败:', err)
      })
  }

  // 动画变体 - 增强动画效果
  const containerVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: displayConfig.cardShadow
        ? `0 20px 60px -10px ${colors.glow}40`
        : '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    selected: {
      scale: 1.05,
      boxShadow: `0 25px 70px -15px ${colors.glow}60`,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const formulaVariants = {
    hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        delay: 0.2,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { scale: 1.2, rotate: 5 },
    tap: { scale: 0.95, rotate: -5 }
  }

  // 渲染变量列表
  const renderVariables = () => {
    if (!displayConfig.showVariables || !formula.variables || formula.variables.length === 0) {
      return null
    }

    return (
      <motion.div className="mt-6 space-y-3" variants={itemVariants}>
        <motion.h4
          className="text-sm font-bold uppercase tracking-wide"
          style={{ color: colors.variable }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          变量说明
        </motion.h4>
        <div className="grid grid-cols-1 gap-3 text-sm">
          {formula.variables.map((variable, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 rounded-lg bg-opacity-10 p-3 backdrop-blur-sm"
              style={{ backgroundColor: `${colors.border}10` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{
                backgroundColor: `${colors.border}20`,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <span className="font-mono text-lg font-bold" style={{ color: colors.variable }}>
                {variable.name}
              </span>
              <div className="flex-1">
                <span className="block" style={{ color: colors.text }}>
                  {variable.description}
                </span>
                <span
                  className="mt-1 block font-mono text-xs opacity-75"
                  style={{ color: colors.text }}
                >
                  ({variable.unit})
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  // 渲染应用场景
  const renderApplications = () => {
    if (
      !displayConfig.showApplications ||
      !formula.applications ||
      formula.applications.length === 0
    ) {
      return null
    }

    return (
      <motion.div className="mt-6 space-y-3" variants={itemVariants}>
        <motion.h4
          className="text-sm font-bold uppercase tracking-wide"
          style={{ color: colors.application }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          应用场景
        </motion.h4>
        <ul className="space-y-2 text-sm">
          {formula.applications.map((app, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-3 rounded-lg p-2"
              style={{ color: colors.text }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{
                x: 5,
                transition: { duration: 0.2 }
              }}
            >
              <motion.span
                className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${colors.application}20`, color: colors.application }}
                variants={iconVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {index + 1}
              </motion.span>
              <span>{app}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    )
  }

  // 动态样式计算
  const cardStyle: React.CSSProperties = {
    background: colors.background,
    borderColor: colors.border,
    boxShadow: displayConfig.cardShadow ? `0 10px 30px -5px rgba(0, 0, 0, 0.3)` : 'none',
    position: 'relative',
    overflow: 'hidden'
  }

  // 边框发光效果
  const borderEffect = displayConfig.borderEffect && (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{
        borderRadius: 'inherit',
        padding: '1px',
        background: `linear-gradient(45deg, ${colors.glow}, transparent, ${colors.glow})`,
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        opacity: isHovered || isSelected ? 0.8 : 0.3,
        transition: 'opacity 0.3s ease'
      }}
      animate={{
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )

  return (
    <motion.div
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300`}
      style={cardStyle}
      variants={containerVariants}
      initial="hidden"
      animate={isSelected ? 'selected' : 'visible'}
      whileHover={!isSelected ? 'hover' : 'selected'}
      whileTap={!isSelected ? { scale: 0.98 } : {}}
      onClick={() => onFormulaSelect?.(formula.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 边框发光效果 */}
      {borderEffect}

      {/* 背景装饰 */}
      <div
        className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-opacity-10 blur-3xl"
        style={{ backgroundColor: colors.glow }}
      />
      <div
        className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-opacity-10 blur-3xl"
        style={{ backgroundColor: colors.variable }}
      />

      {/* 公式卡片头部 */}
      <motion.div
        className="relative flex items-center justify-between border-b bg-opacity-50 px-6 py-4 backdrop-blur-sm"
        style={{ borderColor: `${colors.border}40` }}
      >
        {/* 公式名称 */}
        {displayConfig.showName && (
          <motion.h3
            className="text-xl font-bold tracking-tight"
            style={{ color: colors.title }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {formula.name}
          </motion.h3>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 复制按钮 */}
          {displayConfig.showCopyButton && (
            <motion.button
              onClick={e => {
                e.stopPropagation()
                copyFormula()
              }}
              className="relative overflow-hidden rounded-full p-2 transition-all duration-300 hover:bg-opacity-20"
              style={{ backgroundColor: `${colors.border}10` }}
              title="复制公式"
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <AnimatePresence mode="wait">
                {isCopied ? (
                  <motion.svg
                    key="check"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: '#34d399' }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="copy"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: colors.text }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* 展开/折叠按钮 */}
          <motion.button
            onClick={e => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="rounded-full p-2 transition-all duration-300 hover:bg-opacity-20"
            style={{ backgroundColor: `${colors.border}10` }}
            title={isExpanded ? '折叠详情' : '展开详情'}
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <motion.svg
              className={`h-5 w-5 transition-transform duration-500`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: colors.text }}
              animate={{ rotate: isExpanded ? 180 : 0 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </motion.button>
        </div>
      </motion.div>

      {/* 公式主体 */}
      <div className="relative p-6">
        {/* 公式 */}
        <motion.div
          className={`mb-4 overflow-x-auto py-2`}
          variants={formulaVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: displayConfig.formulaAlign }}
        >
          <MathJax
            formula={formula.formula}
            fontSize={displayConfig.fontSize}
            color={colors.formula}
          />
        </motion.div>

        {/* 公式描述 */}
        {displayConfig.showDescription && (
          <motion.p
            className="mb-4 text-sm leading-relaxed"
            style={{ color: colors.text }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {formula.description}
          </motion.p>
        )}

        {/* 展开内容 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: 'auto',
                opacity: 1
              }}
              exit={{
                height: 0,
                opacity: 0
              }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="overflow-hidden"
            >
              {/* 变量说明 */}
              {renderVariables()}

              {/* 应用场景 */}
              {renderApplications()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 分类标签 */}
        {displayConfig.showCategory && (
          <motion.div
            className="mt-6 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span
              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
              style={{
                backgroundColor: `${colors.border}20`,
                color: colors.border,
                border: `1px solid ${colors.border}40`
              }}
            >
              {formula.category}
            </span>
            {formula.physicalDimension && (
              <span
                className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: `${colors.variable}20`,
                  color: colors.variable,
                  border: `1px solid ${colors.variable}40`
                }}
              >
                量纲: {formula.physicalDimension}
              </span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default FormulaDisplay

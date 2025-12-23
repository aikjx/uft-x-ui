import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MathJax } from '../components/MathJax'
import { ANIMATION_VARIANTS } from '../constants'
import { cn } from '../utils'

// 使用全局动画变体常量
const { containerVariants, itemVariants, formulaVariants } = ANIMATION_VARIANTS

const KnowledgePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('basics')
  const [showContent, setShowContent] = useState(true)
  const navigate = useNavigate()

  // 使用useMemo缓存数据，避免不必要的重新渲染
  const theoryContent = useMemo(
    () => ({
      basics: {
        title: '统一场论基础概念',
        content: [
          {
            heading: '什么是统一场论？',
            text: '统一场论是物理学的前沿理论，旨在将自然界的四种基本力（引力、电磁力、强核力和弱核力）统一到一个完整的理论框架中。张祥前统一场论提出了19个核心公式，揭示了空间运动与物理现象之间的内在联系。',
            icon: '🌐'
          },
          {
            heading: '空间的本质',
            text: '根据统一场论，空间是一种特殊的物质形式，具有以下基本属性：1) 空间可以运动；2) 空间的运动可以产生各种物理现象；3) 空间本身是连续的、无限的；4) 空间的运动遵循特定的规律。',
            icon: '📐'
          },
          {
            heading: '时间的本质',
            text: '时间是空间本身的运动，而不是独立于空间的存在。时间的流逝是由于空间以光速向四周扩张运动所导致的。这一观点打破了牛顿的绝对时空观。',
            icon: '⏱️'
          }
        ]
      },
      formulas: {
        title: '核心公式解析',
        content: [
          {
            heading: '时空同一化方程',
            text: '这个方程揭示了时间和空间的本质联系。时间可以表示为空间以光速运动的积累。',
            icon: '📈',
            formula: '\\vec{r}(t) = \\vec{C}t'
          },
          {
            heading: '宇宙大统一方程',
            text: '这个方程统一了四种基本力，揭示了力的本质是空间运动状态的变化。',
            icon: '🔄',
            formula:
              'F = \\frac{dP}{dt} = C \\cdot \\frac{dm}{dt} - V \\cdot \\frac{dm}{dt} + m \\cdot \\frac{dC}{dt} - m \\cdot \\frac{dV}{dt}'
          },
          {
            heading: '统一场论能量方程',
            text: '这个方程扩展了爱因斯坦的质能方程，更加全面地描述了能量与质量的关系。',
            icon: '⚡',
            formula: 'e = m_0c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}'
          }
        ]
      },
      applications: {
        title: '应用领域',
        content: [
          {
            heading: '光速飞行器',
            text: '基于统一场论的光速飞行器可以通过人工场技术改变自身质量，从而实现接近光速甚至超光速的飞行。',
            icon: '🚀'
          },
          {
            heading: '人工场扫描技术',
            text: '人工场可以作为一种超精密的扫描工具，应用于医疗诊断、材料分析等领域。',
            icon: '🔍'
          },
          {
            heading: '能源革命',
            text: '统一场论揭示了质量与能量的深层关系，有望带来新的能源技术突破。',
            icon: '💡'
          }
        ]
      },
      history: {
        title: '理论发展历程',
        content: [
          {
            heading: '早期探索',
            text: '爱因斯坦晚年致力于统一场论研究，但未能完成。20世纪后期，弦理论、超弦理论等试图统一四种基本力。',
            icon: '🧠'
          },
          {
            heading: '张祥前统一场论',
            text: '张祥前经过数十年研究，提出了独特的统一场论体系，从空间的基本属性出发，推导出19个核心公式。',
            icon: '📝'
          },
          {
            heading: '现代进展',
            text: '随着物理学和计算机技术的发展，统一场论的研究方法和验证手段不断丰富。',
            icon: '💻'
          }
        ]
      }
    }),
    []
  )

  // 使用useMemo缓存教程数据
  const tutorials = useMemo(
    () => [
      {
        id: 1,
        title: '统一场论入门',
        level: '初级',
        duration: '45分钟',
        description: '了解统一场论的基本概念和核心思想',
        gradient: 'from-blue-600/30 to-blue-900/30',
        icon: '🎓'
      },
      {
        id: 2,
        title: '时空方程详解',
        level: '中级',
        duration: '60分钟',
        description: '深入理解时空同一化方程和三维螺旋时空方程',
        gradient: 'from-purple-600/30 to-purple-900/30',
        icon: '📊'
      },
      {
        id: 3,
        title: '场方程与相互作用',
        level: '高级',
        duration: '90分钟',
        description: '详细解析引力场、电磁场的定义方程及其相互转化关系',
        gradient: 'from-indigo-600/30 to-indigo-900/30',
        icon: '⚛️'
      }
    ],
    []
  )

  return (
    <div className="page-container">
      <motion.div
        className="relative m-0 flex h-full w-full flex-col bg-[#0a0a14] p-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 顶部导航栏 - 固定在顶部，半透明设计 */}
        <div className="absolute left-0 right-0 top-0 z-50 bg-gradient-to-b from-[#0a0a14]/80 to-transparent p-2 backdrop-blur-md">
          <motion.h1
            className="text-center text-2xl font-bold text-blue-300 md:text-3xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            统一场论知识学习中心
          </motion.h1>
        </div>

        {/* 内容显示控制按钮 */}
        <div className="absolute right-2 top-2 z-40">
          <motion.button
            onClick={() => setShowContent(!showContent)}
            className="rounded-md bg-blue-900/50 px-3 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-blue-800/70"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showContent ? '隐藏内容' : '显示内容'}
          </motion.button>
        </div>

        {/* 知识学习内容 - 可折叠设计 */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              className="absolute inset-0 z-30 overflow-y-auto bg-gradient-to-b from-[#0a0a14]/70 to-[#0a0a14]/95 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container mx-auto max-w-6xl">
                {/* 理论讲解部分 */}
                <motion.section className="mb-12" variants={itemVariants}>
                  <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-blue-200">
                    <span className="inline-block h-6 w-2 rounded-full bg-blue-500"></span>
                    理论讲解
                  </h2>

                  {/* 理论讲解标签页 - 改进样式和交互 */}
                  <div className="mb-6 flex flex-wrap gap-3">
                    {Object.keys(theoryContent).map(key => (
                      <motion.button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className={cn(
                          `flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-300 ${activeSection === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'bg-blue-900/30 text-blue-200 hover:bg-blue-800/40 hover:shadow-md hover:shadow-blue-900/20'}`
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>
                          {theoryContent[key as keyof typeof theoryContent].content[0].icon}
                        </span>
                        {theoryContent[key as keyof typeof theoryContent].title}
                      </motion.button>
                    ))}
                  </div>

                  {/* 理论讲解内容 - 增强视觉效果 */}
                  <motion.div
                    className={cn(
                      'rounded-xl border border-blue-900/30 bg-[#121228] p-4 shadow-lg shadow-blue-900/5 md:p-6'
                    )}
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)' }}
                  >
                    <h3 className="mb-6 flex items-center gap-2 border-b border-blue-800/50 pb-3 text-xl font-bold text-blue-300">
                      <span className="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
                      {theoryContent[activeSection as keyof typeof theoryContent].title}
                    </h3>
                    <div className="space-y-6">
                      {theoryContent[activeSection as keyof typeof theoryContent].content.map(
                        (item, index) => (
                          <motion.div
                            key={index}
                            className="flex gap-3 md:gap-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <div className="mt-0.5 min-w-[30px] text-xl">{item.icon}</div>
                            <div>
                              <h4 className="mb-2 text-base font-semibold text-blue-200 md:text-lg">
                                {item.heading}
                              </h4>
                              {'formula' in item && item.formula && (
                                <motion.div
                                  className={cn(
                                    'mb-3 rounded-lg border border-blue-800/30 bg-[#0a0a14] p-2 md:p-3'
                                  )}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.6 }}
                                >
                                  <MathJax formula={item.formula} />
                                </motion.div>
                              )}
                              <p className="text-sm leading-relaxed text-blue-100/80 md:text-base">
                                {item.text}
                              </p>
                            </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  </motion.div>
                </motion.section>

                {/* 可视化教程部分 - 改进卡片设计和交互 */}
                <motion.section className="mb-12" variants={itemVariants}>
                  <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-blue-200">
                    <span className="inline-block h-6 w-2 rounded-full bg-blue-500"></span>
                    可视化教程
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {tutorials.map(tutorial => (
                      <motion.div
                        key={tutorial.id}
                        className={cn(
                          'overflow-hidden rounded-xl border border-blue-900/30 bg-[#121228] transition-all duration-300 hover:border-blue-500/50'
                        )}
                        whileHover={{
                          y: -5,
                          boxShadow: '0 15px 30px -10px rgba(59, 130, 246, 0.2)'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className={`h-32 bg-gradient-to-r ${tutorial.gradient} relative flex items-center justify-center overflow-hidden`}
                        >
                          <div className="z-10 text-4xl">{tutorial.icon}</div>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
                        </div>
                        <div className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="rounded bg-blue-900/50 px-2 py-1 text-xs font-medium text-blue-300">
                              {tutorial.level}
                            </span>
                            <span className="text-xs text-blue-400">{tutorial.duration}</span>
                          </div>
                          <h3 className="mb-2 text-base font-bold text-blue-200">
                            {tutorial.title}
                          </h3>
                          <p className="mb-4 text-xs text-blue-100/70">{tutorial.description}</p>
                          <motion.button
                            onClick={() => navigate(`/formulas`)}
                            className={cn(
                              'w-full rounded-lg bg-blue-600 py-2 text-xs text-white transition-colors duration-300 hover:bg-blue-700'
                            )}
                            whileHover={{ backgroundColor: 'rgba(37, 99, 235, 0.8)' }}
                            whileTap={{ scale: 0.97 }}
                          >
                            开始学习
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* 科学实验模拟 - 增强视觉设计 */}
                <motion.section variants={itemVariants}>
                  <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-blue-200">
                    <span className="inline-block h-6 w-2 rounded-full bg-blue-500"></span>
                    科学实验模拟
                  </h2>
                  <motion.div
                    className={cn(
                      'rounded-xl border border-blue-900/30 bg-[#121228] p-4 shadow-lg shadow-blue-900/5 md:p-6'
                    )}
                    whileHover={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-blue-200">
                          <span>🔬</span>
                          虚拟物理实验
                        </h3>
                        <p className="mb-4 leading-relaxed text-blue-100/80">
                          通过我们的虚拟实验环境，您可以：
                        </p>
                        <ul className="mb-5 list-none space-y-2">
                          {[
                            '模拟空间运动对物理现象的影响',
                            '验证统一场论核心公式',
                            '探索不同参数下的物理效应',
                            '记录和分析实验数据'
                          ].map((item, index) => (
                            <motion.li
                              key={index}
                              className="flex items-start gap-2 text-blue-100/70"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-900/50 text-xs text-blue-300">
                                {index + 1}
                              </span>
                              <span className="text-sm">{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                        <motion.button
                          onClick={() => navigate('/interactive')}
                          className={cn(
                            'flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-blue-700'
                          )}
                          whileHover={{
                            scale: 1.03,
                            boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
                          }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span>🚀</span>
                          进入实验环境
                        </motion.button>
                      </div>
                      <motion.div
                        className="relative flex items-center justify-center overflow-hidden rounded-xl border border-blue-800/30 bg-[#0a0a14] p-6"
                        whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
                      >
                        <div className="z-10 text-center">
                          <div className="mb-4 text-5xl">🔬</div>
                          <h4 className="mb-2 text-xl font-bold text-blue-300">
                            交互式物理实验平台
                          </h4>
                          <p className="text-xs text-blue-400">实时数据采集与分析</p>
                        </div>
                        {/* 装饰元素 */}
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-600/10 blur-3xl"></div>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default KnowledgePage

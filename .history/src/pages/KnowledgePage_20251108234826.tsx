import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MathJax } from '../components/MathJax';
import { ANIMATION_VARIANTS } from '../constants';
import { cn } from '../utils';

// 使用全局动画变体常量
const { containerVariants, itemVariants, formulaVariants } = ANIMATION_VARIANTS;

const KnowledgePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('basics');
  const navigate = useNavigate();

  // 使用useMemo缓存数据，避免不必要的重新渲染
  const theoryContent = useMemo(() => ({
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
        {{{
          heading: '时空同一化方程',
          text: '这个方程揭示了时间和空间的本质联系。时间可以表示为空间以光速运动的积累。',
          icon: '📈',
          formula: '\\vec{r}(t) = \\vec{C}t'
        }},{{
          heading: '宇宙大统一方程',
          text: '这个方程统一了四种基本力，揭示了力的本质是空间运动状态的变化。',
          icon: '🔄',
          formula: 'F = \\frac{dP}{dt} = C \\cdot \\frac{dm}{dt} - V \\cdot \\frac{dm}{dt} + m \\cdot \\frac{dC}{dt} - m \\cdot \\frac{dV}{dt}'
        }},{
        {{{
          heading: '统一场论能量方程',
          text: '这个方程扩展了爱因斯坦的质能方程，更加全面地描述了能量与质量的关系。',
          icon: '⚡',
          formula: 'e = m_0c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}'
        }}}
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
  }), []);

  // 使用useMemo缓存教程数据
  const tutorials = useMemo(() => [
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
  ], []);

  return (
    <PageContainer>
      <motion.div
        className="relative w-full min-h-[calc(100vh-8rem)] flex flex-col bg-[#0a0a14] py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container px-4 mx-auto">
          <motion.h1
            className="mb-12 text-3xl font-bold text-center text-blue-300 md:text-4xl"
            variants={itemVariants}
          >
            统一场论知识学习中心
          </motion.h1>

          {/* 理论讲解部分 */}
          <motion.section
            className="mb-16"
            variants={itemVariants}
          >
            <h2 className="flex gap-2 items-center mb-6 text-2xl font-bold text-blue-200">
              <span className="inline-block w-2 h-6 bg-blue-500 rounded-full"></span>
              理论讲解
            </h2>
            
            {/* 理论讲解标签页 - 改进样式和交互 */}
            <div className="flex flex-wrap gap-3 mb-8">
              {Object.keys(theoryContent).map((key) => (
                <motion.button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={cn(`px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 ${activeSection === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'bg-blue-900/30 text-blue-200 hover:bg-blue-800/40 hover:shadow-md hover:shadow-blue-900/20'}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{theoryContent[key as keyof typeof theoryContent].content[0].icon}</span>
                  {theoryContent[key as keyof typeof theoryContent].title}
                </motion.button>
              ))}
            </div>

            {/* 理论讲解内容 - 增强视觉效果 */}
            <motion.div
              className={cn("bg-[#121228] rounded-xl p-6 border border-blue-900/30 shadow-lg shadow-blue-900/5")}
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)' }}
            >
              <h3 className="flex gap-2 items-center pb-3 mb-6 text-xl font-bold text-blue-300 border-b border-blue-800/50">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                {theoryContent[activeSection as keyof typeof theoryContent].title}
              </h3>
              <div className="space-y-8">
                {theoryContent[activeSection as keyof typeof theoryContent].content.map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-2xl mt-1 min-w-[40px]">{item.icon}</div>
                    <div>
                      <h4 className="mb-3 text-lg font-semibold text-blue-200">{item.heading}</h4>
                      {item.formula && (
                        <motion.div 
                          className={cn("mb-3 p-3 bg-[#0a0a14] rounded-lg border border-blue-800/30")}
                          variants={formulaVariants}
                        >
                          <MathJax formula={item.formula} />
                        </motion.div>
                      )}
                      <p className="leading-relaxed text-blue-100/80">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.section>

          {/* 可视化教程部分 - 改进卡片设计和交互 */}
          <motion.section
            className="mb-16"
            variants={itemVariants}
          >
            <h2 className="flex gap-2 items-center mb-6 text-2xl font-bold text-blue-200">
              <span className="inline-block w-2 h-6 bg-blue-500 rounded-full"></span>
              可视化教程
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {tutorials.map((tutorial) => (
                <motion.div
                  key={tutorial.id}
                  className={cn("bg-[#121228] rounded-xl overflow-hidden border border-blue-900/30 hover:border-blue-500/50 transition-all duration-300")}
                  whileHover={{ y: -8, boxShadow: '0 15px 30px -10px rgba(59, 130, 246, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`h-40 bg-gradient-to-r ${tutorial.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="z-10 text-5xl">{tutorial.icon}</div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2 py-1 text-xs font-medium text-blue-300 rounded bg-blue-900/50">{tutorial.level}</span>
                      <span className="text-xs text-blue-400">{tutorial.duration}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-blue-200">{tutorial.title}</h3>
                    <p className="mb-4 text-sm text-blue-100/70">{tutorial.description}</p>
                    <motion.button
                      onClick={() => navigate(`/formulas`)}
                      className={cn("w-full py-2.5 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-800/40 transition-colors duration-300")}
                      whileHover={{ backgroundColor: 'rgba(37, 99, 235, 0.3)' }}
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
          <motion.section
            variants={itemVariants}
          >
            <h2 className="flex gap-2 items-center mb-6 text-2xl font-bold text-blue-200">
              <span className="inline-block w-2 h-6 bg-blue-500 rounded-full"></span>
              科学实验模拟
            </h2>
            <motion.div
              className={cn("bg-[#121228] rounded-xl p-6 border border-blue-900/30 shadow-lg shadow-blue-900/5")}
              whileHover={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 gap-8 items-center md:grid-cols-2">
                <div>
                  <h3 className="flex gap-2 items-center mb-4 text-xl font-semibold text-blue-200">
                    <span>🔬</span>
                    虚拟物理实验
                  </h3>
                  <p className="mb-5 leading-relaxed text-blue-100/80">
                    通过我们的虚拟实验环境，您可以：
                  </p>
                  <ul className="mb-6 space-y-3 list-none">
                    {[
                      '模拟空间运动对物理现象的影响',
                      '验证统一场论核心公式',
                      '探索不同参数下的物理效应',
                      '记录和分析实验数据'
                    ].map((item, index) => (
                      <motion.li 
                        key={index} 
                        className="flex gap-3 items-start text-blue-100/70"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-900/50 text-blue-300 text-xs mt-0.5">{index + 1}</span>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.button
                    onClick={() => navigate('/interactive')}
                    className={cn("flex gap-2 items-center px-6 py-3 text-white bg-blue-600 rounded-lg transition-colors duration-300 hover:bg-blue-700")}
                    whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>🚀</span>
                    进入实验环境
                  </motion.button>
                </div>
                <motion.div 
                  className="bg-[#0a0a14] rounded-xl p-8 border border-blue-800/30 flex items-center justify-center relative overflow-hidden"
                  whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
                >
                  <div className="z-10 text-center">
                    <div className="mb-6 text-7xl">🔬</div>
                    <h4 className="mb-2 text-xl font-bold text-blue-300">交互式物理实验平台</h4>
                    <p className="text-sm text-blue-400">实时数据采集与分析</p>
                  </div>
                  {/* 装饰元素 */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl bg-blue-600/10"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl bg-purple-600/10"></div>
                </motion.div>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default KnowledgePage;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const KnowledgePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('basics');
  const navigate = useNavigate();

  // 理论讲解内容
  const theoryContent = {
    basics: {
      title: '统一场论基础概念',
      content: [
        {
          heading: '什么是统一场论？',
          text: '统一场论是物理学的前沿理论，旨在将自然界的四种基本力（引力、电磁力、强核力和弱核力）统一到一个完整的理论框架中。张祥前统一场论提出了19个核心公式，揭示了空间运动与物理现象之间的内在联系。'
        },
        {
          heading: '空间的本质',
          text: '根据统一场论，空间是一种特殊的物质形式，具有以下基本属性：1) 空间可以运动；2) 空间的运动可以产生各种物理现象；3) 空间本身是连续的、无限的；4) 空间的运动遵循特定的规律。'
        },
        {
          heading: '时间的本质',
          text: '时间是空间本身的运动，而不是独立于空间的存在。时间的流逝是由于空间以光速向四周扩张运动所导致的。这一观点打破了牛顿的绝对时空观。'
        }
      ]
    },
    formulas: {
      title: '核心公式解析',
      content: [
        {
          heading: '时空同一化方程',
          text: 'r(t) = Ct，这个方程揭示了时间和空间的本质联系。时间可以表示为空间以光速运动的积累。'
        },
        {
          heading: '宇宙大统一方程',
          text: 'F = dP/dt = C·dm/dt - V·dm/dt + m·dC/dt - m·dV/dt，这个方程统一了四种基本力，揭示了力的本质是空间运动状态的变化。'
        },
        {
          heading: '统一场论能量方程',
          text: 'e = m₀c² = mc²√(1 - v²/c²)，这个方程扩展了爱因斯坦的质能方程，更加全面地描述了能量与质量的关系。'
        }
      ]
    },
    applications: {
      title: '应用领域',
      content: [
        {
          heading: '光速飞行器',
          text: '基于统一场论的光速飞行器可以通过人工场技术改变自身质量，从而实现接近光速甚至超光速的飞行。'
        },
        {
          heading: '人工场扫描技术',
          text: '人工场可以作为一种超精密的扫描工具，应用于医疗诊断、材料分析等领域。'
        },
        {
          heading: '能源革命',
          text: '统一场论揭示了质量与能量的深层关系，有望带来新的能源技术突破。'
        }
      ]
    },
    history: {
      title: '理论发展历程',
      content: [
        {
          heading: '早期探索',
          text: '爱因斯坦晚年致力于统一场论研究，但未能完成。20世纪后期，弦理论、超弦理论等试图统一四种基本力。'
        },
        {
          heading: '张祥前统一场论',
          text: '张祥前经过数十年研究，提出了独特的统一场论体系，从空间的基本属性出发，推导出19个核心公式。'
        },
        {
          heading: '现代进展',
          text: '随着物理学和计算机技术的发展，统一场论的研究方法和验证手段不断丰富。'
        }
      ]
    }
  };

  // 教程内容
  const tutorials = [
    {
      id: 1,
      title: '统一场论入门',
      level: '初级',
      duration: '45分钟',
      description: '了解统一场论的基本概念和核心思想',
      image: 'tutorial1.jpg'
    },
    {
      id: 2,
      title: '时空方程详解',
      level: '中级',
      duration: '60分钟',
      description: '深入理解时空同一化方程和三维螺旋时空方程',
      image: 'tutorial2.jpg'
    },
    {
      id: 3,
      title: '场方程与相互作用',
      level: '高级',
      duration: '90分钟',
      description: '详细解析引力场、电磁场的定义方程及其相互转化关系',
      image: 'tutorial3.jpg'
    }
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#0a0a14]">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          统一场论知识学习中心
        </motion.h1>

        {/* 理论讲解部分 */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-blue-200 mb-6">理论讲解</h2>
          
          {/* 理论讲解标签页 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.keys(theoryContent).map((key) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`px-4 py-2 rounded-full transition-all ${activeSection === key ? 'bg-blue-600 text-white' : 'bg-blue-900/30 text-blue-200 hover:bg-blue-800/40'}`}
              >
                {theoryContent[key as keyof typeof theoryContent].title}
              </button>
            ))}
          </div>

          {/* 理论讲解内容 */}
          <motion.div
            className="bg-[#121228] rounded-xl p-6 border border-blue-900/30"
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-bold text-blue-300 mb-4">
              {theoryContent[activeSection as keyof typeof theoryContent].title}
            </h3>
            <div className="space-y-6">
              {theoryContent[activeSection as keyof typeof theoryContent].content.map((item, index) => (
                <div key={index}>
                  <h4 className="text-lg font-semibold text-blue-200 mb-2">{item.heading}</h4>
                  <p className="text-blue-100/80">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* 可视化教程部分 */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-blue-200 mb-6">可视化教程</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <motion.div
                key={tutorial.id}
                className="bg-[#121228] rounded-xl overflow-hidden border border-blue-900/30 hover:border-blue-500/50 transition-all"
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)' }}
              >
                <div className="h-40 bg-gradient-to-r from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                  <div className="text-4xl">🎓</div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-900/50 text-blue-300">{tutorial.level}</span>
                    <span className="text-xs text-blue-400">{tutorial.duration}</span>
                  </div>
                  <h3 className="text-lg font-bold text-blue-200 mb-2">{tutorial.title}</h3>
                  <p className="text-blue-100/70 text-sm mb-4">{tutorial.description}</p>
                  <button
                    onClick={() => navigate(`/formulas`)} // 假设有教程详情页
                    className="w-full py-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-800/40 transition-colors"
                  >
                    开始学习
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 科学实验模拟 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-blue-200 mb-6">科学实验模拟</h2>
          <div className="bg-[#121228] rounded-xl p-6 border border-blue-900/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-200 mb-3">虚拟物理实验</h3>
                <p className="text-blue-100/80 mb-4">
                  通过我们的虚拟实验环境，您可以：
                </p>
                <ul className="list-disc list-inside text-blue-100/70 space-y-2">
                  <li>模拟空间运动对物理现象的影响</li>
                  <li>验证统一场论核心公式</li>
                  <li>探索不同参数下的物理效应</li>
                  <li>记录和分析实验数据</li>
                </ul>
                <button
                  onClick={() => navigate('/interactive')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  进入实验环境
                </button>
              </div>
              <div className="bg-[#0a0a14] rounded-lg p-4 border border-blue-800/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔬</div>
                  <p className="text-blue-200">交互式物理实验平台</p>
                  <p className="text-blue-400 text-sm mt-2">实时数据采集与分析</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default KnowledgePage;

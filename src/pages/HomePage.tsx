import React, { useMemo } from 'react';
import { motion, easeOut } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

// 类型定义
interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  link: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

interface SimulationDataPoint {
  value: number;
  index: number;
}

// 配置常量 - 增强渐变配置
const FEATURES: FeatureItem[] = [
  {
    icon: '📐',
    title: '核心公式3D可视化',
    description: '将19个核心公式转化为直观的3D交互模型，让抽象的物理概念变得清晰可见',
    link: '/formulas',
    color: 'from-blue-500 to-cyan-500',
    gradientFrom: 'rgb(59, 130, 246)',
    gradientTo: 'rgb(34, 211, 238)'
  },
  {
    icon: '🛸',
    title: '人工场技术模拟',
    description: '可视化展示人工场技术原理及其应用场景，探索未来科技的无限可能',
    link: '/artificial-field',
    color: 'from-purple-500 to-indigo-500',
    gradientFrom: 'rgb(168, 85, 247)',
    gradientTo: 'rgb(99, 102, 241)'
  },
  {
    icon: '🔍',
    title: '交互式探索系统',
    description: '通过直观的交互界面，调整参数，实时观察物理现象的变化',
    link: '/interactive',
    color: 'from-blue-600 to-blue-400',
    gradientFrom: 'rgb(37, 99, 235)',
    gradientTo: 'rgb(96, 165, 250)'
  }
];

// 通用动画变体 - 增强动画配置
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: custom * 0.1,
      ease: easeOut
    }
  })
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// 卡片悬停动画变体
const cardHoverVariants = {
  initial: {
    y: 0,
    boxShadow: '0 0 0 rgba(59, 130, 246, 0.1)'
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 25px -5px rgba(74, 108, 247, 0.1), 0 10px 10px -5px rgba(74, 108, 247, 0.04)',
    transition: {
      duration: 0.3,
      ease: easeOut
    }
  }
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // 使用useMemo缓存模拟数据生成结果
  const simulationData = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => ({
      value: Math.sin(i * 0.1) * 50 + 50 + Math.random() * 10,
      index: i
    })), []
  );

  return (
      <div className="relative">

        {/* 英雄区 - 增强视觉效果 */}
        <motion.section
          className="flex relative z-10 flex-col justify-center items-center px-4 py-16 text-center md:px-8 md:py-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* 装饰元素 - 增强渐变和动画效果 */}
          <motion.div 
            className="flex absolute inset-0 justify-center items-center opacity-5"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 2, delay: 0.5 }}
          >
            <div className="w-[800px] h-[800px] rounded-full border-8 border-blue-500"></div>
          </motion.div>
          
          {/* 增强的光晕效果 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[80px]"></div>
          
          <motion.h1
            className="text-4xl md:text-6xl lg:text-[clamp(2.5rem,6vw,4.5rem)] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6 leading-tight relative z-10"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            统一场论人工场
            <br />
            <span className="text-3xl md:text-5xl">3D可视化平台</span>
          </motion.h1>
          
          <motion.p
            className="relative z-10 mb-8 max-w-3xl text-lg text-blue-100 md:text-xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            探索宇宙本质规律，将张祥前统一场论的19个核心公式转化为震撼人心的3D交互体验
          </motion.p>

          <motion.div
            className="flex relative z-10 flex-col gap-4 mb-12 sm:flex-row"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.button
              onClick={() => navigate('/formulas')}
              className="px-8 py-3 font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/30"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              探索核心公式
            </motion.button>
            <motion.button
              onClick={() => navigate('/interactive')}
              className="px-8 py-3 font-medium text-blue-300 bg-transparent rounded-full border border-blue-400 transition-all hover:bg-blue-900/20"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(96, 165, 250, 0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              交互式体验
            </motion.button>
          </motion.div>

          {/* 实时模拟指示器 */}
          <motion.div
            className="flex relative z-10 gap-2 items-center text-blue-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            <span>实时物理模拟中</span>
          </motion.div>
        </motion.section>

        {/* 功能展示区 - 改进深度和交互效果 */}
        <section className="relative z-10 bg-gradient-to-b from-transparent to-[#0a0a14]/90 py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.h2
              className="mb-16 text-3xl font-bold text-center text-blue-100 md:text-4xl"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              custom={0}
            >
              革命性的可视化体验
            </motion.h2>

            <motion.div 
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUpVariants}
                  custom={index}
                  className="bg-gradient-to-br from-[#1e1e3f] to-[#151525] rounded-xl p-6 border border-blue-900/30 hover:border-blue-500/50 transition-all duration-300 h-full flex flex-col group relative overflow-hidden"
                  whileHover={{ 
                    ...cardHoverVariants.hover,
                    borderColor: 'rgba(59, 130, 246, 0.5)'
                  }}
                >
                  {/* 增强的装饰效果 */}
                  <motion.div 
                    className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`}
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                  
                  {/* 卡片内发光效果 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent pointer-events-none to-black/20"></div>
                  
                  <div className="flex relative z-10 flex-col h-full">
                    <motion.div 
                      className="mb-4 text-4xl"
                      initial={{ rotate: -5 }}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="mb-3 text-xl font-bold text-blue-200">{feature.title}</h3>
                    <p className="flex-grow mb-6 leading-relaxed text-blue-100/70">{feature.description}</p>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => navigate(feature.link)}
                        className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.color} hover:text-blue-300 flex items-center gap-2 transition-all duration-300 group-hover:underline`}
                      >
                        <span>了解更多</span>
                        <svg className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 实时数据展示区 - 增强视觉设计和响应式 */}
        <section className="relative z-10 py-20 px-4 bg-[#0a0a14]">
          <div className="container mx-auto max-w-7xl">
            <motion.h2
              className="mb-16 text-3xl font-bold text-center text-blue-100 md:text-4xl"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              custom={0}
            >
              实时物理模拟数据
            </motion.h2>

            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              custom={1}
              className="bg-[#121228] rounded-xl p-4 md:p-8 border border-blue-900/30 shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden"
            >
              {/* 背景装饰 */}
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl bg-blue-500/10"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl bg-purple-500/10"></div>
              
              <div className="relative z-10">
                <h3 className="flex gap-2 items-center mb-4 text-xl font-semibold text-blue-200">
                  <span className="inline-block w-2 h-6 bg-blue-500 rounded-full"></span>
                  空间波动模拟
                </h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={simulationData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="rgba(59, 130, 246, 0.2)" 
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="index" 
                        stroke="rgba(148, 163, 184, 0.6)"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
                        tickLine={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
                        label={{ 
                          value: '时间', 
                          position: 'insideBottomRight', 
                          offset: 0,
                          fill: '#94a3b8',
                          fontSize: 12
                        }}
                      />
                      <YAxis 
                        stroke="rgba(148, 163, 184, 0.6)"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
                        tickLine={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
                        label={{ 
                          value: '波动强度', 
                          angle: -90, 
                          position: 'insideLeft',
                          fill: '#94a3b8',
                          fontSize: 12
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a3a',
                          borderColor: '#333366',
                          borderRadius: '8px',
                          color: '#fff',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                          borderWidth: '1px'
                        }}
                        itemStyle={{ color: '#60a5fa' }}
                        labelStyle={{ color: '#f1f5f9', marginBottom: '0.25rem', fontWeight: 'bold' }}
                        cursor={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#60a5fa"
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={2000}
                        activeDot={{ 
                          r: 6, 
                          fill: '#60a5fa',
                          stroke: '#121228',
                          strokeWidth: 2
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
  );
};

export default HomePage;
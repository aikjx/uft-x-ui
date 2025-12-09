import React from 'react';
import { Link } from 'react-router-dom';
import { FEATURES } from '../constants';
import { cn } from '../utils';

const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* 英雄区域 - 增强版响应式设计 */}
      <section className="overflow-hidden relative py-16 md:py-28 lg:py-36 text-center">
        {/* 动态背景网格 - 增强版 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse-slow"></div>
          {/* 添加动态粒子效果 */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-blue-500/50"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.5 + 0.2
                }}
                animate={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: [Math.random() * 0.5 + 0.2, Math.random() * 0.8 + 0.2, Math.random() * 0.5 + 0.2],
                  scale: [1, Math.random() * 1.5 + 0.5, 1]
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 px-4 mx-auto max-w-6xl">
          <motion.div 
            className="mb-6" 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-6 py-3 text-sm font-medium text-blue-300 bg-gradient-to-r rounded-full border backdrop-blur-sm transition-all duration-300 from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
              🌌 统一场论探索
            </span>
          </motion.div>
          
          <motion.h1 
            className="mb-8 text-3xl md:text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            🌌 统一场论探索
            <br />
            <span className="text-xl md:text-3xl lg:text-5xl font-light text-gray-300">
              Unified Field Theory
            </span>
          </motion.h1>
          
          <motion.p 
            className="mx-auto mb-12 max-w-3xl text-base md:text-lg lg:text-xl leading-relaxed text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            探索宇宙本质规律，将张祥前统一场论的19个核心公式转化为震撼人心的3D交互体验
          </motion.p>
          
          <motion.div 
            className="flex flex-col gap-4 sm:gap-6 justify-center items-center sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.2),0_10px_10px_-5px_rgba(59,130,246,0.1)]"
            >
              <Link
                to="/formulas"
                className="inline-block px-8 py-4 sm:px-10 sm:py-5 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:from-blue-700 hover:to-purple-700"
              >
                🚀 开始探索
              </Link>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                to="/knowledge"
                className="inline-block px-8 py-4 sm:px-10 sm:py-5 font-semibold text-blue-300 bg-gradient-to-r rounded-xl border backdrop-blur-sm transition-all duration-300 from-gray-800/80 to-gray-900/80 border-blue-500/30 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-500/10"
              >
                📚 学习理论
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 特性展示 - 增强版 */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-blue-950/20">
        <div className="px-4 mx-auto max-w-7xl">
          <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              探索核心公式
              <span className="block text-blue-400">交互式体验</span>
            </h2>
            <p className="mx-auto max-w-3xl text-base md:text-lg text-gray-400">
              实时物理模拟，革命性的可视化体验，让复杂的物理公式变得直观易懂
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={feature.link}
                  className="block p-6 sm:p-8 h-full bg-gradient-to-br rounded-2xl border transition-all duration-300 from-gray-900/50 to-gray-800/30 border-gray-700/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 group"
                >
                  <motion.div 
                    className="mb-4 text-4xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-blue-300">
                    {feature.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
                  <motion.div 
                    className="flex items-center font-medium text-blue-400"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    了解更多
                    <svg
                      className="ml-2 w-4 h-4 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 数据展示 - 增强版 */}
      <section className="py-16 md:py-24">
        <div className="px-4 mx-auto max-w-7xl">
          <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              实时物理模拟数据
            </h2>
            <p className="text-base md:text-lg text-gray-400">
              基于统一场论的精确物理模拟
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: '核心公式', value: '19', unit: '个', icon: '📐', color: 'blue' },
              { label: '物理参数', value: '50+', unit: '种', icon: '⚡', color: 'yellow' },
              { label: '模拟精度', value: '99.9', unit: '%', icon: '🎯', color: 'green' },
              { label: '实时更新', value: '60', unit: 'FPS', icon: '🔄', color: 'purple' }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className={`p-5 sm:p-6 text-center bg-gradient-to-br rounded-xl border from-gray-900/50 to-gray-800/30 border-gray-700/50 hover:border-${item.color}-500/50 hover:shadow-lg hover:shadow-${item.color}-500/10`}
              >
                <motion.div 
                  className="mb-2 text-3xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {item.icon}
                </motion.div>
                <motion.div 
                  className="mb-1 text-3xl font-bold text-white md:text-4xl"
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                >
                  {item.value}
                  <span className="text-lg text-blue-400">{item.unit}</span>
                </motion.div>
                <div className="text-sm text-gray-400">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心公式预览 - 增强版 */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="px-4 mx-auto max-w-7xl">
          <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              核心公式预览
              <span className="block text-purple-400">统一场论的基石</span>
            </h2>
            <p className="mx-auto max-w-3xl text-base md:text-lg text-gray-400">
              探索19个核心公式，揭示空间、时间与物理现象的本质联系
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: 1, name: '时空同一化方程', formula: '\vec{r}(t) = \vec{C}t', description: '时间是空间的运动', icon: '⏱️' },
              { id: 7, name: '宇宙大统一方程', formula: 'F = \frac{d\vec{P}}{dt}', description: '统一四种基本力', icon: '🔄' },
              { id: 16, name: '统一场论能量方程', formula: 'e = m_0c^2', description: '能量与质量的关系', icon: '⚡' }
            ].map((formula, index) => (
              <motion.div
                key={formula.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-5 sm:p-6 bg-gradient-to-br rounded-xl border backdrop-blur-sm from-gray-900/50 to-gray-800/30 border-purple-500/30 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.span 
                    className="text-2xl"
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {formula.icon}
                  </motion.span>
                  <h3 className="text-xl font-bold text-purple-300">{formula.name}</h3>
                </div>
                <div className="mb-4 text-center">
                  <motion.div 
                    className="p-4 bg-gray-900/80 rounded-lg border border-purple-800/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <p className="text-lg text-white font-mono">{formula.formula}</p>
                  </motion.div>
                </div>
                <p className="text-sm text-gray-400">{formula.description}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block hover:shadow-[0_20px_25px_-5px_rgba(168,85,247,0.2),0_10px_10px_-5px_rgba(168,85,247,0.1)]"
            >
              <Link
                to="/formulas"
                className="inline-block px-10 py-4 sm:px-12 sm:py-5 font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:from-purple-700 hover:to-indigo-700"
              >
                📐 查看所有公式
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 技术亮点 - 增强版 */}
      <section className="py-16 md:py-24">
        <div className="px-4 mx-auto max-w-7xl">
          <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              技术亮点
              <span className="block text-cyan-400">革命性的可视化体验</span>
            </h2>
            <p className="mx-auto max-w-3xl text-base md:text-lg text-gray-400">
              采用最先进的技术，打造沉浸式的统一场论探索平台
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {[
              { title: '3D实时渲染', description: '基于Three.js的高性能3D渲染引擎，实现流畅的物理模拟和可视化效果', icon: '🎮', color: 'cyan' },
              { title: '交互式探索', description: '直观的用户界面，支持参数调整，实时观察物理现象的变化', icon: '🎛️', color: 'blue' },
              { title: '响应式设计', description: '完美适配各种设备，从手机到桌面，随时随地探索物理世界', icon: '📱', color: 'purple' },
              { title: '高性能优化', description: '智能性能优化系统，根据设备性能自动调整渲染质量', icon: '⚡', color: 'yellow' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`p-5 sm:p-6 bg-gradient-to-br rounded-xl border from-gray-900/50 to-gray-800/30 border-${feature.color}-500/30 hover:border-${feature.color}-500/50 hover:shadow-xl hover:shadow-${feature.color}-500/10 transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.span 
                    className="text-3xl"
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {feature.icon}
                  </motion.span>
                  <h3 className="text-xl font-bold text-cyan-300">{feature.title}</h3>
                </div>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA区域 - 增强版 */}
      <section className="overflow-hidden relative py-20 md:py-32 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-blue-900/30">
        {/* 动态背景装饰 - 增强版 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse-slow"></div>
          {/* 添加动态粒子效果 */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-blue-500/50"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.5 + 0.2
                }}
                animate={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: [Math.random() * 0.5 + 0.2, Math.random() * 0.8 + 0.2, Math.random() * 0.5 + 0.2],
                  scale: [1, Math.random() * 1.5 + 0.5, 1]
                }}
                transition={{
                  duration: Math.random() * 15 + 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 px-4 mx-auto max-w-4xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-6 text-2xl md:text-4xl lg:text-5xl font-bold text-white">
              开始你的统一场论探索之旅
            </h2>
            <p className="mb-10 text-base md:text-lg lg:text-xl text-gray-300">
              空间波动模拟 🌌
            </p>
            <div className="flex flex-col gap-4 sm:flex-row flex-wrap justify-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="hover:shadow-[0_20px_25px_-5px_rgba(34,197,94,0.2),0_10px_10px_-5px_rgba(34,197,94,0.1)]"
              >
                <Link
                  to="/interactive"
                  className="inline-block px-8 py-4 sm:px-10 sm:py-5 font-semibold text-white bg-gradient-to-r from-green-600 to-cyan-600 rounded-xl transition-all duration-300 hover:from-green-700 hover:to-cyan-700 hover:shadow-lg hover:shadow-green-500/20"
                >
                  🔬 立即体验
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  to="/artificial-field"
                  className="inline-block px-8 py-4 sm:px-10 sm:py-5 font-semibold text-green-300 bg-gradient-to-r rounded-xl border backdrop-blur-sm transition-all duration-300 from-gray-800/80 to-gray-900/80 border-green-500/30 hover:bg-green-500/10 hover:shadow-lg hover:shadow-green-500/10"
                >
                  🛸 了解人工场
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="hover:shadow-[0_20px_25px_-5px_rgba(168,85,247,0.2),0_10px_10px_-5px_rgba(168,85,247,0.1)]"
              >
                <Link
                  to="/formulas"
                  className="inline-block px-8 py-4 sm:px-10 sm:py-5 font-semibold text-purple-300 bg-gradient-to-r rounded-xl border backdrop-blur-sm transition-all duration-300 from-gray-800/80 to-gray-900/80 border-purple-500/30 hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  📐 公式可视化
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FEATURES, ANIMATION_VARIANTS } from '../constants';
import { cn } from '../utils';

const { containerVariants, itemVariants, fadeInUpVariants } = ANIMATION_VARIANTS;

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* 英雄区域 */}
      <section className="relative py-20 md:py-32 text-center overflow-hidden">
        {/* 动态背景网格 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto px-4 relative z-10"
        >
          <div className="mb-6">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              🌌 统一场论探索
            </span>
          </div>
          
          <motion.h1 
            variants={fadeInUpVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
          >
            统一场论人工场
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-300">
              3D可视化平台
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUpVariants}
            custom={1}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            探索宇宙本质规律，将张祥前统一场论的19个核心公式转化为震撼人心的3D交互体验
          </motion.p>
          
          <motion.div 
            variants={fadeInUpVariants}
            custom={2}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <div className="hover:scale-105 transition-transform duration-300 hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.2),0_10px_10px_-5px_rgba(59,130,246,0.1)]">
              <Link
                to="/formulas"
                className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300"
              >
                🚀 开始探索
              </Link>
            </div>
            <div className="hover:scale-105 transition-transform duration-300">
              <Link
                to="/knowledge"
                className="inline-block px-10 py-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 text-blue-300 rounded-xl font-semibold border border-blue-500/30 hover:bg-blue-500/10 transition-all duration-300 backdrop-blur-sm"
              >
                📚 学习理论
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 特性展示 */}
      <section className="py-20 bg-gradient-to-b from-transparent to-blue-950/20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              探索核心公式
              <span className="block text-blue-400">交互式体验</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              实时物理模拟，革命性的可视化体验，让复杂的物理公式变得直观易懂
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUpVariants}
                custom={index}
                className="group"
              >
                <Link
                  to={feature.link}
                  className="block h-full p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-blue-400 font-medium">
                    了解更多
                    <svg
                      className="w-4 h-4 ml-2 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 数据展示 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-white mb-4">
              实时物理模拟数据
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-400">
              基于统一场论的精确物理模拟
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: '核心公式', value: '19', unit: '个', icon: '📐' },
              { label: '物理参数', value: '50+', unit: '种', icon: '⚡' },
              { label: '模拟精度', value: '99.9', unit: '%', icon: '🎯' },
              { label: '实时更新', value: '60', unit: 'FPS', icon: '🔄' }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUpVariants}
                custom={index}
                className="text-center p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {item.value}
                  <span className="text-blue-400 text-lg">{item.unit}</span>
                </div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="py-24 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-blue-900/30 relative overflow-hidden">
        {/* 动态背景装饰 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              开始你的统一场论探索之旅
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-10">
              空间波动模拟 🌌
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="hover:scale-105 transition-transform duration-300 hover:shadow-[0_20px_25px_-5px_rgba(34,197,94,0.2),0_10px_10px_-5px_rgba(34,197,94,0.1)]">
                <Link
                  to="/interactive"
                  className="inline-block px-12 py-5 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-cyan-700 transition-all duration-300"
                >
                  🔬 立即体验
                </Link>
              </div>
              <div className="hover:scale-105 transition-transform duration-300">
                <Link
                  to="/artificial-field"
                  className="inline-block px-12 py-5 bg-gradient-to-r from-gray-800/80 to-gray-900/80 text-green-300 rounded-xl font-semibold border border-green-500/30 hover:bg-green-500/10 transition-all duration-300 backdrop-blur-sm"
                >
                  🛸 了解人工场
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
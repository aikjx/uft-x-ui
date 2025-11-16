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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto px-4"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
              🌌 统一场论探索
            </span>
          </motion.div>
          
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
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            探索宇宙本质规律，将张祥前统一场论的19个核心公式转化为震撼人心的3D交互体验
          </motion.p>
          
          <motion.div 
            variants={fadeInUpVariants}
            custom={2}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/formulas"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🚀 开始探索
            </Link>
            <Link
              to="/knowledge"
              className="px-8 py-4 border border-blue-500/30 text-blue-300 rounded-lg font-semibold hover:bg-blue-500/10 transition-all duration-300"
            >
              📚 学习理论
            </Link>
          </motion.div>
        </motion.div>
        
        {/* 装饰元素 */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
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
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-white mb-4">
              探索核心公式
              <span className="block text-blue-400">交互式体验</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-3xl mx-auto">
              实时物理模拟，革命性的可视化体验，让复杂的物理公式变得直观易懂
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUpVariants}
                custom={index}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group"
              >
                <Link
                  to={feature.link}
                  className="block h-full p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
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
                    <motion.svg
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
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
      <section className="py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-white mb-4">
              开始你的统一场论探索之旅
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-300 mb-8">
              空间波动模拟 🌌
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/interactive"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-cyan-700 transition-all duration-300"
              >
                🔬 立即体验
              </Link>
              <Link
                to="/artificial-field"
                className="px-8 py-4 border border-green-500/30 text-green-300 rounded-lg font-semibold hover:bg-green-500/10 transition-all duration-300"
              >
                🛸 了解人工场
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import React from 'react';
import { Link } from 'react-router-dom';
import { FEATURES } from '../constants';
import { cn } from '../utils';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* 英雄区域 */}
      <section className="overflow-hidden relative py-20 text-center md:py-32">
        {/* 动态背景网格 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
        
        <div className="relative z-10 px-4 mx-auto max-w-6xl">
          <div className="mb-6 animate-fade-in">
            <span className="inline-block px-6 py-3 text-sm font-medium text-blue-300 bg-gradient-to-r rounded-full border backdrop-blur-sm transition-transform duration-300 from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:scale-105">
              🌌 统一场论探索
            </span>
          </div>
          
          <h1 
            className="mb-6 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 md:text-6xl lg:text-7xl animate-fade-in"
          >
            统一场论人工场
            <br />
            <span className="text-2xl font-light text-gray-300 md:text-4xl lg:text-5xl">
              3D可视化平台
            </span>
          </h1>
          
          <p 
            className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-gray-300 delay-100 md:text-xl animate-fade-in"
          >
            探索宇宙本质规律，将张祥前统一场论的19个核心公式转化为震撼人心的3D交互体验
          </p>
          
          <div 
            className="flex flex-col gap-6 justify-center items-center delay-200 sm:flex-row animate-fade-in"
          >
            <div className="hover:scale-105 transition-transform duration-300 hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.2),0_10px_10px_-5px_rgba(59,130,246,0.1)]">
              <Link
                to="/formulas"
                className="inline-block px-10 py-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl transition-all duration-300"
              >
                🚀 开始探索
              </Link>
            </div>
            <div className="transition-transform duration-300 hover:scale-105">
              <Link
                to="/knowledge"
                className="inline-block px-10 py-4 font-semibold text-blue-300 bg-gradient-to-r rounded-xl border backdrop-blur-sm transition-all duration-300 from-gray-800/80 to-gray-900/80 border-blue-500/30 hover:bg-blue-500/10"
              >
                📚 学习理论
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 特性展示 */}
      <section className="py-20 bg-gradient-to-b from-transparent to-blue-950/20">
        <div className="px-4 mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              探索核心公式
              <span className="block text-blue-400">交互式体验</span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-400">
              实时物理模拟，革命性的可视化体验，让复杂的物理公式变得直观易懂
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                  className="block p-8 h-full bg-gradient-to-br rounded-2xl border transition-all duration-300 from-gray-900/50 to-gray-800/30 border-gray-700/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"
                >
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <h3 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-blue-300">
                    {feature.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
                  <div className="flex items-center font-medium text-blue-400">
                    了解更多
                    <svg
                      className="ml-2 w-4 h-4 animate-pulse"
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
        <div className="px-4 mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="mb-16 text-center"
          >
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold text-white md:text-4xl">
              实时物理模拟数据
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-400">
              基于统一场论的精确物理模拟
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
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
                className="p-6 text-center bg-gradient-to-br rounded-xl border from-gray-900/50 to-gray-800/30 border-gray-700/50"
              >
                <div className="mb-2 text-3xl">{item.icon}</div>
                <div className="mb-1 text-3xl font-bold text-white md:text-4xl">
                  {item.value}
                  <span className="text-lg text-blue-400">{item.unit}</span>
                </div>
                <div className="text-sm text-gray-400">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="overflow-hidden relative py-24 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-blue-900/30">
        {/* 动态背景装饰 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
        
        <div className="relative z-10 px-4 mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">
              开始你的统一场论探索之旅
            </h2>
            <p className="mb-10 text-lg text-gray-300 md:text-xl">
              空间波动模拟 🌌
            </p>
            <div className="flex flex-col gap-6 justify-center sm:flex-row">
              <div className="hover:scale-105 transition-transform duration-300 hover:shadow-[0_20px_25px_-5px_rgba(34,197,94,0.2),0_10px_10px_-5px_rgba(34,197,94,0.1)]">
                <Link
                  to="/interactive"
                  className="inline-block px-12 py-5 font-semibold text-white bg-gradient-to-r from-green-600 to-cyan-600 rounded-xl transition-all duration-300 hover:from-green-700 hover:to-cyan-700"
                >
                  🔬 立即体验
                </Link>
              </div>
              <div className="transition-transform duration-300 hover:scale-105">
                <Link
                  to="/artificial-field"
                  className="inline-block px-12 py-5 font-semibold text-green-300 bg-gradient-to-r rounded-xl border backdrop-blur-sm transition-all duration-300 from-gray-800/80 to-gray-900/80 border-green-500/30 hover:bg-green-500/10"
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
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const footerSections = [
    {
      title: '快速链接',
      links: [
        { path: '/', label: '首页' },
        { path: '/formulas', label: '公式可视化' },
        { path: '/artificial-field', label: '人工场技术' },
        { path: '/interactive', label: '交互探索' },
        { path: '/knowledge', label: '知识学习' }
      ]
    },
    {
      title: '资源',
      links: [
        { path: '/knowledge', label: '统一场论论文' },
        { path: '/knowledge', label: '技术文档' },
        { path: '/knowledge', label: '教育视频' },
        { path: '/knowledge', label: '研究成果' },
        { path: '/api', label: '开发者API' }
      ]
    },
    {
      title: '联系我们',
      content: (
        <div className="space-y-3">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ x: 5, color: '#60a5fa' }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-blue-400">📧</span>
            <span>contact@utftheory.org</span>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ x: 5, color: '#60a5fa' }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-blue-400">📱</span>
            <span>+86 123 4567 8910</span>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ x: 5, color: '#60a5fa' }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-blue-400">📍</span>
            <span>北京市海淀区量子物理研究院</span>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-3 text-sm text-gray-500 ml-2"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-purple-400">🔬</span>
            <span>统一场论研究中心</span>
          </motion.div>
        </div>
      )
    }
  ];

  // 容器动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // 项目动画变体
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <footer className="relative bg-gradient-to-t from-gray-900 via-gray-900 to-gray-950 border-t border-gray-800/50">
      {/* 装饰背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-purple-900/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      
      {/* 粒子装饰 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/50 rounded-full"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              opacity: 0
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [1, 1.5, 1],
              x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
              y: [Math.random() * 100 + '%', Math.random() * 100 + '%']
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* 品牌信息 */}
          <motion.div 
            className="lg:col-span-1"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="flex items-center space-x-3 mb-6"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.2)',
                    '0 0 40px rgba(59, 130, 246, 0.4)',
                    '0 0 20px rgba(59, 130, 246, 0.2)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* 内部动画 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-white font-bold text-2xl relative z-10">🌌</span>
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">统一场论探索</h3>
                <p className="text-sm text-gray-400">探索宇宙本质规律</p>
              </div>
            </motion.div>
            <motion.p 
              className="text-gray-500 text-sm leading-relaxed mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              将张祥前统一场论的19个核心公式转化为震撼人心的3D交互体验，
              探索空间、时间与物理的奥秘。
            </motion.p>
          </motion.div>

          {/* 链接部分 */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
            >
              <motion.h4 
                className="text-lg font-semibold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {section.title}
              </motion.h4>
              
              {section.links ? (
                <ul className="space-y-3">
                  {section.links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <motion.li 
                        key={link.label}
                        whileHover={{ x: 8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          to={link.path}
                          className={`text-sm transition-all duration-300 flex items-center space-x-2 group relative`}
                          style={{
                            color: isActive ? '#60a5fa' : '#9ca3af',
                          }}
                        >
                          {/* 活性指示器 */}
                          {isActive && (
                            <motion.span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-400 rounded-full"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.8, 1, 0.8]
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          )}
                          <span className="w-1 h-1 bg-transparent group-hover:bg-blue-400 rounded-full transition-all duration-200"></span>
                          <span 
                            className={`group-hover:text-blue-400 transition-colors duration-200 ${isActive ? 'font-medium' : ''}`}
                          >
                            {link.label}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <motion.div 
                  className="text-gray-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {section.content}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* 底部版权 */}
        <motion.div 
          className="border-t border-gray-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center space-x-4 text-sm text-gray-500">
            <motion.span 
              className="bg-gradient-to-r from-gray-500 to-gray-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              © {currentYear} 统一场论探索. 保留所有权利.
            </motion.span>
            <div className="hidden md:flex space-x-4">
              {['📱', '📧', '🔔', '🌐'].map((icon, index) => (
                <motion.span 
                  key={index}
                  className="cursor-pointer transition-all duration-200 hover:text-blue-400"
                  whileHover={{ 
                    scale: 1.3, 
                    rotate: [0, 10, -10, 10, 0],
                    color: '#60a5fa'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {icon}
                </motion.span>
              ))}
            </div>
          </div>
          
          <motion.div 
            className="flex items-center space-x-3 text-sm text-gray-500 bg-gray-800/30 px-4 py-2 rounded-full backdrop-blur-sm"
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="flex items-center space-x-1">
              <span className="text-blue-400">🎯</span>
              <span>实时物理模拟中</span>
            </span>
          </motion.div>
        </motion.div>

        {/* 科技感装饰 */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </footer>
  );
};

export default Footer;
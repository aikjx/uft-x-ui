import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

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
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span>📧</span>
            <span>contact@utftheory.org</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📱</span>
            <span>+86 123 4567 8910</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📍</span>
            <span>北京市海淀区量子物理研究院</span>
          </div>
          <div className="text-sm text-gray-500 ml-6">🔬 统一场论研究中心</div>
        </div>
      )
    }
  ];

  return (
    <footer className="relative bg-gradient-to-t from-gray-900 via-gray-900 to-gray-950 border-t border-gray-800/50">
      {/* 装饰背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-purple-900/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">🌌</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">统一场论探索</h3>
                <p className="text-sm text-gray-400">探索宇宙本质规律</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              将张祥前统一场论的19个核心公式转化为震撼人心的3D交互体验，
              探索空间、时间与物理的奥秘。
            </p>
          </motion.div>

          {/* 链接部分 */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">{section.title}</h4>
              
              {section.links ? (
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-gray-500 hover:text-blue-400 transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-sm">
                  {section.content}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 底部版权 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4 md:mb-0">
            <span>© {currentYear} 统一场论探索. 保留所有权利.</span>
            <div className="flex space-x-2">
              <span>📱</span>
              <span>📧</span>
              <span>🔔</span>
              <span>🌐</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <span>🎯</span>
              <span>实时物理模拟中</span>
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </motion.div>

        {/* 科技感装饰 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>

      {/* 浮动元素 */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-4 right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{
          y: [0, 15, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-4 left-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"
      />
    </footer>
  );
};

export default Footer;
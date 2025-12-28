import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const location = useLocation()

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
          <div className="flex items-center space-x-3">
            <span className="text-blue-400">📧</span>
            <span>contact@utftheory.org</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-blue-400">📱</span>
            <span>+86 123 4567 8910</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-blue-400">📍</span>
            <span>北京市海淀区量子物理研究院</span>
          </div>
          <div className="ml-2 flex items-center space-x-3 text-sm text-gray-500">
            <span className="text-purple-400">🔬</span>
            <span>统一场论研究中心</span>
          </div>
        </div>
      )
    }
  ]

  // 社交媒体图标
  const socialIcons = [
    { icon: '🐦', label: 'Twitter' },
    { icon: '📘', label: 'Facebook' },
    { icon: '📷', label: 'Instagram' },
    { icon: '💼', label: 'LinkedIn' },
    { icon: '📺', label: 'YouTube' }
  ]

  return (
    <footer className="relative border-t border-gray-800/50 bg-gradient-to-t from-gray-900 via-gray-900 to-gray-950">
      {/* 增强的装饰背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-purple-900/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.1),transparent_70%)]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* 响应式网格布局 */}
        <motion.div 
          className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
        >
          {/* 品牌信息 */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 flex items-center space-x-3">
              <motion.div 
                className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 shadow-lg shadow-blue-500/20"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(99, 102, 241, 0.2)',
                    '0 0 40px rgba(99, 102, 241, 0.4)',
                    '0 0 20px rgba(99, 102, 241, 0.2)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <span className="text-2xl font-bold text-white">🌌</span>
              </motion.div>
              <div>
                <h3 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent text-white">
                  统一场论探索
                </h3>
                <p className="text-xs text-blue-400/80">Unified Field Theory</p>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              将张祥前统一场论的19个核心公式转化为震撼人心的3D交互体验，
              探索空间、时间与物理的奥秘。
            </p>
            
            {/* 社交媒体图标 - 移动端可见 */}
            <div className="mb-6 flex space-x-4">
              {socialIcons.map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/50 text-gray-400 transition-all duration-300 hover:bg-blue-500/20 hover:text-blue-400 hover:shadow-lg hover:shadow-blue-500/20"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <span>{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* 链接部分 */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            >
              <h4 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-lg font-semibold text-transparent text-white">
                {section.title}
              </h4>

              {section.links ? (
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => {
                    const isActive = location.pathname === link.path
                    return (
                      <motion.li 
                        key={link.label}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: linkIndex * 0.1 }}
                      >
                        <Link
                          to={link.path}
                          className={`group relative flex items-center space-x-2 text-sm transition-all duration-300`}
                          style={{
                            color: isActive ? '#60a5fa' : '#9ca3af'
                          }}
                        >
                          {/* 活性指示器 */}
                          <motion.span
                            className="h-1 w-1 rounded-full bg-blue-400"
                            initial={{ scale: 0 }}
                            animate={{ scale: isActive ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                          />
                          
                          {/* 连接线动画 */}
                          <motion.span
                            className="absolute left-0 top-1/2 h-[1px] -translate-y-1/2 bg-gradient-to-r from-blue-400 to-transparent origin-left"
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{ width: '16px', opacity: 0.6 }}
                          />
                          
                          <span
                            className={`relative z-10 transition-colors duration-200 group-hover:text-blue-400 group-hover:translate-x-2 ${isActive ? 'font-medium' : ''}`}
                          >
                            {link.label}
                          </span>
                        </Link>
                      </motion.li>
                    )
                  })}
                </ul>
              ) : (
                <motion.div 
                  className="text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {section.content}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* 底部版权 */}
        <motion.div 
          className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-gray-800/50 pt-8 md:flex-row"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col items-center space-x-6 text-sm text-gray-500 md:flex-row">
            <span className="bg-gradient-to-r from-gray-500 to-gray-400 bg-clip-text text-transparent">
              © {currentYear} 统一场论探索. 保留所有权利.
            </span>
            
            {/* 社交媒体图标 - 桌面端可见 */}
            <div className="hidden space-x-4 md:flex">
              {socialIcons.map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="cursor-pointer text-gray-500 transition-all duration-300 hover:text-blue-400 hover:scale-110"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <motion.div 
            className="flex items-center space-x-3 rounded-full bg-gray-800/30 px-6 py-3 text-sm text-gray-500 backdrop-blur-sm shadow-lg shadow-blue-500/5"
            whileHover={{ 
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
              scale: 1.02
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="h-2 w-2 rounded-full bg-green-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <span className="flex items-center space-x-2">
              <span className="text-blue-400">🎯</span>
              <span>实时物理模拟中</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer

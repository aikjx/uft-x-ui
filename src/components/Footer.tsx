import React from 'react'
import { Link, useLocation } from 'react-router-dom'

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

  return (
    <footer className="relative border-t border-gray-800/50 bg-gradient-to-t from-gray-900 via-gray-900 to-gray-950">
      {/* 简化的装饰背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-purple-900/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:80px_80px]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* 品牌信息 */}
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center space-x-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 shadow-lg shadow-blue-500/20">
                <span className="text-2xl font-bold text-white">🌌</span>
              </div>
              <div>
                <h3 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent text-white">
                  统一场论探索
                </h3>
                <p className="text-sm text-gray-400">探索宇宙本质规律</p>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              将张祥前统一场论的19个核心公式转化为震撼人心的3D交互体验，
              探索空间、时间与物理的奥秘。
            </p>
          </div>

          {/* 链接部分 */}
          {footerSections.map(section => (
            <div key={section.title}>
              <h4 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-lg font-semibold text-transparent text-white">
                {section.title}
              </h4>

              {section.links ? (
                <ul className="space-y-3">
                  {section.links.map(link => {
                    const isActive = location.pathname === link.path
                    return (
                      <li key={link.label}>
                        <Link
                          to={link.path}
                          className={`relative flex items-center space-x-2 text-sm transition-all duration-300`}
                          style={{
                            color: isActive ? '#60a5fa' : '#9ca3af'
                          }}
                        >
                          {/* 活性指示器 */}
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-blue-400" />
                          )}
                          <span className="h-1 w-1 rounded-full bg-transparent transition-all duration-200 group-hover:bg-blue-400"></span>
                          <span
                            className={`transition-colors duration-200 group-hover:text-blue-400 ${isActive ? 'font-medium' : ''}`}
                          >
                            {link.label}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">{section.content}</div>
              )}
            </div>
          ))}
        </div>

        {/* 底部版权 */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800/50 pt-8 md:flex-row">
          <div className="flex flex-col items-center space-x-4 text-sm text-gray-500 md:flex-row">
            <span className="bg-gradient-to-r from-gray-500 to-gray-400 bg-clip-text text-transparent">
              © {currentYear} 统一场论探索. 保留所有权利.
            </span>
            <div className="hidden space-x-4 md:flex">
              {['📱', '📧', '🔔', '🌐'].map((icon, index) => (
                <span
                  key={index}
                  className="cursor-pointer transition-all duration-200 hover:text-blue-400"
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-full bg-gray-800/30 px-4 py-2 text-sm text-gray-500 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="flex items-center space-x-1">
              <span className="text-blue-400">🎯</span>
              <span>实时物理模拟中</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

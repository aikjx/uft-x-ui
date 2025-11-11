import React from 'react';
import { motion, easeOut } from 'framer-motion';
import { Link } from 'react-router-dom';

// 配置常量
const SOCIAL_ICONS = ['📱', '📧', '🔔', '🌐'];
const CONTACT_INFO = [
  { icon: '✉️', text: 'contact@utftheory.org' },
  { icon: '📱', text: '+86 123 4567 8910' },
  { icon: '📍', text: '北京市海淀区量子物理研究院' },
  { icon: '🔬', text: '统一场论研究中心' }
];
const RESOURCES = [
  { label: '统一场论论文' },
  { label: '技术文档' },
  { label: '教育视频' },
  { label: '研究成果' },
  { label: '开发者API' }
];
const QUICK_LINKS = [
  { path: '/', label: '首页' },
  { path: '/formulas', label: '公式可视化' },
  { path: '/artificial-field', label: '人工场技术' },
  { path: '/interactive', label: '交互探索' },
  { path: '/knowledge', label: '知识学习' }
];

// 通用动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut
    }
  }
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a14] border-t border-blue-900/30 py-8 md:py-12 mt-auto">
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* 网站信息 */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2">
              <motion.div 
                className="text-2xl"
                animate={{ rotate: [0, 5, -5, 5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌌
              </motion.div>
              <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                统一场论探索
              </h3>
            </div>
            <p className="text-blue-100/60 text-sm leading-relaxed">
              探索空间、时间与物理的奥秘，展示统一场论的前沿理论和人工场技术的未来应用。
            </p>
          </motion.div>

          {/* 快速链接 */}
          <motion.div variants={itemVariants}>
            <h4 className="text-blue-300 font-medium mb-4 flex items-center">
              <span className="w-1 h-6 bg-blue-400 rounded-full mr-2"></span>
              快速链接
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((item) => (
                <motion.li 
                  key={item.path}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    to={item.path} 
                    className="text-blue-100/60 hover:text-blue-300 transition-colors duration-300 flex items-center"
                  >
                    <span className="w-0.5 h-0.5 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* 资源 */}
          <motion.div variants={itemVariants}>
            <h4 className="text-blue-300 font-medium mb-4 flex items-center">
              <span className="w-1 h-6 bg-blue-400 rounded-full mr-2"></span>
              资源
            </h4>
            <ul className="space-y-3">
              {RESOURCES.map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a 
                    href="#" 
                    className="text-blue-100/60 hover:text-blue-300 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-0.5 h-0.5 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* 联系我们 */}
          <motion.div variants={itemVariants}>
            <h4 className="text-blue-300 font-medium mb-4 flex items-center">
              <span className="w-1 h-6 bg-blue-400 rounded-full mr-2"></span>
              联系我们
            </h4>
            <ul className="space-y-3">
              {CONTACT_INFO.map((item, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start gap-2 text-blue-100/60"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="mt-0.5 text-base">{item.icon}</span>
                  <span className="text-sm">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <div className="border-t border-blue-900/30 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-blue-100/50 text-sm order-2 md:order-1"
          >
            © 2024 统一场论探索. 保留所有权利.
          </motion.p>
          
          <motion.div 
            className="flex items-center gap-6 order-1 md:order-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {SOCIAL_ICONS.map((icon, index) => (
              <motion.a
                key={index}
                href="#"
                className="text-blue-100/50 hover:text-blue-300 transition-colors duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`社交媒体图标 ${index + 1}`}
              >
                <span className="text-xl">{icon}</span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

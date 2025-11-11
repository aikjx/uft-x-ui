import React from 'react';
import { motion, easeOut } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../App';
import ParticleBackground from '../components/ParticleBackground';

// 动画变体配置
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: (custom: number = 0) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      delay: custom * 0.1,
      ease: easeOut
    }
  })
};

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="relative min-h-screen w-full bg-[#0a0a14] flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* 添加简化版粒子背景 */}
        <ParticleBackground 
          particleCount={500}
          enableMouseInteraction={false}
          enableAutoRotation={true}
          autoRotationSpeed={0.0002}
        />

        {/* 装饰元素 - 增强视觉深度 */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center opacity-30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <div className="w-[500px] h-[500px] rounded-full border border-blue-500/30"></div>
        </motion.div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[80px]"></div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-md mx-auto relative z-10"
        >
          <motion.div
            variants={itemVariants}
            custom={0}
            className="text-8xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6"
          >
            404
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            custom={1}
            className="text-2xl md:text-3xl font-bold text-blue-300 mb-4"
          >
            页面不存在
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            custom={2}
            className="text-blue-100/70 mb-8 leading-relaxed"
          >
            您访问的页面不存在或已被移除。让我们返回统一场论的奇妙世界，继续探索空间与时间的奥秘。
          </motion.p>
          
          <motion.button
            variants={itemVariants}
            custom={3}
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)',
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            返回首页
          </motion.button>
        </motion.div>
        
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-blue-800/50 text-sm relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          探索更深远的物理世界
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default NotFoundPage;
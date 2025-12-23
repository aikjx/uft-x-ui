import React from 'react'
import { motion, easeOut } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '../App'
import ParticleBackground from '../components/ParticleBackground'

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
}

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
}

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <PageContainer>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a14] p-4">
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
          <div className="h-[500px] w-[500px] rounded-full border border-blue-500/30"></div>
        </motion.div>

        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[100px]"></div>
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[80px]"></div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto max-w-md text-center"
        >
          <motion.div
            variants={itemVariants}
            custom={0}
            className="mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-8xl font-bold text-transparent md:text-9xl"
          >
            404
          </motion.div>

          <motion.h1
            variants={itemVariants}
            custom={1}
            className="mb-4 text-2xl font-bold text-blue-300 md:text-3xl"
          >
            页面不存在
          </motion.h1>

          <motion.p
            variants={itemVariants}
            custom={2}
            className="mb-8 leading-relaxed text-blue-100/70"
          >
            您访问的页面不存在或已被移除。让我们返回统一场论的奇妙世界，继续探索空间与时间的奥秘。
          </motion.p>

          <motion.button
            variants={itemVariants}
            custom={3}
            onClick={() => navigate('/')}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/30"
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
          className="absolute relative bottom-10 left-1/2 z-10 -translate-x-1/2 transform text-sm text-blue-800/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          探索更深远的物理世界
        </motion.div>
      </div>
    </PageContainer>
  )
}

export default NotFoundPage

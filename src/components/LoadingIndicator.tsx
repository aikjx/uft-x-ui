import React from 'react';
import { motion } from 'framer-motion';

// 组件属性接口
export interface LoadingIndicatorProps {
  /** 是否显示加载指示器 */
  isLoading: boolean;
  /** 加载进度（可选，0-100） */
  progress?: number;
  /** 自定义CSS类名 */
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = React.memo(({
  isLoading,
  progress,
  className = ''
}) => {
  // 如果不处于加载状态，直接返回null
  if (!isLoading) {
    return null;
  }

  return (
    <motion.div
      className={`flex absolute inset-0 justify-center items-center backdrop-blur-md bg-black/80 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="p-8 text-center rounded-2xl border shadow-2xl backdrop-blur-lg bg-black/50 border-blue-500/30 shadow-blue-500/15">
        <motion.div
          className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
          }}
        />
        <motion.h3
          className="mb-2 text-xl font-semibold text-transparent text-white bg-clip-text bg-gradient-to-r from-blue-300 to-white"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          正在初始化 3D 场景
        </motion.h3>
        <motion.p
          className="mb-6 text-sm text-blue-300"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          加载渲染引擎和资源...
        </motion.p>

        {/* 初始化进度条 */}
        <motion.div
          className="overflow-hidden w-64 h-2 bg-gray-700 rounded-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{
              width: progress !== undefined 
                ? `${progress}%` 
                : ['0%', '30%', '55%', '75%', '90%', '75%']
            }}
            transition={{
              duration: progress !== undefined ? 0.5 : 3,
              repeat: progress !== undefined ? 0 : Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            style={{
              boxShadow: "0 0 8px rgba(59, 130, 246, 0.6)"
            }}
          />
        </motion.div>

        {/* 初始化步骤指示器 */}
        <motion.div
          className="flex gap-2 mt-6 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <span className="px-2 py-1 text-blue-300 rounded-full bg-blue-500/20">引擎初始化</span>
          <span className="px-2 py-1 rounded-full bg-gray-500/20">资源加载</span>
          <span className="px-2 py-1 rounded-full bg-gray-500/20">场景构建</span>
          <span className="px-2 py-1 rounded-full bg-gray-500/20">渲染准备</span>
        </motion.div>
      </div>
    </motion.div>
  );
});

export default React.memo(LoadingIndicator);

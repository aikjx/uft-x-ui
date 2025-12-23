import React from 'react'
import { motion } from 'framer-motion'
import SpiralDivergenceVisualization from '../../archived/可视化/spiral_divergence_3d'

const SpiralDivergencePage: React.FC = () => {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="mb-6 bg-gradient-to-r from-orange-400 via-yellow-300 to-cyan-400 bg-clip-text text-center text-4xl font-bold text-transparent">
          物体12方向圆柱状螺旋发散运动
        </h1>
        <div className="mb-8 text-center text-blue-300/90">
          <p className="text-lg">Unified Field - 12 Direction Cylindrical Spiral Divergence</p>
        </div>
      </motion.div>

      <div className="relative h-[80vh] w-full">
        <SpiralDivergenceVisualization />
      </div>
    </div>
  )
}

export default SpiralDivergencePage

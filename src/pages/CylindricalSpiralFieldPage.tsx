import React from 'react';
import { motion } from 'framer-motion';
import CylindricalSpiralField from '../../archived/可视化/spacetime_3d_viz';

const CylindricalSpiralFieldPage: React.FC = () => {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="mb-6 text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-cyan-400">
          统一场论·圆柱螺旋发散
        </h1>
        <div className="mb-8 text-center text-blue-300/90">
          <p className="text-lg">Unified Field - Cylindrical Spiral Divergence from Origin</p>
          <p className="mt-2 text-sm text-blue-300/70">从原点(0,0,0)向空间四面八方发散，每个方向保持恒定半径的圆柱螺旋运动</p>
        </div>
      </motion.div>

      <div className="relative w-full h-[80vh]">
        <CylindricalSpiralField />
      </div>
    </div>
  );
};

export default CylindricalSpiralFieldPage;

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import ThreeJSVisualization from '../components/ThreeJSVisualization';
import { MathJax } from '../components/MathJax';
import { useThreeScene } from '../hooks/useThreeScene';
import { FORMULAS, FEATURES, ANIMATION_VARIANTS } from '../constants';
import { cn, showNotification } from '../utils';
import { FormulaService } from '../services/formulaService';
import { VisualizationService } from '../services/visualizationService';

const { containerVariants, itemVariants, featureVariants, formulaVariants } = ANIMATION_VARIANTS;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'features' | 'formulas'>('features');
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const { createScene, getScene, updateScene } = useThreeScene();

  // 模拟加载数据
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      showNotification.success('欢迎来到统一场论可视化系统');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 创建动态背景可视化
  const createHeroVisualization = (scene: any) => {
    // 添加坐标轴和网格
    const axesHelper = VisualizationService.createAxesHelper(10);
    scene.add(axesHelper);
    
    // 创建粒子系统
    const particles = VisualizationService.createParticleSystem({
      count: 5000,
      size: 0.02,
      color: new THREE.Color(0x00aaff),
      spread: 20
    });
    scene.add(particles);
    
    // 添加表示公式的环形
    const torus = VisualizationService.createTorus(3, 0.05, 0x00aaff);
    scene.add(torus);
    
    // 设置更新函数
    const updateFunction = (deltaTime: number) => {
      if (particles) {
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.0005;
      }
      if (torus) {
        torus.rotation.x += 0.002;
        torus.rotation.y += 0.002;
      }
    };
    
    // 存储更新函数供useThreeScene使用
    (scene as any).updateFunction = updateFunction;
  };

  const handleFeatureClick = (feature: any) => {
    navigate(feature.link);
    showNotification.info(`导航至：${feature.title}`);
  };

  const handleFormulaClick = (formulaId: number) => {
    navigate(`/formulas/${formulaId}`);
    showNotification.info(`查看公式详情`);
  };

  // 获取核心公式（限制为3个）
  const coreFormulas = FORMULAS.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050518] to-[#0a0a28] text-white">
      <ParticleBackground />
      
      {/* 英雄区域 */}
      <div ref={heroRef} className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            统一场论可视化系统
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-blue-100/80 max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            探索时空、引力与电磁场的统一本质
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="mt-8"
          >
            <button 
              onClick={() => navigate('/formulas')} 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
            >
              探索公式
            </button>
          </motion.div>
        </div>
        
        {/* 3D 可视化背景 */}
        <div className="absolute inset-0 z-0">
          <ThreeJSVisualization 
            className="w-full h-full" 
            createVisualization={createHeroVisualization}
            cameraConfig={{ position: { x: 0, y: 0, z: 10 } }}
          />
        </div>
        
        {/* 渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050518] to-transparent z-10"></div>
      </div>

      {/* 内容区域 */}
      <motion.div 
        className="container mx-auto px-4 py-16"
        variants={containerVariants}
        initial="hidden"
        animate={isLoading ? "hidden" : "visible"}
      >
        {/* 标签切换 */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-blue-900/20 rounded-full">
            <button
              className={`px-6 py-2 rounded-full transition-all ${activeTab === 'features' ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'}`}
              onClick={() => setActiveTab('features')}
            >
              系统功能
            </button>
            <button
              className={`px-6 py-2 rounded-full transition-all ${activeTab === 'formulas' ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white'}`}
              onClick={() => setActiveTab('formulas')}
            >
              核心公式
            </button>
          </div>
        </div>

        {/* 功能卡片 */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.id}
                variants={featureVariants}
                className="bg-gradient-to-b from-blue-900/10 to-blue-900/5 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all hover:-translate-y-1 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => handleFeatureClick(feature)}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">{feature.title}</h3>
                <p className="text-blue-100/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* 公式卡片 */}
        {activeTab === 'formulas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreFormulas.map((formula) => {
              // 使用服务格式化数学公式
              const formatFormula = (expression: string) => {
                return FormulaService.formatFormulaExpression(expression);
              };
              
              return (
                <motion.div
                  key={formula.id}
                  variants={formulaVariants}
                  className="bg-gradient-to-b from-blue-900/10 to-blue-900/5 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all hover:-translate-y-1 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleFormulaClick(formula.id)}
                >
                  <h3 className="text-xl font-semibold text-blue-300 mb-3">{formula.name}</h3>
                  <p className="text-blue-100/70 mb-4 text-sm">{formula.description}</p>
                  <div className="bg-[#0a0a14] p-4 rounded-lg border border-blue-800/30 overflow-x-auto shadow-inner shadow-blue-900/10">
                    <MathJax formula={formatFormula(formula.expression)} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 底部CTA */}
        <motion.div 
          className="mt-20 text-center"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold text-blue-300 mb-6">开始您的统一场论探索之旅</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate('/formulas')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-all shadow-lg hover:shadow-blue-500/30"
            >
              浏览所有公式
            </button>
            <button 
              onClick={() => navigate('/artificial-field')}
              className="px-8 py-3 bg-transparent border border-blue-600 hover:bg-blue-600/10 rounded-full text-white font-medium transition-all"
            >
              探索人工场
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
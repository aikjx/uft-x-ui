import { useState, useEffect } from 'react';
import FormulaMenu from '@/components/FormulaMenu';
import FormulaViewer from '@/components/FormulaViewer';
import { useTheme } from '@/hooks/useTheme';
import * as THREE from 'three';

// 定义公式数据类型
interface Formula {
  id: number;
  name: string;
  expression: string;
  description: string;
}

// 张祥前统一场论20个核心公式数据
const formulasData: Formula[] = [
  {
    id: 1,
    name: "时空同一化方程",
    expression: "\\vec{r}(t) = \\vec{C}t = x\\vec{i} + y\\vec{j} + z\\vec{k}",
    description: "描述空间和时间的统一关系，表明空间是时间的函数。"
  },
  {
    id: 2,
    name: "三维螺旋时空方程",
    expression: "\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}",
    description: "揭示物体在时空中的螺旋运动规律。"
  },
  {
    id: 3,
    name: "质量定义方程",
    expression: "m = k \\cdot \\frac{dn}{d\\Omega}",
    description: "从空间几何角度定义质量，与空间运动量有关。"
  },
  {
    id: 4,
    name: "引力场定义方程",
    expression: "\\overrightarrow{A} = -Gk\\frac{\\Delta n}{\\Delta s}\\frac{\\overrightarrow{r}}{r}",
    description: "定义引力场为空间运动量的变化率。"
  },
  {
    id: 5,
    name: "静止动量方程",
    expression: "\\overrightarrow{p}_{0} = m_{0}\\overrightarrow{C}_{0}",
    description: "描述静止物体的动量，与光速相关。"
  },
  {
    id: 6,
    name: "运动动量方程",
    expression: "\\overrightarrow{P} = m(\\overrightarrow{C} - \\overrightarrow{V})",
    description: "描述运动物体的动量，考虑了速度对动量的影响。"
  },
  {
    id: 7,
    name: "宇宙大统一方程（力方程）",
    expression: "F = \\frac{d\\vec{P}}{dt} = \\vec{C}\\frac{dm}{dt} - \\vec{V}\\frac{dm}{dt} + m\\frac{d\\vec{C}}{dt} - m\\frac{d\\vec{V}}{dt}",
    description: "统一描述各种力的本质，揭示力与动量变化的关系。"
  },
  {
    id: 8,
    name: "空间波动方程",
    expression: "\\frac{\\partial^2 L}{\\partial x^2} + \\frac{\\partial^2 L}{\\partial y^2} + \\frac{\\partial^2 L}{\\partial z^2} = \\frac{1}{c^2} \\frac{\\partial^2 L}{\\partial t^2}",
    description: "描述空间波动的传播规律。"
  },
  {
    id: 9,
    name: "电荷定义方程",
    expression: "q = k^{\\prime}k\\frac{1}{\\Omega^{2}}\\frac{d\\Omega}{dt}",
    description: "从空间几何角度定义电荷，与空间旋转运动有关。"
  },
  {
    id: 10,
    name: "电场定义方程",
    expression: "\\vec{E} = -\\frac{kk^{\\prime}}{4\\pi\\epsilon_0\\Omega^2}\\frac{d\\Omega}{dt}\\frac{\\vec{r}}{r^3}",
    description: "定义电场为空间旋转运动的变化率。"
  },
  {
    id: 11,
    name: "磁场定义方程",
    expression: "\\vec{B} = \\frac{\\mu_{0} \\gamma k k^{\\prime}}{4 \\pi \\Omega^{2}} \\frac{d \\Omega}{d t} \\frac{[(x-v t) \\vec{i}+y \\vec{j}+z \\vec{k}]}{[\\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}]^{\\frac{3}{2}}}",
    description: "定义磁场为运动电荷产生的空间效应。"
  },
  {
    id: 12,
    name: "变化的引力场产生电磁场",
    expression: "\\frac{\\partial^{2}\\overline{A}}{\\partial t^{2}} = \\frac{\\overline{V}}{f}(\\overline{\\nabla}\\cdot\\overline{E}) - \\frac{C^{2}}{f}(\\overline{\\nabla}\\times\\overline{B})",
    description: "揭示引力场与电磁场的相互转化关系。"
  },
  {
    id: 13,
    name: "磁矢势方程",
    expression: "\\vec{\\nabla} \\times \\vec{A} = \\frac{\\vec{B}}{f}",
    description: "描述磁矢势与磁场的关系。"
  },
  {
    id: 14,
    name: "变化的引力场产生电场",
    expression: "\\vec{E} = -f\\frac{d\\vec{A}}{dt}",
    description: "揭示引力场变化如何产生电场。"
  },
  {
    id: 15,
    name: "变化的磁场产生引力场和电场",
    expression: "\\frac{d\\overrightarrow{B}}{dt} = \\frac{-\\overrightarrow{A}\\times\\overrightarrow{E}}{c^2} - \\frac{\\overrightarrow{V}}{c^{2}}\\times\\frac{d\\overrightarrow{E}}{dt}",
    description: "揭示磁场变化如何产生引力场和电场。"
  },
  {
    id: 16,
    name: "统一场论能量方程",
    expression: "e = m_0 c^2 = mc^2\\sqrt{1 - \\frac{v^2}{c^2}}",
    description: "描述能量与质量、速度的关系，是相对论能量方程的扩展。"
  },
  {
    id: 17,
    name: "光速飞行器动力学方程",
    expression: "\\vec{F} = (\\vec{C} - \\vec{V})\\frac{dm}{dt}",
    description: "为超光速飞行提供理论基础。"
  },
  {
    id: 18,
    name: "核力场定义方程",
    expression: "\\mathbf{D} = - G m \\frac{ \\mathbf{C} - 3 \\frac{\\mathbf{R}}{r} \\dot{r} }{r^3}",
    description: "定义核力场为质量物体在空间中产生的特殊场效应。"
  },
  {
    id: 19,
    name: "引力光速统一方程",
    expression: "Z = Gc/2",
    description: "揭示万有引力常数与光速的内在联系。"
  },
  {
    id: 20,
    name: "电磁耦合常数",
    expression: "Z' = \\frac{c}{8\\pi\\epsilon_0}",
    description: "电磁相互作用的基本常数。"
  }
];

export default function Home() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(formulasData[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 切换公式选择
  const handleFormulaSelect = (formula: Formula) => {
    setSelectedFormula(formula);
    // 在移动设备上选择公式后自动关闭菜单
    if (window.innerWidth < 1024) {
      setIsMenuOpen(false);
    }
  };

  // 切换菜单显示
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 切换全屏模式
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  return (
    <div className={`flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white transition-colors duration-500 ${theme === 'dark' ? 'dark' : 'light'}`}>
      {/* 移动设备菜单切换按钮 */}
      <button 
        onClick={toggleMenu} 
        className="fixed top-4 left-4 z-50 lg:hidden bg-indigo-600/90 hover:bg-indigo-500/90 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-110"
        aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
      >
        <i className={`fa ${isMenuOpen ? 'fa-times' : 'fa-bars'} transition-transform duration-300`}></i>
      </button>

      {/* 左侧公式菜单 */}
      <FormulaMenu 
        formulas={formulasData} 
        selectedFormula={selectedFormula} 
        onSelectFormula={handleFormulaSelect} 
        isOpen={isMenuOpen}
      />

      {/* 右侧公式展示区域 */}
      <FormulaViewer 
        formula={selectedFormula} 
        onToggleTheme={toggleTheme}
        isMenuOpen={isMenuOpen}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </div>
  );
}
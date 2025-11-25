// 通用类型定义
export interface Formula {
  id: number;
  name: string;
  expression: string;
  description: string;
  category: string;
  parameters?: string[]; // 添加parameters属性
  visualizationType?: string; // 添加可视化类型属性
  complexity?: number; // 添加复杂度属性
}

export interface SimulationParameters {
  spacetime: {
    speed: number;
    curvature: number;
    particleCount: number;
  };
  gravity: {
    mass: number;
    distance: number;
    fieldStrength: number;
  };
  electromagnetic: {
    charge: number;
    fieldStrength: number;
    frequency: number;
  };
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  link: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface SimulationDataPoint {
  value: number;
  index: number;
}

// 路由参数类型
export interface RouteParams {
  id?: string;
  simulationType?: string;
}

// Three.js相关类型
export interface ThreeJSVisualizationProps {
  createScene: (scene: THREE.Scene) => void;
  updateScene?: (scene: THREE.Scene, deltaTime: number) => void;
  width?: number;
  height?: number;
  className?: string;
}
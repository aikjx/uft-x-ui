// 通用类型定义
export interface Formula {
  id: number;
  name: string;
  expression: string;
  description: string;
  category: string;
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
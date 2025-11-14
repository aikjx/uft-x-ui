import * as THREE from 'three';
import { PerformanceOptimizationManager, OptimizationStrategy, PerformanceMode } from './performanceOptimizationManager';
import { VISUALIZATION_CONFIG } from '../constants';

// 设备性能级别
export type DevicePerformanceTier = 'high' | 'medium' | 'low' | 'unknown';

// 设备信息接口
export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  gpu: string;
  isTouchDevice: boolean;
  screenResolution: { width: number; height: number };
  pixelRatio: number;
  supportsWebGL2: boolean;
  supportsWebGP: boolean;
  performanceTier: DevicePerformanceTier;
}

// 设备性能测试结果
export interface PerformanceTestResult {
  score: number;
  tier: DevicePerformanceTier;
  gpuScore: number;
  cpuScore: number;
  memoryScore: number;
  recommendedMode: PerformanceMode;
  optimalSettings: Partial<OptimizationStrategy>;
}

// 设备性能分析器类
export class DevicePerformanceAnalyzer {
  private deviceInfo: DeviceInfo;
  private testResult: PerformanceTestResult | null = null;
  private isTestRunning: boolean = false;
  private testStartTime: number = 0;
  private testDuration: number = 3000; // 3秒测试
  private testScene: THREE.Scene | null = null;
  private testCamera: THREE.PerspectiveCamera | null = null;
  private testRenderer: THREE.WebGLRenderer | null = null;
  private testCanvas: HTMLCanvasElement | null = null;
  private testCube: THREE.Mesh | null = null;
  private testParticles: THREE.Points | null = null;
  private frameCount: number = 0;
  private fpsHistory: number[] = [];
  private startTime: number = 0;
  
  constructor() {
    // 初始化设备信息
    this.deviceInfo = this.detectDeviceInfo();
  }
  
  // 检测设备信息
  private detectDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    
    // 检测浏览器
    let browser = 'unknown';
    let browserVersion = 'unknown';
    if (ua.includes('Chrome')) {
      browser = 'Chrome';
      const match = ua.match(/Chrome\/(\d+)/);
      browserVersion = match ? match[1] : 'unknown';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      const match = ua.match(/Firefox\/(\d+)/);
      browserVersion = match ? match[1] : 'unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
      const match = ua.match(/Version\/(\d+)/);
      browserVersion = match ? match[1] : 'unknown';
    } else if (ua.includes('Edge')) {
      browser = 'Edge';
      const match = ua.match(/Edge\/(\d+)/);
      browserVersion = match ? match[1] : 'unknown';
    }
    
    // 检测操作系统
    let os = 'unknown';
    let osVersion = 'unknown';
    if (ua.includes('Windows')) {
      os = 'Windows';
      const match = ua.match(/Windows NT (\d+\.\d+)/);
      osVersion = match ? match[1] : 'unknown';
    } else if (ua.includes('Mac OS X')) {
      os = 'macOS';
      const match = ua.match(/Mac OS X (\d+_\d+)/);
      osVersion = match ? match[1].replace('_', '.') : 'unknown';
    } else if (ua.includes('Android')) {
      os = 'Android';
      const match = ua.match(/Android (\d+\.\d+)/);
      osVersion = match ? match[1] : 'unknown';
    } else if (ua.includes('iOS')) {
      os = 'iOS';
      const match = ua.match(/iPhone OS (\d+_\d+)/);
      osVersion = match ? match[1].replace('_', '.') : 'unknown';
    }
    
    // 检测GPU信息
    let gpu = 'unknown';
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
      }
    }
    
    // 检测WebGL2和WebGPU支持
    const supportsWebGL2 = !!document.createElement('canvas').getContext('webgl2');
    const supportsWebGP = typeof navigator !== 'undefined' && 
                         typeof (navigator as any).gpu !== 'undefined';
    
    // 确定性能级别
    const performanceTier = this.determinePerformanceTier(
      navigator.hardwareConcurrency || 2,
      (navigator as any).deviceMemory || 4,
      isMobile || isTablet,
      supportsWebGL2,
      gpu
    );
    
    return {
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      browser,
      browserVersion,
      os,
      osVersion,
      hardwareConcurrency: navigator.hardwareConcurrency || 2,
      deviceMemory: (navigator as any).deviceMemory || 4,
      gpu,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenResolution: {
        width: window.screen.width,
        height: window.screen.height
      },
      pixelRatio: window.devicePixelRatio || 1,
      supportsWebGL2,
      supportsWebGP,
      performanceTier
    };
  }
  
  // 根据硬件规格确定性能级别
  private determinePerformanceTier(
    hardwareConcurrency: number,
    deviceMemory: number,
    isMobile: boolean,
    supportsWebGL2: boolean,
    gpu: string
  ): DevicePerformanceTier {
    // 移动设备默认降低一个级别
    if (isMobile) {
      if (hardwareConcurrency >= 8 && deviceMemory >= 6 && supportsWebGL2) {
        return 'medium'; // 高端移动设备视为中等
      } else if (hardwareConcurrency >= 4 && deviceMemory >= 4) {
        return 'medium';
      } else {
        return 'low';
      }
    }
    
    // 桌面设备
    if (hardwareConcurrency >= 8 && deviceMemory >= 8 && supportsWebGL2) {
      // 检查GPU是否为高端型号
      const highEndGPUs = ['RTX', 'GTX 10', 'GTX 20', 'GTX 30', 'AMD Radeon RX', 'AMD Radeon Pro'];
      if (highEndGPUs.some(gpuName => gpu.includes(gpuName))) {
        return 'high';
      }
      return 'medium';
    } else if (hardwareConcurrency >= 4 && deviceMemory >= 4) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  // 获取设备信息
  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }
  
  // 运行性能测试
  public async runPerformanceTest(): Promise<PerformanceTestResult> {
    if (this.isTestRunning) {
      throw new Error('性能测试已在运行中');
    }
    
    this.isTestRunning = true;
    this.testStartTime = performance.now();
    this.frameCount = 0;
    this.fpsHistory = [];
    this.startTime = this.testStartTime;
    
    // 创建测试场景
    this.setupTestScene();
    
    // 运行测试动画循环
    await new Promise<void>((resolve) => {
      const animate = () => {
        const currentTime = performance.now();
        
        // 每100毫秒记录一次FPS
        if (currentTime - this.startTime >= 100) {
          const fps = this.frameCount * 10;
          this.fpsHistory.push(fps);
          this.frameCount = 0;
          this.startTime = currentTime;
        }
        
        if (currentTime - this.testStartTime < this.testDuration) {
          this.updateTestScene();
          this.frameCount++;
          requestAnimationFrame(animate);
        } else {
          this.cleanupTestScene();
          this.isTestRunning = false;
          this.calculateTestResults();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
    
    return this.testResult!;
  }
  
  // 设置测试场景
  private setupTestScene(): void {
    // 创建测试Canvas（不添加到DOM）
    this.testCanvas = document.createElement('canvas');
    this.testCanvas.width = 500;
    this.testCanvas.height = 500;
    
    // 创建渲染器
    this.testRenderer = new THREE.WebGLRenderer({ 
      canvas: this.testCanvas,
      antialias: false,
      alpha: true
    });
    
    // 创建场景
    this.testScene = new THREE.Scene();
    
    // 创建相机
    this.testCamera = new THREE.PerspectiveCamera(
      75,
      1,
      0.1,
      1000
    );
    this.testCamera.position.z = 5;
    
    // 创建测试几何体（立方体）
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x00ff00,
      wireframe: false
    });
    this.testCube = new THREE.Mesh(geometry, material);
    this.testScene.add(this.testCube);
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.testScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.testScene.add(directionalLight);
    
    // 创建大量粒子来测试GPU性能
    const particleGeometry = new THREE.BufferGeometry();
    const particlesCount = 10000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.01,
      color: 0x0000ff
    });
    
    this.testParticles = new THREE.Points(particleGeometry, particleMaterial);
    this.testScene.add(this.testParticles);
  }
  
  // 更新测试场景
  private updateTestScene(): void {
    if (!this.testCube || !this.testParticles || !this.testRenderer || !this.testScene || !this.testCamera) return;
    
    // 旋转立方体
    this.testCube.rotation.x += 0.01;
    this.testCube.rotation.y += 0.01;
    
    // 旋转粒子系统
    this.testParticles.rotation.y += 0.001;
    
    // 渲染场景
    this.testRenderer.render(this.testScene, this.testCamera);
  }
  
  // 清理测试场景
  private cleanupTestScene(): void {
    if (this.testRenderer) {
      this.testRenderer.dispose();
      this.testRenderer = null;
    }
    
    if (this.testCube) {
      this.testCube.geometry.dispose();
      (this.testCube.material as THREE.Material).dispose();
      this.testCube = null;
    }
    
    if (this.testParticles) {
      this.testParticles.geometry.dispose();
      (this.testParticles.material as THREE.Material).dispose();
      this.testParticles = null;
    }
    
    this.testScene = null;
    this.testCamera = null;
    this.testCanvas = null;
  }
  
  // 计算测试结果
  private calculateTestResults(): void {
    if (this.fpsHistory.length === 0) {
      this.testResult = {
        score: 0,
        tier: 'unknown',
        gpuScore: 0,
        cpuScore: 0,
        memoryScore: 0,
        recommendedMode: 'low',
        optimalSettings: this.getOptimalSettingsForTier('low')
      };
      return;
    }
    
    // 计算平均FPS并移除异常值
    const sortedFPS = [...this.fpsHistory].sort((a, b) => a - b);
    const middleFPS = sortedFPS.slice(Math.floor(sortedFPS.length * 0.1), Math.floor(sortedFPS.length * 0.9));
    const avgFPS = middleFPS.reduce((sum, fps) => sum + fps, 0) / middleFPS.length;
    
    // 计算性能分数（0-100）
    const fpsScore = Math.min(100, Math.max(0, (avgFPS / 60) * 100));
    const hardwareScore = this.calculateHardwareScore();
    
    // 综合分数
    const totalScore = (fpsScore * 0.6) + (hardwareScore * 0.4);
    
    // 确定性能级别
    let tier: DevicePerformanceTier;
    if (totalScore >= 70) {
      tier = 'high';
    } else if (totalScore >= 40) {
      tier = 'medium';
    } else {
      tier = 'low';
    }
    
    // 确定推荐的性能模式
    const recommendedMode: PerformanceMode = tier === 'high' ? 'high' : tier === 'medium' ? 'medium' : 'low';
    
    this.testResult = {
      score: Math.round(totalScore),
      tier,
      gpuScore: Math.round(fpsScore),
      cpuScore: Math.round(this.deviceInfo.hardwareConcurrency / 16 * 100),
      memoryScore: Math.round(this.deviceInfo.deviceMemory / 16 * 100),
      recommendedMode,
      optimalSettings: this.getOptimalSettingsForTier(tier)
    };
    
    // 更新设备性能级别
    this.deviceInfo.performanceTier = tier;
    
    console.log('性能测试结果:', this.testResult);
  }
  
  // 计算硬件分数
  private calculateHardwareScore(): number {
    const cpuScore = Math.min(100, (this.deviceInfo.hardwareConcurrency / 16) * 100);
    const memoryScore = Math.min(100, (this.deviceInfo.deviceMemory / 16) * 100);
    const gpuScore = this.deviceInfo.supportsWebGL2 ? 80 : 40;
    
    return (cpuScore * 0.3) + (memoryScore * 0.3) + (gpuScore * 0.4);
  }
  
  // 获取特定性能级别的最佳设置
  private getOptimalSettingsForTier(tier: DevicePerformanceTier): Partial<OptimizationStrategy> {
    switch (tier) {
      case 'high':
        return {
          particleCount: 300,
          fieldResolution: 30,
          renderScale: 1.0,
          shadowQuality: 'high',
          enableShadows: true,
          enableLOD: false,
          pixelRatio: Math.min(window.devicePixelRatio, 2.0)
        };
      case 'medium':
        return {
          particleCount: 200,
          fieldResolution: 20,
          renderScale: 0.8,
          shadowQuality: 'medium',
          enableShadows: true,
          enableLOD: true,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5)
        };
      case 'low':
      default:
        return {
          particleCount: 100,
          fieldResolution: 15,
          renderScale: 0.6,
          shadowQuality: 'low',
          enableShadows: false,
          enableLOD: true,
          pixelRatio: 1.0
        };
    }
  }
  
  // 应用最佳配置到性能优化管理器
  public applyOptimalSettings(optimizer: PerformanceOptimizationManager): void {
    if (this.testResult) {
      // 使用测试结果的设置
      const currentStrategy = optimizer.getCurrentStrategy();
      const optimalStrategy = {
        ...currentStrategy,
        ...this.testResult.optimalSettings
      };
      
      optimizer.applyStrategy(optimalStrategy);
      optimizer.setPerformanceMode(this.testResult.recommendedMode);
    } else {
      // 使用基于设备规格的默认设置
      const optimalSettings = this.getOptimalSettingsForTier(this.deviceInfo.performanceTier);
      const currentStrategy = optimizer.getCurrentStrategy();
      const strategy = {
        ...currentStrategy,
        ...optimalSettings
      };
      
      optimizer.applyStrategy(strategy);
      
      // 设置推荐的性能模式
      const recommendedMode: PerformanceMode = 
        this.deviceInfo.performanceTier === 'high' ? 'high' :
        this.deviceInfo.performanceTier === 'medium' ? 'medium' : 'low';
      optimizer.setPerformanceMode(recommendedMode);
    }
  }
  
  // 获取缓存的测试结果
  public getTestResult(): PerformanceTestResult | null {
    return this.testResult;
  }
  
  // 检查是否支持特定功能
  public isFeatureSupported(feature: string): boolean {
    switch (feature) {
      case 'webgl2':
        return this.deviceInfo.supportsWebGL2;
      case 'webgpu':
        return this.deviceInfo.supportsWebGP;
      case 'shadows':
        return this.deviceInfo.performanceTier !== 'low' || this.deviceInfo.supportsWebGL2;
      case 'high-res-textures':
        return this.deviceInfo.deviceMemory >= 4 && this.deviceInfo.performanceTier !== 'low';
      default:
        return false;
    }
  }
  
  // 生成设备兼容性报告
  public generateCompatibilityReport(): { 
    isCompatible: boolean; 
    warnings: string[]; 
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // 检查基本兼容性
    const isCompatible = this.deviceInfo.supportsWebGL2 || !!document.createElement('canvas').getContext('webgl');
    
    if (!isCompatible) {
      warnings.push('您的设备不支持WebGL，无法运行可视化效果');
      return { isCompatible: false, warnings, recommendations };
    }
    
    // 性能警告
    if (this.deviceInfo.performanceTier === 'low') {
      warnings.push('您的设备性能较低，可能会影响可视化效果的流畅度');
      recommendations.push('建议使用低性能模式运行');
      recommendations.push('降低浏览器中其他标签页的数量');
    }
    
    // 移动设备警告
    if (this.deviceInfo.deviceType === 'mobile') {
      warnings.push('移动设备上可能会消耗较多电量');
      recommendations.push('考虑在桌面设备上查看以获得最佳体验');
    }
    
    // 内存警告
    if (this.deviceInfo.deviceMemory < 4) {
      warnings.push('可用内存较少，可能会影响复杂场景的加载');
      recommendations.push('关闭其他应用程序以释放内存');
    }
    
    // GPU警告
    if (!this.deviceInfo.supportsWebGL2) {
      warnings.push('您的GPU不支持WebGL2，某些高级效果将不可用');
    }
    
    return { isCompatible, warnings, recommendations };
  }
}

// 导出单例实例
export const devicePerformanceAnalyzer = new DevicePerformanceAnalyzer();

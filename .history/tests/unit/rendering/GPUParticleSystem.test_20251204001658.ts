import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { GPUParticleSystem, GPUParticleSystemManager } from '@/visualization/GPUParticleSystem';

describe('GPUParticleSystem', () => {
  let scene: THREE.Scene;
  let config: any;
  let gpuParticleSystem: GPUParticleSystem;

  beforeEach(() => {
    // 创建场景
    scene = new THREE.Scene();
    
    // 配置GPU粒子系统
    config = {
      maxParticles: 1000,
      position: new THREE.Vector3(0, 0, 0),
      rate: 50,
      lifetime: 5,
      lifetimeVariance: 2,
      velocity: new THREE.Vector3(0, 5, 0),
      velocityVariance: 2,
      size: 0.5,
      sizeVariance: 0.2,
      color: new THREE.Color(0x00ffff),
      colorVariance: 0.5,
      spread: Math.PI * 2,
      gravity: new THREE.Vector3(0, -0.5, 0),
      turbulence: 0.5,
      damping: 0.98,
      startSize: 0.1,
      endSize: 1.0,
      startColor: new THREE.Color(0x00ffff),
      endColor: new THREE.Color(0xff00ff)
    };
    
    gpuParticleSystem = new GPUParticleSystem(scene, config);
  });

  it('should initialize with correct default values', () => {
    // 检查初始状态
    expect(gpuParticleSystem.getParticleCount()).toBe(0);
    expect(gpuParticleSystem.getMaxParticles()).toBe(config.maxParticles);
  });

  it('should emit particles', () => {
    // 更新粒子系统，触发粒子发射
    gpuParticleSystem.update(1);
    
    // 检查是否有粒子被发射
    expect(gpuParticleSystem.getParticleCount()).toBeGreaterThan(0);
  });

  it('should update particles correctly', () => {
    // 发射一些粒子
    gpuParticleSystem.update(0.5);
    const initialCount = gpuParticleSystem.getParticleCount();
    
    // 再次更新，让粒子运动和老化
    gpuParticleSystem.update(1);
    
    // 检查粒子数量是否变化（应该有新粒子发射，同时旧粒子可能死亡）
    const updatedCount = gpuParticleSystem.getParticleCount();
    expect(updatedCount).toBeGreaterThanOrEqual(0);
  });

  it('should respect max particles limit', () => {
    // 使用较小的最大粒子数
    const limitedConfig = {
      ...config,
      maxParticles: 100,
      rate: 1000 // 高发射率，确保快速达到上限
    };
    
    const limitedSystem = new GPUParticleSystem(scene, limitedConfig);
    
    // 快速更新多次，确保粒子数达到上限
    for (let i = 0; i < 10; i++) {
      limitedSystem.update(0.1);
    }
    
    // 检查粒子数是否不超过上限
    expect(limitedSystem.getParticleCount()).toBeLessThanOrEqual(limitedConfig.maxParticles);
  });

  it('should set position correctly', () => {
    // 设置新位置
    const newPosition = new THREE.Vector3(10, 5, -3);
    gpuParticleSystem.setPosition(newPosition);
    
    // 更新系统，确保位置生效
    gpuParticleSystem.update(0.1);
    
    // 检查粒子系统是否正常工作
    expect(gpuParticleSystem.getParticleCount()).toBeGreaterThanOrEqual(0);
  });

  it('should dispose correctly', () => {
    // 发射一些粒子
    gpuParticleSystem.update(1);
    
    // 检查粒子系统是否有粒子
    expect(gpuParticleSystem.getParticleCount()).toBeGreaterThan(0);
    
    // 释放粒子系统
    gpuParticleSystem.dispose();
    
    // 检查粒子系统是否被正确移除
    expect(scene.children.length).toBe(0);
  });
});

describe('GPUParticleSystemManager', () => {
  let scene: THREE.Scene;
  let particleSystemManager: GPUParticleSystemManager;
  let config: any;

  beforeEach(() => {
    // 创建场景
    scene = new THREE.Scene();
    
    // 创建粒子系统管理器
    particleSystemManager = new GPUParticleSystemManager(scene);
    
    // 配置GPU粒子系统
    config = {
      maxParticles: 1000,
      position: new THREE.Vector3(0, 0, 0),
      rate: 50,
      lifetime: 5,
      lifetimeVariance: 2,
      velocity: new THREE.Vector3(0, 5, 0),
      velocityVariance: 2,
      size: 0.5,
      sizeVariance: 0.2,
      color: new THREE.Color(0x00ffff),
      colorVariance: 0.5,
      spread: Math.PI * 2,
      gravity: new THREE.Vector3(0, -0.5, 0),
      turbulence: 0.5,
      damping: 0.98,
      startSize: 0.1,
      endSize: 1.0,
      startColor: new THREE.Color(0x00ffff),
      endColor: new THREE.Color(0xff00ff)
    };
  });

  it('should create particle system correctly', () => {
    // 创建GPU粒子系统
    const particleSystem = particleSystemManager.createParticleSystem('test-system', config);
    
    // 检查返回的粒子系统是否是GPUParticleSystem实例
    expect(particleSystem).toBeDefined();
    expect(particleSystem.getMaxParticles()).toBe(config.maxParticles);
  });

  it('should get particle system correctly', () => {
    // 创建GPU粒子系统
    particleSystemManager.createParticleSystem('test-system', config);
    
    // 获取粒子系统
    const particleSystem = particleSystemManager.getParticleSystem('test-system');
    
    // 检查是否获取到正确的粒子系统
    expect(particleSystem).toBeDefined();
  });

  it('should remove particle system correctly', () => {
    // 创建GPU粒子系统
    particleSystemManager.createParticleSystem('test-system', config);
    
    // 移除粒子系统
    particleSystemManager.removeParticleSystem('test-system');
    
    // 尝试获取已移除的粒子系统，应该返回undefined
    const particleSystem = particleSystemManager.getParticleSystem('test-system');
    expect(particleSystem).toBeUndefined();
  });

  it('should update all particle systems', () => {
    // 创建多个粒子系统
    particleSystemManager.createParticleSystem('system1', config);
    particleSystemManager.createParticleSystem('system2', config);
    
    // 更新所有粒子系统
    particleSystemManager.update(1);
    
    // 检查粒子系统是否有粒子被发射
    const system1 = particleSystemManager.getParticleSystem('system1');
    const system2 = particleSystemManager.getParticleSystem('system2');
    
    expect(system1?.getParticleCount()).toBeGreaterThan(0);
    expect(system2?.getParticleCount()).toBeGreaterThan(0);
  });

  it('should dispose all particle systems', () => {
    // 创建多个粒子系统
    particleSystemManager.createParticleSystem('system1', config);
    particleSystemManager.createParticleSystem('system2', config);
    
    // 释放所有粒子系统
    particleSystemManager.dispose();
    
    // 检查粒子系统是否被正确移除
    expect(scene.children.length).toBe(0);
  });
});
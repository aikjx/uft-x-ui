// 性能测试脚本
import * as THREE from 'three';
import { PhysicsEngine } from './src/core/PhysicsEngine.js';

// 测试物理场计算性能
function testPhysicsFieldCalculation() {
  console.log('\n=== 物理场计算性能测试 ===');
  
  const physicsEngine = new PhysicsEngine();
  const position = new THREE.Vector3(10, 10, 10);
  const mass = 1000;
  const charge = 1;
  const time = 0;
  
  // 测试1: 单次计算性能
  const startTime1 = performance.now();
  for (let i = 0; i < 10000; i++) {
    physicsEngine.calculateUnifiedField(position, time, mass, charge);
  }
  const endTime1 = performance.now();
  console.log(`10,000次统一场计算: ${(endTime1 - startTime1).toFixed(2)} ms`);
  
  // 测试2: 缓存效果测试
  const startTime2 = performance.now();
  for (let i = 0; i < 10000; i++) {
    physicsEngine.calculateUnifiedField(position, time, mass, charge);
  }
  const endTime2 = performance.now();
  console.log(`10,000次缓存统一场计算: ${(endTime2 - startTime2).toFixed(2)} ms`);
  
  // 测试3: 不同位置计算性能
  const startTime3 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const randomPos = new THREE.Vector3(
      Math.random() * 100 - 50,
      Math.random() * 100 - 50,
      Math.random() * 100 - 50
    );
    physicsEngine.calculateUnifiedField(randomPos, time, mass, charge);
  }
  const endTime3 = performance.now();
  console.log(`1,000次随机位置统一场计算: ${(endTime3 - startTime3).toFixed(2)} ms`);
}

// 测试参数更新性能
function testParameterUpdate() {
  console.log('\n=== 参数更新性能测试 ===');
  
  const physicsEngine = new PhysicsEngine();
  const params = {
    performanceMode: 'medium',
    simulationSpeed: 0.5,
    precision: 1e-4
  };
  
  const startTime = performance.now();
  for (let i = 0; i < 100; i++) {
    physicsEngine.setParameters(params);
  }
  const endTime = performance.now();
  console.log(`100次参数更新: ${(endTime - startTime).toFixed(2)} ms`);
}

// 测试性能模式切换
function testPerformanceModeSwitch() {
  console.log('\n=== 性能模式切换测试 ===');
  
  const physicsEngine = new PhysicsEngine();
  const modes = ['high', 'medium', 'low'];
  
  const startTime = performance.now();
  for (let i = 0; i < 100; i++) {
    const mode = modes[i % 3];
    physicsEngine.setPerformanceMode(mode);
  }
  const endTime = performance.now();
  console.log(`100次性能模式切换: ${(endTime - startTime).toFixed(2)} ms`);
}

// 运行所有测试
function runAllTests() {
  console.log('性能测试开始...');
  const totalStartTime = performance.now();
  
  testPhysicsFieldCalculation();
  testParameterUpdate();
  testPerformanceModeSwitch();
  
  const totalEndTime = performance.now();
  console.log(`\n=== 测试完成 ===`);
  console.log(`总测试时间: ${(totalEndTime - totalStartTime).toFixed(2)} ms`);
}

// 运行测试
runAllTests();

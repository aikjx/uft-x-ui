/**
 * 数学工具函数库
 * Advanced Mathematical Utilities for Unified Field Theory
 */

import * as THREE from 'three'
import { Complex, Tensor } from '@/types/unified-field-theory'

/**
 * 复数运算工具
 */
export class ComplexMath {
  /**
   * 复数加法
   */
  static add(a: Complex, b: Complex): Complex {
    return {
      real: a.real + b.real,
      imag: a.imag + b.imag
    }
  }

  /**
   * 复数减法
   */
  static subtract(a: Complex, b: Complex): Complex {
    return {
      real: a.real - b.real,
      imag: a.imag - b.imag
    }
  }

  /**
   * 复数乘法
   */
  static multiply(a: Complex, b: Complex): Complex {
    return {
      real: a.real * b.real - a.imag * b.imag,
      imag: a.real * b.imag + a.imag * b.real
    }
  }

  /**
   * 复数除法
   */
  static divide(a: Complex, b: Complex): Complex {
    const denominator = b.real * b.real + b.imag * b.imag
    return {
      real: (a.real * b.real + a.imag * b.imag) / denominator,
      imag: (a.imag * b.real - a.real * b.imag) / denominator
    }
  }

  /**
   * 复数模
   */
  static abs(c: Complex): number {
    return Math.sqrt(c.real * c.real + c.imag * c.imag)
  }

  /**
   * 复数共轭
   */
  static conjugate(c: Complex): Complex {
    return {
      real: c.real,
      imag: -c.imag
    }
  }

  /**
   * 复数指数
   */
  static exp(c: Complex): Complex {
    const expReal = Math.exp(c.real)
    return {
      real: expReal * Math.cos(c.imag),
      imag: expReal * Math.sin(c.imag)
    }
  }

  /**
   * 欧拉公式: e^(iθ) = cos(θ) + i*sin(θ)
   */
  static euler(theta: number): Complex {
    return {
      real: Math.cos(theta),
      imag: Math.sin(theta)
    }
  }
}

/**
 * 向量运算工具
 */
export class VectorMath {
  /**
   * 向量点积
   */
  static dot(a: THREE.Vector3, b: THREE.Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z
  }

  /**
   * 向量叉积
   */
  static cross(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)
  }

  /**
   * 向量归一化
   */
  static normalize(v: THREE.Vector3): THREE.Vector3 {
    const length = v.length()
    if (length === 0) return new THREE.Vector3(0, 0, 0)
    return v.clone().divideScalar(length)
  }

  /**
   * 向量投影
   */
  static project(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3 {
    const scalar = this.dot(a, b) / this.dot(b, b)
    return b.clone().multiplyScalar(scalar)
  }

  /**
   * 向量反射
   */
  static reflect(v: THREE.Vector3, normal: THREE.Vector3): THREE.Vector3 {
    const dot = this.dot(v, normal)
    return v.clone().sub(normal.clone().multiplyScalar(2 * dot))
  }

  /**
   * 向量插值
   */
  static lerp(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
    return new THREE.Vector3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t)
  }

  /**
   * 球面线性插值
   */
  static slerp(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
    const dot = this.dot(this.normalize(a), this.normalize(b))
    const theta = Math.acos(Math.max(-1, Math.min(1, dot)))

    if (Math.abs(theta) < 0.001) {
      return this.lerp(a, b, t)
    }

    const sinTheta = Math.sin(theta)
    const wa = Math.sin((1 - t) * theta) / sinTheta
    const wb = Math.sin(t * theta) / sinTheta

    return a.clone().multiplyScalar(wa).add(b.clone().multiplyScalar(wb))
  }
}

/**
 * 矩阵运算工具
 */
export class MatrixMath {
  /**
   * 矩阵乘法
   */
  static multiply(a: number[][], b: number[][]): number[][] {
    const rows = a.length
    const cols = b[0].length
    const inner = b.length

    const result: number[][] = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(0))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let k = 0; k < inner; k++) {
          result[i][j] += a[i][k] * b[k][j]
        }
      }
    }

    return result
  }

  /**
   * 矩阵转置
   */
  static transpose(matrix: number[][]): number[][] {
    const rows = matrix.length
    const cols = matrix[0].length

    const result: number[][] = Array(cols)
      .fill(0)
      .map(() => Array(rows).fill(0))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = matrix[i][j]
      }
    }

    return result
  }

  /**
   * 矩阵行列式 (2x2)
   */
  static determinant2x2(matrix: number[][]): number {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
  }

  /**
   * 矩阵行列式 (3x3)
   */
  static determinant3x3(matrix: number[][]): number {
    return (
      matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
      matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
      matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
    )
  }

  /**
   * 单位矩阵
   */
  static identity(size: number): number[][] {
    const result: number[][] = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0))
    for (let i = 0; i < size; i++) {
      result[i][i] = 1
    }
    return result
  }
}

/**
 * 张量运算工具
 */
export class TensorMath {
  /**
   * 创建零张量
   */
  static zeros(dimensions: number[]): Tensor {
    const size = dimensions.reduce((a, b) => a * b, 1)
    return {
      rank: dimensions.length,
      dimensions,
      data: Array(size).fill(0)
    }
  }

  /**
   * 张量加法
   */
  static add(a: Tensor, b: Tensor): Tensor {
    if (a.rank !== b.rank) {
      throw new Error('Tensor ranks must match')
    }

    return {
      rank: a.rank,
      dimensions: a.dimensions,
      data: a.data.map((val, i) => val + b.data[i])
    }
  }

  /**
   * 张量标量乘法
   */
  static scale(tensor: Tensor, scalar: number): Tensor {
    return {
      rank: tensor.rank,
      dimensions: tensor.dimensions,
      data: tensor.data.map(val => val * scalar)
    }
  }

  /**
   * 张量缩并
   */
  static contract(tensor: Tensor, indices: number[]): Tensor {
    // 简化实现
    return tensor
  }
}

/**
 * 物理数学工具
 */
export class PhysicsMath {
  /**
   * 洛伦兹因子
   */
  static lorentzFactor(v: number, c: number): number {
    const beta = v / c
    return 1 / Math.sqrt(1 - beta * beta)
  }

  /**
   * 相对论动量
   */
  static relativisticMomentum(m: number, v: number, c: number): number {
    const gamma = this.lorentzFactor(v, c)
    return gamma * m * v
  }

  /**
   * 相对论能量
   */
  static relativisticEnergy(m: number, v: number, c: number): number {
    const gamma = this.lorentzFactor(v, c)
    return gamma * m * c * c
  }

  /**
   * 史瓦西半径
   */
  static schwarzschildRadius(M: number, G: number, c: number): number {
    return (2 * G * M) / (c * c)
  }

  /**
   * 逃逸速度
   */
  static escapeVelocity(M: number, r: number, G: number): number {
    return Math.sqrt((2 * G * M) / r)
  }

  /**
   * 轨道速度
   */
  static orbitalVelocity(M: number, r: number, G: number): number {
    return Math.sqrt((G * M) / r)
  }

  /**
   * 引力势能
   */
  static gravitationalPotential(M: number, r: number, G: number): number {
    return -(G * M) / r
  }

  /**
   * 时间膨胀因子
   */
  static timeDilation(v: number, c: number): number {
    return this.lorentzFactor(v, c)
  }

  /**
   * 长度收缩因子
   */
  static lengthContraction(v: number, c: number): number {
    const gamma = this.lorentzFactor(v, c)
    return 1 / gamma
  }
}

/**
 * 数值积分工具
 */
export class NumericalIntegration {
  /**
   * 梯形法则
   */
  static trapezoid(f: (x: number) => number, a: number, b: number, n: number): number {
    const h = (b - a) / n
    let sum = (f(a) + f(b)) / 2

    for (let i = 1; i < n; i++) {
      sum += f(a + i * h)
    }

    return sum * h
  }

  /**
   * 辛普森法则
   */
  static simpson(f: (x: number) => number, a: number, b: number, n: number): number {
    if (n % 2 !== 0) n++

    const h = (b - a) / n
    let sum = f(a) + f(b)

    for (let i = 1; i < n; i++) {
      const x = a + i * h
      sum += f(x) * (i % 2 === 0 ? 2 : 4)
    }

    return (sum * h) / 3
  }

  /**
   * 龙格-库塔法 (RK4)
   */
  static rk4(
    f: (t: number, y: number) => number,
    t0: number,
    y0: number,
    h: number,
    steps: number
  ): number[] {
    const result = [y0]
    let t = t0
    let y = y0

    for (let i = 0; i < steps; i++) {
      const k1 = h * f(t, y)
      const k2 = h * f(t + h / 2, y + k1 / 2)
      const k3 = h * f(t + h / 2, y + k2 / 2)
      const k4 = h * f(t + h, y + k3)

      y += (k1 + 2 * k2 + 2 * k3 + k4) / 6
      t += h

      result.push(y)
    }

    return result
  }
}

/**
 * 插值工具
 */
export class Interpolation {
  /**
   * 线性插值
   */
  static linear(x: number, x0: number, x1: number, y0: number, y1: number): number {
    return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0)
  }

  /**
   * 双线性插值
   */
  static bilinear(
    x: number,
    y: number,
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    q00: number,
    q01: number,
    q10: number,
    q11: number
  ): number {
    const r1 = this.linear(x, x0, x1, q00, q10)
    const r2 = this.linear(x, x0, x1, q01, q11)
    return this.linear(y, y0, y1, r1, r2)
  }

  /**
   * 三次样条插值
   */
  static cubicSpline(x: number, points: { x: number; y: number }[]): number {
    // 简化实现
    if (points.length < 2) return points[0]?.y || 0

    // 找到x所在的区间
    let i = 0
    while (i < points.length - 1 && points[i + 1].x < x) {
      i++
    }

    if (i >= points.length - 1) return points[points.length - 1].y

    // 线性插值作为简化
    return this.linear(x, points[i].x, points[i + 1].x, points[i].y, points[i + 1].y)
  }
}

/**
 * 统计工具
 */
export class Statistics {
  /**
   * 平均值
   */
  static mean(data: number[]): number {
    return data.reduce((sum, val) => sum + val, 0) / data.length
  }

  /**
   * 标准差
   */
  static standardDeviation(data: number[]): number {
    const avg = this.mean(data)
    const squareDiffs = data.map(val => Math.pow(val - avg, 2))
    return Math.sqrt(this.mean(squareDiffs))
  }

  /**
   * 方差
   */
  static variance(data: number[]): number {
    const avg = this.mean(data)
    const squareDiffs = data.map(val => Math.pow(val - avg, 2))
    return this.mean(squareDiffs)
  }

  /**
   * 中位数
   */
  static median(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2
    }
    return sorted[mid]
  }

  /**
   * 最小值
   */
  static min(data: number[]): number {
    return Math.min(...data)
  }

  /**
   * 最大值
   */
  static max(data: number[]): number {
    return Math.max(...data)
  }

  /**
   * 范围
   */
  static range(data: number[]): number {
    return this.max(data) - this.min(data)
  }
}

/**
 * 工具函数
 */
export const MathUtils = {
  /**
   * 限制值在范围内
   */
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  },

  /**
   * 线性映射
   */
  map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  },

  /**
   * 平滑步进
   */
  smoothstep(edge0: number, edge1: number, x: number): number {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1)
    return t * t * (3 - 2 * t)
  },

  /**
   * 更平滑的步进
   */
  smootherstep(edge0: number, edge1: number, x: number): number {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1)
    return t * t * t * (t * (t * 6 - 15) + 10)
  },

  /**
   * 角度转弧度
   */
  degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180
  },

  /**
   * 弧度转角度
   */
  radToDeg(radians: number): number {
    return (radians * 180) / Math.PI
  },

  /**
   * 判断是否为2的幂
   */
  isPowerOfTwo(value: number): boolean {
    return (value & (value - 1)) === 0 && value !== 0
  },

  /**
   * 向上取整到2的幂
   */
  ceilPowerOfTwo(value: number): number {
    return Math.pow(2, Math.ceil(Math.log2(value)))
  },

  /**
   * 向下取整到2的幂
   */
  floorPowerOfTwo(value: number): number {
    return Math.pow(2, Math.floor(Math.log2(value)))
  }
}

/**
 * 公式引擎单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FormulaEngine } from '@/core/FormulaEngine'
import { FormulaType, PHYSICS_CONSTANTS } from '@/types/unified-field-theory'
import * as THREE from 'three'

describe('FormulaEngine', () => {
  let engine: FormulaEngine

  beforeEach(() => {
    engine = new FormulaEngine()
  })

  describe('时空同一化方程', () => {
    it('应该正确计算时空位置', () => {
      const result = engine.calculate(FormulaType.SPACETIME_UNITY, {
        c: PHYSICS_CONSTANTS.LIGHT_SPEED,
        t: 1,
        C: new THREE.Vector3(1, 0, 0)
      })

      expect(result).toBeInstanceOf(THREE.Vector3)
      expect(result.x).toBeCloseTo(PHYSICS_CONSTANTS.LIGHT_SPEED, -6)
      expect(result.y).toBe(0)
      expect(result.z).toBe(0)
    })

    it('应该处理不同的时间值', () => {
      const result1 = engine.calculate(FormulaType.SPACETIME_UNITY, {
        c: 1e8,
        t: 0
      })
      expect(result1.length()).toBe(0)

      const result2 = engine.calculate(FormulaType.SPACETIME_UNITY, {
        c: 1e8,
        t: 2
      })
      expect(result2.length()).toBeCloseTo(2e8, -6)
    })
  })

  describe('三维螺旋时空方程', () => {
    it('应该生成螺旋轨迹', () => {
      const result = engine.calculate(FormulaType.SPIRAL_SPACETIME, {
        r: 1,
        omega: 1,
        h: 0.1,
        t: 0
      })

      expect(result).toBeInstanceOf(THREE.Vector3)
      expect(result.x).toBeCloseTo(1, 5)
      expect(result.y).toBeCloseTo(0, 5)
      expect(result.z).toBeCloseTo(0, 5)
    })

    it('应该随时间变化', () => {
      const t1 = 0
      const t2 = Math.PI / 2

      const result1 = engine.calculate(FormulaType.SPIRAL_SPACETIME, {
        r: 1,
        omega: 1,
        h: 0.1,
        t: t1
      })

      const result2 = engine.calculate(FormulaType.SPIRAL_SPACETIME, {
        r: 1,
        omega: 1,
        h: 0.1,
        t: t2
      })

      expect(result1.x).not.toBeCloseTo(result2.x, 1)
      expect(result1.y).not.toBeCloseTo(result2.y, 1)
    })
  })

  describe('质量定义方程', () => {
    it('应该正确计算质量', () => {
      const result = engine.calculate(FormulaType.MASS_DEFINITION, {
        k: 1,
        n: 10,
        Omega: 2
      })

      expect(result).toBe(5)
    })

    it('应该处理不同的参数', () => {
      const result1 = engine.calculate(FormulaType.MASS_DEFINITION, {
        k: 2,
        n: 10,
        Omega: 5
      })
      expect(result1).toBe(4)

      const result2 = engine.calculate(FormulaType.MASS_DEFINITION, {
        k: 0.5,
        n: 20,
        Omega: 4
      })
      expect(result2).toBe(2.5)
    })
  })

  describe('引力场定义方程', () => {
    it('应该生成引力场矢量', () => {
      const result = engine.calculate(FormulaType.GRAVITY_FIELD, {
        G: PHYSICS_CONSTANTS.GRAVITY_CONSTANT,
        k: 1,
        n: 1,
        r: 1
      })

      expect(result).toBeInstanceOf(THREE.Vector3)
      expect(result.z).toBeLessThan(0) // 引力指向负方向
    })

    it('引力应该随距离平方反比衰减', () => {
      const result1 = engine.calculate(FormulaType.GRAVITY_FIELD, {
        G: 1,
        k: 1,
        n: 1,
        r: 1
      })

      const result2 = engine.calculate(FormulaType.GRAVITY_FIELD, {
        G: 1,
        k: 1,
        n: 1,
        r: 2
      })

      const ratio = result1.length() / result2.length()
      expect(ratio).toBeCloseTo(4, 1) // 距离加倍，引力减小到1/4
    })
  })

  describe('动量方程', () => {
    it('应该正确计算静止动量', () => {
      const result = engine.calculate(FormulaType.STATIC_MOMENTUM, {
        m0: 1,
        C: new THREE.Vector3(PHYSICS_CONSTANTS.LIGHT_SPEED, 0, 0)
      })

      expect(result).toBeInstanceOf(THREE.Vector3)
      expect(result.x).toBeCloseTo(PHYSICS_CONSTANTS.LIGHT_SPEED, -6)
    })

    it('应该正确计算运动动量', () => {
      const result = engine.calculate(FormulaType.MOTION_MOMENTUM, {
        m: 1,
        C: new THREE.Vector3(1e8, 0, 0),
        V: new THREE.Vector3(1e7, 0, 0)
      })

      expect(result).toBeInstanceOf(THREE.Vector3)
      expect(result.x).toBeCloseTo(9e7, -6)
    })
  })

  describe('能量方程', () => {
    it('应该正确计算静止能量', () => {
      const result = engine.calculate(FormulaType.ENERGY_EQUATION, {
        m: 1,
        c: PHYSICS_CONSTANTS.LIGHT_SPEED,
        v: 0
      })

      const expected = PHYSICS_CONSTANTS.LIGHT_SPEED ** 2
      expect(result).toBeCloseTo(expected, -10)
    })

    it('应该考虑相对论效应', () => {
      const m = 1
      const c = PHYSICS_CONSTANTS.LIGHT_SPEED
      const v = c * 0.5

      const result = engine.calculate(FormulaType.ENERGY_EQUATION, {
        m,
        c,
        v
      })

      const restEnergy = m * c * c
      expect(result).toBeGreaterThan(restEnergy) // 运动能量应该大于静止能量
    })
  })

  describe('引力光速统一方程', () => {
    it('应该正确计算Z值', () => {
      const result = engine.calculate(FormulaType.GRAVITY_LIGHTSPEED, {
        G: PHYSICS_CONSTANTS.GRAVITY_CONSTANT,
        c: PHYSICS_CONSTANTS.LIGHT_SPEED
      })

      const expected = (PHYSICS_CONSTANTS.GRAVITY_CONSTANT * PHYSICS_CONSTANTS.LIGHT_SPEED) / 2
      expect(result).toBeCloseTo(expected, -5)
    })
  })

  describe('场数据生成', () => {
    it('应该生成引力场数据', () => {
      const fieldData = engine.generateFieldData(
        FormulaType.GRAVITY_FIELD,
        {
          G: PHYSICS_CONSTANTS.GRAVITY_CONSTANT,
          k: 1,
          n: 1
        },
        8 // 低分辨率用于测试
      )

      expect(fieldData.type).toBe('gravity')
      expect(fieldData.points.length).toBeGreaterThan(0)
      expect(fieldData.values.length).toBe(fieldData.points.length)
      expect(fieldData.vectors?.length).toBe(fieldData.points.length)
      expect(fieldData.intensity.length).toBe(fieldData.points.length)
    })

    it('场强度应该随距离衰减', () => {
      const fieldData = engine.generateFieldData(
        FormulaType.GRAVITY_FIELD,
        {
          G: 1,
          k: 1,
          n: 1
        },
        8
      )

      // 找到距离原点最近和最远的点
      let minDist = Infinity
      let maxDist = 0
      let minIntensity = Infinity
      let maxIntensity = 0

      fieldData.points.forEach((point, i) => {
        const dist = point.length()
        const intensity = fieldData.intensity[i]

        if (dist < minDist) {
          minDist = dist
          minIntensity = intensity
        }
        if (dist > maxDist) {
          maxDist = dist
          maxIntensity = intensity
        }
      })

      // 近处的场强应该大于远处
      expect(minIntensity).toBeGreaterThan(maxIntensity)
    })
  })

  describe('缓存机制', () => {
    it('应该缓存计算结果', () => {
      const params = {
        c: PHYSICS_CONSTANTS.LIGHT_SPEED,
        t: 1,
        C: new THREE.Vector3(1, 0, 0)
      }

      const result1 = engine.calculate(FormulaType.SPACETIME_UNITY, params)
      const result2 = engine.calculate(FormulaType.SPACETIME_UNITY, params)

      // 应该返回相同的对象（缓存）
      expect(result1).toBe(result2)
    })

    it('应该能清除缓存', () => {
      const params = {
        c: PHYSICS_CONSTANTS.LIGHT_SPEED,
        t: 1
      }

      engine.calculate(FormulaType.SPACETIME_UNITY, params)
      engine.clearCache()

      // 清除后应该重新计算
      const result = engine.calculate(FormulaType.SPACETIME_UNITY, params)
      expect(result).toBeDefined()
    })
  })

  describe('边界条件', () => {
    it('应该处理零值', () => {
      const result = engine.calculate(FormulaType.MASS_DEFINITION, {
        k: 0,
        n: 10,
        Omega: 2
      })
      expect(result).toBe(0)
    })

    it('应该处理极小值', () => {
      const result = engine.calculate(FormulaType.GRAVITY_FIELD, {
        G: PHYSICS_CONSTANTS.GRAVITY_CONSTANT,
        k: 1,
        n: 1,
        r: 0.1 // 很小的距离
      })
      expect(result).toBeInstanceOf(THREE.Vector3)
      expect(result.length()).toBeGreaterThan(0)
    })

    it('应该处理极大值', () => {
      const result = engine.calculate(FormulaType.SPACETIME_UNITY, {
        c: PHYSICS_CONSTANTS.LIGHT_SPEED,
        t: 1e10 // 很大的时间
      })
      expect(result).toBeInstanceOf(THREE.Vector3)
      expect(result.length()).toBeGreaterThan(0)
    })
  })
})

/**
 * 实时体积效果系统
 * 提供高质量的体积云、雾、烟雾和体积光效果
 */

import * as THREE from 'three'
import { eventSystem, APP_EVENTS } from '../utils/eventSystem'

// 定义体积效果类型
export enum VolumetricEffectType {
  FOG = 'fog',
  CLOUDS = 'clouds',
  SMOKE = 'smoke',
  FIRE = 'fire',
  NEBULA = 'nebula',
  LIGHT_BEAM = 'light_beam'
}

// 体积效果系统
export class VolumetricEffectsSystem {
  private effects: Map<string, VolumetricEffect> = new Map()
  private scene: THREE.Scene | null = null
  private enabled: boolean = false

  constructor() {}

  /**
   * 初始化系统
   */
  public initialize(scene: THREE.Scene): void {
    this.scene = scene
    eventSystem.emit(APP_EVENTS.VOLUMETRIC_EFFECTS_INITIALIZED)
  }

  /**
   * 添加体积效果
   */
  public addEffect(id: string, type: VolumetricEffectType, position: THREE.Vector3): VolumetricEffect {
    const effect = new VolumetricEffect(type, position)
    
    if (this.scene) {
      effect.initialize(this.scene)
    }
    
    this.effects.set(id, effect)
    return effect
  }

  /**
   * 获取体积效果
   */
  public getEffect(id: string): VolumetricEffect | undefined {
    return this.effects.get(id)
  }

  /**
   * 移除体积效果
   */
  public removeEffect(id: string): void {
    const effect = this.effects.get(id)
    if (effect) {
      effect.dispose()
      this.effects.delete(id)
    }
  }

  /**
   * 更新体积效果
   */
  public update(deltaTime: number): void {
    for (const effect of this.effects.values()) {
      effect.update(deltaTime)
    }
  }

  /**
   * 启用体积效果
   */
  public enable(): void {
    this.enabled = true
    for (const effect of this.effects.values()) {
      effect.setEnabled(true)
    }
    eventSystem.emit(APP_EVENTS.VOLUMETRIC_EFFECTS_ENABLED)
  }

  /**
   * 禁用体积效果
   */
  public disable(): void {
    this.enabled = false
    for (const effect of this.effects.values()) {
      effect.setEnabled(false)
    }
    eventSystem.emit(APP_EVENTS.VOLUMETRIC_EFFECTS_DISABLED)
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    for (const effect of this.effects.values()) {
      effect.dispose()
    }
    this.effects.clear()
    eventSystem.emit(APP_EVENTS.VOLUMETRIC_EFFECTS_DISPOSED)
  }
}

// 体积效果类
export class VolumetricEffect {
  private type: VolumetricEffectType
  private position: THREE.Vector3
  private scene: THREE.Scene | null = null
  private mesh: THREE.Mesh | null = null
  private material: THREE.ShaderMaterial | null = null
  private time: number = 0
  private enabled: boolean = true

  constructor(type: VolumetricEffectType, position: THREE.Vector3) {
    this.type = type
    this.position = position
    this.initializeMaterial()
  }

  /**
   * 初始化效果
   */
  public initialize(scene: THREE.Scene): void {
    this.scene = scene
    this.createGeometry()
  }

  /**
   * 初始化材质
   */
  private initializeMaterial(): void {
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: this.getTypeColor() },
        intensity: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vPosition;

        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float intensity;

        varying vec3 vPosition;

        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.5432))) * 43758.5453;
        }

        float fractalNoise(vec3 p) {
          float f = 0.0;
          float amp = 1.0;
          for (int i = 0; i < 3; i++) {
            f += noise(p * amp) * amp;
            amp *= 0.5;
            p *= 2.0;
          }
          return f;
        }

        void main() {
          float noiseVal = fractalNoise(vPosition * 0.1 + time * 0.01);
          float alpha = smoothstep(0.4, 0.6, noiseVal) * intensity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })

    this.material = shaderMaterial
  }

  /**
   * 根据效果类型获取颜色
   */
  private getTypeColor(): THREE.Color {
    switch (this.type) {
      case VolumetricEffectType.FOG:
        return new THREE.Color(0x87ceeb)
      case VolumetricEffectType.CLOUDS:
        return new THREE.Color(0xffffff)
      case VolumetricEffectType.SMOKE:
        return new THREE.Color(0x888888)
      case VolumetricEffectType.FIRE:
        return new THREE.Color(0xff4500)
      case VolumetricEffectType.NEBULA:
        return new THREE.Color(0x8a2be2)
      case VolumetricEffectType.LIGHT_BEAM:
        return new THREE.Color(0xffffff)
      default:
        return new THREE.Color(0x87ceeb)
    }
  }

  /**
   * 创建几何体
   */
  private createGeometry(): void {
    if (!this.scene || !this.material) return

    let geometry: THREE.BufferGeometry

    switch (this.type) {
      case VolumetricEffectType.FOG:
      case VolumetricEffectType.CLOUDS:
        geometry = new THREE.BoxGeometry(100, 50, 100)
        break
      case VolumetricEffectType.SMOKE:
        geometry = new THREE.SphereGeometry(10, 32, 32)
        break
      case VolumetricEffectType.FIRE:
        geometry = new THREE.ConeGeometry(5, 15, 32)
        break
      case VolumetricEffectType.NEBULA:
        geometry = new THREE.SphereGeometry(20, 64, 64)
        break
      case VolumetricEffectType.LIGHT_BEAM:
        geometry = new THREE.CylinderGeometry(0.5, 2, 20, 32)
        break
      default:
        geometry = new THREE.BoxGeometry(50, 50, 50)
    }

    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.position.copy(this.position)
    this.scene.add(this.mesh)
  }

  /**
   * 更新效果
   */
  public update(deltaTime: number): void {
    if (!this.enabled || !this.material || !this.mesh) return

    this.time += deltaTime
    this.material.uniforms.time.value = this.time

    switch (this.type) {
      case VolumetricEffectType.FIRE:
        this.mesh.scale.y = 1.0 + Math.sin(this.time * 2) * 0.1
        break
      case VolumetricEffectType.SMOKE:
        this.mesh.position.y += deltaTime * 2
        if (this.mesh.position.y > 20) {
          this.mesh.position.y = this.position.y
        }
        break
      case VolumetricEffectType.AURORA:
        this.mesh.rotation.y += deltaTime * 0.1
        break
    }
  }

  /**
   * 设置位置
   */
  public setPosition(position: THREE.Vector3): void {
    this.position.copy(position)
    if (this.mesh) {
      this.mesh.position.copy(position)
    }
  }

  /**
   * 设置颜色
   */
  public setColor(color: THREE.Color): void {
    if (this.material) {
      this.material.uniforms.color.value.copy(color)
    }
  }

  /**
   * 启用/禁用效果
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (this.mesh) {
      this.mesh.visible = enabled
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.scene && this.mesh) {
      this.scene.remove(this.mesh)
    }

    if (this.mesh) {
      this.mesh.geometry.dispose()
    }

    if (this.material) {
      this.material.dispose()
    }
  }
}

// 导出默认实例
export const volumetricEffectsSystem = new VolumetricEffectsSystem()

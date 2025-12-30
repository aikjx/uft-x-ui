import * as THREE from 'three';

interface GPUParticleSystemParams {
  particleCount: number;
  color: THREE.Color;
  opacity: number;
  size: number;
}

export class GPUParticleSystem {
  private particleCount: number;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Points;
  private time: number;

  constructor(params: GPUParticleSystemParams) {
    this.particleCount = params.particleCount;
    this.time = 0;

    // 创建几何体
    this.geometry = this.createGeometry();

    // 创建材质
    this.material = this.createMaterial(params.color, params.opacity, params.size);

    // 创建粒子系统
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.frustumCulled = false;

    // 添加动画更新函数
    this.mesh.userData = {
      animate: (deltaTime: number) => {
        this.update(deltaTime);
      }
    };
  }

  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    // 位置数组
    const positions = new Float32Array(this.particleCount * 3);
    
    // 速度数组
    const velocities = new Float32Array(this.particleCount * 3);
    
    // 生命周期数组
    const lifetimes = new Float32Array(this.particleCount);
    
    // 大小数组
    const sizes = new Float32Array(this.particleCount);
    
    // 随机偏移数组
    const offsets = new Float32Array(this.particleCount * 2);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const i2 = i * 2;

      // 创建更有规律的粒子分布，形成球体效果
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = Math.random() * 6 + 2; // 半径在2-8之间

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      // 随机速度
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

      // 随机生命周期
      lifetimes[i] = Math.random();

      // 随机大小
      sizes[i] = Math.random() * 0.8 + 0.2;

      // 随机偏移
      offsets[i2] = Math.random();
      offsets[i2 + 1] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 2));

    return geometry;
  }

  private createMaterial(color: THREE.Color, opacity: number, size: number): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: color },
        opacity: { value: opacity },
        size: { value: size },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        attribute vec3 velocity;
        attribute float lifetime;
        attribute float size;
        attribute vec2 offset;

        uniform float time;
        uniform float size;

        varying float vLifetime;
        varying vec2 vOffset;

        void main() {
          vLifetime = lifetime;
          vOffset = offset;

          // 计算粒子位置
          vec3 pos = position + velocity * time;
          
          // 添加波动效果
          float wave = sin(time * 0.001 + position.x * 0.5 + position.y * 0.5 + position.z * 0.5) * 0.5;
          pos += vec3(wave, wave, wave);

          // 添加生命周期动画
          float lifeProgress = mod(time * 0.001 + lifetime, 1.0);
          pos *= 1.0 + lifeProgress * 0.2;

          // 计算最终位置
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // 设置粒子大小
          gl_PointSize = (size * 0.05) * (300.0 / -mvPosition.z) * size;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        uniform float time;

        varying float vLifetime;
        varying vec2 vOffset;

        void main() {
          // 创建圆形粒子
          vec2 uv = gl_PointCoord.xy - vec2(0.5);
          float distance = length(uv);
          
          if (distance > 0.5) {
            discard;
          }

          // 添加生命周期透明度变化
          float lifeProgress = mod(time * 0.001 + vLifetime, 1.0);
          float alpha = smoothstep(0.0, 0.2, lifeProgress) * smoothstep(1.0, 0.8, lifeProgress);
          
          // 添加渐变效果
          float gradient = 1.0 - distance * 2.0;
          float glow = pow(gradient, 2.0);

          // 添加脉冲效果
          float pulse = sin(time * 0.01 + vLifetime * 10.0) * 0.2 + 0.8;

          // 计算最终颜色
          vec3 finalColor = color;
          float finalOpacity = opacity * alpha * glow * pulse;

          gl_FragColor = vec4(finalColor, finalOpacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: false,
      alphaTest: 0.1
    });
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
    this.material.uniforms.time.value = this.time;
  }

  public getMesh(): THREE.Points {
    return this.mesh;
  }

  public updateParams(color: THREE.Color, opacity: number, size: number): void {
    this.material.uniforms.color.value = color;
    this.material.uniforms.opacity.value = opacity;
    this.material.uniforms.size.value = size;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
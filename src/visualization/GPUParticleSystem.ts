import * as THREE from 'three';

export interface GPUParticleSystemConfig {
  maxParticles: number;
  position: THREE.Vector3;
  rate: number;
  lifetime: number;
  lifetimeVariance: number;
  velocity: THREE.Vector3;
  velocityVariance: number;
  size: number;
  sizeVariance: number;
  color: THREE.Color;
  colorVariance: number;
  spread: number;
  gravity: THREE.Vector3;
  turbulence: number;
  damping: number;
  startSize: number;
  endSize: number;
  startColor: THREE.Color;
  endColor: THREE.Color;
}

export class GPUParticleSystem {
  private config: GPUParticleSystemConfig;
  private scene: THREE.Scene;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Points;
  private time: number;
  private spawnTimer: number;

  constructor(scene: THREE.Scene, config: GPUParticleSystemConfig) {
    this.scene = scene;
    this.config = config;
    this.time = 0;
    this.spawnTimer = 0;

    this.geometry = this.createGeometry();
    this.material = this.createMaterial();
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);
  }

  private createGeometry(): THREE.BufferGeometry {
    const maxParticles = this.config.maxParticles;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(maxParticles * 3);
    const velocities = new Float32Array(maxParticles * 3);
    const lifetimes = new Float32Array(maxParticles);
    const ages = new Float32Array(maxParticles);
    const sizes = new Float32Array(maxParticles);
    const colors = new Float32Array(maxParticles * 3);

    for (let i = 0; i < maxParticles; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      lifetimes[i] = 0;
      ages[i] = 0;
      sizes[i] = this.config.size;

      colors[i3] = this.config.color.r;
      colors[i3 + 1] = this.config.color.g;
      colors[i3 + 2] = this.config.color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('age', new THREE.BufferAttribute(ages, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geometry;
  }

  private createMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        gravity: { value: this.config.gravity },
        turbulence: { value: this.config.turbulence }
      },
      vertexShader: `
        uniform float time;
        uniform vec3 gravity;
        uniform float turbulence;

        attribute vec3 velocity;
        attribute vec3 color;
        attribute float size;
        attribute float lifetime;
        attribute float age;

        varying vec3 vColor;
        varying float vAge;
        varying float vLifetime;

        void main() {
          vColor = color;
          vAge = age;
          vLifetime = lifetime;

          vec3 pos = position;
          vec3 vel = velocity;

          if (age < lifetime) {
            vel += gravity * 0.016;
            pos += vel * 0.016;

            vec3 turbulenceForce = vec3(
              sin(time * 0.1) * turbulence,
              sin(time * 0.15) * turbulence,
              sin(time * 0.2) * turbulence
            );
            pos += turbulenceForce * 0.016;

            float sizeFactor = 1.0 - (age / lifetime);
            float particleSize = size * sizeFactor;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = particleSize * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          } else {
            gl_Position = vec4(10000.0, 10000.0, 10000.0, 1.0);
            gl_PointSize = 0.0;
          }
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAge;
        varying float vLifetime;

        void main() {
          vec2 uv = gl_PointCoord.xy - vec2(0.5);
          float distance = length(uv);
          
          if (distance > 0.5) discard;

          float lifeProgress = vAge / vLifetime;
          float alpha = smoothstep(0.0, 0.2, lifeProgress) * smoothstep(1.0, 0.8, lifeProgress);
          float gradient = 1.0 - distance * 2.0;
          float glow = pow(gradient, 2.0);

          gl_FragColor = vec4(vColor, alpha * glow);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
    this.material.uniforms.time.value = this.time;

    const particlesToSpawn = Math.floor(this.spawnTimer * this.config.rate);
    if (particlesToSpawn > 0) {
      this.spawnParticles(particlesToSpawn);
      this.spawnTimer -= particlesToSpawn / this.config.rate;
    }

    const ages = this.geometry.attributes.age.array as Float32Array;
    for (let i = 0; i < this.config.maxParticles; i++) {
      if (ages[i] < this.geometry.attributes.lifetime.array[i]) {
        ages[i] += deltaTime;
      }
    }
    this.geometry.attributes.age.needsUpdate = true;
  }

  private spawnParticles(count: number): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const velocities = this.geometry.attributes.velocity.array as Float32Array;
    const colors = this.geometry.attributes.color.array as Float32Array;
    const lifetimes = this.geometry.attributes.lifetime.array as Float32Array;
    const ages = this.geometry.attributes.age.array as Float32Array;

    let particlesSpawned = 0;

    for (let i = 0; i < this.config.maxParticles && particlesSpawned < count; i++) {
      const i3 = i * 3;

      if (ages[i] >= lifetimes[i] || lifetimes[i] === 0) {
        const offsetX = (Math.random() - 0.5) * this.config.spread;
        const offsetY = (Math.random() - 0.5) * this.config.spread;
        const offsetZ = (Math.random() - 0.5) * this.config.spread;

        positions[i3] = this.config.position.x + offsetX;
        positions[i3 + 1] = this.config.position.y + offsetY;
        positions[i3 + 2] = this.config.position.z + offsetZ;

        const velocityX = this.config.velocity.x + (Math.random() - 0.5) * this.config.velocityVariance;
        const velocityY = this.config.velocity.y + (Math.random() - 0.5) * this.config.velocityVariance;
        const velocityZ = this.config.velocity.z + (Math.random() - 0.5) * this.config.velocityVariance;

        velocities[i3] = velocityX;
        velocities[i3 + 1] = velocityY;
        velocities[i3 + 2] = velocityZ;

        const colorVariance = this.config.colorVariance;
        const colorR = Math.max(0, Math.min(1, this.config.color.r + (Math.random() - 0.5) * colorVariance));
        const colorG = Math.max(0, Math.min(1, this.config.color.g + (Math.random() - 0.5) * colorVariance));
        const colorB = Math.max(0, Math.min(1, this.config.color.b + (Math.random() - 0.5) * colorVariance));

        colors[i3] = colorR;
        colors[i3 + 1] = colorG;
        colors[i3 + 2] = colorB;

        const lifetimeVariance = this.config.lifetimeVariance;
        const lifetime = this.config.lifetime + (Math.random() - 0.5) * lifetimeVariance;
        lifetimes[i] = Math.max(0.1, lifetime);

        ages[i] = 0;

        particlesSpawned++;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.velocity.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.lifetime.needsUpdate = true;
    this.geometry.attributes.age.needsUpdate = true;
  }

  public setPosition(position: THREE.Vector3): void {
    this.config.position.copy(position);
  }

  public setEmissionRate(rate: number): void {
    this.config.rate = rate;
  }

  public setMaxParticles(maxParticles: number): void {
    this.config.maxParticles = maxParticles;
  }

  public getParticlePositions(): Float32Array {
    return this.geometry.attributes.position.array as Float32Array;
  }

  public getStats(): any {
    return {
      particleCount: this.config.maxParticles,
      memoryUsage: this.geometry.attributes.position.array.byteLength
    };
  }

  public pause(): void {
    this.mesh.visible = false;
  }

  public resume(): void {
    this.mesh.visible = true;
  }

  public dispose(): void {
    if (this.scene) {
      this.scene.remove(this.mesh);
    }
    this.geometry.dispose();
    this.material.dispose();
  }
}
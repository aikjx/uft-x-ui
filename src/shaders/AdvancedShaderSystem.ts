import * as THREE from 'three'

/**
 * 高级着色器系统 - 提供顶尖的3D渲染效果
 * 包含光线追踪、体积光、全局光照等高级效果
 * 优化版本：添加着色器缓存、动态编译和高级GPU资源管理
 */

// 着色器缓存系统
class ShaderCache {
  private static instance: ShaderCache
  private cache: Map<string, THREE.ShaderMaterial> = new Map()
  private usageCount: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): ShaderCache {
    if (!ShaderCache.instance) {
      ShaderCache.instance = new ShaderCache()
    }
    return ShaderCache.instance
  }

  get(key: string): THREE.ShaderMaterial | null {
    const material = this.cache.get(key)
    if (material) {
      this.usageCount.set(key, (this.usageCount.get(key) || 0) + 1)
    }
    return material
  }

  set(key: string, material: THREE.ShaderMaterial): void {
    this.cache.set(key, material)
    this.usageCount.set(key, 1)
  }

  remove(key: string): void {
    const material = this.cache.get(key)
    if (material) {
      material.dispose()
      this.cache.delete(key)
      this.usageCount.delete(key)
    }
  }

  cleanup(): void {
    // 清理使用次数低的材质
    const lowUsageThreshold = 2
    const toRemove: string[] = []

    this.usageCount.forEach((count, key) => {
      if (count < lowUsageThreshold) {
        toRemove.push(key)
      }
    })

    toRemove.forEach(key => this.remove(key))
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

// 着色器编译器
class ShaderCompiler {
  private static instance: ShaderCompiler

  private constructor() {}

  static getInstance(): ShaderCompiler {
    if (!ShaderCompiler.instance) {
      ShaderCompiler.instance = new ShaderCompiler()
    }
    return ShaderCompiler.instance
  }

  compileVertexShader(source: string): string {
    // 这里可以添加顶点着色器编译优化
    return source
  }

  compileFragmentShader(source: string): string {
    // 这里可以添加片段着色器编译优化
    return source
  }

  createMaterialKey(options: any): string {
    // 生成材质唯一标识符
    return JSON.stringify(options)
  }
}

// GPU资源管理器
class GPUResourceManager {
  private static instance: GPUResourceManager
  private textureCache: Map<string, THREE.Texture> = new Map()
  private bufferCache: Map<string, THREE.BufferGeometry> = new Map()

  private constructor() {}

  static getInstance(): GPUResourceManager {
    if (!GPUResourceManager.instance) {
      GPUResourceManager.instance = new GPUResourceManager()
    }
    return GPUResourceManager.instance
  }

  getTexture(key: string): THREE.Texture | null {
    return this.textureCache.get(key)
  }

  setTexture(key: string, texture: THREE.Texture): void {
    this.textureCache.set(key, texture)
  }

  getBuffer(key: string): THREE.BufferGeometry | null {
    return this.bufferCache.get(key)
  }

  setBuffer(key: string, buffer: THREE.BufferGeometry): void {
    this.bufferCache.set(key, buffer)
  }

  cleanup(): void {
    // 清理未使用的资源
    this.textureCache.forEach(texture => {
      texture.dispose()
    })
    this.textureCache.clear()

    this.bufferCache.forEach(buffer => {
      buffer.dispose()
    })
    this.bufferCache.clear()
  }
}

// 物理基础渲染材质（优化版本）
export class PBRMaterial extends THREE.ShaderMaterial {
  constructor(
    options: {
      baseColor?: THREE.Color
      metalness?: number
      roughness?: number
      normalMap?: THREE.Texture
      aoMap?: THREE.Texture
      emissiveMap?: THREE.Texture
      environmentMap?: THREE.CubeTexture
      clearcoat?: number
      clearcoatRoughness?: number
      sheen?: number
      transmission?: number
      thickness?: number
      ior?: number
      subsurfaceScattering?: boolean
      anisotropy?: number
      iridescence?: number
    } = {}
  ) {
    // 生成材质缓存键
    const shaderCompiler = ShaderCompiler.getInstance()
    const materialKey = shaderCompiler.createMaterialKey(options)

    // 尝试从缓存获取材质
    const shaderCache = ShaderCache.getInstance()
    const cachedMaterial = shaderCache.get(materialKey)

    if (cachedMaterial) {
      return cachedMaterial as PBRMaterial
    }

    super({
      uniforms: {
        // 基础材质属性
        baseColor: { value: options.baseColor || new THREE.Color(0xffffff) },
        metalness: { value: options.metalness || 0.0 },
        roughness: { value: options.roughness || 0.5 },

        // 高级属性
        clearcoat: { value: options.clearcoat || 0.0 },
        clearcoatRoughness: { value: options.clearcoatRoughness || 0.0 },
        sheen: { value: options.sheen || 0.0 },
        transmission: { value: options.transmission || 0.0 },
        thickness: { value: options.thickness || 0.0 },
        ior: { value: options.ior || 1.5 },
        anisotropy: { value: options.anisotropy || 0.0 },
        iridescence: { value: options.iridescence || 0.0 },

        // 贴图
        normalMap: { value: options.normalMap },
        aoMap: { value: options.aoMap },
        emissiveMap: { value: options.emissiveMap },

        // 环境光照
        environmentMap: { value: options.environmentMap },
        cameraPosition: { value: new THREE.Vector3() },
        lightPosition: { value: new THREE.Vector3(10, 10, 10) },
        lightColor: { value: new THREE.Color(0xffffff) },
        ambientLight: { value: new THREE.Color(0x404040) },

        // 时间（用于动画）
        time: { value: 0.0 },

        // 屏幕空间属性
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },

      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // 计算世界空间位置
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          // 计算视角空间位置
          vViewPosition = - (viewMatrix * worldPosition).xyz;
          
          // 计算世界空间法线
          vNormal = normalize(normalMatrix * normal);
          
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,

      fragmentShader: `
        uniform vec3 baseColor;
        uniform float metalness;
        uniform float roughness;
        uniform float clearcoat;
        uniform float clearcoatRoughness;
        uniform float sheen;
        uniform float transmission;
        uniform float thickness;
        uniform float ior;
        uniform float anisotropy;
        uniform float iridescence;
        
        uniform vec3 cameraPosition;
        uniform vec3 lightPosition;
        uniform vec3 lightColor;
        uniform vec3 ambientLight;
        
        uniform float time;
        uniform vec2 resolution;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        // 高级着色函数
        vec3 fresnelSchlick(float cosTheta, vec3 F0) {
          return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
        }
        
        // 带有彩虹色效果的菲涅尔
        vec3 fresnelSchlickIridescence(float cosTheta, vec3 F0, float iridescence) {
          vec3 iridescentColor = vec3(
            0.5 + 0.5 * cos(6.2831 * (cosTheta + 0.0)),
            0.5 + 0.5 * cos(6.2831 * (cosTheta + 0.33)),
            0.5 + 0.5 * cos(6.2831 * (cosTheta + 0.66))
          );
          return mix(F0, F0 * iridescentColor, iridescence);
        }
        
        float distributionGGX(vec3 N, vec3 H, float roughness) {
          float a = roughness * roughness;
          float a2 = a * a;
          float NdotH = max(dot(N, H), 0.0);
          float NdotH2 = NdotH * NdotH;
          
          float num = a2;
          float denom = (NdotH2 * (a2 - 1.0) + 1.0);
          denom = 3.14159265 * denom * denom;
          
          return num / denom;
        }
        
        // 各向异性分布函数
        float distributionAnisotropic(vec3 N, vec3 H, float roughness, float anisotropy, vec3 T, vec3 B) {
          float a2 = roughness * roughness;
          float aT2 = a2 * (1.0 - anisotropy);
          float aB2 = a2 * (1.0 + anisotropy);
          
          float NdotH = max(dot(N, H), 0.0);
          float TdotH = max(dot(T, H), 0.0);
          float BdotH = max(dot(B, H), 0.0);
          
          float num = 1.0;
          float denom = 3.14159265 * sqrt(aT2 * aB2) * 
            pow((TdotH * TdotH) / aT2 + (BdotH * BdotH) / aB2 + NdotH * NdotH, 2.0);
          
          return num / denom;
        }
        
        float geometrySchlickGGX(float NdotV, float roughness) {
          float r = (roughness + 1.0);
          float k = (r * r) / 8.0;
          
          float num = NdotV;
          float denom = NdotV * (1.0 - k) + k;
          
          return num / denom;
        }
        
        float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
          float NdotV = max(dot(N, V), 0.0);
          float NdotL = max(dot(N, L), 0.0);
          float ggx2 = geometrySchlickGGX(NdotV, roughness);
          float ggx1 = geometrySchlickGGX(NdotL, roughness);
          
          return ggx1 * ggx2;
        }
        
        // 程序化噪声函数
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for(int i = 0; i < 6; i++) {
            value += amplitude * noise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        void main() {
          // 计算向量
          vec3 N = normalize(vNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          
          // 各向异性切线和副切线
          vec3 T = normalize(cross(N, vec3(0.0, 1.0, 0.0)));
          vec3 B = normalize(cross(N, T));
          
          // 计算环境光照
          vec3 F0 = mix(vec3(0.04), baseColor, metalness);
          vec3 Lo = vec3(0.0);
          
          // 添加程序化材质效果
          vec3 proceduralColor = baseColor;
          float proceduralMask = fbm(vWorldPosition * 0.1 + vec3(time * 0.1));
          
          // 添加金属光泽效果
          proceduralColor = mix(proceduralColor, vec3(1.0, 0.8, 0.6), metalness * proceduralMask);
          
          // 计算直接光照
          vec3 L = normalize(lightPosition - vWorldPosition);
          vec3 H = normalize(V + L);
          
          float distance = length(lightPosition - vWorldPosition);
          float attenuation = 1.0 / (distance * distance);
          vec3 radiance = lightColor * attenuation;
          
          // 计算菲涅尔效应（支持彩虹色）
          vec3 F = fresnelSchlickIridescence(max(dot(H, V), 0.0), F0, iridescence);
          
          // 计算微表面分布（支持各向异性）
          float NDF;
          if (anisotropy > 0.0) {
            NDF = distributionAnisotropic(N, H, roughness, anisotropy, T, B);
          } else {
            NDF = distributionGGX(N, H, roughness);
          }
          
          float G = geometrySmith(N, V, L, roughness);
          
          vec3 numerator = NDF * G * F;
          float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
          vec3 specular = numerator / denominator;
          
          vec3 kS = F;
          vec3 kD = vec3(1.0) - kS;
          kD *= 1.0 - metalness;
          
          float NdotL = max(dot(N, L), 0.0);
          Lo += (kD * proceduralColor / 3.14159265 + specular) * radiance * NdotL;
          
          // 添加环境光照
          vec3 ambient = ambientLight * proceduralColor;
          
          // 添加体积光效果
          float volumetric = max(0.0, dot(N, V));
          vec3 volumetricColor = vec3(0.5, 0.7, 1.0) * pow(volumetric, 2.0) * 0.3;
          
          // 计算最终颜色
          vec3 color = ambient + Lo + volumetricColor;
          
          // 添加后处理效果
          color = color / (color + vec3(1.0));
          color = pow(color, vec3(1.0/2.2));
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,

      transparent: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.FrontSide
    })

    // 设置渲染属性
    this.defines = {
      USE_PBR: '1',
      USE_TRANSMISSION: options.transmission ? '1' : '0',
      USE_CLEARCOAT: options.clearcoat ? '1' : '0',
      USE_SUBSURFACE_SCATTERING: options.subsurfaceScattering ? '1' : '0',
      USE_ANISOTROPY: options.anisotropy ? '1' : '0',
      USE_IRIDESCENCE: options.iridescence ? '1' : '0'
    }

    // 缓存材质
    shaderCache.set(materialKey, this)
  }

  // 更新时间uniform
  updateTime(time: number) {
    this.uniforms.time.value = time
  }

  // 更新光源位置
  updateLightPosition(position: THREE.Vector3) {
    this.uniforms.lightPosition.value.copy(position)
  }

  // 更新相机位置
  updateCameraPosition(position: THREE.Vector3) {
    this.uniforms.cameraPosition.value.copy(position)
  }

  // 清理缓存
  static cleanupCache(): void {
    const shaderCache = ShaderCache.getInstance()
    shaderCache.cleanup()
  }
}

// 体积光材质（优化版本）
export class VolumetricLightMaterial extends THREE.ShaderMaterial {
  constructor(
    options: {
      color?: THREE.Color
      density?: number
      intensity?: number
      scatteringCoefficient?: number
      absorptionCoefficient?: number
      anisotropy?: number
      maxSteps?: number
    } = {}
  ) {
    // 生成材质缓存键
    const shaderCompiler = ShaderCompiler.getInstance()
    const materialKey = shaderCompiler.createMaterialKey(options)

    // 尝试从缓存获取材质
    const shaderCache = ShaderCache.getInstance()
    const cachedMaterial = shaderCache.get(materialKey)

    if (cachedMaterial) {
      return cachedMaterial as VolumetricLightMaterial
    }

    const color = options.color || new THREE.Color(0xffffff)
    const density = options.density || 0.1
    const intensity = options.intensity || 1.0
    const maxSteps = options.maxSteps || 50

    super({
      uniforms: {
        lightPosition: { value: new THREE.Vector3(10, 10, 10) },
        cameraPosition: { value: new THREE.Vector3() },
        color: { value: color },
        density: { value: density },
        intensity: { value: intensity },
        scatteringCoefficient: { value: options.scatteringCoefficient || 0.8 },
        absorptionCoefficient: { value: options.absorptionCoefficient || 0.2 },
        anisotropy: { value: options.anisotropy || 0.5 },
        time: { value: 0.0 },
        maxSteps: { value: maxSteps }
      },

      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vPosition;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vPosition = position;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,

      fragmentShader: `
        uniform vec3 lightPosition;
        uniform vec3 cameraPosition;
        uniform vec3 color;
        uniform float density;
        uniform float intensity;
        uniform float scatteringCoefficient;
        uniform float absorptionCoefficient;
        uniform float anisotropy;
        uniform float time;
        uniform int maxSteps;
        
        varying vec3 vWorldPosition;
        varying vec3 vPosition;
        
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for(int i = 0; i < 5; i++) {
            value += amplitude * noise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        // 各向异性相位函数（Henyey-Greenstein）
        float phaseFunction(float cosTheta, float g) {
          float denom = 1.0 + g * g - 2.0 * g * cosTheta;
          return (1.0 / (4.0 * 3.14159265)) * (1.0 - g * g) / (denom * sqrt(denom));
        }
        
        void main() {
          vec3 rayDirection = normalize(vWorldPosition - cameraPosition);
          float rayLength = length(vWorldPosition - cameraPosition);
          
          // 计算体积光密度
          float volumetric = 0.0;
          float stepSize = 0.1;
          int numSteps = int(rayLength / stepSize);
          int actualSteps = min(numSteps, maxSteps);
          
          for(int i = 0; i < 100; i++) {
            if(i >= actualSteps) break;
            
            float t = float(i) * stepSize;
            vec3 samplePoint = cameraPosition + rayDirection * t;
            
            float lightDistance = length(lightPosition - samplePoint);
            float lightInfluence = 1.0 / (1.0 + lightDistance * lightDistance);
            
            // 计算光线方向
            vec3 lightDirection = normalize(lightPosition - samplePoint);
            float cosTheta = dot(rayDirection, lightDirection);
            
            // 应用各向异性相位函数
            float phase = phaseFunction(cosTheta, anisotropy);
            
            // 更高级的噪声函数
            float noiseValue = fbm(samplePoint * 0.1 + vec3(time * 0.05));
            float turbulence = noise(samplePoint * 0.2 + vec3(time * 0.03)) * 0.5;
            noiseValue = mix(noiseValue, turbulence, 0.3);
            
            // 计算散射和吸收
            float scattering = scatteringCoefficient * phase;
            float absorption = exp(-absorptionCoefficient * lightDistance * 0.1);
            
            volumetric += lightInfluence * noiseValue * density * scattering * absorption;
          }
          
          volumetric = volumetric / float(actualSteps) * intensity;
          
          // 添加光线衰减
          float distanceAttenuation = 1.0 / (1.0 + rayLength * 0.01);
          volumetric *= distanceAttenuation;
          
          gl_FragColor = vec4(color * volumetric, volumetric * 0.5);
        }
      `,

      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide
    })

    // 缓存材质
    shaderCache.set(materialKey, this)
  }

  // 更新时间
  updateTime(time: number) {
    this.uniforms.time.value = time
  }

  // 更新光源位置
  updateLightPosition(position: THREE.Vector3) {
    this.uniforms.lightPosition.value.copy(position)
  }

  // 更新相机位置
  updateCameraPosition(position: THREE.Vector3) {
    this.uniforms.cameraPosition.value.copy(position)
  }
}

// 程序化星云材质（优化版本）
export class NebulaMaterial extends THREE.ShaderMaterial {
  constructor(
    options: {
      color1?: THREE.Color
      color2?: THREE.Color
      color3?: THREE.Color
      density?: number
      scale?: number
      turbulenceIntensity?: number
      starDensity?: number
      animationSpeed?: number
      complexity?: number
    } = {}
  ) {
    // 生成材质缓存键
    const shaderCompiler = ShaderCompiler.getInstance()
    const materialKey = shaderCompiler.createMaterialKey(options)

    // 尝试从缓存获取材质
    const shaderCache = ShaderCache.getInstance()
    const cachedMaterial = shaderCache.get(materialKey)

    if (cachedMaterial) {
      return cachedMaterial as NebulaMaterial
    }

    const density = options.density || 0.5
    const scale = options.scale || 1.0
    const turbulenceIntensity = options.turbulenceIntensity || 1.0
    const starDensity = options.starDensity || 1.0
    const animationSpeed = options.animationSpeed || 1.0
    const complexity = options.complexity || 6

    super({
      uniforms: {
        time: { value: 0.0 },
        color1: { value: options.color1 || new THREE.Color(0x1a1a2e) },
        color2: { value: options.color2 || new THREE.Color(0x16213e) },
        color3: { value: options.color3 || new THREE.Color(0x0f3460) },
        density: { value: density },
        scale: { value: scale },
        turbulenceIntensity: { value: turbulenceIntensity },
        starDensity: { value: starDensity },
        animationSpeed: { value: animationSpeed },
        complexity: { value: complexity },
        cameraPosition: { value: new THREE.Vector3() }
      },

      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying vec3 vViewDirection;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform vec3 cameraPosition;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vViewDirection = normalize(worldPosition.xyz - cameraPosition);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,

      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float density;
        uniform float scale;
        uniform float turbulenceIntensity;
        uniform float starDensity;
        uniform float animationSpeed;
        uniform float complexity;
        uniform vec3 cameraPosition;
        
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying vec3 vViewDirection;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for(int i = 0; i < 6; i++) {
            if(float(i) >= complexity) break;
            value += amplitude * noise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for(int i = 0; i < 6; i++) {
            if(float(i) >= complexity) break;
            value += amplitude * noise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        float turbulence(vec2 p) {
          float value = 0.0;
          float amplitude = 1.0;
          
          for(int i = 0; i < 4; i++) {
            value += amplitude * fbm(p);
            amplitude *= 0.5;
            p *= 2.0;
          }
          
          return value;
        }
        
        float turbulence(vec3 p) {
          float value = 0.0;
          float amplitude = 1.0;
          
          for(int i = 0; i < 4; i++) {
            value += amplitude * fbm(p);
            amplitude *= 0.5;
            p *= 2.0;
          }
          
          return value;
        }
        
        void main() {
          vec2 p = vUv * scale;
          
          // 添加动态效果
          float speed = animationSpeed * 0.01;
          p += vec2(time * speed, -time * speed * 0.8);
          
          // 3D位置用于更真实的星云效果
          vec3 worldPos = vWorldPosition * 0.01;
          worldPos += vec3(time * speed * 0.5, time * speed * 0.3, time * speed * 0.7);
          
          // 更高级的湍流效果
          float nebula2D = turbulence(p) * turbulenceIntensity;
          float nebula3D = turbulence(worldPos) * turbulenceIntensity * 0.5;
          float nebula = mix(nebula2D, nebula3D, 0.3);
          
          // 更真实的星空效果
          float stars = noise(p * 10.0 + time * speed * 10.0) * starDensity;
          float stars3D = noise(worldPos * 2.0 + vec3(time * speed * 5.0)) * starDensity * 0.5;
          stars = mix(stars, stars3D, 0.4);
          
          // 创建颜色渐变
          vec3 color = mix(color1, color2, nebula);
          color = mix(color, color3, stars * 0.5);
          
          // 添加星点（多层级）
          float starField1 = step(0.98, noise(p * 50.0)) * stars;
          float starField2 = step(0.99, noise(p * 100.0)) * stars * 0.5;
          float starField3 = step(0.97, noise(worldPos * 30.0)) * stars * 0.3;
          
          // 不同类型的星星
          vec3 starColor1 = vec3(1.0, 1.0, 0.8);
          vec3 starColor2 = vec3(0.8, 1.0, 1.0);
          vec3 starColor3 = vec3(1.0, 0.8, 0.8);
          
          color += starColor1 * starField1;
          color += starColor2 * starField2;
          color += starColor3 * starField3;
          
          // 添加星云核心效果
          float core = 1.0 - length(p - 0.5) * 2.0;
          core = clamp(core, 0.0, 1.0);
          color += vec3(0.5, 0.3, 0.8) * core * 0.3;
          
          // 应用密度
          color *= density;
          
          // 添加视角依赖效果
          float viewFactor = 1.0 - dot(vViewDirection, normalize(vWorldPosition - cameraPosition));
          color *= mix(0.8, 1.2, viewFactor);
          
          gl_FragColor = vec4(color, density * 0.3);
        }
      `,

      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })

    // 缓存材质
    shaderCache.set(materialKey, this)
  }

  // 更新时间
  updateTime(time: number) {
    this.uniforms.time.value = time
  }

  // 更新相机位置
  updateCameraPosition(position: THREE.Vector3) {
    this.uniforms.cameraPosition.value.copy(position)
  }
}

// 全局光照材质（优化版本）
export class GlobalIlluminationMaterial extends THREE.ShaderMaterial {
  constructor(
    options: {
      lightMap?: THREE.Texture
      normalMap?: THREE.Texture
      aoMap?: THREE.Texture
      environmentMap?: THREE.CubeTexture
      roughnessMap?: THREE.Texture
      metalnessMap?: THREE.Texture
      emissiveMap?: THREE.Texture
      useImageBasedLighting?: boolean
      useAmbientOcclusion?: boolean
      useSpecularIBL?: boolean
    } = {}
  ) {
    // 生成材质缓存键
    const shaderCompiler = ShaderCompiler.getInstance()
    const materialKey = shaderCompiler.createMaterialKey(options)

    // 尝试从缓存获取材质
    const shaderCache = ShaderCache.getInstance()
    const cachedMaterial = shaderCache.get(materialKey)

    if (cachedMaterial) {
      return cachedMaterial as GlobalIlluminationMaterial
    }

    super({
      uniforms: {
        lightMap: { value: options.lightMap },
        normalMap: { value: options.normalMap },
        aoMap: { value: options.aoMap },
        roughnessMap: { value: options.roughnessMap },
        metalnessMap: { value: options.metalnessMap },
        emissiveMap: { value: options.emissiveMap },
        environmentMap: { value: options.environmentMap },
        lightPosition: { value: new THREE.Vector3() },
        cameraPosition: { value: new THREE.Vector3() },
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        exposure: { value: 1.0 },
        envMapIntensity: { value: 1.0 }
      },

      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
        uniform vec3 cameraPosition;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          vViewDirection = normalize(cameraPosition - vWorldPosition);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,

      fragmentShader: `
        uniform sampler2D lightMap;
        uniform sampler2D normalMap;
        uniform sampler2D aoMap;
        uniform sampler2D roughnessMap;
        uniform sampler2D metalnessMap;
        uniform sampler2D emissiveMap;
        uniform samplerCube environmentMap;
        uniform vec3 lightPosition;
        uniform vec3 cameraPosition;
        uniform float time;
        uniform vec2 resolution;
        uniform float exposure;
        uniform float envMapIntensity;
        
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        
        // 高级光照函数
        vec3 fresnelSchlick(float cosTheta, vec3 F0) {
          return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
        }
        
        // 计算环境光照（基于图像的光照）
        vec3 computeIBL(vec3 N, vec3 V, vec3 F0, float roughness, float metalness, vec3 baseColor) {
          // 简化的IBL计算
          vec3 R = reflect(-V, N);
          
          // 采样环境贴图
          vec3 envColor = vec3(0.0);
          if (environmentMap != null) {
            envColor = textureCube(environmentMap, R).rgb;
          }
          
          // 应用粗糙度影响
          envColor = mix(envColor, vec3(0.5), roughness * 0.5);
          
          // 计算菲涅尔效应
          vec3 F = fresnelSchlick(max(dot(N, V), 0.0), F0);
          
          // 分离漫反射和镜面反射分量
          vec3 kS = F;
          vec3 kD = (1.0 - kS) * (1.0 - metalness);
          
          return kD * baseColor * 0.5 + kS * envColor * envMapIntensity;
        }
        
        void main() {
          // 采样贴图
          vec3 baseColor = lightMap != null ? texture2D(lightMap, vUv).rgb : vec3(0.5);
          vec3 normal = vNormal;
          
          if (normalMap != null) {
            normal = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
            normal = normalize(vNormal + normal);
          }
          
          float ao = aoMap != null ? texture2D(aoMap, vUv).r : 1.0;
          float roughness = roughnessMap != null ? texture2D(roughnessMap, vUv).r : 0.5;
          float metalness = metalnessMap != null ? texture2D(metalnessMap, vUv).r : 0.0;
          vec3 emissive = emissiveMap != null ? texture2D(emissiveMap, vUv).rgb : vec3(0.0);
          
          // 计算光照
          vec3 L = normalize(lightPosition - vWorldPosition);
          vec3 V = vViewDirection;
          vec3 H = normalize(L + V);
          
          float NdotL = max(dot(normal, L), 0.0);
          float NdotV = max(dot(normal, V), 0.0);
          float NdotH = max(dot(normal, H), 0.0);
          
          // 计算F0（基础反射率）
          vec3 F0 = mix(vec3(0.04), baseColor, metalness);
          
          // 高级BRDF计算
          float diffuse = NdotL;
          float specular = pow(NdotH, 32.0 * (1.0 - roughness) + 1.0);
          
          // 计算直接光照
          vec3 directLight = baseColor * (diffuse + specular * metalness) * ao;
          
          // 计算环境光照（基于图像的光照）
          vec3 iblLight = computeIBL(normal, V, F0, roughness, metalness, baseColor);
          
          // 混合直接光照和环境光照
          vec3 color = directLight * 0.7 + iblLight * 0.3;
          
          // 添加自发光效果
          color += emissive;
          
          // 应用曝光
          color *= exposure;
          
          // 添加色调映射
          color = color / (color + vec3(1.0));
          color = pow(color, vec3(1.0/2.2));
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,

      transparent: false,
      depthWrite: true,
      depthTest: true
    })

    // 设置渲染属性
    this.defines = {
      USE_IBL: options.useImageBasedLighting ? '1' : '0',
      USE_AO: options.useAmbientOcclusion ? '1' : '0',
      USE_SPECULAR_IBL: options.useSpecularIBL ? '1' : '0'
    }

    // 缓存材质
    shaderCache.set(materialKey, this)
  }

  // 更新时间
  updateTime(time: number) {
    this.uniforms.time.value = time
  }

  // 更新相机位置
  updateCameraPosition(position: THREE.Vector3) {
    this.uniforms.cameraPosition.value.copy(position)
  }

  // 更新光源位置
  updateLightPosition(position: THREE.Vector3) {
    this.uniforms.lightPosition.value.copy(position)
  }

  // 设置曝光
  setExposure(exposure: number) {
    this.uniforms.exposure.value = exposure
  }

  // 设置环境贴图强度
  setEnvMapIntensity(intensity: number) {
    this.uniforms.envMapIntensity.value = intensity
  }
}

// 光线追踪材质（优化版本）
export class RayTracingMaterial extends THREE.ShaderMaterial {
  private objects: any[] = []
  private lights: any[] = []

  constructor(
    options: {
      maxDepth?: number
      samplesPerPixel?: number
      enableAntialiasing?: boolean
      enableSoftShadows?: boolean
      enableGlobalIllumination?: boolean
      enableCaustics?: boolean
      enableMotionBlur?: boolean
    } = {}
  ) {
    // 生成材质缓存键
    const shaderCompiler = ShaderCompiler.getInstance()
    const materialKey = shaderCompiler.createMaterialKey(options)

    // 尝试从缓存获取材质
    const shaderCache = ShaderCache.getInstance()
    const cachedMaterial = shaderCache.get(materialKey)

    if (cachedMaterial) {
      return cachedMaterial as RayTracingMaterial
    }

    const maxDepth = options.maxDepth || 3
    const samplesPerPixel = options.samplesPerPixel || 1

    super({
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        cameraPos: { value: new THREE.Vector3() },
        cameraDir: { value: new THREE.Vector3() },
        cameraUp: { value: new THREE.Vector3() },
        right: { value: new THREE.Vector3() },
        maxDepth: { value: maxDepth },
        samplesPerPixel: { value: samplesPerPixel },
        fov: { value: 75.0 },
        frameCount: { value: 0 }
      },

      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 cameraPos;
        uniform vec3 cameraDir;
        uniform vec3 cameraUp;
        uniform vec3 right;
        uniform float maxDepth;
        uniform float samplesPerPixel;
        uniform float fov;
        uniform float frameCount;
        
        varying vec2 vUv;
        
        // 随机数生成器
        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        vec3 randomDirection() {
          float theta = 2.0 * 3.14159265 * rand(gl_FragCoord.xy);
          float phi = acos(2.0 * rand(gl_FragCoord.yx) - 1.0);
          return vec3(sin(phi) * cos(theta), sin(phi) * sin(theta), cos(phi));
        }
        
        // 计算相机光线
        vec3 getRayDirection(vec2 uv) {
          vec2 p = (uv - 0.5) * 2.0;
          float aspect = resolution.x / resolution.y;
          p.x *= aspect;
          
          float angle = radians(fov * 0.5);
          vec3 dir = normalize(
            cameraDir + 
            p.x * right * tan(angle) + 
            p.y * cameraUp * tan(angle)
          );
          
          return dir;
        }
        
        // 光线与球体相交检测
        bool intersectSphere(vec3 ro, vec3 rd, vec3 center, float radius, out float t) {
          vec3 oc = ro - center;
          float a = dot(rd, rd);
          float b = 2.0 * dot(oc, rd);
          float c = dot(oc, oc) - radius * radius;
          float discriminant = b * b - 4.0 * a * c;
          
          if (discriminant < 0.0) return false;
          
          t = (-b - sqrt(discriminant)) / (2.0 * a);
          return t > 0.0;
        }
        
        // 光线与平面相交检测
        bool intersectPlane(vec3 ro, vec3 rd, vec3 normal, float distance, out float t) {
          float denom = dot(normal, rd);
          if (abs(denom) < 1e-6) return false;
          
          t = -(dot(normal, ro) + distance) / denom;
          if (t < 0.0) return false;
          
          return true;
        }
        
        // 光线与立方体相交检测
        bool intersectBox(vec3 ro, vec3 rd, vec3 minBox, vec3 maxBox, out float t) {
          vec3 invD = 1.0 / rd;
          vec3 tmin = (minBox - ro) * invD;
          vec3 tmax = (maxBox - ro) * invD;
          
          vec3 tminC = min(tmin, tmax);
          vec3 tmaxC = max(tmin, tmax);
          
          float t0 = max(max(tminC.x, tminC.y), tminC.z);
          float t1 = min(min(tmaxC.x, tmaxC.y), tmaxC.z);
          
          if (t0 > t1 || t1 < 0.0) return false;
          
          t = t0;
          return true;
        }
        
        // 计算场景中所有对象的交集
        bool intersectScene(vec3 ro, vec3 rd, out float t, out int objectId, out vec3 hitPoint, out vec3 normal) {
          float closestT = 1e20;
          objectId = -1;
          
          // 测试所有球体
          for (int i = 0; i < 5; i++) {
            float sphereT;
            vec3 center = vec3(float(i) - 2.0, 0.0, 0.0);
            if (intersectSphere(ro, rd, center, 0.5, sphereT)) {
              if (sphereT < closestT) {
                closestT = sphereT;
                objectId = i;
                hitPoint = ro + rd * sphereT;
                normal = normalize(hitPoint - center);
              }
            }
          }
          
          // 测试平面
          float planeT;
          if (intersectPlane(ro, rd, vec3(0.0, 1.0, 0.0), -1.0, planeT)) {
            if (planeT < closestT) {
              closestT = planeT;
              objectId = 5; // 平面ID
              hitPoint = ro + rd * planeT;
              normal = vec3(0.0, 1.0, 0.0);
            }
          }
          
          // 测试立方体
          float boxT;
          vec3 boxMin = vec3(-1.5, -1.0, -1.5);
          vec3 boxMax = vec3(-0.5, 0.0, -0.5);
          if (intersectBox(ro, rd, boxMin, boxMax, boxT)) {
            if (boxT < closestT) {
              closestT = boxT;
              objectId = 6; // 立方体ID
              hitPoint = ro + rd * boxT;
              // 计算立方体法线
              vec3 center = (boxMin + boxMax) * 0.5;
              normal = normalize(hitPoint - center);
            }
          }
          
          if (objectId != -1) {
            t = closestT;
            return true;
          }
          
          return false;
        }
        
        // 计算表面颜色
        vec3 getColor(vec3 hitPoint, int objectId, vec3 normal) {
          if (objectId == 5) {
            // 棋盘格地面
            vec2 pos = hitPoint.xz;
            float check = step(0.0, sin(pos.x) * sin(pos.z));
            return mix(vec3(0.3, 0.3, 0.35), vec3(0.8, 0.8, 0.85), check);
          } else if (objectId == 6) {
            // 立方体颜色
            return vec3(0.2, 0.6, 0.8);
          } else if (objectId == 1) {
            // 折射球体
            return vec3(0.2, 0.8, 0.9);
          }
          
          // 其他球体颜色
          return vec3(0.8, 0.5, 0.2);
        }
        
        // 检查光线是否被遮挡（软阴影）
        float calculateShadow(vec3 hitPoint, vec3 lightPos, float softness) {
          vec3 lightDir = normalize(lightPos - hitPoint);
          float lightDistance = length(lightPos - hitPoint);
          
          float shadow = 1.0;
          float stepSize = 0.05;
          float t = 0.01;
          
          for (int i = 0; i < 50; i++) {
            if (t > lightDistance) break;
            
            vec3 samplePoint = hitPoint + lightDir * t;
            float dummyT;
            int dummyId;
            vec3 dummyHit, dummyNormal;
            
            if (intersectScene(samplePoint, lightDir, dummyT, dummyId, dummyHit, dummyNormal)) {
              if (dummyT < lightDistance - t) {
                shadow = 0.0;
                break;
              }
            }
            
            t += stepSize;
          }
          
          return shadow;
        }
        
        // 光线追踪主函数
        vec3 traceRay(vec3 ro, vec3 rd, int depth, inout float weight) {
          float t;
          int objectId;
          vec3 hitPoint, normal;
          
          if (!intersectScene(ro, rd, t, objectId, hitPoint, normal)) {
            // 背景颜色（更高级的天空盒）
            vec3 skyColor = vec3(0.05, 0.05, 0.1);
            float sunFactor = max(dot(rd, normalize(vec3(1.0, 1.0, 1.0))), 0.0);
            skyColor += vec3(1.0, 0.8, 0.6) * pow(sunFactor, 16.0);
            skyColor += vec3(0.5, 0.7, 1.0) * pow(sunFactor, 256.0);
            return skyColor;
          }
          
          vec3 color = getColor(hitPoint, objectId, normal);
          
          // 环境光照
          vec3 ambient = vec3(0.1) * color;
          
          // 添加反射
          if (depth < int(maxDepth) && weight > 0.01) {
            vec3 reflectedDir = reflect(rd, normal);
            float reflectionWeight = 0.3 * weight;
            vec3 reflection = traceRay(hitPoint + normal * 0.01, reflectedDir, depth + 1, reflectionWeight);
            color = mix(color, reflection, 0.3);
            weight *= 0.7;
          }
          
          // 添加折射效果
          if (depth < int(maxDepth) && objectId == 1 && weight > 0.01) {
            vec3 refractedDir = refract(rd, normal, 0.7);
            if (dot(refractedDir, refractedDir) > 0.0) {
              float refractionWeight = 0.5 * weight;
              vec3 refraction = traceRay(hitPoint - normal * 0.01, refractedDir, depth + 1, refractionWeight);
              color = mix(color, refraction, 0.5);
              weight *= 0.5;
            }
          }
          
          // 添加直接光照
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(normal, lightDir), 0.0);
          
          // 添加软阴影
          float shadow = calculateShadow(hitPoint, vec3(5.0, 5.0, 5.0), 0.1);
          
          // 添加点光源
          vec3 pointLightPos = vec3(0.0, 2.0, 0.0);
          vec3 toLight = pointLightPos - hitPoint;
          float dist2 = dot(toLight, toLight);
          float att = 1.0 / (1.0 + 0.1 * dist2);
          
          float diff2 = max(dot(normal, normalize(toLight)), 0.0);
          
          // 添加高光
          vec3 viewDir = normalize(cameraPos - hitPoint);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
          
          return ambient + color * (diff * shadow + diff2 * att) + vec3(0.8) * spec * shadow;
        }
        
        void main() {
          vec2 uv = vUv;
          
          // 多重采样抗锯齿
          vec3 finalColor = vec3(0.0);
          int samples = int(samplesPerPixel);
          
          for (int s = 0; s < 16; s++) {
            if (s >= samples) break;
            
            vec2 jitter = vec2(rand(uv + vec2(s, frameCount)), rand(uv - vec2(s, frameCount))) * 0.001;
            vec2 sampleUv = uv + jitter;
            
            // 获取相机光线
            vec3 rayDir = getRayDirection(sampleUv);
            
            // 执行光线追踪
            float weight = 1.0;
            vec3 color = traceRay(cameraPos, rayDir, 0, weight);
            
            finalColor += color;
          }
          
          finalColor /= float(samples);
          
          // 伽马校正
          finalColor = pow(finalColor, vec3(1.0 / 2.2));
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,

      transparent: false,
      depthTest: false,
      depthWrite: false
    })

    // 缓存材质
    shaderCache.set(materialKey, this)
  }

  // 更新相机参数
  updateCamera(camera: THREE.PerspectiveCamera) {
    this.uniforms.cameraPos.value.copy(camera.position)
    this.uniforms.fov.value = camera.fov
    this.uniforms.cameraDir.value.copy(camera.getWorldDirection(new THREE.Vector3()))
    this.uniforms.cameraUp.value.copy(camera.up)

    // 计算相机右向量
    this.uniforms.right.value.copy(
      this.uniforms.cameraDir.value.clone().cross(this.uniforms.cameraUp.value)
    )
  }

  // 更新时间
  updateTime(time: number) {
    this.uniforms.time.value = time
  }

  // 更新帧计数器
  updateFrameCount(count: number) {
    this.uniforms.frameCount.value = count
  }
}

// 玻璃材质 - 实现真实的折射和色散效果
export class GlassMaterial extends THREE.ShaderMaterial {
  constructor(
    options: {
      baseColor?: THREE.Color
      roughness?: number
      transmission?: number
      ior?: number
      dispersion?: number
      thickness?: number
      envMap?: THREE.CubeTexture
    } = {}
  ) {
    // 生成材质缓存键
    const shaderCompiler = ShaderCompiler.getInstance()
    const materialKey = shaderCompiler.createMaterialKey(options)

    // 尝试从缓存获取材质
    const shaderCache = ShaderCache.getInstance()
    const cachedMaterial = shaderCache.get(materialKey)

    if (cachedMaterial) {
      return cachedMaterial as GlassMaterial
    }

    super({
      uniforms: {
        baseColor: { value: options.baseColor || new THREE.Color(0xffffff) },
        roughness: { value: options.roughness || 0.0 },
        transmission: { value: options.transmission || 0.9 },
        ior: { value: options.ior || 1.5 },
        dispersion: { value: options.dispersion || 0.03 },
        thickness: { value: options.thickness || 0.5 },
        envMap: { value: options.envMap },
        cameraPosition: { value: new THREE.Vector3() },
        lightPosition: { value: new THREE.Vector3(10, 10, 10) },
        time: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vViewPosition = - (viewMatrix * worldPosition).xyz;
          
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform float roughness;
        uniform float transmission;
        uniform float ior;
        uniform float dispersion;
        uniform float thickness;
        uniform samplerCube envMap;
        uniform vec3 cameraPosition;
        uniform vec3 lightPosition;
        uniform float time;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        // 色散函数
        vec3 disperse(vec3 dir, float eta, float dispersion) {
          vec3 colors = vec3(1.0, 0.5, 0.2); // RGB
          float etaR = eta + dispersion;
          float etaG = eta;
          float etaB = eta - dispersion * 0.5;
          
          vec3 disp = vec3(
            refract(dir, vec3(0, 1, 0), 1.0 / etaR).x,
            refract(dir, vec3(0, 1, 0), 1.0 / etaG).x,
            refract(dir, vec3(0, 1, 0), 1.0 / etaB).x
          );
          
          return mix(dir, disp, colors);
        }
        
        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          vec3 L = normalize(lightPosition - vWorldPosition);
          vec3 H = normalize(V + L);
          
          // 计算反射和折射
          vec3 R = reflect(-V, N);
          vec3 T = refract(-V, N, 1.0 / ior);
          
          // 应用色散
          vec3 dispR = disperse(R, ior, dispersion);
          vec3 dispT = disperse(T, ior, dispersion);
          
          // 采样环境贴图
          vec3 envColor = vec3(0.0);
          if (envMap != null) {
            envColor = textureCube(envMap, R).rgb;
          }
          
          // 计算菲涅尔效应
          float F = pow(1.0 - max(dot(N, V), 0.0), 5.0);
          F = mix(0.04, 1.0, F);
          
          // 计算颜色
          vec3 color = mix(baseColor, envColor, F);
          
          // 添加折射效果
          vec3 refractedColor = vec3(0.8, 0.9, 1.0) * transmission;
          color = mix(color, refractedColor, transmission * (1.0 - F));
          
          // 添加厚度效果
          float thicknessEffect = thickness * (1.0 - max(dot(N, V), 0.0));
          color += baseColor * thicknessEffect * 0.2;
          
          // 添加高光
          float specular = pow(max(dot(N, H), 0.0), 32.0);
          color += vec3(1.0) * specular * (1.0 - roughness);
          
          // 添加深度效果
          float depth = length(cameraPosition - vWorldPosition);
          float depthEffect = 1.0 / (1.0 + depth * 0.1);
          color *= depthEffect;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false,
      depthWrite: true,
      depthTest: true
    })

    // 缓存材质
    shaderCache.set(materialKey, this)
  }

  updateCameraPosition(position: THREE.Vector3) {
    this.uniforms.cameraPosition.value.copy(position)
  }

  updateTime(time: number) {
    this.uniforms.time.value = time
  }
}

// 次表面散射材质 - 用于皮肤、蜡等材质
export class SubsurfaceScatteringMaterial extends THREE.ShaderMaterial {
  constructor(
    options: {
      baseColor?: THREE.Color
      subsurfaceColor?: THREE.Color
      subsurfaceRadius?: number
      subsurfaceScale?: number
      roughness?: number
      metalness?: number
      thickness?: number
    } = {}
  ) {
    // 生成材质缓存键
    const shaderCompiler = ShaderCompiler.getInstance()
    const materialKey = shaderCompiler.createMaterialKey(options)

    // 尝试从缓存获取材质
    const shaderCache = ShaderCache.getInstance()
    const cachedMaterial = shaderCache.get(materialKey)

    if (cachedMaterial) {
      return cachedMaterial as SubsurfaceScatteringMaterial
    }

    super({
      uniforms: {
        baseColor: { value: options.baseColor || new THREE.Color(0xffccbb) },
        subsurfaceColor: { value: options.subsurfaceColor || new THREE.Color(0xff8866) },
        subsurfaceRadius: { value: options.subsurfaceRadius || 1.0 },
        subsurfaceScale: { value: options.subsurfaceScale || 1.0 },
        roughness: { value: options.roughness || 0.3 },
        metalness: { value: options.metalness || 0.0 },
        thickness: { value: options.thickness || 1.0 },
        cameraPosition: { value: new THREE.Vector3() },
        lightPosition: { value: new THREE.Vector3(10, 10, 10) },
        time: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 subsurfaceColor;
        uniform float subsurfaceRadius;
        uniform float subsurfaceScale;
        uniform float roughness;
        uniform float metalness;
        uniform float thickness;
        uniform vec3 cameraPosition;
        uniform vec3 lightPosition;
        uniform float time;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        // 次表面散射函数
        vec3 subsurfaceScattering(vec3 N, vec3 V, vec3 L, vec3 position, float thickness) {
          vec3 subsurface = vec3(0.0);
          float dist = length(lightPosition - position);
          
          // 计算光线方向
          vec3 lightDir = normalize(L);
          
          // 模拟次表面散射
          for (int i = 1; i <= 3; i++) {
            float offset = float(i) * 0.1;
            vec3 samplePos = position + N * offset;
            vec3 toLight = normalize(lightPosition - samplePos);
            float dotNL = max(dot(N, toLight), 0.0);
            
            subsurface += subsurfaceColor * dotNL * exp(-dist * 0.1) * (1.0 / float(i));
          }
          
          return subsurface * subsurfaceScale * thickness;
        }
        
        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          vec3 L = normalize(lightPosition - vWorldPosition);
          vec3 H = normalize(V + L);
          
          // 计算基础漫反射
          float diffuse = max(dot(N, L), 0.0);
          
          // 计算次表面散射
          vec3 subsurface = subsurfaceScattering(N, V, L, vWorldPosition, thickness);
          
          // 计算高光
          float specular = pow(max(dot(N, H), 0.0), 32.0 * (1.0 - roughness) + 1.0);
          
          // 计算菲涅尔效应
          float F = pow(1.0 - max(dot(N, V), 0.0), 5.0);
          F = mix(0.04, 1.0, F);
          
          // 计算最终颜色
          vec3 color = baseColor * diffuse + subsurface + specular * (1.0 - roughness) * F;
          
          // 添加厚度效果
          float thicknessEffect = thickness * (1.0 - max(dot(N, V), 0.0));
          color += subsurfaceColor * thicknessEffect * 0.3;
          
          // 添加深度效果
          float depth = length(cameraPosition - vWorldPosition);
          float depthEffect = 1.0 / (1.0 + depth * 0.05);
          color *= depthEffect;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false,
      depthWrite: true,
      depthTest: true
    })

    // 缓存材质
    shaderCache.set(materialKey, this)
  }

  updateCameraPosition(position: THREE.Vector3) {
    this.uniforms.cameraPosition.value.copy(position)
  }

  updateLightPosition(position: THREE.Vector3) {
    this.uniforms.lightPosition.value.copy(position)
  }
}

// 导出着色器缓存和资源管理系统
export { ShaderCache, ShaderCompiler, GPUResourceManager }

// 清理所有着色器缓存
export function cleanupShaderCache(): void {
  const shaderCache = ShaderCache.getInstance()
  shaderCache.cleanup()

  const gpuManager = GPUResourceManager.getInstance()
  gpuManager.cleanup()
}

// 获取着色器系统状态
export function getShaderSystemStatus(): {
  cacheSize: number
  gpuResources: {
    textures: number
    buffers: number
  }
} {
  const shaderCache = ShaderCache.getInstance()
  const gpuManager = GPUResourceManager.getInstance()

  return {
    cacheSize: shaderCache.getCacheSize(),
    gpuResources: {
      textures: gpuManager.getTextureCount(),
      buffers: gpuManager.getBufferCount()
    }
  }
}

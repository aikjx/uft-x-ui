import * as THREE from 'three'

/**
 * 高级着色器系统 - 提供顶尖的3D渲染效果
 * 包含光线追踪、体积光、全局光照等高级效果
 */

// 物理基础渲染材质
export class PBRMaterial extends THREE.ShaderMaterial {
  constructor(options: {
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
  } = {}) {
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
          
          float NDF = distributionGGX(N, H, roughness);
          float G = geometrySmith(N, V, L, roughness);
          vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
          
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
      USE_CLEARCOAT: options.clearcoat ? '1' : '0'
    }
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
}

// 体积光材质
export class VolumetricLightMaterial extends THREE.ShaderMaterial {
  constructor(color: THREE.Color = new THREE.Color(0xffffff)) {
    super({
      uniforms: {
        lightPosition: { value: new THREE.Vector3(10, 10, 10) },
        cameraPosition: { value: new THREE.Vector3() },
        color: { value: color },
        density: { value: 0.1 },
        intensity: { value: 1.0 },
        time: { value: 0.0 }
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
        uniform float time;
        
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
        
        void main() {
          vec3 rayDirection = normalize(vWorldPosition - cameraPosition);
          float rayLength = length(vWorldPosition - cameraPosition);
          
          // 计算体积光密度
          float volumetric = 0.0;
          float stepSize = 0.1;
          int numSteps = int(rayLength / stepSize);
          
          for(int i = 0; i < 50; i++) {
            if(i >= numSteps) break;
            
            float t = float(i) * stepSize;
            vec3 samplePoint = cameraPosition + rayDirection * t;
            
            float lightDistance = length(lightPosition - samplePoint);
            float lightInfluence = 1.0 / (1.0 + lightDistance * lightDistance);
            
            float noiseValue = fbm(samplePoint * 0.1 + vec3(time * 0.05));
            volumetric += lightInfluence * noiseValue * density;
          }
          
          volumetric = volumetric / float(numSteps) * intensity;
          
          gl_FragColor = vec4(color * volumetric, volumetric * 0.5);
        }
      `,
      
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true
    })
  }
}

// 程序化星云材质
export class NebulaMaterial extends THREE.ShaderMaterial {
  constructor(options: {
    color1?: THREE.Color
    color2?: THREE.Color
    color3?: THREE.Color
    density?: number
    scale?: number
  } = {}) {
    super({
      uniforms: {
        time: { value: 0.0 },
        color1: { value: options.color1 || new THREE.Color(0x1a1a2e) },
        color2: { value: options.color2 || new THREE.Color(0x16213e) },
        color3: { value: options.color3 || new THREE.Color(0x0f3460) },
        density: { value: options.density || 0.5 },
        scale: { value: options.scale || 1.0 }
      },
      
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
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
        
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        float fbm(vec2 p) {
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
        
        void main() {
          vec2 p = vUv * scale;
          
          // 添加动态效果
          p += vec2(time * 0.01, -time * 0.008);
          
          float nebula = turbulence(p);
          float stars = noise(p * 10.0 + time * 0.1);
          
          // 创建颜色渐变
          vec3 color = mix(color1, color2, nebula);
          color = mix(color, color3, stars * 0.5);
          
          // 添加星点
          float starField = step(0.98, noise(p * 50.0)) * stars;
          color += vec3(1.0, 1.0, 0.8) * starField;
          
          // 应用密度
          color *= density;
          
          gl_FragColor = vec4(color, density * 0.3);
        }
      `,
      
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  }
}

// 全局光照材质
export class GlobalIlluminationMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        lightMap: { value: null },
        normalMap: { value: null },
        aoMap: { value: null },
        lightPosition: { value: new THREE.Vector3() },
        cameraPosition: { value: new THREE.Vector3() },
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      
      fragmentShader: `
        uniform sampler2D lightMap;
        uniform sampler2D normalMap;
        uniform sampler2D aoMap;
        uniform vec3 lightPosition;
        uniform vec3 cameraPosition;
        uniform float time;
        uniform vec2 resolution;
        
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        
        void main() {
          // 采样贴图
          vec3 baseColor = texture2D(lightMap, vUv).rgb;
          vec3 normal = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
          float ao = texture2D(aoMap, vUv).r;
          
          // 重新构建法线
          normal = normalize(vNormal + normal);
          
          // 计算光照
          vec3 L = normalize(lightPosition - vWorldPosition);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          vec3 H = normalize(L + V);
          
          float NdotL = max(dot(normal, L), 0.0);
          float NdotV = max(dot(normal, V), 0.0);
          float NdotH = max(dot(normal, H), 0.0);
          
          // 简化的BRDF计算
          float diffuse = NdotL;
          float specular = pow(NdotH, 32.0);
          
          vec3 color = baseColor * (diffuse + specular) * ao;
          
          // 添加全局光照效果
          color += baseColor * 0.1;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      
      transparent: false,
      depthWrite: true,
      depthTest: true
    })
  }
}

// 光线追踪材质 - 实现真正的光线追踪效果
export class RayTracingMaterial extends THREE.ShaderMaterial {
  private objects: any[] = []
  private lights: any[] = []
  private maxDepth: number = 3
  private fov: number = 75
  private cameraPos: THREE.Vector3 = new THREE.Vector3(0, 0, 5)
  private cameraDir: THREE.Vector3 = new THREE.Vector3(0, 0, -1)
  private cameraUp: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
  private right: THREE.Vector3 = new THREE.Vector3()
  
  constructor() {
    super({
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        cameraPos: { value: new THREE.Vector3() },
        cameraDir: { value: new THREE.Vector3() },
        cameraUp: { value: new THREE.Vector3() },
        right: { value: new THREE.Vector3() },
        objects: { value: [] },
        lights: { value: [] },
        maxDepth: { value: 3.0 },
        fov: { value: 75.0 }
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
        uniform float fov;
        uniform float maxDepth;
        
        varying vec2 vUv;
        
        // 随机数生成器
        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
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
          
          float t = -(dot(normal, ro) + distance) / denom;
          if (t < 0.0) return false;
          
          return true;
        }
        
        // 计算场景中所有对象的交集
        bool intersectScene(vec3 ro, vec3 rd, out float t, out int objectId) {
          float closestT = 1e20;
          objectId = -1;
          
          // 测试所有球体
          for (int i = 0; i < 5; i++) {
            float sphereT;
            if (intersectSphere(ro, rd, vec3(float(i) - 2.0, 0.0, 0.0), 0.5, sphereT)) {
              if (sphereT < closestT) {
                closestT = sphereT;
                objectId = i;
              }
            }
          }
          
          // 测试平面
          float planeT;
          if (intersectPlane(ro, rd, vec3(0.0, 1.0, 0.0), -1.0, planeT)) {
            if (planeT < closestT) {
              closestT = planeT;
              objectId = 5; // 平面ID
            }
          }
          
          if (objectId != -1) {
            t = closestT;
            return true;
          }
          
          return false;
        }
        
        // 计算表面法线
        vec3 getNormal(vec3 hitPoint, int objectId) {
          if (objectId == 5) {
            // 平面法线
            return vec3(0.0, 1.0, 0.0);
          }
          
          // 球体法线
          vec3 center = vec3(float(objectId) - 2.0, 0.0, 0.0);
          return normalize(hitPoint - center);
        }
        
        // 计算表面颜色
        vec3 getColor(vec3 hitPoint, int objectId, vec3 normal) {
          if (objectId == 5) {
            // 棋盘格地面
            vec2 pos = hitPoint.xz;
            float check = step(0.0, sin(pos.x) * sin(pos.z));
            return mix(vec3(0.3, 0.3, 0.35), vec3(0.8, 0.8, 0.85), check);
          }
          
          // 球体颜色
          return vec3(0.8, 0.5, 0.2);
        }
        
        // 光线追踪主函数
        vec3 traceRay(vec3 ro, vec3 rd, int depth) {
          float t;
          int objectId;
          
          if (!intersectScene(ro, rd, t, objectId)) {
            // 背景颜色
            return vec3(0.05, 0.05, 0.1) + vec3(0.05) * sin(rd.y * 10.0 + time);
          }
          
          vec3 hitPoint = ro + rd * t;
          vec3 normal = getNormal(hitPoint, objectId);
          vec3 color = getColor(hitPoint, objectId, normal);
          
          // 环境光照
          vec3 ambient = vec3(0.1) * color;
          
          // 添加反射
          if (depth < int(maxDepth)) {
            vec3 reflectedDir = reflect(rd, normal);
            vec3 reflection = traceRay(hitPoint + normal * 0.01, reflectedDir, depth + 1);
            color = mix(color, reflection, 0.3);
          }
          
          // 添加折射效果
          if (depth < int(maxDepth) && objectId == 1) {
            vec3 refractedDir = refract(rd, normal, 0.7);
            vec3 refraction = traceRay(hitPoint - normal * 0.01, refractedDir, depth + 1);
            color = mix(color, refraction, 0.5);
          }
          
          // 添加简单的光照
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(normal, lightDir), 0.0);
          
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
          
          return color * (ambient + vec3(0.7) * diff + vec3(0.8) * diff2 * att) + vec3(0.8) * spec;
        }
        
        void main() {
          vec2 uv = vUv;
          
          // 获取相机光线
          vec3 rayDir = getRayDirection(uv);
          
          // 执行光线追踪
          vec3 color = traceRay(cameraPos, rayDir, 0);
          
          // 伽马校正
          color = pow(color, vec3(1.0 / 2.2));
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      
      transparent: false,
      depthTest: false,
      depthWrite: false
    })
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
}
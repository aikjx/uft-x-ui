/**
 * 量子场着色器
 * Quantum Field Shaders - 电影级视觉效果
 */

import * as THREE from 'three'

/**
 * 量子粒子顶点着色器
 */
export const quantumParticleVertexShader = `
  uniform float time;
  uniform float scale;
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vColor = customColor;
    
    // 量子波动效果
    vec3 pos = position;
    float wave = sin(pos.x * 0.5 + time) * cos(pos.y * 0.5 + time) * 0.5;
    pos.z += wave;
    
    // 计算透明度（基于距离）
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = length(mvPosition.xyz);
    vAlpha = 1.0 - smoothstep(10.0, 50.0, dist);
    
    gl_PointSize = size * scale * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

/**
 * 量子粒子片段着色器
 */
export const quantumParticleFragmentShader = `
  uniform sampler2D pointTexture;
  uniform float opacity;
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // 圆形粒子
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    if (dist > 0.5) {
      discard;
    }
    
    // 辉光效果
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    glow = pow(glow, 2.0);
    
    // 最终颜色
    vec3 color = vColor * glow;
    float alpha = glow * vAlpha * opacity;
    
    gl_FragColor = vec4(color, alpha);
  }
`

/**
 * 引力场扭曲着色器
 */
export const gravityDistortionVertexShader = `
  uniform float time;
  uniform float strength;
  uniform vec3 gravityCenter;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // 计算到引力中心的距离
    vec3 toCenter = position - gravityCenter;
    float dist = length(toCenter);
    
    // 引力扭曲效果
    float distortion = strength / (dist * dist + 1.0);
    vec3 distortedPos = position + normalize(toCenter) * distortion * sin(time);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(distortedPos, 1.0);
  }
`

export const gravityDistortionFragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    // 三色渐变
    float mixFactor1 = sin(vPosition.x * 0.5 + time) * 0.5 + 0.5;
    float mixFactor2 = cos(vPosition.y * 0.5 + time) * 0.5 + 0.5;
    
    vec3 color = mix(color1, color2, mixFactor1);
    color = mix(color, color3, mixFactor2);
    
    // 添加脉动效果
    float pulse = sin(time * 2.0) * 0.2 + 0.8;
    color *= pulse;
    
    gl_FragColor = vec4(color, 0.6);
  }
`

/**
 * 时空涟漪着色器
 */
export const spacetimeRippleVertexShader = `
  uniform float time;
  uniform float amplitude;
  uniform float frequency;
  varying vec2 vUv;
  varying float vElevation;
  
  void main() {
    vUv = uv;
    
    // 计算涟漪效果
    float dist = length(position.xy);
    float ripple = sin(dist * frequency - time * 3.0) * amplitude;
    ripple *= exp(-dist * 0.1); // 衰减
    
    vec3 newPosition = position;
    newPosition.z += ripple;
    vElevation = ripple;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

export const spacetimeRippleFragmentShader = `
  uniform vec3 colorLow;
  uniform vec3 colorHigh;
  varying vec2 vUv;
  varying float vElevation;
  
  void main() {
    // 根据高度混合颜色
    float mixStrength = (vElevation + 1.0) * 0.5;
    vec3 color = mix(colorLow, colorHigh, mixStrength);
    
    // 添加网格线
    float grid = 0.0;
    if (mod(vUv.x * 50.0, 1.0) < 0.05 || mod(vUv.y * 50.0, 1.0) < 0.05) {
      grid = 0.3;
    }
    
    color += vec3(grid);
    
    gl_FragColor = vec4(color, 0.8);
  }
`

/**
 * 全息投影着色器
 */
export const holographicVertexShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // 全息扫描线效果
    vec3 pos = position;
    float scanline = sin(pos.y * 20.0 + time * 5.0) * 0.02;
    pos += normal * scanline;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const holographicFragmentShader = `
  uniform float time;
  uniform vec3 hologramColor;
  uniform float opacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // 菲涅尔效果
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
    
    // 扫描线
    float scanline = sin(vPosition.y * 50.0 + time * 10.0) * 0.5 + 0.5;
    
    // 闪烁效果
    float flicker = sin(time * 20.0) * 0.1 + 0.9;
    
    // 组合效果
    vec3 color = hologramColor * (fresnel + scanline * 0.3) * flicker;
    float alpha = (fresnel * 0.7 + scanline * 0.3) * opacity;
    
    gl_FragColor = vec4(color, alpha);
  }
`

/**
 * 量子纠缠连接线着色器
 */
export const quantumEntanglementVertexShader = `
  uniform float time;
  attribute float linePosition;
  varying float vLinePosition;
  varying vec3 vColor;
  
  void main() {
    vLinePosition = linePosition;
    
    // 波动效果
    vec3 pos = position;
    float wave = sin(linePosition * 10.0 + time * 3.0) * 0.2;
    pos.y += wave;
    
    // 颜色变化
    vColor = vec3(
      0.5 + 0.5 * sin(time + linePosition * 3.14159),
      0.5 + 0.5 * cos(time + linePosition * 3.14159),
      1.0
    );
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const quantumEntanglementFragmentShader = `
  uniform float time;
  uniform float opacity;
  varying float vLinePosition;
  varying vec3 vColor;
  
  void main() {
    // 能量流动效果
    float flow = sin(vLinePosition * 20.0 - time * 5.0) * 0.5 + 0.5;
    
    // 脉冲效果
    float pulse = sin(time * 3.0) * 0.3 + 0.7;
    
    vec3 color = vColor * flow * pulse;
    float alpha = flow * pulse * opacity;
    
    gl_FragColor = vec4(color, alpha);
  }
`

/**
 * 创建量子粒子材质
 */
export function createQuantumParticleMaterial(
  params: {
    color?: THREE.Color
    size?: number
    opacity?: number
  } = {}
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      scale: { value: params.size || 1.0 },
      opacity: { value: params.opacity || 1.0 },
      pointTexture: { value: null }
    },
    vertexShader: quantumParticleVertexShader,
    fragmentShader: quantumParticleFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
}

/**
 * 创建引力场扭曲材质
 */
export function createGravityDistortionMaterial(
  params: {
    strength?: number
    gravityCenter?: THREE.Vector3
    colors?: THREE.Color[]
  } = {}
): THREE.ShaderMaterial {
  const colors = params.colors || [
    new THREE.Color(0x00d4ff),
    new THREE.Color(0xb400ff),
    new THREE.Color(0xff0080)
  ]

  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      strength: { value: params.strength || 1.0 },
      gravityCenter: { value: params.gravityCenter || new THREE.Vector3(0, 0, 0) },
      color1: { value: colors[0] },
      color2: { value: colors[1] },
      color3: { value: colors[2] }
    },
    vertexShader: gravityDistortionVertexShader,
    fragmentShader: gravityDistortionFragmentShader,
    transparent: true,
    side: THREE.DoubleSide
  })
}

/**
 * 创建时空涟漪材质
 */
export function createSpacetimeRippleMaterial(
  params: {
    amplitude?: number
    frequency?: number
    colorLow?: THREE.Color
    colorHigh?: THREE.Color
  } = {}
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      amplitude: { value: params.amplitude || 0.5 },
      frequency: { value: params.frequency || 2.0 },
      colorLow: { value: params.colorLow || new THREE.Color(0x000033) },
      colorHigh: { value: params.colorHigh || new THREE.Color(0x00d4ff) }
    },
    vertexShader: spacetimeRippleVertexShader,
    fragmentShader: spacetimeRippleFragmentShader,
    transparent: true,
    side: THREE.DoubleSide
  })
}

/**
 * 创建全息投影材质
 */
export function createHolographicMaterial(
  params: {
    color?: THREE.Color
    opacity?: number
  } = {}
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      hologramColor: { value: params.color || new THREE.Color(0x00d4ff) },
      opacity: { value: params.opacity || 0.8 }
    },
    vertexShader: holographicVertexShader,
    fragmentShader: holographicFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
  })
}

/**
 * 创建量子纠缠连接线材质
 */
export function createQuantumEntanglementMaterial(
  params: {
    opacity?: number
  } = {}
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: params.opacity || 0.8 }
    },
    vertexShader: quantumEntanglementVertexShader,
    fragmentShader: quantumEntanglementFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
}

/**
 * 更新着色器时间
 */
export function updateShaderTime(material: THREE.ShaderMaterial, time: number): void {
  if (material.uniforms.time) {
    material.uniforms.time.value = time
  }
}

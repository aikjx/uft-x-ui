import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'

interface PostProcessingConfig {
  enableTAA: boolean
  enableBloom: boolean
  enableDOF: boolean
  enableOutline: boolean
  enableAfterimage: boolean
  enableFilm: boolean
  enableSMAA: boolean
  enableChromaticAberration: boolean
  enableVignette: boolean
  enableColorGrading: boolean
  enableDepthFog: boolean
  enableMotionBlur: boolean
  bloomStrength: number
  bloomThreshold: number
  bloomRadius: number
  dofFocus: number
  dofAperture: number
  dofMaxBlur: number
  filmGrain: number
  filmScanlines: number
  filmNoise: number
  filmGrayscale: boolean
  outlineStrength: number
  outlineThickness: number
  outlineGlow: number
  afterimageDamp: number
  chromaticAberrationStrength: number
  vignetteIntensity: number
  vignetteDarkness: number
  colorGradingIntensity: number
  depthFogDensity: number
  depthFogColor: string
  motionBlurIntensity: number
  motionBlurSamples: number
}

/**
 * Advanced post-processing system with TAA and other cutting-edge effects
 */
export class AdvancedPostProcessingSystem {
  private composer: EffectComposer
  private renderPass: RenderPass
  private taaPass: ShaderPass | null = null
  private bloomPass: UnrealBloomPass | null = null
  private bokehPass: BokehPass | null = null
  private outlinePass: OutlinePass | null = null
  private afterimagePass: AfterimagePass | null = null
  private filmPass: FilmPass | null = null
  private smaaPass: SMAAPass | null = null
  private chromaticAberrationPass: ShaderPass | null = null
  private vignettePass: ShaderPass | null = null
  private colorGradingPass: ShaderPass | null = null
  private depthFogPass: ShaderPass | null = null
  private motionBlurPass: ShaderPass | null = null

  private config: PostProcessingConfig
  private scene: THREE.Scene
  private camera: THREE.Camera
  private renderer: THREE.WebGLRenderer | THREE.WebGPURenderer

  // TAA history buffers
  private historyTexture: THREE.WebGLRenderTarget | null = null
  private velocityTexture: THREE.WebGLRenderTarget | null = null
  private currentFrame: number = 0

  constructor(
    renderer: THREE.WebGLRenderer | THREE.WebGPURenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    config: Partial<PostProcessingConfig> = {}
  ) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera

    // Default configuration
    this.config = {
      enableTAA: true,
      enableBloom: false,
      enableDOF: false,
      enableOutline: false,
      enableAfterimage: false,
      enableFilm: false,
      enableSMAA: true,
      enableChromaticAberration: false,
      enableVignette: false,
      enableColorGrading: false,
      enableDepthFog: false,
      enableMotionBlur: false,
      bloomStrength: 1.0,
      bloomThreshold: 0.8,
      bloomRadius: 0.5,
      dofFocus: 5.0,
      dofAperture: 0.001,
      dofMaxBlur: 0.01,
      filmGrain: 0.1,
      filmScanlines: 0.1,
      filmNoise: 0.1,
      filmGrayscale: false,
      outlineStrength: 3.0,
      outlineThickness: 1.0,
      outlineGlow: 1.0,
      afterimageDamp: 0.8,
      chromaticAberrationStrength: 0.1,
      vignetteIntensity: 0.5,
      vignetteDarkness: 0.3,
      colorGradingIntensity: 0.5,
      depthFogDensity: 0.1,
      depthFogColor: '#000000',
      motionBlurIntensity: 0.1,
      motionBlurSamples: 8,
      ...config
    }

    // Create render targets
    this.historyTexture = this.createRenderTarget()
    this.velocityTexture = this.createRenderTarget()

    // Initialize composer
    this.composer = new EffectComposer(renderer)
    this.renderPass = new RenderPass(scene, camera)
    this.composer.addPass(this.renderPass)

    // Initialize post-processing passes
    this.initializePasses()
  }

  /**
   * Create render target
   */
  private createRenderTarget(): THREE.WebGLRenderTarget {
    const size = this.getRendererSize()
    return new THREE.WebGLRenderTarget(size.width, size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      samples: 8
    })
  }

  /**
   * Get renderer size
   */
  private getRendererSize(): { width: number; height: number } {
    const size = new THREE.Vector2()
    this.renderer.getSize(size)
    return { width: size.width, height: size.height }
  }

  /**
   * Initialize post-processing passes
   */
  private initializePasses(): void {
    const size = this.getRendererSize()

    // TAA Pass
    if (this.config.enableTAA) {
      this.taaPass = this.createTAAPass()
      this.composer.addPass(this.taaPass)
    }

    // Bloom Pass
    if (this.config.enableBloom) {
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        this.config.bloomStrength,
        this.config.bloomRadius,
        this.config.bloomThreshold
      )
      this.composer.addPass(this.bloomPass)
    }

    // Depth of Field Pass
    if (this.config.enableDOF) {
      this.bokehPass = new BokehPass(this.scene, this.camera as THREE.PerspectiveCamera, {
        focus: this.config.dofFocus,
        aperture: this.config.dofAperture,
        maxblur: this.config.dofMaxBlur,
        width: size.width,
        height: size.height
      })
      this.composer.addPass(this.bokehPass)
    }

    // Outline Pass
    if (this.config.enableOutline) {
      this.outlinePass = new OutlinePass(
        new THREE.Vector2(size.width, size.height),
        this.scene,
        this.camera as THREE.PerspectiveCamera
      )
      this.outlinePass.edgeStrength = this.config.outlineStrength
      this.outlinePass.edgeThickness = this.config.outlineThickness
      this.outlinePass.edgeGlow = this.config.outlineGlow
      this.outlinePass.visibleEdgeColor.set('#00ffff')
      this.outlinePass.hiddenEdgeColor.set('#00ffff')
      this.composer.addPass(this.outlinePass)
    }

    // Afterimage Pass
    if (this.config.enableAfterimage) {
      this.afterimagePass = new AfterimagePass()
      this.afterimagePass.uniforms['damp'].value = this.config.afterimageDamp
      this.composer.addPass(this.afterimagePass)
    }

    // SMAA Pass for high-quality anti-aliasing
    if (this.config.enableSMAA) {
      this.smaaPass = new SMAAPass(size.width, size.height)
      this.composer.addPass(this.smaaPass)
    }

    // Chromatic Aberration Pass
    if (this.config.enableChromaticAberration) {
      this.chromaticAberrationPass = this.createChromaticAberrationPass()
      this.composer.addPass(this.chromaticAberrationPass)
    }

    // Vignette Pass
    if (this.config.enableVignette) {
      this.vignettePass = this.createVignettePass()
      this.composer.addPass(this.vignettePass)
    }

    // Color Grading Pass
    if (this.config.enableColorGrading) {
      this.colorGradingPass = this.createColorGradingPass()
      this.composer.addPass(this.colorGradingPass)
    }

    // Depth Fog Pass
    if (this.config.enableDepthFog) {
      this.depthFogPass = this.createDepthFogPass()
      this.composer.addPass(this.depthFogPass)
    }

    // Motion Blur Pass
    if (this.config.enableMotionBlur) {
      this.motionBlurPass = this.createMotionBlurPass()
      this.composer.addPass(this.motionBlurPass)
    }

    // Film Pass
    if (this.config.enableFilm) {
      this.filmPass = new FilmPass(
        this.config.filmNoise,
        this.config.filmScanlines,
        this.config.filmGrain,
        this.config.filmGrayscale
      )
      this.composer.addPass(this.filmPass)
    }
  }

  /**
   * Create TAA (Temporal Anti-Aliasing) pass
   */
  private createTAAPass(): ShaderPass {
    const taaShader = {
      uniforms: {
        tDiffuse: { value: null },
        tHistory: { value: this.historyTexture?.texture },
        tVelocity: { value: this.velocityTexture?.texture },
        resolution: { value: new THREE.Vector2() },
        frame: { value: 0 },
        blendFactor: { value: 0.9 }
      },

      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tHistory;
        uniform sampler2D tVelocity;
        uniform vec2 resolution;
        uniform float frame;
        uniform float blendFactor;
        
        varying vec2 vUv;
        
        vec2 jitter(vec2 uv, float frame) {
          vec2 jitterPattern[4] = vec2[](
            vec2(-1.0, -1.0),
            vec2(1.0, -1.0),
            vec2(-1.0, 1.0),
            vec2(1.0, 1.0)
          );
          vec2 jitterOffset = jitterPattern[int(mod(frame, 4.0))] * 0.02;
          return uv + jitterOffset / resolution;
        }
        
        void main() {
          vec2 uv = vUv;
          vec2 jitteredUv = jitter(uv, frame);
          
          vec4 currentColor = texture2D(tDiffuse, jitteredUv);
          vec4 historyColor = texture2D(tHistory, uv);
          vec2 velocity = texture2D(tVelocity, uv).xy;
          
          vec2 historyUv = uv - velocity * 0.5;
          historyUv = clamp(historyUv, 0.0, 1.0);
          
          vec4 filteredHistoryColor = texture2D(tHistory, historyUv);
          
          float weight = 0.1 + blendFactor * 0.8;
          vec4 finalColor = mix(currentColor, filteredHistoryColor, weight);
          
          gl_FragColor = finalColor;
        }
      `
    }

    return new ShaderPass(taaShader)
  }

  /**
   * Create Chromatic Aberration pass
   */
  private createChromaticAberrationPass(): ShaderPass {
    const chromaticAberrationShader = {
      uniforms: {
        tDiffuse: { value: null },
        strength: { value: this.config.chromaticAberrationStrength }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float strength;
        
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          vec2 offset = (vUv - center) * strength;
          
          float r = texture2D(tDiffuse, vUv + offset).r;
          float g = texture2D(tDiffuse, vUv).g;
          float b = texture2D(tDiffuse, vUv - offset).b;
          
          gl_FragColor = vec4(r, g, b, 1.0);
        }
      `
    }

    return new ShaderPass(chromaticAberrationShader)
  }

  /**
   * Create Vignette pass
   */
  private createVignettePass(): ShaderPass {
    const vignetteShader = {
      uniforms: {
        tDiffuse: { value: null },
        intensity: { value: this.config.vignetteIntensity },
        darkness: { value: this.config.vignetteDarkness }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float intensity;
        uniform float darkness;
        
        varying vec2 vUv;
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          vec2 center = vec2(0.5, 0.5);
          float distance = length(vUv - center);
          
          float vignette = 1.0 - intensity * pow(distance, 2.0);
          vignette = mix(1.0, vignette, darkness);
          
          gl_FragColor = vec4(color.rgb * vignette, color.a);
        }
      `
    }

    return new ShaderPass(vignetteShader)
  }

  /**
   * Create Color Grading pass
   */
  private createColorGradingPass(): ShaderPass {
    const colorGradingShader = {
      uniforms: {
        tDiffuse: { value: null },
        intensity: { value: this.config.colorGradingIntensity }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float intensity;
        
        varying vec2 vUv;
        
        // Cinematic color grading
        vec3 cinematicGrade(vec3 color) {
          // Tone mapping
          color = color / (color + 1.0);
          
          // Color grading
          color.r *= 1.05;
          color.g *= 0.95;
          color.b *= 0.9;
          
          // Contrast boost
          color = (color - 0.5) * 1.2 + 0.5;
          
          // Saturation
          float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
          color = mix(vec3(gray), color, 1.1);
          
          return color;
        }
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          vec3 gradedColor = cinematicGrade(color.rgb);
          color.rgb = mix(color.rgb, gradedColor, intensity);
          gl_FragColor = color;
        }
      `
    }

    return new ShaderPass(colorGradingShader)
  }

  /**
   * Create Depth Fog pass
   */
  private createDepthFogPass(): ShaderPass {
    const depthFogShader = {
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: this.velocityTexture?.texture },
        density: { value: this.config.depthFogDensity },
        fogColor: { value: new THREE.Color(this.config.depthFogColor) },
        cameraNear: { value: (this.camera as THREE.PerspectiveCamera).near || 0.1 },
        cameraFar: { value: (this.camera as THREE.PerspectiveCamera).far || 1000 }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float density;
        uniform vec3 fogColor;
        uniform float cameraNear;
        uniform float cameraFar;
        
        varying vec2 vUv;
        
        float linearizeDepth(float depth) {
          float z = depth * 2.0 - 1.0;
          return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - z * (cameraFar - cameraNear));
        }
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          float depth = texture2D(tDepth, vUv).r;
          float linearDepth = linearizeDepth(depth);
          
          float fogFactor = exp(-density * density * linearDepth * linearDepth);
          fogFactor = clamp(fogFactor, 0.0, 1.0);
          
          color.rgb = mix(fogColor, color.rgb, fogFactor);
          gl_FragColor = color;
        }
      `
    }

    return new ShaderPass(depthFogShader)
  }

  /**
   * Create Motion Blur pass
   */
  private createMotionBlurPass(): ShaderPass {
    const motionBlurShader = {
      uniforms: {
        tDiffuse: { value: null },
        tVelocity: { value: this.velocityTexture?.texture },
        intensity: { value: this.config.motionBlurIntensity },
        samples: { value: this.config.motionBlurSamples }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tVelocity;
        uniform float intensity;
        uniform float samples;
        
        varying vec2 vUv;
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          vec2 velocity = texture2D(tVelocity, vUv).xy * intensity;
          
          if (length(velocity) > 0.0) {
            vec2 texelSize = vec2(1.0 / 1024.0, 1.0 / 1024.0);
            float totalWeight = 1.0;
            
            for (float i = 1.0; i < 10.0; i++) {
              if (i >= samples) break;
              
              float percent = i / samples;
              vec2 offset = velocity * percent;
              
              vec4 sampleColor = texture2D(tDiffuse, vUv + offset);
              float weight = 1.0 - percent;
              
              color += sampleColor * weight;
              totalWeight += weight;
            }
            
            color /= totalWeight;
          }
          
          gl_FragColor = color;
        }
      `
    }

    return new ShaderPass(motionBlurShader)
  }

  /**
   * Update post-processing system
   */
  public update(deltaTime: number): void {
    this.currentFrame++

    // Update TAA frame counter
    if (this.taaPass) {
      this.taaPass.uniforms['frame'].value = this.currentFrame
    }

    // Update bloom parameters
    if (this.bloomPass) {
      this.bloomPass.threshold = this.config.bloomThreshold
      this.bloomPass.strength = this.config.bloomStrength
      this.bloomPass.radius = this.config.bloomRadius
    }

    // Update DOF parameters
    if (this.bokehPass) {
      this.bokehPass.uniforms['focus'].value = this.config.dofFocus
      this.bokehPass.uniforms['aperture'].value = this.config.dofAperture
      this.bokehPass.uniforms['maxblur'].value = this.config.dofMaxBlur
    }

    // Update outline parameters
    if (this.outlinePass) {
      this.outlinePass.edgeStrength = this.config.outlineStrength
      this.outlinePass.edgeThickness = this.config.outlineThickness
      this.outlinePass.edgeGlow = this.config.outlineGlow
    }

    // Update afterimage parameters
    if (this.afterimagePass) {
      this.afterimagePass.uniforms['damp'].value = this.config.afterimageDamp
    }

    // Update chromatic aberration parameters
    if (this.chromaticAberrationPass) {
      this.chromaticAberrationPass.uniforms['strength'].value =
        this.config.chromaticAberrationStrength
    }

    // Update vignette parameters
    if (this.vignettePass) {
      this.vignettePass.uniforms['intensity'].value = this.config.vignetteIntensity
      this.vignettePass.uniforms['darkness'].value = this.config.vignetteDarkness
    }

    // Update color grading parameters
    if (this.colorGradingPass) {
      this.colorGradingPass.uniforms['intensity'].value = this.config.colorGradingIntensity
    }

    // Update depth fog parameters
    if (this.depthFogPass) {
      this.depthFogPass.uniforms['density'].value = this.config.depthFogDensity
      this.depthFogPass.uniforms['fogColor'].value = new THREE.Color(this.config.depthFogColor)
    }

    // Update motion blur parameters
    if (this.motionBlurPass) {
      this.motionBlurPass.uniforms['intensity'].value = this.config.motionBlurIntensity
      this.motionBlurPass.uniforms['samples'].value = this.config.motionBlurSamples
    }
  }

  /**
   * Render the scene with post-processing
   */
  public render(): void {
    this.composer.render()

    // Swap history buffers for TAA
    if (this.historyTexture) {
      const temp = this.historyTexture
      this.historyTexture = this.createRenderTarget()
      if (this.taaPass) {
        this.taaPass.uniforms['tHistory'].value = this.historyTexture.texture
      }
      temp.dispose()
    }
  }

  /**
   * Set objects to outline
   */
  public setOutlineObjects(objects: THREE.Object3D[]): void {
    if (this.outlinePass) {
      this.outlinePass.selectedObjects = objects
    }
  }

  /**
   * Resize the post-processing system
   */
  public resize(width: number, height: number): void {
    this.composer.setSize(width, height)

    // Update render targets
    if (this.historyTexture) {
      this.historyTexture.setSize(width, height)
    }
    if (this.velocityTexture) {
      this.velocityTexture.setSize(width, height)
    }

    // Update passes that need size information
    if (this.outlinePass) {
      this.outlinePass.setSize(width, height)
    }

    // Update TAA resolution
    if (this.taaPass) {
      this.taaPass.uniforms['resolution'].value.set(width, height)
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<PostProcessingConfig>): void {
    this.config = { ...this.config, ...config }
    this.reinitializePasses()
  }

  /**
   * Reinitialize passes based on updated config
   */
  private reinitializePasses(): void {
    // Remove all passes except render pass
    this.composer.passes = [this.renderPass]

    // Reinitialize passes
    this.initializePasses()
  }

  /**
   * Get current configuration
   */
  public getConfig(): PostProcessingConfig {
    return { ...this.config }
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    this.composer.dispose()

    if (this.historyTexture) {
      this.historyTexture.dispose()
    }

    if (this.velocityTexture) {
      this.velocityTexture.dispose()
    }
  }
}

/**
 * Create advanced post-processing system
 */
export function createAdvancedPostProcessingSystem(
  renderer: THREE.WebGLRenderer | THREE.WebGPURenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  config?: Partial<PostProcessingConfig>
): AdvancedPostProcessingSystem {
  return new AdvancedPostProcessingSystem(renderer, scene, camera, config)
}

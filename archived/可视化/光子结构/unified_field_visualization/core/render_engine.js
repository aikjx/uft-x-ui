// 统一场论可视化系统 - 核心渲染引擎
// 版本: v1.0
// 功能: 提供Canvas 2D和WebGL渲染支持，实现3D时空可视化

class RenderEngine {
  constructor() {
    this.canvases = new Map();
    this.webglContexts = new Map();
    this.shaders = new Map();
    this.geometryCache = new Map();
    this.renderStats = {
      frames: 0,
      fps: 0,
      lastTime: 0
    };
    this.init();
  }

  init() {
    console.log('🌌 核心渲染引擎初始化');
    this.initWebGLSupport();
    this.initShaders();
  }

  initWebGLSupport() {
    this.webglSupported = typeof WebGLRenderingContext !== 'undefined';
    console.log(`🌐 WebGL支持: ${this.webglSupported ? '✅ 支持' : '❌ 不支持'}`);
  }

  initShaders() {
    if (this.webglSupported) {
      this.createBasicShaders();
    }
  }

  createBasicShaders() {
    // 顶点着色器
    const vertexShaderSource = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying vec3 vColor;
      
      void main() {
        vColor = aColor;
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 vColor;
      
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `;

    this.shaders.set('basic', {
      vertex: vertexShaderSource,
      fragment: fragmentShaderSource
    });
  }

  createCanvas(id, width, height) {
    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = '1px solid #667eea';
    canvas.style.borderRadius = '8px';
    canvas.style.backgroundColor = '#0a0e39';
    
    const ctx = canvas.getContext('2d');
    this.canvases.set(id, {
      canvas,
      ctx,
      width,
      height,
      webgl: null
    });

    return canvas;
  }

  createWebGLCanvas(id, width, height) {
    if (!this.webglSupported) {
      return this.createCanvas(id, width, height);
    }

    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = '1px solid #667eea';
    canvas.style.borderRadius = '8px';
    canvas.style.backgroundColor = '#0a0e39';

    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        this.canvases.set(id, {
          canvas,
          ctx: null,
          webgl: gl,
          width,
          height
        });
        this.initWebGLContext(gl);
      } else {
        const ctx = canvas.getContext('2d');
        this.canvases.set(id, {
          canvas,
          ctx,
          webgl: null,
          width,
          height
        });
      }
    } catch (error) {
      console.error('WebGL初始化失败:', error);
      const ctx = canvas.getContext('2d');
      this.canvases.set(id, {
        canvas,
        ctx,
        webgl: null,
        width,
        height
      });
    }

    return canvas;
  }

  initWebGLContext(gl) {
    gl.clearColor(0.06, 0.09, 0.23, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  getCanvas(id) {
    return this.canvases.get(id);
  }

  render2D(id, callback) {
    const canvasData = this.canvases.get(id);
    if (canvasData && canvasData.ctx) {
      const { ctx, width, height } = canvasData;
      ctx.save();
      callback(ctx, width, height);
      ctx.restore();
    }
  }

  renderWebGL(id, callback) {
    const canvasData = this.canvases.get(id);
    if (canvasData && canvasData.webgl) {
      const { webgl, width, height } = canvasData;
      webgl.viewport(0, 0, width, height);
      webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
      callback(webgl, width, height);
    }
  }

  // 3D变换方法
  createModelViewMatrix(position, rotation, scale) {
    const matrix = [
      scale, 0, 0, 0,
      0, scale, 0, 0,
      0, 0, scale, 0,
      position.x, position.y, position.z, 1
    ];
    // 这里可以添加旋转矩阵的计算
    return matrix;
  }

  createProjectionMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov * 0.5);
    const rangeInv = 1.0 / (near - far);
    
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  }

  // 几何数据处理
  createGeometry(points, indices) {
    const key = `${points.length}-${indices ? indices.length : 0}`;
    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key);
    }

    const geometry = {
      points: Float32Array.from(points),
      indices: indices ? Uint16Array.from(indices) : null,
      vertexCount: points.length / 3,
      indexCount: indices ? indices.length : 0
    };

    this.geometryCache.set(key, geometry);
    return geometry;
  }

  // 性能监控
  updateStats(timestamp) {
    this.renderStats.frames++;
    if (timestamp - this.renderStats.lastTime >= 1000) {
      this.renderStats.fps = this.renderStats.frames;
      this.renderStats.frames = 0;
      this.renderStats.lastTime = timestamp;
    }
  }

  getStats() {
    return { ...this.renderStats };
  }

  // 清理资源
  dispose() {
    this.canvases.forEach(canvasData => {
      if (canvasData.webgl) {
        // 清理WebGL资源
      }
    });
    this.canvases.clear();
    this.webglContexts.clear();
    this.shaders.clear();
    this.geometryCache.clear();
  }
}

// 导出渲染引擎实例
const renderEngine = new RenderEngine();
window.RenderEngine = RenderEngine;
window.renderEngine = renderEngine;

console.log('🎨 核心渲染引擎初始化完成');

import React, { useRef, useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, easeOut } from 'framer-motion'
import * as THREE from 'three'
import ThreeJSVisualization from '../components/ThreeJSVisualization'
import { MathJax } from '../components/MathJax'
import { useFormula } from '../hooks/useFormula'
import { useThreeScene } from '../hooks/useThreeScene'
import { ANIMATION_VARIANTS, FORMULAS } from '../constants/index'
import { cn, showNotification } from '../utils'
import { serviceContainer } from '../services'
import { VisualizationService } from '../services/visualizationService'
import { FormulaService } from '../services/formulaService'
import { VisualizationStrategyFactory } from '../strategies/visualization/VisualizationStrategyFactory'

const { containerVariants, itemVariants, formulaVariants } = ANIMATION_VARIANTS

const FormulaVisualizationPage: React.FC = () => {
  const navigate = useNavigate()
  const { selectedFormula, isLoading, selectFormula, formulas, formulasByCategory } = useFormula()
  // 使用ref存储当前场景引用
  const currentSceneRef = useRef<THREE.Scene | null>(null)
  // 动画选择状态
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
  // 例子选择状态
  const [selectedExample, setSelectedExample] = useState<string | null>(null)
  // 动画加载状态
  const [animationLoading, setAnimationLoading] = useState<boolean>(false)
  // 动画缓存，提高切换性能
  const animationCacheRef = useRef<Map<string, { objects: any[]; lastUsed: number; size: number }>>(new Map())
  // 缓存大小限制（MB）
  const MAX_CACHE_SIZE_MB = 100
  // 动画播放状态
  const [animationPlaying, setAnimationPlaying] = useState<boolean>(true)

  // 从serviceContainer获取VisualizationService实例
  const visualizationService = serviceContainer.resolve(VisualizationService)
  // 创建FormulaService实例
  const formulaService = new FormulaService()

  // 使用useCallback优化导航函数
  const handleFormulaSelect = useCallback(
    (formula: any) => {
      // 根据公式ID查找对应的unifiedFieldTheoryFormulas公式对象
      const formulaId = typeof formula.id === 'number' ? `uf${formula.id}` : formula.id;
      const targetFormula = formulas.find(f => f.id === formulaId);
      if (targetFormula) {
        selectFormula(targetFormula);
        navigate(`/formulas/${targetFormula.id}`);
        showNotification.success(`已选择公式：${targetFormula.name}`);
      } else {
        // 如果找不到，直接使用传入的公式对象
        selectFormula(formula);
        navigate(`/formulas/${formula.id}`);
        showNotification.success(`已选择公式：${formula.name}`);
      }
    },
    [navigate, selectFormula, showNotification, formulas]
  )

  // ThreeJSVisualization组件会自动处理场景清理，不需要额外的清理逻辑

  // 使用自定义渲染函数创建3D可视化
  const createVisualization = useCallback(
    async ({ 
      scene, 
      camera, 
      renderer, 
      controls 
    }: {
      scene: THREE.Scene
      camera: THREE.Camera
      renderer: THREE.WebGLRenderer
      controls: any
    }) => {
      // 保存场景引用以供update使用
      currentSceneRef.current = scene

      if (!selectedFormula) return

      // 获取当前选中的动画配置
      const currentAnimation = selectedFormula.animations.find(
        (anim) => anim.id === selectedAnimation
      ) || selectedFormula.animations[0];
      
      // 获取当前选中的例子配置
      const currentExample = selectedFormula.examples?.find(
        (example) => example.id === selectedExample
      ) || selectedFormula.examples?.[0];

      // 清理场景中除了基础元素外的所有对象
      scene.children.forEach(child => {
        if (
          !(child instanceof THREE.AmbientLight ||
            child instanceof THREE.DirectionalLight ||
            child instanceof THREE.GridHelper ||
            child instanceof THREE.AxesHelper)
        ) {
          scene.remove(child)
        }
      })

      // 只在场景中没有坐标轴和网格时添加
      const hasAxesHelper = scene.children.some(child => child instanceof THREE.AxesHelper)
      if (!hasAxesHelper) {
        const axesHelper = visualizationService.createAxesHelper(5)
        scene.add(axesHelper)
      }

      const hasGridHelper = scene.children.some(child => child instanceof THREE.GridHelper)
      if (!hasGridHelper) {
        const gridHelper = visualizationService.createGridHelper(10, 10)
        scene.add(gridHelper)
      }

      // 只在场景中没有光照时添加
      const hasAmbientLight = scene.children.some(child => child instanceof THREE.AmbientLight)
      if (!hasAmbientLight) {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)
      }

      const hasDirectionalLight = scene.children.some(
        child => child instanceof THREE.DirectionalLight
      )
      if (!hasDirectionalLight) {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(5, 10, 7.5)
        scene.add(directionalLight)
      }

      // 缓存键，包含例子ID
      const cacheKey = `${selectedFormula.id}-${currentAnimation.id}-${currentExample?.id || 'default'}`;

      // 检查缓存
      if (animationCacheRef.current.has(cacheKey)) {
        // 获取缓存的可视化对象
        const cachedData = animationCacheRef.current.get(cacheKey);
        cachedData.objects.forEach(obj => {
          scene.add(obj);
        });
        // 更新最后使用时间
        cachedData.lastUsed = Date.now();
        // 动画加载完成
        setAnimationLoading(false);
        // 保存当前动画信息到场景userData
        scene.userData.animationPlaying = animationPlaying;
        return;
      }

      // 创建可视化对象组
      const visualizationGroup = new THREE.Group();

      try {
        // 将字符串格式的ID转换为数字ID（如 "uf3" -> 3）
        const formulaNumberId = parseInt(selectedFormula.id.replace(/^uf/, ''), 10);
        // 使用策略工厂获取可视化策略并创建可视化
        const strategy = await VisualizationStrategyFactory.getStrategy(formulaNumberId);
        // 合并动画配置和例子配置
        const combinedConfig = {
          ...currentAnimation.config,
          ...currentExample?.config
        };
        strategy.createVisualization(visualizationGroup, combinedConfig);
      } catch (error) {
        console.error('Failed to create visualization:', error);
      }

      // 将可视化对象添加到场景
      scene.add(visualizationGroup);

      // 缓存可视化对象
      const visualizationObjects = [];
      visualizationGroup.traverse(obj => {
        if (obj instanceof THREE.Object3D) {
          visualizationObjects.push(obj);
        }
      });
      
      // 估算对象大小（简化计算，实际大小会更复杂）
      const estimateObjectSize = (obj: THREE.Object3D): number => {
        let size = 0;
        // 几何体大小
        if (obj.geometry) {
          size += (obj.geometry.attributes.position.array?.length || 0) * 4; // 每个浮点数4字节
          size += (obj.geometry.attributes.normal.array?.length || 0) * 4;
          size += (obj.geometry.attributes.uv.array?.length || 0) * 4;
        }
        // 材质大小（简化）
        if (obj.material) {
          size += 1000; // 每个材质估算1KB
        }
        return size;
      };
      
      // 计算总大小
      let totalSize = 0;
      visualizationObjects.forEach(obj => {
        totalSize += estimateObjectSize(obj);
      });
      
      // 清理超出大小限制的缓存
      const cleanupCache = () => {
        const cache = animationCacheRef.current;
        let currentTotalSize = 0;
        
        // 计算当前总大小
        cache.forEach(item => {
          currentTotalSize += item.size;
        });
        
        // 如果超出限制，清理最久未使用的缓存
        if (currentTotalSize + totalSize > MAX_CACHE_SIZE_MB * 1024 * 1024) {
          // 按最后使用时间排序
          const sortedCacheEntries = Array.from(cache.entries()).sort((a, b) => a[1].lastUsed - b[1].lastUsed);
          
          // 清理最旧的缓存，直到空间足够
          for (const [key, entry] of sortedCacheEntries) {
            if (currentTotalSize + totalSize > MAX_CACHE_SIZE_MB * 1024 * 1024) {
              cache.delete(key);
              currentTotalSize -= entry.size;
            } else {
              break;
            }
          }
        }
      };
      
      // 执行缓存清理
      cleanupCache();
      
      // 保存到缓存
      animationCacheRef.current.set(cacheKey, {
        objects: visualizationObjects,
        lastUsed: Date.now(),
        size: totalSize
      });

      // 添加平滑过渡动画
      visualizationGroup.scale.set(0.8, 0.8, 0.8);
      visualizationGroup.rotation.y = Math.PI * 0.1;
      visualizationGroup.position.y = -0.5;
      
      // 使用平滑的缓出动画
      let animationProgress = 0;
      const animateIn = () => {
        animationProgress += 0.03;
        if (animationProgress < 1) {
          const progress = 1 - Math.pow(1 - animationProgress, 3); // 缓出曲线
          visualizationGroup.scale.setScalar(0.8 + progress * 0.2);
          visualizationGroup.rotation.y = Math.PI * 0.1 * (1 - progress);
          visualizationGroup.position.y = -0.5 + progress * 0.5;
          requestAnimationFrame(animateIn);
        } else {
          visualizationGroup.scale.setScalar(1);
          visualizationGroup.rotation.y = 0;
          visualizationGroup.position.y = 0;
          // 动画加载完成
          setAnimationLoading(false);
        }
      };
      animateIn();

      // 保存当前动画信息到场景userData
      scene.userData.visualizationGroup = visualizationGroup;
      scene.userData.currentAnimation = currentAnimation;
      scene.userData.animationPlaying = animationPlaying;
    },
    [selectedFormula, selectedAnimation, selectedExample, animationPlaying]
  )

  // 更新可视化的动画函数 - 只接收deltaTime参数
  const updateVisualization = useCallback((deltaTime: number) => {
    try {
      // 使用保存的场景引用
      const scene = currentSceneRef.current
      if (scene) {
        // 更新动画播放状态和速度
        scene.userData.animationPlaying = animationPlaying;
        scene.userData.animationSpeed = controls.animationSpeed;
        
        // 只有在播放状态下才更新动画
        if (animationPlaying && scene.userData && typeof scene.userData.update === 'function') {
          try {
            // 检查update方法是否接受参数，并应用速度因子
            const scaledDeltaTime = deltaTime * controls.animationSpeed;
            if (scene.userData.update.length > 0) {
              scene.userData.update(scaledDeltaTime)
            } else {
              // 如果update方法不接受参数，我们需要在各个可视化函数中处理速度
              scene.userData.update()
            }
          } catch (updateError) {
            console.error('Error in scene update function:', updateError)
          }
        }
        
        // 添加呼吸效果，增强视觉吸引力
        if (scene.userData.visualizationGroup) {
          const group = scene.userData.visualizationGroup;
          const time = Date.now() * 0.001 * controls.animationSpeed;
          group.scale.setScalar(1 + Math.sin(time * 2) * 0.01);
        }
      }
    } catch (error) {
      console.error('Error in visualization update:', error)
    }
  }, [animationPlaying, controls.animationSpeed])

  // 当公式变化时，清空所有缓存，因为公式变化了
  React.useEffect(() => {
    // 清空所有缓存，因为公式变化了
    animationCacheRef.current.clear();
    // 重置选中的例子
    setSelectedExample(null);
  }, [selectedFormula?.id]);

  // 当选中的动画变化时，添加流畅的过渡效果
  useEffect(() => {
    const scene = currentSceneRef.current;
    if (scene) {
      // 添加淡出动画，然后ThreeJSVisualization会自动调用createVisualization创建新动画
      if (scene.userData.visualizationGroup) {
        const group = scene.userData.visualizationGroup;
        let fadeProgress = 1;
        const fadeOut = () => {
          fadeProgress -= 0.05;
          if (fadeProgress > 0) {
            group.scale.setScalar(fadeProgress);
            group.rotation.y += 0.05;
            group.position.y = (1 - fadeProgress) * 0.5;
            // 淡出效果
            group.traverse(obj => {
              if (obj.material && typeof obj.material === 'object' && 'opacity' in obj.material) {
                obj.material.opacity = fadeProgress;
              }
            });
            requestAnimationFrame(fadeOut);
          }
        };
        fadeOut();
      }
    }
  }, [selectedAnimation]);

  // 当动画播放状态变化时，更新场景中的动画状态
  useEffect(() => {
    const scene = currentSceneRef.current;
    if (scene) {
      scene.userData.animationPlaying = animationPlaying;
    }
  }, [animationPlaying])

  // 时空同一化方程可视化
  const createSpaceTimeVisualization = (scene: THREE.Scene) => {
    // 创建时间轴
    const timeLineGeometry = new THREE.BufferGeometry()
    const timeLinePoints = []
    for (let i = -5; i <= 5; i += 0.1) {
      timeLinePoints.push(new THREE.Vector3(i, 0, 0))
    }
    timeLineGeometry.setFromPoints(timeLinePoints)
    const timeLineMaterial = new THREE.LineBasicMaterial({ color: 0xff6b6b })
    const timeLine = new THREE.Line(timeLineGeometry, timeLineMaterial)
    scene.add(timeLine)

    // 创建空间点运动轨迹
    const pathGeometry = new THREE.BufferGeometry()
    const pathPoints = []
    for (let t = 0; t <= 10; t += 0.1) {
      // C = (1, 1, 1) 简化示例
      pathPoints.push(new THREE.Vector3(t * 0.3, t * 0.3, t * 0.3))
    }
    pathGeometry.setFromPoints(pathPoints)
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0x4ecdc4 })
    const pathLine = new THREE.Line(pathGeometry, pathMaterial)
    scene.add(pathLine)

    // 添加动态点
    const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x45b7d1 })
    const movingPoint = new THREE.Mesh(pointGeometry, pointMaterial)
    scene.add(movingPoint)

    // 动画更新
    let t = 0
    scene.userData.update = () => {
      const speed = scene.userData.animationSpeed || 1.0
      t += 0.01 * speed
      movingPoint.position.set(t * 0.3, t * 0.3, t * 0.3)
      if (t > 10) t = 0
    }
  }

  // 三维螺旋时空方程可视化
  const createHelixVisualization = (scene: THREE.Scene) => {
    const helixGeometry = new THREE.BufferGeometry()
    const helixPoints = []
    const r = 1 // 半径
    const h = 0.5 // 高度系数
    const omega = 2 // 角速度

    for (let t = 0; t <= 10; t += 0.05) {
      const x = r * Math.cos(omega * t)
      const y = r * Math.sin(omega * t)
      const z = h * t
      helixPoints.push(new THREE.Vector3(x, y, z))
    }

    helixGeometry.setFromPoints(helixPoints)
    const helixMaterial = new THREE.LineBasicMaterial({ color: 0x95e1d3 })
    const helixLine = new THREE.Line(helixGeometry, helixMaterial)
    scene.add(helixLine)

    // 添加螺旋管道效果
    const tubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(helixPoints),
      100,
      0.05,
      8,
      false
    )
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x5352ed,
      transparent: true,
      opacity: 0.3
    })
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial)
    scene.add(tubeMesh)
  }

  // 引力场定义方程可视化
  const createGravitationalFieldVisualization = (scene: THREE.Scene) => {
    // 中心质点
    const centralGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    const centralMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 })
    const centralMass = new THREE.Mesh(centralGeometry, centralMaterial)
    scene.add(centralMass)

    // 场线
    const fieldLines = []
    const numLines = 12
    const numPointsPerLine = 20

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2
      const lineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 1; j <= numPointsPerLine; j++) {
        const r = 0.7 + j * 0.3
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        const z = 0
        points.push(new THREE.Vector3(x, y, z))
      }

      lineGeometry.setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x4facfe,
        linewidth: 2
      })
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(fieldLine)
      fieldLines.push(fieldLine)
    }
  }

  // 宇宙大统一方程可视化
  const createUnifiedForceVisualization = (scene: THREE.Scene) => {
    // 创建四个分力向量
    const forces = [
      { color: 0xff6b6b, vector: new THREE.Vector3(1, 0, 0), label: 'dP/dt' },
      { color: 0x4ecdc4, vector: new THREE.Vector3(0, 1, 0), label: 'C·dm/dt' },
      { color: 0x45b7d1, vector: new THREE.Vector3(-0.5, 0, 0), label: '-V·dm/dt' },
      { color: 0x96ceb4, vector: new THREE.Vector3(0, -0.5, 0), label: 'm·dC/dt - m·dV/dt' }
    ]

    forces.forEach((force, index) => {
      const { color, vector, label } = force

      // 向量线
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        vector
      ])
      const lineMaterial = new THREE.LineBasicMaterial({ color })
      const line = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(line)

      // 箭头
      const arrowHelper = new THREE.ArrowHelper(vector.clone().normalize(), vector, 0.1, color)
      scene.add(arrowHelper)
    })

    // 合力
    const resultant = forces.reduce((sum, force) => sum.add(force.vector), new THREE.Vector3())
    const resultantGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      resultant
    ])
    const resultantMaterial = new THREE.LineBasicMaterial({
      color: 0xffd93d,
      linewidth: 3
    })
    const resultantLine = new THREE.Line(resultantGeometry, resultantMaterial)
    scene.add(resultantLine)

    const resultantArrow = new THREE.ArrowHelper(
      resultant.clone().normalize(),
      resultant,
      0.1,
      0xffd93d
    )
    scene.add(resultantArrow)
  }

  // 质量定义方程可视化
  const createMassDefinitionVisualization = (scene: THREE.Scene) => {
    // 创建粒子系统表示空间运动
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 200
    const positions = new Float32Array(particlesCount * 3)
    const colors = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 6
      positions[i3 + 1] = (Math.random() - 0.5) * 6
      positions[i3 + 2] = (Math.random() - 0.5) * 6

      // 红色系，密度越高越红
      const distance = Math.sqrt(
        positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2
      )
      const intensity = Math.max(0, 1 - distance / 3)
      colors[i3] = 1.0
      colors[i3 + 1] = intensity * 0.3
      colors[i3 + 2] = intensity * 0.1
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // 添加质量球体
    const massGeometry = new THREE.SphereGeometry(0.8, 32, 32)
    const massMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4757,
      wireframe: true
    })
    const massSphere = new THREE.Mesh(massGeometry, massMaterial)
    scene.add(massSphere)

    // 动画更新
    scene.userData.update = () => {
      const speed = scene.userData.animationSpeed || 1.0
      particles.rotation.y += 0.005 * speed
    }
  }

  // 静止动量方程可视化
  const createRestMomentumVisualization = (scene: THREE.Scene) => {
    // 创建静止质量
    const massGeometry = new THREE.SphereGeometry(1, 32, 32)
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa })
    const restMass = new THREE.Mesh(massGeometry, massMaterial)
    scene.add(restMass)

    // 创建光速矢量C0
    const c0Vector = new THREE.Vector3(0, 2, 0)
    const c0Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      c0Vector
    ])
    const c0Material = new THREE.LineBasicMaterial({ color: 0xff6348 })
    const c0Line = new THREE.Line(c0Geometry, c0Material)
    scene.add(c0Line)

    // 添加箭头
    const c0Arrow = new THREE.ArrowHelper(c0Vector.clone().normalize(), c0Vector, 0.2, 0xff6348)
    scene.add(c0Arrow)

    // 创建动量矢量p0 = m0*C0
    const p0Vector = c0Vector.clone().multiplyScalar(1)
    const p0Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      p0Vector
    ])
    const p0Material = new THREE.LineBasicMaterial({ color: 0x1dd1a1, linewidth: 2 })
    const p0Line = new THREE.Line(p0Geometry, p0Material)
    scene.add(p0Line)

    const p0Arrow = new THREE.ArrowHelper(p0Vector.clone().normalize(), p0Vector, 0.2, 0x1dd1a1)
    scene.add(p0Arrow)
  }

  // 运动动量方程可视化
  const createMovingMomentumVisualization = (scene: THREE.Scene) => {
    // 创建质量体
    const massGeometry = new THREE.SphereGeometry(1, 32, 32)
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa })
    const mass = new THREE.Mesh(massGeometry, massMaterial)
    scene.add(mass)

    // 创建光速矢量C
    const cVector = new THREE.Vector3(0, 3, 0)
    const cGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      cVector
    ])
    const cMaterial = new THREE.LineBasicMaterial({ color: 0xff6348 })
    const cLine = new THREE.Line(cGeometry, cMaterial)
    scene.add(cLine)

    // 创建速度矢量V
    const vVector = new THREE.Vector3(1.5, 0, 0)
    const vGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      vVector
    ])
    const vMaterial = new THREE.LineBasicMaterial({ color: 0xffa502 })
    const vLine = new THREE.Line(vGeometry, vMaterial)
    scene.add(vLine)

    // 计算动量矢量P = m(C - V)
    const cvVector = cVector.clone().sub(vVector)
    const pVector = cvVector.clone().multiplyScalar(1)
    const pGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      pVector
    ])
    const pMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1, linewidth: 2 })
    const pLine = new THREE.Line(pGeometry, pMaterial)
    scene.add(pLine)

    // 添加箭头
    const cArrow = new THREE.ArrowHelper(cVector.clone().normalize(), cVector, 0.2, 0xff6348)
    const vArrow = new THREE.ArrowHelper(vVector.clone().normalize(), vVector, 0.2, 0xffa502)
    const pArrow = new THREE.ArrowHelper(pVector.clone().normalize(), pVector, 0.2, 0x1dd1a1)

    scene.add(cArrow, vArrow, pArrow)
  }

  // 空间波动方程可视化
  const createWaveEquationVisualization = (scene: THREE.Scene) => {
    // 创建波动表面
    const waveGeometry = new THREE.PlaneGeometry(8, 8, 100, 100)
    const positions = waveGeometry.attributes.position.array
    const colors = new Float32Array((positions.length * 3) / 3)

    // 初始化颜色属性
    for (let i = 0; i < positions.length; i += 3) {
      colors[i] = 0.2
      colors[i + 1] = 0.5
      colors[i + 2] = 1.0
    }

    waveGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const waveMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      wireframe: true
    })

    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial)
    waveMesh.rotation.x = -Math.PI / 2
    scene.add(waveMesh)

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      const speed = scene.userData.animationSpeed || 1.0
      time += 0.01 * speed
      const positions = waveMesh.geometry.attributes.position.array
      const colors = waveMesh.geometry.attributes.color.array

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const z = positions[i + 2]
        const distance = Math.sqrt(x * x + z * z)
        positions[i + 1] = Math.sin(distance - time * 2) * 0.5 * Math.exp(-distance * 0.1)

        // 根据振幅设置颜色
        const intensity = (positions[i + 1] + 0.5) / 1.0
        colors[i] = 0.2 + intensity * 0.3
        colors[i + 1] = 0.5 + intensity * 0.3
        colors[i + 2] = 1.0
      }

      waveMesh.geometry.attributes.position.needsUpdate = true
      waveMesh.geometry.attributes.color.needsUpdate = true
    }
  }

  // 电荷定义方程可视化
  const createChargeDefinitionVisualization = (scene: THREE.Scene) => {
    // 创建旋转的环形结构表示空间旋转
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    scene.add(ring)

    // 创建电荷粒子
    const chargeGeometry = new THREE.SphereGeometry(0.4, 32, 32)
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa })
    const charge = new THREE.Mesh(chargeGeometry, chargeMaterial)
    scene.add(charge)

    // 创建粒子轨迹
    const pathGeometry = new THREE.BufferGeometry()
    const pathPoints = []
    for (let t = 0; t <= Math.PI * 2; t += 0.05) {
      pathPoints.push(new THREE.Vector3(Math.cos(t) * 1.5, 0, Math.sin(t) * 1.5))
    }
    pathGeometry.setFromPoints(pathPoints)
    const pathMaterial = new THREE.LineBasicMaterial({
      color: 0xff6348,
      transparent: true,
      opacity: 0.5
    })
    const pathLine = new THREE.Line(pathGeometry, pathMaterial)
    scene.add(pathLine)

    // 动画更新
    let angle = 0
    scene.userData.update = () => {
      angle += 0.02
      ring.rotation.x = Math.sin(angle * 0.5) * 0.3
      ring.rotation.y = angle

      // 移动电荷粒子沿环形轨迹
      charge.position.x = Math.cos(angle) * 1.5
      charge.position.z = Math.sin(angle) * 1.5
    }
  }

  // 电场定义方程可视化
  const createElectricFieldVisualization = (scene: THREE.Scene) => {
    // 创建电荷中心
    const chargeGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 })
    const charge = new THREE.Mesh(chargeGeometry, chargeMaterial)
    scene.add(charge)

    // 创建电场线（径向）
    const fieldLines = []
    const numLines = 16
    const numPointsPerLine = 15

    for (let i = 0; i < numLines; i++) {
      const phi = (i / numLines) * Math.PI * 2
      const theta = Math.PI / 2 // 赤道平面

      for (let j = 0; j < 2; j++) {
        // 正负两个方向
        const sign = j === 0 ? 1 : -1
        const lineGeometry = new THREE.BufferGeometry()
        const points = []

        for (let k = 1; k <= numPointsPerLine; k++) {
          const r = 0.7 + k * 0.2
          const x = r * Math.sin(theta) * Math.cos(phi) * sign
          const y = r * Math.cos(theta) * sign
          const z = r * Math.sin(theta) * Math.sin(phi) * sign
          points.push(new THREE.Vector3(x, y, z))
        }

        lineGeometry.setFromPoints(points)
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa })
        const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
        scene.add(fieldLine)
        fieldLines.push(fieldLine)
      }
    }

    // 创建垂直平面的电场线
    for (let i = 0; i < numLines / 2; i++) {
      const phi = 0
      const theta = ((i / (numLines / 2)) * Math.PI) / 2

      const lineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let k = 1; k <= numPointsPerLine; k++) {
        const r = 0.7 + k * 0.2
        const x = r * Math.sin(theta) * Math.cos(phi)
        const y = r * Math.cos(theta)
        const z = r * Math.sin(theta) * Math.sin(phi)
        points.push(new THREE.Vector3(x, y, z))
        points.push(new THREE.Vector3(-x, y, -z)) // 对称点
      }

      lineGeometry.setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa })
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(fieldLine)
      fieldLines.push(fieldLine)
    }
  }

  // 磁场定义方程可视化
  const createMagneticFieldVisualization = (scene: THREE.Scene) => {
    // 创建运动电荷
    const chargeGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    const chargeMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 })
    const charge = new THREE.Mesh(chargeGeometry, chargeMaterial)
    scene.add(charge)

    // 创建速度方向
    const velocityVector = new THREE.Vector3(0, 0, 1)
    const velocityGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      velocityVector.clone().multiplyScalar(3)
    ])
    const velocityMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 })
    const velocityLine = new THREE.Line(velocityGeometry, velocityMaterial)
    scene.add(velocityLine)

    // 创建磁场线（环形围绕速度方向）
    const fieldLines: THREE.Line[] = []
    const numRings = 5
    const pointsPerRing = 64

    for (let i = 0; i < numRings; i++) {
      const radius = 0.8 + i * 0.4
      const height = -1.5 + i * 0.8

      const ringGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 0; j <= pointsPerRing; j++) {
        const angle = (j / pointsPerRing) * Math.PI * 2
        const x = radius * Math.cos(angle)
        const z = height
        const y = radius * Math.sin(angle)
        points.push(new THREE.Vector3(x, y, z))
      }

      ringGeometry.setFromPoints(points)
      const intensity = 1 - i / numRings
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0.2, 0.5, 1.0).lerp(new THREE.Color(1.0, 0.2, 0.2), intensity)
      })
      const fieldLine = new THREE.Line(ringGeometry, lineMaterial)
      scene.add(fieldLine)
      fieldLines.push(fieldLine)
    }

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      time += 0.01

      // 移动电荷
      charge.position.z = Math.sin(time * 2) * 1.5

      // 旋转磁场线
      fieldLines.forEach((line, index) => {
        line.rotation.z = time * 0.5 + index * 0.1
      })
    }
  }

  // 变化的引力场产生电磁场可视化
  const createGravityToElectroVisualization = (scene: THREE.Scene) => {
    // 创建中心质量
    const massGeometry = new THREE.SphereGeometry(0.8, 32, 32)
    const massMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 })
    const centralMass = new THREE.Mesh(massGeometry, massMaterial)
    scene.add(centralMass)

    // 创建引力场线
    const gravityFieldLines: THREE.Line[] = []
    const numGravityLines = 8

    for (let i = 0; i < numGravityLines; i++) {
      const angle = (i / numGravityLines) * Math.PI * 2
      const lineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 1; j <= 20; j++) {
        const r = 1.2 + j * 0.2
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        const z = 0
        points.push(new THREE.Vector3(x, y, z))
      }

      lineGeometry.setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x3742fa,
        transparent: true,
        opacity: 0.5
      })
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(fieldLine)
      gravityFieldLines.push(fieldLine)
    }

    // 创建产生的电磁场
    const emFieldGroup = new THREE.Group()
    scene.add(emFieldGroup)

    const numEmRings = 6
    for (let i = 0; i < numEmRings; i++) {
      const radius = 3 + i * 0.5
      const height = -2.5 + i * 1.0

      const ringGeometry = new THREE.RingGeometry(radius, radius + 0.1, 64)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      ring.position.y = height
      emFieldGroup.add(ring)
    }

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      time += 0.01

      // 引力场脉动
      centralMass.scale.x = 0.8 + Math.sin(time * 2) * 0.2
      centralMass.scale.y = 0.8 + Math.sin(time * 2) * 0.2
      centralMass.scale.z = 0.8 + Math.sin(time * 2) * 0.2

      // 引力场线运动
      gravityFieldLines.forEach((line, index) => {
        const scale = 1 + Math.sin(time * 2 + index * 0.5) * 0.2
        line.scale.x = scale
        line.scale.y = scale
      })

      // 电磁场响应
      emFieldGroup.children.forEach((ring, index) => {
        const intensity = Math.sin(time * 2 + index * 0.3)
        ;((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          0.1 + intensity * 0.4
        )
        ring.rotation.y = time * 0.2
      })
    }
  }

  // 磁矢势方程可视化
  const createMagneticVectorPotentialVisualization = (scene: THREE.Scene) => {
    // 创建中心源
    const sourceGeometry = new THREE.SphereGeometry(0.6, 32, 32)
    const sourceMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 })
    const source = new THREE.Mesh(sourceGeometry, sourceMaterial)
    scene.add(source)

    // 创建磁矢势A的环
    const vectorPotentialRings: THREE.Mesh[] = []
    const numRings = 8

    for (let i = 0; i < numRings; i++) {
      const radius = 1.2 + i * 0.3
      const ringGeometry = new THREE.TorusGeometry(radius, 0.05, 8, 64)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.2, 0.5, 1.0).lerp(new THREE.Color(1.0, 0.5, 0.2), i / numRings)
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      scene.add(ring)
      vectorPotentialRings.push(ring)
    }

    // 创建磁场B（A的旋度）
    const magneticFieldLines: THREE.Line[] = []
    const numFieldLines = 6

    for (let i = 0; i < numFieldLines; i++) {
      const height = -1.5 + i * 0.6
      const radius = 1.5 + Math.abs(height) * 0.2

      const fieldLineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2
        const x = radius * Math.cos(angle)
        const y = height
        const z = radius * Math.sin(angle)
        points.push(new THREE.Vector3(x, y, z))
      }

      fieldLineGeometry.setFromPoints(points)
      const fieldLineMaterial = new THREE.LineBasicMaterial({ color: 0xffd700 })
      const fieldLine = new THREE.Line(fieldLineGeometry, fieldLineMaterial)
      scene.add(fieldLine)
      magneticFieldLines.push(fieldLine)
    }

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      time += 0.01

      // 旋转磁矢势环
      vectorPotentialRings.forEach((ring, index) => {
        ring.rotation.x = Math.sin(time * 0.5 + index * 0.2) * 0.1
        ring.rotation.y = time * 0.3
      })

      // 磁场线动画
      magneticFieldLines.forEach((line, index) => {
        line.rotation.z = time * 0.2 + index * 0.1
      })
    }
  }

  // 变化的引力场产生电场可视化
  const createGravityToElectricFieldVisualization = (scene: THREE.Scene) => {
    // 创建中心引力源
    const gravitySourceGeometry = new THREE.SphereGeometry(0.7, 32, 32)
    const gravitySourceMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 })
    const gravitySource = new THREE.Mesh(gravitySourceGeometry, gravitySourceMaterial)
    scene.add(gravitySource)

    // 创建引力场A
    const aFieldLines: THREE.Line[] = []
    const numALines = 8

    for (let i = 0; i < numALines; i++) {
      const angle = (i / numALines) * Math.PI * 2
      const lineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 1; j <= 15; j++) {
        const r = 1.2 + j * 0.2
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        const z = 0
        points.push(new THREE.Vector3(x, y, z))
      }

      lineGeometry.setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3742fa })
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(fieldLine)
      aFieldLines.push(fieldLine)
    }

    // 创建产生的电场E
    const electricFieldLines: THREE.Line[] = []
    const numELines = 6

    for (let i = 0; i < numELines; i++) {
      const height = -1 + i * 0.4
      const angle = (i / numELines) * Math.PI * 2

      const lineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 1; j <= 15; j++) {
        const r = 1.2 + j * 0.2
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle) + height
        const z = Math.sin(j * 0.3) * 0.5
        points.push(new THREE.Vector3(x, y, z))
      }

      lineGeometry.setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 })
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(fieldLine)
      electricFieldLines.push(fieldLine)
    }

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      time += 0.01

      // 引力场脉动
      gravitySource.scale.x = 0.7 + Math.sin(time * 2) * 0.2
      gravitySource.scale.y = 0.7 + Math.sin(time * 2) * 0.2
      gravitySource.scale.z = 0.7 + Math.sin(time * 2) * 0.2

      // 引力场A变化
      aFieldLines.forEach((line, index) => {
        const scale = 1 + Math.sin(time * 2 + index * 0.3) * 0.2
        line.scale.x = scale
        line.scale.y = scale
      })

      // 电场E响应
      electricFieldLines.forEach((line, index) => {
        const offset = Math.sin(time * 2 + index * 0.3)
        line.position.z = offset * 0.3
        line.rotation.y = offset * 0.2
      })
    }
  }

  // 变化的磁场产生引力场和电场可视化
  const createMagneticToGravityVisualization = (scene: THREE.Scene) => {
    // 创建磁场源
    const magneticSourceGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32)
    const magneticSourceMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 })
    const magneticSource = new THREE.Mesh(magneticSourceGeometry, magneticSourceMaterial)
    scene.add(magneticSource)

    // 创建磁场线B
    const magneticFieldLines: THREE.Line[] = []
    const numBLines = 8

    for (let i = 0; i < numBLines; i++) {
      const radius = 1.0 + (i % 4) * 0.3
      const height = -1.5 + Math.floor(i / 4) * 3.0

      const lineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2
        const x = radius * Math.cos(angle)
        const y = height
        const z = radius * Math.sin(angle)
        points.push(new THREE.Vector3(x, y, z))
      }

      lineGeometry.setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffd700 })
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(fieldLine)
      magneticFieldLines.push(fieldLine)
    }

    // 创建产生的引力场A
    const gravityFieldGroup = new THREE.Group()
    scene.add(gravityFieldGroup)

    const numGravityRings = 5
    for (let i = 0; i < numGravityRings; i++) {
      const radius = 2 + i * 0.4
      const ringGeometry = new THREE.RingGeometry(radius, radius + 0.1, 64)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x3742fa,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.z = Math.PI / 2
      gravityFieldGroup.add(ring)
    }

    // 创建产生的电场E
    const electricFieldLines: THREE.Line[] = []
    const numELines = 6

    for (let i = 0; i < numELines; i++) {
      const angle = (i / numELines) * Math.PI * 2
      const lineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 0; j <= 32; j++) {
        const r = 2.5 + j * 0.2
        const x = r * Math.cos(angle)
        const y = Math.sin(j * 0.5) * 0.5
        const z = r * Math.sin(angle)
        points.push(new THREE.Vector3(x, y, z))
      }

      lineGeometry.setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 })
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(fieldLine)
      electricFieldLines.push(fieldLine)
    }

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      time += 0.01

      // 磁场变化
      magneticSource.scale.y = 0.3 + Math.sin(time * 3) * 0.1

      // 磁场线动画
      magneticFieldLines.forEach((line, index) => {
        const intensity = Math.sin(time * 2 + index * 0.3)
        line.scale.x = 1 + intensity * 0.1
        line.scale.z = 1 + intensity * 0.1
        line.rotation.y = time * 0.1
      })

      // 引力场响应
      gravityFieldGroup.children.forEach((ring, index) => {
        const intensity = Math.sin(time * 2 + index * 0.2)
        const mesh = ring as THREE.Mesh
        ;(mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.1 + intensity * 0.2)
        ring.rotation.x = time * 0.1 + intensity * 0.1
      })

      // 电场响应
      electricFieldLines.forEach((line, index) => {
        const offset = Math.sin(time * 2 + index * 0.4)
        line.position.y = offset * 0.3
        line.rotation.x = offset * 0.1
      })
    }
  }

  // 统一场论能量方程可视化
  const createEnergyEquationVisualization = (scene: THREE.Scene) => {
    // 创建静止质量
    const restMassGeometry = new THREE.SphereGeometry(0.8, 32, 32)
    const restMassMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa })
    const restMass = new THREE.Mesh(restMassGeometry, restMassMaterial)
    restMass.position.x = -2
    scene.add(restMass)

    // 创建运动质量
    const movingMassGeometry = new THREE.SphereGeometry(0.8, 32, 32)
    const movingMassMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 })
    const movingMass = new THREE.Mesh(movingMassGeometry, movingMassMaterial)
    movingMass.position.x = 2
    scene.add(movingMass)

    // 创建能量场
    const energyFieldGeometry = new THREE.SphereGeometry(3, 32, 32)
    const energyFieldMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    })
    const energyField = new THREE.Mesh(energyFieldGeometry, energyFieldMaterial)
    scene.add(energyField)

    // 创建速度向量
    const velocityVector = new THREE.Vector3(0, 0, 1.5)
    const velocityGeometry = new THREE.BufferGeometry().setFromPoints([
      movingMass.position,
      movingMass.position.clone().add(velocityVector)
    ])
    const velocityMaterial = new THREE.LineBasicMaterial({ color: 0x1dd1a1 })
    const velocityLine = new THREE.Line(velocityGeometry, velocityMaterial)
    scene.add(velocityLine)

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      time += 0.01

      // 运动质量速度变化
      const speed = Math.sin(time * 0.5) * 0.8 + 0.2
      movingMass.scale.x = 1 / Math.sqrt(1 - speed * speed) // 相对论质量增加
      movingMass.scale.y = 1 / Math.sqrt(1 - speed * speed)
      movingMass.scale.z = 1 / Math.sqrt(1 - speed * speed)

      // 更新速度向量
      const newVelocity = new THREE.Vector3(0, 0, 1.5 * speed)
      velocityGeometry.setFromPoints([
        movingMass.position,
        movingMass.position.clone().add(newVelocity)
      ])
      velocityGeometry.attributes.position.needsUpdate = true

      // 能量场脉动
      energyField.scale.x = 3 + Math.sin(time * 2) * 0.3
      energyField.scale.y = 3 + Math.sin(time * 2) * 0.3
      energyField.scale.z = 3 + Math.sin(time * 2) * 0.3
      ;(energyField.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.abs(Math.sin(time * 2)) * 0.2
    }
  }

  // 光速飞行器动力学方程可视化
  const createLightSpeedCraftVisualization = (scene: THREE.Scene) => {
    // 创建飞行器
    const craftGeometry = new THREE.ConeGeometry(0.5, 1, 32)
    const craftMaterial = new THREE.MeshBasicMaterial({ color: 0x3742fa })
    const craft = new THREE.Mesh(craftGeometry, craftMaterial)
    craft.rotation.x = Math.PI / 2
    scene.add(craft)

    // 创建光速向量C
    const cVector = new THREE.Vector3(0, 0, 3)
    const cGeometry = new THREE.BufferGeometry().setFromPoints([
      craft.position,
      craft.position.clone().add(cVector)
    ])
    const cMaterial = new THREE.LineBasicMaterial({ color: 0xff6348 })
    const cLine = new THREE.Line(cGeometry, cMaterial)
    scene.add(cLine)

    // 创建速度向量V
    const vVector = new THREE.Vector3(0, 0, 1.5)
    const vGeometry = new THREE.BufferGeometry().setFromPoints([
      craft.position,
      craft.position.clone().add(vVector)
    ])
    const vMaterial = new THREE.LineBasicMaterial({ color: 0xffa502 })
    const vLine = new THREE.Line(vGeometry, vMaterial)
    scene.add(vLine)

    // 创建推力向量F
    const fVector = cVector.clone().sub(vVector).multiplyScalar(0.5)
    const fGeometry = new THREE.BufferGeometry().setFromPoints([
      craft.position,
      craft.position.clone().sub(fVector) // 推力方向与加速度相反
    ])
    const fMaterial = new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 2 })
    const fLine = new THREE.Line(fGeometry, fMaterial)
    scene.add(fLine)

    // 创建推进粒子效果
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 100
    const positions = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 0.5
      positions[i3 + 1] = (Math.random() - 0.5) * 0.5
      positions[i3 + 2] = (Math.random() - 0.5) * 0.2 - 0.7 // 粒子从尾部喷出
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xff6348,
      transparent: true,
      opacity: 0.8
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    craft.add(particles)

    // 动画更新
    let time = 0
    let position = 0
    scene.userData.update = () => {
      time += 0.01

      // 更新飞行器位置
      position += 0.02
      craft.position.z = position

      // 更新向量位置
      cGeometry.setFromPoints([craft.position, craft.position.clone().add(cVector)])
      vGeometry.setFromPoints([craft.position, craft.position.clone().add(vVector)])
      fGeometry.setFromPoints([craft.position, craft.position.clone().sub(fVector)])

      cGeometry.attributes.position.needsUpdate = true
      vGeometry.attributes.position.needsUpdate = true
      fGeometry.attributes.position.needsUpdate = true

      // 更新粒子位置
      const positions = particles.geometry.attributes.position.array
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3
        positions[i3 + 2] -= 0.02 // 粒子向后移动

        // 重置远离的粒子
        if (positions[i3 + 2] < -2) {
          positions[i3] = (Math.random() - 0.5) * 0.5
          positions[i3 + 1] = (Math.random() - 0.5) * 0.5
          positions[i3 + 2] = (Math.random() - 0.5) * 0.2 - 0.7
        }
      }
      particles.geometry.attributes.position.needsUpdate = true
    }
  }

  // 核力场定义方程可视化
  const createNuclearForceVisualization = (scene: THREE.Scene) => {
    // 创建原子核
    const nucleusGeometry = new THREE.SphereGeometry(0.6, 32, 32)
    const nucleusMaterial = new THREE.MeshBasicMaterial({ color: 0xff6348 })
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial)
    scene.add(nucleus)

    // 创建核子（质子/中子）
    const nucleons: THREE.Mesh[] = []
    const numNucleons = 8

    for (let i = 0; i < numNucleons; i++) {
      const angle = (i / numNucleons) * Math.PI * 2
      const distance = 1.2 + (i % 2) * 0.3
      const x = distance * Math.cos(angle)
      const z = distance * Math.sin(angle)

      const nucleonGeometry = new THREE.SphereGeometry(0.3, 16, 16)
      const nucleonMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x3742fa : 0x1dd1a1
      })
      const nucleon = new THREE.Mesh(nucleonGeometry, nucleonMaterial)
      nucleon.position.set(x, 0, z)
      scene.add(nucleon)
      nucleons.push(nucleon)
    }

    // 创建核力场线
    const nuclearFieldLines: THREE.Line[] = []
    const numFieldLines = 12

    for (let i = 0; i < numFieldLines; i++) {
      const angle = (i / numFieldLines) * Math.PI * 2
      const lineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 1; j <= 20; j++) {
        const r = 0.8 + j * 0.1
        // 核力的短程特性，距离增加时力迅速减小
        const forceStrength = Math.exp(-r * 0.5) * 2
        const x = r * Math.cos(angle) * forceStrength
        const y = r * Math.sin(angle * 2) * 0.3
        const z = r * Math.sin(angle) * forceStrength
        points.push(new THREE.Vector3(x, y, z))
      }

      lineGeometry.setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffd700 })
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(fieldLine)
      nuclearFieldLines.push(fieldLine)
    }

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      time += 0.01

      // 核子振动
      nucleons.forEach((nucleon, index) => {
        const basePosition = nucleon.position.clone()
        const originalDistance = Math.sqrt(basePosition.x ** 2 + basePosition.z ** 2)
        const oscillation = Math.sin(time * 3 + index * 0.5) * 0.1

        const angle = Math.atan2(basePosition.z, basePosition.x)
        nucleon.position.x = Math.cos(angle) * (originalDistance + oscillation)
        nucleon.position.z = Math.sin(angle) * (originalDistance + oscillation)
      })

      // 核力场波动
      nuclearFieldLines.forEach((line, index) => {
        const points = line.geometry.attributes.position.array
        for (let i = 0; i < points.length; i += 3) {
          const r = Math.sqrt(points[i] ** 2 + points[i + 2] ** 2)
          const angle = Math.atan2(points[i + 2], points[i])
          const oscillation = Math.sin(time * 2 + r * 2 + index * 0.2) * 0.1

          points[i] = Math.cos(angle) * (r + oscillation)
          points[i + 2] = Math.sin(angle) * (r + oscillation)
        }
        line.geometry.attributes.position.needsUpdate = true
      })
    }
  }

  // 引力光速统一方程可视化
  const createGravityLightSpeedVisualization = (scene: THREE.Scene) => {
    // 创建中央统一点
    const centerGeometry = new THREE.SphereGeometry(0.8, 32, 32)
    const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 })
    const center = new THREE.Mesh(centerGeometry, centerMaterial)
    scene.add(center)

    // 创建引力场表示
    const gravityFieldGeometry = new THREE.SphereGeometry(2, 32, 32)
    const gravityFieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x3742fa,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    })
    const gravityField = new THREE.Mesh(gravityFieldGeometry, gravityFieldMaterial)
    scene.add(gravityField)

    // 创建光速表示
    const lightRays: THREE.Line[] = []
    const numRays = 16

    for (let i = 0; i < numRays; i++) {
      const phi = (i / numRays) * Math.PI * 2
      const theta = Math.PI / 2

      const rayGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 0; j <= 20; j++) {
        const r = 0.8 + j * 0.2
        const x = r * Math.sin(theta) * Math.cos(phi)
        const y = r * Math.cos(theta)
        const z = r * Math.sin(theta) * Math.sin(phi)
        points.push(new THREE.Vector3(x, y, z))
      }

      rayGeometry.setFromPoints(points)
      const rayMaterial = new THREE.LineBasicMaterial({ color: 0xff6348 })
      const ray = new THREE.Line(rayGeometry, rayMaterial)
      scene.add(ray)
      lightRays.push(ray)
    }

    // 创建统一常数Z的表示
    const zRingGeometry = new THREE.RingGeometry(1.2, 1.4, 64)
    const zRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x1dd1a1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    })
    const zRing = new THREE.Mesh(zRingGeometry, zRingMaterial)
    zRing.rotation.x = Math.PI / 2
    scene.add(zRing)

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      time += 0.01

      // 中央统一点脉动
      center.scale.x = 0.8 + Math.sin(time * 2) * 0.1
      center.scale.y = 0.8 + Math.sin(time * 2) * 0.1
      center.scale.z = 0.8 + Math.sin(time * 2) * 0.1

      // 引力场脉动
      gravityField.scale.x = 2 + Math.sin(time * 1.5) * 0.2
      gravityField.scale.y = 2 + Math.sin(time * 1.5) * 0.2
      gravityField.scale.z = 2 + Math.sin(time * 1.5) * 0.2
      ;(gravityField.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.abs(Math.sin(time * 1.5)) * 0.2

      // 光速射线动画
      lightRays.forEach((ray, index) => {
        const points = ray.geometry.attributes.position.array
        for (let i = 0; i < points.length; i += 3) {
          const baseR = Math.sqrt(points[i] ** 2 + points[i + 1] ** 2 + points[i + 2] ** 2)
          const phase = time * 3 + index * 0.2
          const intensity = 1 + Math.sin(phase - baseR * 0.5) * 0.2

          const direction = new THREE.Vector3(points[i], points[i + 1], points[i + 2]).normalize()
          points[i] = direction.x * baseR * intensity
          points[i + 1] = direction.y * baseR * intensity
          points[i + 2] = direction.z * baseR * intensity
        }
        ray.geometry.attributes.position.needsUpdate = true
      })

      // 统一常数环旋转
      zRing.rotation.y = time * 0.3
      zRing.rotation.z = Math.sin(time * 0.5) * 0.1
    }
  }

  // 电磁耦合常数可视化
  const createElectricMagneticCouplingVisualization = (scene: THREE.Scene) => {
    // 创建中心电磁源
    const emSourceGeometry = new THREE.SphereGeometry(0.6, 32, 32)
    const emSourceMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const emSource = new THREE.Mesh(emSourceGeometry, emSourceMaterial)
    scene.add(emSource)

    // 创建电磁场耦合环
    const couplingRings: THREE.Mesh[] = []
    const numRings = 8

    for (let i = 0; i < numRings; i++) {
      const radius = 1.0 + i * 0.4
      const ringGeometry = new THREE.TorusGeometry(radius, 0.08, 16, 64)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xff0000).lerp(new THREE.Color(0x0000ff), i / numRings)
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      scene.add(ring)
      couplingRings.push(ring)
    }

    // 创建耦合场线
    const couplingFieldLines: THREE.Line[] = []
    const numFieldLines = 16

    for (let i = 0; i < numFieldLines; i++) {
      const angle = (i / numFieldLines) * Math.PI * 2
      const lineGeometry = new THREE.BufferGeometry()
      const points = []

      for (let j = 0; j <= 64; j++) {
        const ringAngle = (j / 64) * Math.PI * 2
        const radius = 1.2 + Math.sin(ringAngle * 2) * 0.3
        const x = radius * Math.cos(ringAngle)
        const y = Math.sin(ringAngle * 4) * 0.2
        const z = radius * Math.sin(ringAngle)
        points.push(new THREE.Vector3(x, y, z))
      }

      lineGeometry.setFromPoints(points)
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0x00ffff).lerp(new THREE.Color(0xffff00), i / numFieldLines)
      })
      const fieldLine = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(fieldLine)
      couplingFieldLines.push(fieldLine)
    }

    // 创建耦合常数可视化球体
    const constantGeometry = new THREE.SphereGeometry(1.5, 32, 32)
    const constantMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true
    })
    const constantSphere = new THREE.Mesh(constantGeometry, constantMaterial)
    scene.add(constantSphere)

    // 动画更新
    let time = 0
    scene.userData.update = () => {
      const speed = scene.userData.animationSpeed || 1.0
      time += 0.01 * speed

      // 电磁源脉动
      emSource.scale.setScalar(0.6 + Math.sin(time * 2) * 0.2)

      // 耦合环旋转和缩放
      couplingRings.forEach((ring, index) => {
        ring.rotation.y = time * 0.3 + index * 0.1
        ring.scale.setScalar(1 + Math.sin(time * 3 + index * 0.5) * 0.1)
      })

      // 场线动画
      couplingFieldLines.forEach((line, index) => {
        line.rotation.z = time * 0.2 + index * 0.05
        line.rotation.x = Math.sin(time * 1.5 + index * 0.3) * 0.1
      })

      // 常数球体旋转
      constantSphere.rotation.x += 0.005 * speed
      constantSphere.rotation.y += 0.008 * speed
    }
  }

  // 使用服务层的公式格式化方法
  const formatFormula = useCallback((expression: string) => {
    // 检查表达式是否已经包含$$符号，如果包含则直接返回，否则使用FormulaService.formatFormulaExpression处理
    if (expression.startsWith('$$') && expression.endsWith('$$')) {
      return expression.replace(/\$/g, '').trim()
    }
    return FormulaService.formatFormulaExpression(expression)
  }, [])

  // 添加显示求导公式的状态
  const [showDerivative, setShowDerivative] = useState(false)

  // 添加可视化控制状态
  const [controls, setControls] = useState({
    showGrid: true,
    showAxes: true,
    showStats: true,
    autoRotate: false,
    enableParticleEffects: true,
    enableFieldLines: true,
    animationSpeed: 1.0
  })

  // 添加动画配置状态
  const [animationConfig, setAnimationConfig] = useState<any>({})

  // 当选中的动画变化时，重置动画配置为默认值
  React.useEffect(() => {
    if (selectedFormula && selectedAnimation) {
      const currentAnimation = selectedFormula.animations.find(anim => anim.id === selectedAnimation)
      if (currentAnimation && currentAnimation.parameters) {
        setAnimationConfig(currentAnimation.parameters)
      }
    }
  }, [selectedFormula, selectedAnimation])

  // 移动端适配状态 - 移到组件顶层，确保每次渲染调用相同数量的钩子
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 更新可视化控制
  const updateControls = useCallback((key: string, value: any) => {
    setControls(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  if (!selectedFormula) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a14]">
        <div className="text-blue-400">加载中...</div>
      </div>
    )
  }

  return (
    <motion.div
      className="relative m-0 flex h-full w-full flex-col overflow-hidden bg-[#0a0a14] p-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-0 px-0 mx-0 w-full h-full lg:flex-row lg:gap-0">
        {/* 左侧公式列表 - 优化响应式布局，使用更灵活的宽度 */}
        <motion.div
          className={`${isMobileMenuOpen ? 'fixed inset-0 z-50' : 'lg:w-64 xl:w-72'} sticky top-0 z-10 flex h-fit flex-col overflow-hidden rounded-r-2xl border border-blue-900/30 bg-opacity-95 bg-gradient-to-br from-[#121228] to-[#0f0f20] p-3 shadow-xl shadow-blue-900/5 backdrop-blur-sm transition-all duration-300 lg:max-h-[100vh]`}
          variants={formulaVariants}
          animate={
            isMobileMenuOpen
              ? { x: 0, opacity: 1, display: 'flex' }
              : { x: -10, opacity: 0, display: 'none' }
          }
          initial={{ display: 'none', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* 移动端菜单按钮 */}
          <div className="flex justify-end mb-2 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-blue-400 transition-colors hover:text-blue-300"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              统一场论核心公式
            </h2>
            <p className="mt-1 text-sm text-blue-200/60">20个核心公式的3D可视化</p>
          </div>
          <div className="overflow-y-auto flex-1 pr-2 space-y-2 scrollbar-thin scrollbar-thumb-blue-900/30 scrollbar-track-transparent">
            {formulas.map(formula => (
              <motion.button
                key={formula.id}
                className={`w-full rounded-lg p-3 text-left backdrop-blur-sm transition-all duration-300 ${selectedFormula.id === formula.id ? 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 shadow-lg shadow-blue-900/10' : 'text-blue-100/70 hover:bg-blue-900/20 hover:shadow-lg hover:shadow-blue-900/10'}`}
                onClick={() => handleFormulaSelect(formula)}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                aria-label={`选择公式：${formula.name}`}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex gap-2 items-center mb-1 font-medium">
                  <span className="flex justify-center items-center w-6 h-6 text-xs text-blue-400 rounded-full bg-blue-600/30">
                    {formula.id}
                  </span>
                  {formula.name}
                </div>
                <div className="ml-8 text-xs text-blue-200/60">{formula.category}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 右侧可视化和详情 - 最大化可视化区域，优化间距 */}
        <motion.div className="flex flex-col flex-1 p-2 sm:p-3" variants={itemVariants}>
          {/* 移动端菜单按钮 */}
          <div className="flex justify-start mb-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-md shadow-md transition-all duration-300 shadow-blue-900/20 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg"
            >
              📋 公式列表
            </button>
          </div>

          {/* 公式详情 - 优化样式，改进响应式布局 */}
          <motion.div
            className="mb-3 rounded-xl border border-blue-900/30 bg-gradient-to-br from-[#121228] to-[#0f0f20] p-3 sm:p-4 shadow-lg shadow-blue-900/10 transition-all duration-300"
            key={selectedFormula.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col gap-3 justify-between items-start mb-3 sm:flex-row sm:items-center">
              <h3 className="flex gap-2 items-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 sm:text-2xl">
                <span className="text-blue-500">{selectedFormula.id}.</span>
                {selectedFormula.name}
              </h3>

              {/* 求导切换按钮 - 精简样式 */}
              <motion.button
                onClick={() => setShowDerivative(!showDerivative)}
                className="rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-md shadow-indigo-900/20 transition-all duration-300 hover:from-indigo-700 hover:to-purple-700"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {showDerivative ? '显示原公式' : '显示求导'}
              </motion.button>
            </div>

            <div className="mb-3 rounded-md border border-blue-900/20 bg-[#0a0a14]/50 p-2 text-sm leading-relaxed text-blue-100/80">
              {selectedFormula.description}
            </div>

            <div className="overflow-x-auto rounded-md border border-blue-800/30 bg-[#0a0a14] p-3 shadow-inner shadow-blue-900/10 backdrop-blur-sm">
              {showDerivative ? (
                <>
                  <div className="mb-2 text-xs font-medium text-blue-300">原公式:</div>
                  <div className="mb-3">
                    <MathJax formula={formatFormula(selectedFormula.formula || selectedFormula.expression)} />
                  </div>
                  <div className="my-3 border-t border-blue-800/30"></div>
                  <div className="mb-2 text-xs font-medium text-blue-300">求导结果:</div>
                  {formulaService.deriveFormula(selectedFormula.id) ? (
                    <div className="min-h-[50px]">
                      <MathJax formula={formulaService.deriveFormula(selectedFormula.id) || ''} />
                    </div>
                  ) : (
                    <div className="py-4 text-sm italic text-center rounded-md bg-blue-900/10 text-blue-200/60">
                      <div className="mb-1 text-2xl">🔄</div>
                      该公式暂不支持求导验证
                    </div>
                  )}
                </>
              ) : (
                <div className="min-h-[50px]">
                  <MathJax formula={formatFormula(selectedFormula.formula || selectedFormula.expression)} />
                </div>
              )}
            </div>

            {/* 相关公式展示 */}
            <motion.div
              className="mt-4 rounded-xl border border-blue-900/30 bg-gradient-to-br from-[#121228] to-[#0f0f20] p-3 sm:p-4 shadow-lg shadow-blue-900/10 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="mb-3 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                相关公式
              </h4>
              <div className="overflow-x-auto pb-1">
                <div className="flex gap-2 min-w-max">
                  {/* 根据当前公式的category查找相关公式 */}
                  {formulas
                    .filter(formula => {
                      // 排除当前公式
                      if (formula.id === selectedFormula.id) return false;
                      // 根据类别匹配相关公式
                      return formula.category === selectedFormula.category;
                    })
                    .map(relatedFormula => (
                      <motion.button
                        key={relatedFormula.id}
                        className={`overflow-hidden relative px-3 py-2 text-xs font-medium text-blue-300 rounded-lg border border-transparent transition-all group duration-400 bg-blue-900/20 hover:bg-blue-900/40 group-hover:border-blue-700/50 hover:shadow-md hover:text-blue-200`}
                        onClick={() => handleFormulaSelect(relatedFormula)}
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="transition-colors group-hover:text-blue-200">{relatedFormula.name}</span>
                          <span className="text-xs text-blue-400/60">{relatedFormula.category}</span>
                        </div>
                        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                      </motion.button>
                    ))}
                </div>
              </div>
            </motion.div>

          {/* 动画选择器 */}
          {selectedFormula && selectedFormula.animations && selectedFormula.animations.length > 0 && (
            <motion.div
              className="mb-3 rounded-xl border border-blue-900/30 bg-gradient-to-br from-[#121228] to-[#0f0f20] p-3 sm:p-4 shadow-lg shadow-blue-900/10 transition-all duration-500 backdrop-blur-md"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  可视化动画
                </h4>
                <div className="flex gap-2 items-center">
                  <motion.button
                    className={`rounded-full p-2 transition-all duration-300 ${
                      animationPlaying
                        ? 'text-white shadow-lg bg-green-600/80 hover:bg-green-700/80 shadow-green-900/20'
                        : 'text-white shadow-lg bg-red-600/80 hover:bg-red-700/80 shadow-red-900/20'
                    }`}
                    onClick={() => setAnimationPlaying(!animationPlaying)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={animationPlaying ? "暂停动画" : "播放动画"}
                  >
                    {animationPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </motion.button>
                  {animationLoading && (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 animate-spin border-t-transparent" />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {selectedFormula.animations.map((animation) => {
                  const isActive = selectedAnimation === animation.id;
                  return (
                    <motion.button
                      key={animation.id}
                      className={`group relative overflow-hidden rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-400 ${
                        isActive
                          ? 'text-white bg-gradient-to-r border shadow-lg from-blue-600/90 to-cyan-600/90 shadow-blue-900/30 border-blue-500/50'
                          : 'text-blue-300 border border-transparent bg-blue-900/20 hover:bg-blue-900/40 group-hover:border-blue-700/50 hover:shadow-md'
                      }`}
                      onClick={() => {
                        setAnimationLoading(true);
                        setSelectedAnimation(animation.id);
                      }}
                      whileHover={!isActive ? { scale: 1.05, translateY: -2 } : {}}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * selectedFormula.animations.indexOf(animation) }}
                    >
                      <span className="relative z-10">{animation.name}</span>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      )}
                      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 例子选择器 */}
          {selectedFormula && selectedFormula.examples && selectedFormula.examples.length > 0 && (
            <motion.div
              className="mb-3 rounded-xl border border-blue-900/30 bg-gradient-to-br from-[#121228] to-[#0f0f20] p-3 sm:p-4 shadow-lg shadow-blue-900/10 transition-all duration-500 backdrop-blur-md"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  例子演示
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {selectedFormula.examples.map((example) => {
                  const isActive = selectedExample === example.id;
                  return (
                    <motion.button
                      key={example.id}
                      className={`group relative overflow-hidden rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-400 ${
                        isActive
                          ? 'text-white bg-gradient-to-r border shadow-lg from-blue-600/90 to-purple-600/90 shadow-blue-900/30 border-blue-500/50'
                          : 'text-blue-300 border border-transparent bg-blue-900/20 hover:bg-blue-900/40 group-hover:border-blue-700/50 hover:shadow-md'
                      }`}
                      onClick={() => {
                        setAnimationLoading(true);
                        setSelectedExample(example.id);
                      }}
                      whileHover={!isActive ? { scale: 1.05, translateY: -2 } : {}}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * selectedFormula.examples.indexOf(example) }}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="relative z-10">{example.name}</span>
                        <span className="text-xs text-blue-400/60">{example.description}</span>
                      </div>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      )}
                      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 可视化控制面板 */}
          <motion.div
            className="mb-3 rounded-xl border border-blue-900/30 bg-gradient-to-br from-[#121228] to-[#0f0f20] p-3 shadow-lg shadow-blue-900/10 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-wrap gap-3 items-center">
              {/* 显示网格 */}
              <label className="flex gap-2 items-center text-xs transition-colors cursor-pointer text-blue-100/80 hover:text-blue-300">
                <input
                  type="checkbox"
                  checked={controls.showGrid}
                  onChange={e => updateControls('showGrid', e.target.checked)}
                  className="text-blue-500 rounded focus:ring-blue-500"
                />
                <span>网格</span>
              </label>

              {/* 显示坐标轴 */}
              <label className="flex gap-2 items-center text-xs transition-colors cursor-pointer text-blue-100/80 hover:text-blue-300">
                <input
                  type="checkbox"
                  checked={controls.showAxes}
                  onChange={e => updateControls('showAxes', e.target.checked)}
                  className="text-blue-500 rounded focus:ring-blue-500"
                />
                <span>坐标轴</span>
              </label>

              {/* 显示统计信息 */}
              <label className="flex gap-2 items-center text-xs transition-colors cursor-pointer text-blue-100/80 hover:text-blue-300">
                <input
                  type="checkbox"
                  checked={controls.showStats}
                  onChange={e => updateControls('showStats', e.target.checked)}
                  className="text-blue-500 rounded focus:ring-blue-500"
                />
                <span>统计</span>
              </label>

              {/* 自动旋转 */}
              <label className="flex gap-2 items-center text-xs transition-colors cursor-pointer text-blue-100/80 hover:text-blue-300">
                <input
                  type="checkbox"
                  checked={controls.autoRotate}
                  onChange={e => updateControls('autoRotate', e.target.checked)}
                  className="text-blue-500 rounded focus:ring-blue-500"
                />
                <span>自动旋转</span>
              </label>

              {/* 粒子效果 */}
              <label className="flex gap-2 items-center text-xs transition-colors cursor-pointer text-blue-100/80 hover:text-blue-300">
                <input
                  type="checkbox"
                  checked={controls.enableParticleEffects}
                  onChange={e => updateControls('enableParticleEffects', e.target.checked)}
                  className="text-blue-500 rounded focus:ring-blue-500"
                />
                <span>粒子效果</span>
              </label>

              {/* 场线效果 */}
              <label className="flex gap-2 items-center text-xs transition-colors cursor-pointer text-blue-100/80 hover:text-blue-300">
                <input
                  type="checkbox"
                  checked={controls.enableFieldLines}
                  onChange={e => updateControls('enableFieldLines', e.target.checked)}
                  className="text-blue-500 rounded focus:ring-blue-500"
                />
                <span>场线效果</span>
              </label>

              {/* 动画速度 */}
              <div className="flex gap-2 items-center ml-auto text-xs text-blue-100/80">
                <span>速度:</span>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={controls.animationSpeed}
                  onChange={e => updateControls('animationSpeed', parseFloat(e.target.value))}
                  className="w-24 h-1.5 rounded-lg appearance-none cursor-pointer bg-blue-900/50 accent-blue-500 hover:bg-blue-900/70 transition-all"
                />
                <span className="w-10 font-medium text-center text-blue-300">{controls.animationSpeed.toFixed(1)}x</span>
              </div>
            </div>
          </motion.div>

          {/* 动画配置面板 */}
          {selectedFormula && selectedAnimation && (
            <motion.div
              className="mb-3 rounded-xl border border-blue-900/30 bg-gradient-to-br from-[#121228] to-[#0f0f20] p-3 sm:p-4 shadow-lg shadow-blue-900/10 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="mb-4 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                动画配置
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* 粒子数量控制 */}
                {animationConfig.particleCount !== undefined && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs transition-colors text-blue-300/80 hover:text-blue-300">粒子数量</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="50"
                        max="500"
                        step="10"
                        value={animationConfig.particleCount}
                        onChange={e => setAnimationConfig(prev => ({ ...prev, particleCount: parseInt(e.target.value) }))}
                        className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-blue-900/50 accent-blue-500 hover:bg-blue-900/70 transition-all"
                      />
                      <span className="w-12 text-xs font-medium text-right text-blue-300">{animationConfig.particleCount}</span>
                    </div>
                  </div>
                )}

                {/* 场强控制 */}
                {animationConfig.fieldStrength !== undefined && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs transition-colors text-blue-300/80 hover:text-blue-300">场强</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={animationConfig.fieldStrength}
                        onChange={e => setAnimationConfig(prev => ({ ...prev, fieldStrength: parseFloat(e.target.value) }))}
                        className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-blue-900/50 accent-blue-500 hover:bg-blue-900/70 transition-all"
                      />
                      <span className="w-12 text-xs font-medium text-right text-blue-300">{animationConfig.fieldStrength.toFixed(1)}</span>
                    </div>
                  </div>
                )}

                {/* 振幅控制 */}
                {animationConfig.amplitude !== undefined && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs transition-colors text-blue-300/80 hover:text-blue-300">振幅</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={animationConfig.amplitude}
                        onChange={e => setAnimationConfig(prev => ({ ...prev, amplitude: parseFloat(e.target.value) }))}
                        className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-blue-900/50 accent-blue-500 hover:bg-blue-900/70 transition-all"
                      />
                      <span className="w-12 text-xs font-medium text-right text-blue-300">{animationConfig.amplitude.toFixed(1)}</span>
                    </div>
                  </div>
                )}

                {/* 频率控制 */}
                {animationConfig.frequency !== undefined && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs transition-colors text-blue-300/80 hover:text-blue-300">频率</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={animationConfig.frequency}
                        onChange={e => setAnimationConfig(prev => ({ ...prev, frequency: parseFloat(e.target.value) }))}
                        className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-blue-900/50 accent-blue-500 hover:bg-blue-900/70 transition-all"
                      />
                      <span className="w-12 text-xs font-medium text-right text-blue-300">{animationConfig.frequency.toFixed(1)}</span>
                    </div>
                  </div>
                )}

                {/* 波长控制 */}
                {animationConfig.wavelength !== undefined && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs transition-colors text-blue-300/80 hover:text-blue-300">波长</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value={animationConfig.wavelength}
                        onChange={e => setAnimationConfig(prev => ({ ...prev, wavelength: parseFloat(e.target.value) }))}
                        className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-blue-900/50 accent-blue-500 hover:bg-blue-900/70 transition-all"
                      />
                      <span className="w-12 text-xs font-medium text-right text-blue-300">{animationConfig.wavelength.toFixed(1)}</span>
                    </div>
                  </div>
                )}

                {/* 透明度控制 */}
                {animationConfig.opacity !== undefined && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs transition-colors text-blue-300/80 hover:text-blue-300">透明度</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={animationConfig.opacity}
                        onChange={e => setAnimationConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                        className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-blue-900/50 accent-blue-500 hover:bg-blue-900/70 transition-all"
                      />
                      <span className="w-12 text-xs font-medium text-right text-blue-300">{animationConfig.opacity.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 3D可视化区域 - 全屏显示，突出可视化效果 */}
          <div className="relative h-full w-full flex-1 overflow-hidden bg-[#0a0a14] shadow-xl shadow-blue-900/10 transition-all duration-300">
            {/* 加载覆盖层 */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a14]/90 backdrop-blur-sm">
                <motion.div
                  className="flex flex-col gap-4 items-center text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  ></motion.div>
                  <div className="font-medium text-blue-300">正在渲染3D可视化...</div>
                  <div className="max-w-xs text-sm text-blue-200/60">
                    基于统一场论的精确物理模拟
                  </div>
                </motion.div>
              </div>
            )}

            {/* 全屏可视化舞台 - 顶级操控效果配置 */}
            <ThreeJSVisualization
              children={createVisualization}
              onAnimationFrame={updateVisualization}
              cameraConfig={{
                position: { x: 0, y: 0, z: 5 },
                fov: 75,
                near: 0.1,
                far: 1000
              }}
              sceneConfig={{
                backgroundColor: 0x0a0a14,
                showGrid: controls.showGrid,
                showAxes: controls.showAxes
              }}
              controlsConfig={{
                enableDamping: true,
                dampingFactor: 0.05,
                rotateSpeed: 1.0, // 提高旋转速度
                zoomSpeed: 1.2, // 提高缩放速度
                panSpeed: 0.8, // 优化平移速度
                enablePan: true,
                autoRotate: controls.autoRotate,
                autoRotateSpeed: 2.0,
                minDistance: 0.5, // 允许更近的观察
                maxDistance: 20.0, // 允许更远的观察
                minPolarAngle: 0,
                maxPolarAngle: Math.PI // 允许全方位观察
              }}
              performanceOptions={{
                enableBatchRendering: true,
                dynamicPixelRatio: true,
                usePerformanceMonitoring: controls.showStats,
                maxObjects: 2000 // 增加最大对象数
              }}
              minHeight={0}
              autoFit={true}
              paused={false}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default FormulaVisualizationPage

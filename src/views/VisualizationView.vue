<template>
  <div class="min-h-screen cosmic-bg">
    <nav class="fixed top-0 w-full z-50 glass-effect">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <RouterLink to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">U</span>
            </div>
            <span class="text-xl font-bold gradient-text">3D可视化</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="pt-24 pb-20 px-4">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-5xl font-bold text-center mb-4">
          <span class="gradient-text">3D可视化实验室</span>
        </h1>
        <p class="text-center text-gray-300 text-xl mb-12">
          实时交互式物理场景
        </p>

        <div class="grid lg:grid-cols-3 gap-6">
          <!-- 场景选择 -->
          <div class="glass-effect p-6 rounded-2xl">
            <h2 class="text-2xl font-bold text-white mb-6">选择场景</h2>
            <div class="space-y-3">
              <button
                v-for="scene in scenes"
                :key="scene.id"
                @click="selectedScene = scene.id"
                :class="[
                  'w-full p-4 rounded-xl text-left transition-all',
                  selectedScene === scene.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-black/30 text-gray-300 hover:bg-black/50'
                ]"
              >
                <div class="font-bold mb-1">{{ scene.name }}</div>
                <div class="text-sm opacity-80">{{ scene.description }}</div>
              </button>
            </div>
          </div>

          <!-- 3D渲染区 -->
          <div class="lg:col-span-2">
            <div class="glass-effect p-6 rounded-2xl">
              <div 
                ref="canvasContainer" 
                class="w-full h-[600px] bg-black/50 rounded-xl flex items-center justify-center"
              >
                <div class="text-center">
                  <div class="text-6xl mb-4">🌌</div>
                  <div class="text-white text-xl font-semibold mb-2">
                    {{ currentScene?.name }}
                  </div>
                  <div class="text-gray-400">
                    {{ currentScene?.description }}
                  </div>
                  <div class="mt-6 text-cyan-400">
                    Three.js 渲染引擎准备中...
                  </div>
                </div>
              </div>

              <!-- 控制面板 -->
              <div class="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label class="text-white text-sm mb-2 block">旋转速度</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    v-model="rotationSpeed"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="text-white text-sm mb-2 block">场强度</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    v-model="fieldStrength"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const canvasContainer = ref<HTMLElement>()
const selectedScene = ref('spacetime')
const rotationSpeed = ref(50)
const fieldStrength = ref(50)

const scenes = [
  {
    id: 'spacetime',
    name: '时空同一化',
    description: '光速矢量的三维展示'
  },
  {
    id: 'spiral',
    name: '螺旋时空',
    description: '粒子的螺旋运动轨迹'
  },
  {
    id: 'gravity',
    name: '引力场',
    description: '空间密度梯度可视化'
  },
  {
    id: 'electromagnetic',
    name: '电磁场',
    description: '电场与磁场的统一'
  },
  {
    id: 'unified',
    name: '统一场',
    description: '引力与电磁的耦合'
  }
]

const currentScene = computed(() => {
  return scenes.find(s => s.id === selectedScene.value)
})

onMounted(() => {
  // Three.js 初始化将在这里实现
  console.log('3D场景初始化')
})
</script>

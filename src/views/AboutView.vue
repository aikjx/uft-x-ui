<template>
  <div class="min-h-screen cosmic-bg">
    <nav class="fixed top-0 w-full z-50 glass-effect">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <RouterLink to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">U</span>
            </div>
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="pt-24 pb-20 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-5xl font-bold text-center mb-16">
          <span class="gradient-text">关于统一场论</span>
        </h1>

        <div class="space-y-8">
          <div class="glass-effect p-8 rounded-2xl">
            <h2 class="text-3xl font-bold text-white mb-4">理论简介</h2>
            <p class="text-gray-300 text-lg leading-relaxed mb-4">
              张祥前统一场论是一个革命性的物理理论框架，它从全新的角度解释了时空、引力、电磁场的本质。
              该理论认为时间是空间的运动形式，质量是空间密度梯度的体现，引力和电磁力本质上是统一的。
            </p>
            <p class="text-gray-300 text-lg leading-relaxed">
              通过17个核心公式，统一场论建立了一个完整的数学框架，不仅能够解释现有的物理现象，
              还预言了许多新的效应，为人类探索宇宙提供了全新的视角。
            </p>
          </div>

          <div class="glass-effect p-8 rounded-2xl">
            <h2 class="text-3xl font-bold text-white mb-4">核心思想</h2>
            <div class="space-y-4">
              <div class="bg-black/30 p-6 rounded-xl">
                <h3 class="text-xl font-bold text-cyan-400 mb-2">时空统一</h3>
                <p class="text-gray-300">时间不是独立存在的，而是空间以光速运动的表现形式</p>
              </div>
              <div class="bg-black/30 p-6 rounded-xl">
                <h3 class="text-xl font-bold text-cyan-400 mb-2">质量本质</h3>
                <p class="text-gray-300">质量是空间密度梯度，物质是空间的特殊状态</p>
              </div>
              <div class="bg-black/30 p-6 rounded-xl">
                <h3 class="text-xl font-bold text-cyan-400 mb-2">场的统一</h3>
                <p class="text-gray-300">引力场和电磁场本质相同，都源于空间的几何性质</p>
              </div>
            </div>
          </div>

          <div class="glass-effect p-8 rounded-2xl">
            <h2 class="text-3xl font-bold text-white mb-4">技术实现</h2>
            <p class="text-gray-300 text-lg mb-4">
              本网站采用最先进的Web技术栈构建：
            </p>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-black/30 p-4 rounded-xl">
                <div class="text-cyan-400 font-bold mb-1">Vue 3 + TypeScript</div>
                <div class="text-gray-400 text-sm">现代化前端框架</div>
              </div>
              <div class="bg-black/30 p-4 rounded-xl">
                <div class="text-cyan-400 font-bold mb-1">Three.js</div>
                <div class="text-gray-400 text-sm">高性能3D渲染</div>
              </div>
              <div class="bg-black/30 p-4 rounded-xl">
                <div class="text-cyan-400 font-bold mb-1">MathJax 3.0</div>
                <div class="text-gray-400 text-sm">专业数学公式渲染</div>
              </div>
              <div class="bg-black/30 p-4 rounded-xl">
                <div class="text-cyan-400 font-bold mb-1">Tailwind CSS</div>
                <div class="text-gray-400 text-sm">现代化UI设计</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

/**
 * 统一场论公式集 - 一键修复脚本
 * 在浏览器控制台中复制粘贴此脚本并运行
 */

;(async function quickFix() {
  console.log(
    '%c🔧 统一场论公式集 - 快速修复',
    'font-size: 20px; color: #667eea; font-weight: bold;'
  )
  console.log('')

  // 步骤 1: 检查 MathJax
  console.log('1️⃣ 检查 MathJax 状态...')
  if (!window.MathJax) {
    console.error('❌ MathJax 未加载！')
    console.log('💡 解决方案: 刷新页面 (Ctrl+F5)')
    return
  }
  console.log('✅ MathJax 已加载')

  if (!window.MathJax.typesetPromise) {
    console.error('❌ MathJax 未完全初始化！')
    console.log('💡 解决方案: 等待几秒后重试')
    return
  }
  console.log('✅ MathJax 渲染功能可用')
  console.log('')

  // 步骤 2: 统计公式
  console.log('2️⃣ 统计公式元素...')
  const allFormulas = document.querySelectorAll('.formula-content, .math-formula')
  const errorFormulas = document.querySelectorAll('.formula-error')
  const loadingFormulas = document.querySelectorAll('.formula-loading')

  console.log(`📊 总公式数: ${allFormulas.length}`)
  console.log(`⚠️  错误数: ${errorFormulas.length}`)
  console.log(`⏳ 加载中: ${loadingFormulas.length}`)
  console.log('')

  // 步骤 3: 清除并重新渲染
  console.log('3️⃣ 开始修复...')
  try {
    // 清除之前的渲染
    if (window.MathJax.typesetClear) {
      console.log('🧹 清除旧渲染...')
      window.MathJax.typesetClear()
    }

    // 重新渲染所有公式
    console.log('🔄 重新渲染所有公式...')
    await window.MathJax.typesetPromise()

    console.log('')
    console.log('%c✅ 修复完成！', 'font-size: 18px; color: #10b981; font-weight: bold;')
    console.log('')

    // 步骤 4: 验证结果
    console.log('4️⃣ 验证结果...')
    const renderedElements = document.querySelectorAll('.MathJax, mjx-container')
    const remainingErrors = document.querySelectorAll('.formula-error')

    console.log(`✅ 成功渲染: ${renderedElements.length} 个公式`)
    console.log(`⚠️  剩余错误: ${remainingErrors.length} 个`)

    if (remainingErrors.length > 0) {
      console.log('')
      console.log('⚠️  仍有公式渲染失败，详细信息:')
      remainingErrors.forEach((el, i) => {
        const card = el.closest('.formula-card')
        const name = card?.querySelector('.formula-name')?.textContent
        console.log(`   ${i + 1}. ${name || '未知公式'}`)
      })
      console.log('')
      console.log('💡 建议: 点击失败公式上的"重试"按钮')
    } else {
      console.log('')
      console.log('🎉 所有公式渲染成功！')
    }
  } catch (error) {
    console.error('❌ 修复失败:', error)
    console.log('')
    console.log('💡 可能的原因:')
    console.log('   1. 网络连接问题')
    console.log('   2. 公式语法错误')
    console.log('   3. MathJax 配置问题')
    console.log('')
    console.log('💡 建议操作:')
    console.log('   1. 刷新页面 (Ctrl+F5)')
    console.log('   2. 检查网络连接')
    console.log('   3. 查看控制台详细错误信息')
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📚 更多帮助:')
  console.log('   - 使用调试面板: 点击右下角 🔧 按钮')
  console.log('   - 手动重试: 点击失败公式的"重试"按钮')
  console.log('   - 再次运行: 复制粘贴此脚本重新运行')
  console.log('')
})()

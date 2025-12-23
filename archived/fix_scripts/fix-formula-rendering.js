/**
 * 公式渲染修复脚本
 * 在浏览器控制台中运行此脚本来诊断和修复公式渲染问题
 */

console.log('🔧 开始诊断公式渲染问题...\n')

// 1. 检查 MathJax 状态
console.log('1️⃣ 检查 MathJax 状态:')
console.log('   - MathJax 对象:', !!window.MathJax ? '✅ 存在' : '❌ 不存在')
console.log(
  '   - typesetPromise:',
  !!(window.MathJax && window.MathJax.typesetPromise) ? '✅ 可用' : '❌ 不可用'
)
console.log('   - startup:', !!(window.MathJax && window.MathJax.startup) ? '✅ 存在' : '❌ 不存在')
console.log(
  '   - typesetClear:',
  !!(window.MathJax && window.MathJax.typesetClear) ? '✅ 可用' : '❌ 不可用'
)

// 2. 检查公式元素
console.log('\n2️⃣ 检查公式元素:')
const formulaElements = document.querySelectorAll(
  '.formula-content, .math-formula, [class*="formula"]'
)
console.log(`   - 找到 ${formulaElements.length} 个公式相关元素`)

// 3. 检查是否有渲染错误
console.log('\n3️⃣ 检查渲染错误:')
const errorElements = document.querySelectorAll('.formula-error, .error')
console.log(`   - 找到 ${errorElements.length} 个错误元素`)
if (errorElements.length > 0) {
  errorElements.forEach((el, i) => {
    console.log(`   - 错误 ${i + 1}:`, el.textContent)
  })
}

// 4. 检查加载状态
console.log('\n4️⃣ 检查加载状态:')
const loadingElements = document.querySelectorAll('.formula-loading, .loading')
console.log(`   - 找到 ${loadingElements.length} 个加载中的元素`)

// 5. 提供修复方案
console.log('\n5️⃣ 修复方案:')

if (!window.MathJax) {
  console.log('   ❌ MathJax 未加载，请检查网络连接或 CDN 链接')
  console.log('   💡 建议: 刷新页面或检查 index.html 中的 MathJax 脚本标签')
} else if (!window.MathJax.typesetPromise) {
  console.log('   ❌ MathJax 未完全初始化')
  console.log('   💡 建议: 等待几秒后再试，或刷新页面')
} else {
  console.log('   ✅ MathJax 状态正常')
  console.log('   💡 尝试手动重新渲染所有公式...')

  // 尝试重新渲染
  window.MathJax.typesetClear()
  window.MathJax.typesetPromise()
    .then(() => {
      console.log('   ✅ 重新渲染成功！')
      console.log('   📊 渲染统计:')
      const renderedElements = document.querySelectorAll('.MathJax, mjx-container')
      console.log(`   - 成功渲染 ${renderedElements.length} 个公式`)
    })
    .catch(error => {
      console.error('   ❌ 重新渲染失败:', error)
      console.log('   💡 建议: 检查公式语法是否正确')
    })
}

// 6. 提供手动修复函数
console.log('\n6️⃣ 可用的修复函数:')
console.log('   - fixAllFormulas(): 重新渲染所有公式')
console.log('   - checkFormula(element): 检查特定元素的公式')
console.log('   - clearAndRender(): 清除并重新渲染')

window.fixAllFormulas = async function () {
  console.log('🔄 开始重新渲染所有公式...')
  try {
    if (window.MathJax && window.MathJax.typesetPromise) {
      await window.MathJax.typesetPromise()
      console.log('✅ 所有公式渲染成功')
      return true
    } else {
      console.error('❌ MathJax 不可用')
      return false
    }
  } catch (error) {
    console.error('❌ 渲染失败:', error)
    return false
  }
}

window.checkFormula = function (element) {
  if (!element) {
    console.error('❌ 请提供一个元素')
    return
  }
  console.log('📝 公式内容:', element.textContent)
  console.log('📦 HTML:', element.innerHTML)
  console.log('🏷️ 类名:', element.className)
  console.log('🎨 样式:', window.getComputedStyle(element).display)
}

window.clearAndRender = async function () {
  console.log('🧹 清除所有渲染...')
  try {
    if (window.MathJax && window.MathJax.typesetClear) {
      window.MathJax.typesetClear()
      console.log('✅ 清除成功')
    }
    console.log('🔄 重新渲染...')
    await window.fixAllFormulas()
  } catch (error) {
    console.error('❌ 操作失败:', error)
  }
}

console.log('\n✨ 诊断完成！如果问题仍然存在，请尝试运行 fixAllFormulas() 或 clearAndRender()')

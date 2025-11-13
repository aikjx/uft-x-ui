import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Formula {
  id: string
  name: string
  description: string
  formula: string
  category: string
  variables: {
    name: string
    description: string
    unit: string
  }[]
}

export const useFormulaStore = defineStore('formula', () => {
  // 状态
  const formulas = ref<Formula[]>([])
  const selectedFormulaId = ref<string | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const selectedFormula = computed(() => 
    formulas.value.find(f => f.id === selectedFormulaId.value)
  )

  const formulasByCategory = computed(() => {
    return formulas.value.reduce((acc, formula) => {
      if (!acc[formula.category]) {
        acc[formula.category] = []
      }
      acc[formula.category].push(formula)
      return acc
    }, {} as Record<string, Formula[]>)
  })

  // Actions
  async function fetchFormulas() {
    isLoading.value = true
    try {
      // 这里将来可以替换为真实的API调用
      // const response = await fetch('/api/formulas')
      // formulas.value = await response.json()
      
      // 模拟数据
      formulas.value = [
        {
          id: '1',
          name: '爱因斯坦场方程',
          description: '描述时空曲率与能量动量张量之间关系的方程',
          formula: 'G_{\mu\nu} = \frac{8\pi G}{c^4} T_{\mu\nu}',
          category: '引力理论',
          variables: [
            { name: 'G_{\mu\nu}', description: '爱因斯坦张量', unit: '无' },
            { name: 'G', description: '引力常数', unit: 'm^3/(kg·s^2)' },
            { name: 'c', description: '光速', unit: 'm/s' },
            { name: 'T_{\mu\nu}', description: '能量动量张量', unit: 'kg/(m·s^2)' }
          ]
        },
        {
          id: '2',
          name: '麦克斯韦方程组',
          description: '描述电磁场的基本方程组',
          formula: '\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}',
          category: '电磁理论',
          variables: [
            { name: '\mathbf{E}', description: '电场强度', unit: 'N/C' },
            { name: '\rho', description: '电荷密度', unit: 'C/m^3' },
            { name: '\epsilon_0', description: '真空电容率', unit: 'F/m' }
          ]
        }
      ]
    } catch (error) {
      console.error('Failed to fetch formulas:', error)
    } finally {
      isLoading.value = false
    }
  }

  function selectFormula(id: string) {
    selectedFormulaId.value = id
  }

  function clearSelection() {
    selectedFormulaId.value = null
  }

  return {
    formulas,
    selectedFormulaId,
    selectedFormula,
    formulasByCategory,
    isLoading,
    fetchFormulas,
    selectFormula,
    clearSelection
  }
}, {
  persist: {
    key: 'formula',
    storage: sessionStorage,
    paths: ['selectedFormulaId']
  }
})
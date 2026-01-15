import { FormulaData } from '../components/FormulaDisplay'

// 公式变量类型
type FormulaVariable = FormulaData['variables'][0]

export const unifiedFieldTheoryFormulas: FormulaData[] = [
  {
    id: 'uf1',
    name: '时空同一化方程',
    category: '时空基础方程',
    formula: '$$\\vec{r}(t) = \\vec{c}t = x\\vec{i} + y\\vec{j} + z\\vec{k}$$',
    description: '描述空间和时间的统一关系，表明空间位移与时间的比例关系由光速决定。',
    physicalDimension: '长度 [L]',
    variables: [
      { name: '$\\vec{r}(t)$', description: '空间位移矢量', unit: 'm' },
      { name: '$t$', description: '时间', unit: 's' },
      { name: '$\\vec{c}$', description: '光速矢量', unit: 'm/s' },
      { name: '$x, y, z$', description: '三维空间坐标', unit: 'm' },
      { name: '$\\vec{i}, \\vec{j}, \\vec{k}$', description: '三维空间单位矢量', unit: '无' }
    ],
    applications: ['时空本质研究', '相对论基础', '宇宙学']
  },
  {
    id: 'uf2',
    name: '三维螺旋时空方程',
    category: '时空基础方程',
    formula:
      '$$\\vec{r}(t) = r\\cos\\omega t \\cdot \\vec{i} + r\\sin\\omega t \\cdot \\vec{j} + ht \\cdot \\vec{k}$$',
    description: '揭示物体在时空中的螺旋运动规律，结合旋转和平移运动。',
    physicalDimension: '长度 [L]',
    variables: [
      { name: '$\\vec{r}(t)$', description: '空间位置矢量', unit: 'm' },
      { name: '$r$', description: '旋转半径', unit: 'm' },
      { name: '$\\omega$', description: '角频率', unit: 'rad/s' },
      { name: '$t$', description: '时间', unit: 's' },
      { name: '$h$', description: '螺距', unit: 'm/rad' },
      { name: '$\\vec{i}, \\vec{j}, \\vec{k}$', description: '三维空间单位矢量', unit: '无' }
    ],
    applications: ['天体运动', '粒子物理', '场论']
  },
  {
    id: 'uf3',
    name: '质量定义方程',
    category: '质量与动量方程',
    formula: '$$m = k \\dfrac{dn}{d\\Omega}$$',
    description: '从空间几何角度定义质量，质量与空间几何变化率成正比。',
    physicalDimension: '质量 [M]',
    variables: [
      { name: '$m$', description: '质量', unit: 'kg' },
      { name: '$k$', description: '空间-质量耦合常数', unit: 'kg' },
      { name: '$n$', description: '空间几何参数', unit: '无量纲' },
      { name: '$\\Omega$', description: '立体角', unit: 'sr' }
    ],
    applications: ['质量本质研究', '引力理论', '量子力学']
  },
  {
    id: 'uf4',
    name: '引力场定义方程',
    category: '质量与动量方程',
    formula: '$$\\vec{A} = -Gk\\dfrac{\\Delta n}{\\Delta s}\\dfrac{\\vec{r}}{r}$$',
    description: '定义引力场为空间运动量的变化率，表明引力场强度与空间运动量的梯度成正比。',
    physicalDimension: '引力场强度 [L²T⁻²]',
    variables: [
      { name: '$\\vec{A}$', description: '引力场强度', unit: 'm/s²' },
      { name: '$G$', description: '万有引力常数', unit: 'N·m²/kg²' },
      { name: '$k$', description: '空间-质量耦合常数', unit: 'kg' },
      { name: '$\\Delta n/\\Delta s$', description: '空间运动量的梯度', unit: '1/m' },
      { name: '$\\vec{r}$', description: '位置矢量', unit: 'm' },
      { name: '$r$', description: '距离', unit: 'm' }
    ],
    applications: ['引力理论', '天体物理', '宇宙学']
  },
  {
    id: 'uf5',
    name: '静止动量方程',
    category: '质量与动量方程',
    formula: '$$\\vec{p}_{0} = m_{0}\\vec{c}_{0}$$',
    description: '描述静止质量与光速相关的内在动量，体现质能等价。',
    physicalDimension: '动量 [MLT⁻¹]',
    variables: [
      { name: '$\\vec{p}_{0}$', description: '静止动量', unit: 'kg·m/s' },
      { name: '$m_{0}$', description: '静止质量', unit: 'kg' },
      { name: '$\\vec{c}_{0}$', description: '静止参考系中的光速', unit: 'm/s' }
    ],
    applications: ['相对论力学', '量子力学', '粒子物理']
  },
  {
    id: 'uf6',
    name: '运动动量方程',
    category: '质量与动量方程',
    formula: '$$\\vec{P} = m(\\vec{c} - \\vec{v})$$',
    description: '描述运动物体的动量，考虑了物体速度与光速的相对关系。',
    physicalDimension: '动量 [MLT⁻¹]',
    variables: [
      { name: '$\\vec{P}$', description: '运动动量', unit: 'kg·m/s' },
      { name: '$m$', description: '运动质量', unit: 'kg' },
      { name: '$\\vec{c}$', description: '光速矢量', unit: 'm/s' },
      { name: '$\\vec{v}$', description: '物体运动速度', unit: 'm/s' }
    ],
    applications: ['相对论力学', '天体物理', '粒子物理']
  },
  {
    id: 'uf7',
    name: '宇宙大统一方程（力方程）',
    category: '统一场方程',
    formula:
      '$$\\vec{F} = \\dfrac{d\\vec{P}}{dt} = \\vec{c}\\dfrac{dm}{dt} - \\vec{v}\\dfrac{dm}{dt} + m\\dfrac{d\\vec{c}}{dt} - m\\dfrac{d\\vec{v}}{dt}$$',
    description: '统一描述各种力的本质，力源于动量随时间的变化。',
    physicalDimension: '力 [MLT⁻²]',
    variables: [
      { name: '$\\vec{F}$', description: '力', unit: 'N' },
      { name: '$d\\vec{P}/dt$', description: '动量变化率', unit: 'kg·m/s²' },
      { name: '$\\vec{c}$', description: '光速矢量', unit: 'm/s' },
      { name: '$dm/dt$', description: '质量变化率', unit: 'kg/s' },
      { name: '$\\vec{v}$', description: '物体运动速度', unit: 'm/s' },
      { name: '$d\\vec{v}/dt$', description: '加速度', unit: 'm/s²' }
    ],
    applications: ['力场统一', '量子场论', '高能物理']
  },
  {
    id: 'uf8',
    name: '空间波动方程',
    category: '统一场方程',
    formula: '$$\\nabla^2 L = \\dfrac{1}{c^2} \\dfrac{\\partial^2 L}{\\partial t^2}$$',
    description: '描述空间波动的传播规律，类似于电磁波方程。',
    physicalDimension: '波动方程',
    variables: [
      { name: '$L$', description: '空间波动幅度', unit: 'm' },
      { name: '$\\nabla^2$', description: '拉普拉斯算子', unit: 'm⁻²' },
      { name: '$t$', description: '时间', unit: 's' },
      { name: '$c$', description: '光速', unit: 'm/s' }
    ],
    applications: ['波动理论', '电磁学', '引力波研究']
  },
  {
    id: 'uf9',
    name: '电荷定义方程',
    category: '电磁场方程',
    formula: '$$q = k^{\\prime}k\\dfrac{1}{\\Omega^{2}}\\dfrac{d\\Omega}{dt}$$',
    description: '从空间几何角度定义电荷，电荷与空间旋转运动的时间变化率相关。',
    physicalDimension: '电荷 [Q]',
    variables: [
      { name: '$q$', description: '电荷', unit: 'C' },
      { name: '$k^{\\prime}$', description: '电荷-空间耦合常数', unit: 'C·s/kg' },
      { name: '$k$', description: '空间-质量耦合常数', unit: 'kg' },
      { name: '$\\Omega$', description: '立体角', unit: 'sr' },
      { name: '$d\\Omega/dt$', description: '立体角变化率', unit: 'sr/s' }
    ],
    applications: ['电磁学基础', '电荷本质研究', '量子电动力学']
  },
  {
    id: 'uf10',
    name: '电场定义方程',
    category: '电磁场方程',
    formula:
      '$$\\vec{E} = -\\dfrac{kk^{\\prime}}{4\\pi\\varepsilon_0\\Omega^2}\\dfrac{d\\Omega}{dt}\\dfrac{\\vec{r}}{r^3}$$',
    description: '定义电场为空间旋转运动变化率产生的几何效应。',
    physicalDimension: '电场强度 [LMT⁻²Q⁻¹]',
    variables: [
      { name: '$\\vec{E}$', description: '电场强度', unit: 'V/m' },
      { name: '$k, k^{\\prime}$', description: '耦合常数', unit: '无' },
      { name: '$\\varepsilon_0$', description: '真空介电常数', unit: 'F/m' },
      { name: '$\\Omega$', description: '立体角', unit: 'sr' },
      { name: '$\\vec{r}$', description: '位置矢量', unit: 'm' },
      { name: '$r$', description: '距离', unit: 'm' }
    ],
    applications: ['电磁学', '天线理论', '电子工程']
  },
  {
    id: 'uf11',
    name: '磁场定义方程',
    category: '电磁场方程',
    formula:
      '$$\\vec{B} = \\dfrac{\\mu_{0} \\gamma k k^{\\prime}}{4 \\pi \\Omega^{2}} \\dfrac{d \\Omega}{d t} \\dfrac{[(x-v t) \\vec{i}+y \\vec{j}+z \\vec{k}]}{\\left[\\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}\\right]^{3/2}}$$',
    description: '定义磁场为运动电荷产生的空间几何效应。',
    physicalDimension: '磁感应强度 [ML⁻¹Q⁻¹]',
    variables: [
      { name: '$\\vec{B}$', description: '磁感应强度', unit: 'T' },
      { name: '$\\mu_{0}$', description: '真空磁导率', unit: 'H/m' },
      { name: '$\\gamma$', description: '洛伦兹因子', unit: '无量纲' },
      { name: '$k, k^{\\prime}$', description: '耦合常数', unit: '无' },
      { name: '$\\Omega$', description: '立体角', unit: 'sr' },
      { name: '$v$', description: '电荷运动速度', unit: 'm/s' },
      { name: '$x, y, z$', description: '三维空间坐标', unit: 'm' }
    ],
    applications: ['电磁学', '电机工程', '磁悬浮技术']
  },
  {
    id: 'uf12',
    name: '变化的引力场产生电磁场',
    category: '场转化方程',
    formula:
      '$$\\dfrac{\\partial^{2}\\vec{A}}{\\partial t^{2}} = \\dfrac{\\vec{v}}{f}\\left(\\vec{\\nabla}\\cdot\\vec{E}\\right) - \\dfrac{c^{2}}{f}\\left(\\vec{\\nabla}\\times\\vec{B}\\right)$$',
    description: '揭示引力场变化与电磁场产生的内在联系。',
    physicalDimension: '场变化率 [LT⁻³]',
    variables: [
      { name: '$\\vec{A}$', description: '引力场强度', unit: 'm/s²' },
      { name: '$t$', description: '时间', unit: 's' },
      { name: '$\\vec{v}$', description: '物体运动速度', unit: 'm/s' },
      { name: '$f$', description: '场转化耦合常数', unit: 'kg/C' },
      { name: '$\\vec{\\nabla}\\cdot\\vec{E}$', description: '电场散度', unit: 'V/m²' },
      { name: '$c$', description: '光速', unit: 'm/s' },
      { name: '$\\vec{\\nabla}\\times\\vec{B}$', description: '磁场旋度', unit: 'A/m²' }
    ],
    applications: ['场论统一', '引力电磁统一', '新能源研究']
  },
  {
    id: 'uf13',
    name: '磁矢势方程',
    category: '电磁场方程',
    formula: '$$\\vec{\\nabla} \\times \\vec{A} = \\dfrac{\\vec{B}}{f}$$',
    description: '描述磁矢势与磁场的关系。',
    physicalDimension: '磁矢势 [T⁻¹]',
    variables: [
      { name: '$\\vec{\\nabla} \\times \\vec{A}$', description: '磁矢势的旋度', unit: 'T' },
      { name: '$\\vec{A}$', description: '磁矢势', unit: 'Wb/m' },
      { name: '$\\vec{B}$', description: '磁感应强度', unit: 'T' },
      { name: '$f$', description: '场转化耦合常数', unit: 'kg/C' }
    ],
    applications: ['电磁学', '量子力学', '超导理论']
  },
  {
    id: 'uf14',
    name: '变化的引力场产生电场',
    category: '场转化方程',
    formula: '$$\\vec{E} = -f\\dfrac{d\\vec{A}}{dt}$$',
    description: '揭示引力场变化如何产生电场，表明变化的引力场可以直接产生电场。',
    physicalDimension: '电场强度 [MLT⁻³Q⁻¹]',
    variables: [
      { name: '$\\vec{E}$', description: '电场强度', unit: 'V/m' },
      { name: '$f$', description: '场转化耦合常数', unit: 'kg/C' },
      { name: '$d\\vec{A}/dt$', description: '引力场强度变化率', unit: 'm/s³' },
      { name: '$\\vec{A}$', description: '引力场强度', unit: 'm/s²' }
    ],
    applications: ['场论统一', '引力电磁统一', '能源技术']
  },
  {
    id: 'uf15',
    name: '变化的磁场产生引力场和电场',
    category: '场转化方程',
    formula:
      '$$\\dfrac{d\\vec{B}}{dt} = -\\dfrac{\\vec{A}\\times\\vec{E}}{c^2} - \\dfrac{\\vec{v}}{c^{2}}\\times\\dfrac{d\\vec{E}}{dt}$$',
    description: '揭示磁场变化同时产生引力场和电场的统一机制。',
    physicalDimension: '磁场变化率 [MT⁻³Q⁻¹]',
    variables: [
      { name: '$d\\vec{B}/dt$', description: '磁感应强度变化率', unit: 'T/s' },
      { name: '$\\vec{A}$', description: '引力场强度', unit: 'm/s²' },
      { name: '$\\vec{E}$', description: '电场强度', unit: 'V/m' },
      { name: '$c$', description: '光速', unit: 'm/s' },
      { name: '$\\vec{v}$', description: '物体运动速度', unit: 'm/s' },
      { name: '$d\\vec{E}/dt$', description: '电场强度变化率', unit: 'V/(m·s)' }
    ],
    applications: ['场论统一', '引力电磁统一', '粒子物理']
  },
  {
    id: 'uf16',
    name: '统一场论能量方程',
    category: '能量与运动方程',
    formula: '$$E = m_0 c^2 = mc^2\\sqrt{1 - \\dfrac{v^2}{c^2}}$$',
    description: '描述能量与质量、速度的关系，是相对论能量方程的扩展。',
    physicalDimension: '能量 [ML²T⁻²]',
    variables: [
      { name: '$E$', description: '总能量', unit: 'J' },
      { name: '$m_0$', description: '静止质量', unit: 'kg' },
      { name: '$m$', description: '运动质量', unit: 'kg' },
      { name: '$c$', description: '光速', unit: 'm/s' },
      { name: '$v$', description: '物体运动速度', unit: 'm/s' }
    ],
    applications: ['相对论力学', '核能技术', '粒子物理']
  },
  {
    id: 'uf17',
    name: '光速飞行器动力学方程',
    category: '能量与运动方程',
    formula: '$$\\vec{F} = (\\vec{c} - \\vec{v})\\dfrac{dm}{dt}$$',
    description: '为超光速飞行提供理论基础，描述质量变化产生的推进力。',
    physicalDimension: '力 [MLT⁻²]',
    variables: [
      { name: '$\\vec{F}$', description: '推力', unit: 'N' },
      { name: '$\\vec{c}$', description: '光速矢量', unit: 'm/s' },
      { name: '$\\vec{v}$', description: '飞行器速度', unit: 'm/s' },
      { name: '$dm/dt$', description: '质量变化率', unit: 'kg/s' }
    ],
    applications: ['航天技术', '超光速理论', '未来能源']
  },
  {
    id: 'uf18',
    name: '核力场定义方程',
    category: '核力与统一常数',
    formula: '$$\\vec{D} = - G m \\dfrac{ \\vec{c} - 3 \\dfrac{\\vec{r}}{r} \\dot{r} }{r^3}$$',
    description: '定义核力场为质量物体在空间中产生的特殊几何效应。',
    physicalDimension: '核力场强度 [LT⁻³]',
    variables: [
      { name: '$\\vec{D}$', description: '核力场强度', unit: 'N/kg' },
      { name: '$G$', description: '万有引力常数', unit: 'N·m²/kg²' },
      { name: '$m$', description: '质量', unit: 'kg' },
      { name: '$\\vec{c}$', description: '光速矢量', unit: 'm/s' },
      { name: '$\\vec{r}$', description: '位置矢量', unit: 'm' },
      { name: '$r$', description: '距离', unit: 'm' },
      { name: '$\\dot{r}$', description: '径向速度', unit: 'm/s' }
    ],
    applications: ['核物理', '粒子物理', '核能技术']
  },
  {
    id: 'uf19',
    name: '引力光速统一方程',
    category: '核力与统一常数',
    formula: '$$Z = \\dfrac{Gc}{2}$$',
    description: '揭示万有引力常数与光速的内在联系，体现基本常数的统一性。',
    physicalDimension: '耦合常数 [L⁴M⁻¹T⁻³]',
    variables: [
      { name: '$Z$', description: '引力光速统一常数', unit: 'N·m²/(kg²·s)' },
      { name: '$G$', description: '万有引力常数', unit: 'N·m²/kg²' },
      { name: '$c$', description: '光速', unit: 'm/s' }
    ],
    applications: ['基本物理常数研究', '统一场论', '宇宙学']
  },
  {
    id: 'uf20',
    name: '电磁耦合常数',
    category: '核力与统一常数',
    formula: '$$Z^{\\prime} = \\dfrac{c}{8\\pi\\varepsilon_0}$$',
    description: '描述电磁相互作用强度的基本常数，将光速、真空介电常数联系起来。',
    physicalDimension: '电磁耦合 [L⁴MT⁻³Q⁻²]',
    variables: [
      { name: '$Z^{\\prime}$', description: '电磁耦合常数', unit: 'm/F · m/s' },
      { name: '$c$', description: '光速', unit: 'm/s' },
      { name: '$\\varepsilon_0$', description: '真空介电常数', unit: 'F/m' }
    ],
    applications: ['基本物理常数研究', '统一场论', '电磁学']
  }
]

export default unifiedFieldTheoryFormulas

// 张祥前统一场论20个核心公式数据
import { FormulaData } from '../components/FormulaDisplay';

// 公式变量类型
type FormulaVariable = FormulaData['variables'][0];

export const unifiedFieldTheoryFormulas: FormulaData[] = [
  {
    id: 'uf1',
    name: '时空同一化方程',
    category: '时空理论',
    formula: '$$\vec{r}(t) = \vec{C}t = x\vec{i} + y\vec{j} + z\vec{k}$$',
    description: '描述空间和时间的统一关系，表明空间是时间的函数，空间位置矢量是时间的线性函数。',
    variables: [
      { name: '$\vec{r}(t)$', description: '空间位置矢量', unit: 'm' },
      { name: '$\vec{C}$', description: '时空同一化常数，与光速相关', unit: 'm/s' },
      { name: '$t$', description: '时间', unit: 's' },
      { name: '$x, y, z$', description: '三维空间坐标', unit: 'm' },
      { name: '$\vec{i}, \vec{j}, \vec{k}$', description: '三维空间单位矢量', unit: '无' }
    ],
    applications: ['时空本质研究', '相对论基础', '宇宙学']
  },
  {
    id: 'uf2',
    name: '三维螺旋时空方程',
    category: '时空理论',
    formula: '$$\vec{r}(t) = r\cos\omega t \cdot \vec{i} + r\sin\omega t \cdot \vec{j} + ht \cdot \vec{k}$$',
    description: '揭示物体在时空中的螺旋运动规律，表明物体不仅在平面上做圆周运动，同时沿轴向做直线运动。',
    variables: [
      { name: '$\vec{r}(t)$', description: '空间位置矢量', unit: 'm' },
      { name: '$r$', description: '圆周运动半径', unit: 'm' },
      { name: '$\omega$', description: '角速度', unit: 'rad/s' },
      { name: '$t$', description: '时间', unit: 's' },
      { name: '$h$', description: '轴向运动速度', unit: 'm/s' },
      { name: '$\vec{i}, \vec{j}, \vec{k}$', description: '三维空间单位矢量', unit: '无' }
    ],
    applications: ['天体运动', '粒子物理', '场论']
  },
  {
    id: 'uf3',
    name: '质量定义方程',
    category: '质量理论',
    formula: '$$m = k \cdot \frac{dn}{d\Omega}$$',
    description: '从空间几何角度定义质量，与空间运动量有关，表明质量是空间运动量在立体角上的分布密度。',
    variables: [
      { name: '$m$', description: '质量', unit: 'kg' },
      { name: '$k$', description: '质量常数', unit: 'kg·s' },
      { name: '$\frac{dn}{d\Omega}$', description: '空间运动量在立体角上的分布密度', unit: '1/s' }
    ],
    applications: ['质量本质研究', '引力理论', '量子力学']
  },
  {
    id: 'uf4',
    name: '引力场定义方程',
    category: '引力理论',
    formula: '$$\overrightarrow{A} = -Gk\frac{\Delta n}{\Delta s}\frac{\overrightarrow{r}}{r}$$',
    description: '定义引力场为空间运动量的变化率，表明引力场强度与空间运动量的梯度成正比。',
    variables: [
      { name: '$\overrightarrow{A}$', description: '引力场强度', unit: 'm/s²' },
      { name: '$G$', description: '万有引力常数', unit: 'N·m²/kg²' },
      { name: '$k$', description: '质量常数', unit: 'kg·s' },
      { name: '$\frac{\Delta n}{\Delta s}$', description: '空间运动量的梯度', unit: '1/(m·s)' },
      { name: '$\overrightarrow{r}$', description: '位置矢量', unit: 'm' },
      { name: '$r$', description: '距离', unit: 'm' }
    ],
    applications: ['引力理论', '天体物理', '宇宙学']
  },
  {
    id: 'uf5',
    name: '静止动量方程',
    category: '动量理论',
    formula: '$$\overrightarrow{p}_{0} = m_{0}\overrightarrow{C}_{0}$$',
    description: '描述静止物体的动量，与光速相关，表明静止物体也具有动量，这是相对论动量的基础。',
    variables: [
      { name: '$\overrightarrow{p}_{0}$', description: '静止动量', unit: 'kg·m/s' },
      { name: '$m_{0}$', description: '静止质量', unit: 'kg' },
      { name: '$\overrightarrow{C}_{0}$', description: '静止物体的时空同一化常数', unit: 'm/s' }
    ],
    applications: ['相对论力学', '量子力学', '粒子物理']
  },
  {
    id: 'uf6',
    name: '运动动量方程',
    category: '动量理论',
    formula: '$$\overrightarrow{P} = m(\overrightarrow{C} - \overrightarrow{V})$$',
    description: '描述运动物体的动量，考虑了速度对动量的影响，表明动量与物体速度和光速的差成正比。',
    variables: [
      { name: '$\overrightarrow{P}$', description: '运动动量', unit: 'kg·m/s' },
      { name: '$m$', description: '运动质量', unit: 'kg' },
      { name: '$\overrightarrow{C}$', description: '时空同一化常数', unit: 'm/s' },
      { name: '$\overrightarrow{V}$', description: '物体运动速度', unit: 'm/s' }
    ],
    applications: ['相对论力学', '天体物理', '粒子物理']
  },
  {
    id: 'uf7',
    name: '宇宙大统一方程（力方程）',
    category: '力场理论',
    formula: '$$F = \frac{d\vec{P}}{dt} = \vec{C}\frac{dm}{dt} - \vec{V}\frac{dm}{dt} + m\frac{d\vec{C}}{dt} - m\frac{d\vec{V}}{dt}$$',
    description: '统一描述各种力的本质，揭示力与动量变化的关系，是统一场论的核心方程。',
    variables: [
      { name: '$F$', description: '力', unit: 'N' },
      { name: '$\frac{d\vec{P}}{dt}$', description: '动量变化率', unit: 'kg·m/s²' },
      { name: '$\vec{C}$', description: '时空同一化常数', unit: 'm/s' },
      { name: '$\frac{dm}{dt}$', description: '质量变化率', unit: 'kg/s' },
      { name: '$\vec{V}$', description: '物体运动速度', unit: 'm/s' },
      { name: '$\frac{d\vec{V}}{dt}$', description: '加速度', unit: 'm/s²' }
    ],
    applications: ['力场统一', '量子场论', '高能物理']
  },
  {
    id: 'uf8',
    name: '空间波动方程',
    category: '场论',
    formula: '$$\frac{\partial^2 L}{\partial x^2} + \frac{\partial^2 L}{\partial y^2} + \frac{\partial^2 L}{\partial z^2} = \frac{1}{c^2} \frac{\partial^2 L}{\partial t^2}$$',
    description: '描述空间波动的传播规律，表明空间波动以光速传播，是统一场论中场传播的基础。',
    variables: [
      { name: '$L$', description: '空间波动函数', unit: 'm' },
      { name: '$x, y, z$', description: '三维空间坐标', unit: 'm' },
      { name: '$t$', description: '时间', unit: 's' },
      { name: '$c$', description: '光速', unit: 'm/s' }
    ],
    applications: ['波动理论', '电磁学', '引力波研究']
  },
  {
    id: 'uf9',
    name: '电荷定义方程',
    category: '电磁理论',
    formula: '$$q = k^{\prime}k\frac{1}{\Omega^{2}}\frac{d\Omega}{dt}$$',
    description: '从空间几何角度定义电荷，与空间旋转运动有关，表明电荷是空间旋转运动量的变化率。',
    variables: [
      { name: '$q$', description: '电荷', unit: 'C' },
      { name: '$k^{\prime}$', description: '电荷常数', unit: 'C·s' },
      { name: '$k$', description: '质量常数', unit: 'kg·s' },
      { name: '$\Omega$', description: '立体角', unit: 'rad²' },
      { name: '$\frac{d\Omega}{dt}$', description: '立体角变化率', unit: 'rad²/s' }
    ],
    applications: ['电磁学基础', '电荷本质研究', '量子电动力学']
  },
  {
    id: 'uf10',
    name: '电场定义方程',
    category: '电磁理论',
    formula: '$$\vec{E} = -\frac{kk^{\prime}}{4\pi\epsilon_0\Omega^2}\frac{d\Omega}{dt}\frac{\vec{r}}{r^3}$$',
    description: '定义电场为空间旋转运动的变化率，表明电场强度与电荷产生的空间旋转运动有关。',
    variables: [
      { name: '$\vec{E}$', description: '电场强度', unit: 'V/m' },
      { name: '$k, k^{\prime}$', description: '常数', unit: '无' },
      { name: '$\epsilon_0$', description: '真空介电常数', unit: 'F/m' },
      { name: '$\Omega$', description: '立体角', unit: 'rad²' },
      { name: '$\frac{d\Omega}{dt}$', description: '立体角变化率', unit: 'rad²/s' },
      { name: '$\vec{r}$', description: '位置矢量', unit: 'm' },
      { name: '$r$', description: '距离', unit: 'm' }
    ],
    applications: ['电磁学', '天线理论', '电子工程']
  },
  {
    id: 'uf11',
    name: '磁场定义方程',
    category: '电磁理论',
    formula: '$$\vec{B} = \frac{\mu_{0} \gamma k k^{\prime}}{4 \pi \Omega^{2}} \frac{d \Omega}{d t} \frac{[(x-v t) \vec{i}+y \vec{j}+z \vec{k}]}{[\gamma^{2}(x-v t)^{2}+y^{2}+z^{2}]^{\frac{3}{2}}}$$',
    description: '定义磁场为运动电荷产生的空间效应，考虑了相对论效应，表明磁场是电场的相对论变换结果。',
    variables: [
      { name: '$\vec{B}$', description: '磁感应强度', unit: 'T' },
      { name: '$\mu_{0}$', description: '真空磁导率', unit: 'H/m' },
      { name: '$\gamma$', description: '洛伦兹因子', unit: '无' },
      { name: '$k, k^{\prime}$', description: '常数', unit: '无' },
      { name: '$\Omega$', description: '立体角', unit: 'rad²' },
      { name: '$\frac{d\Omega}{dt}$', description: '立体角变化率', unit: 'rad²/s' },
      { name: '$v$', description: '电荷运动速度', unit: 'm/s' },
      { name: '$x, y, z$', description: '三维空间坐标', unit: 'm' },
      { name: '$t$', description: '时间', unit: 's' },
      { name: '$\vec{i}, \vec{j}, \vec{k}$', description: '三维空间单位矢量', unit: '无' }
    ],
    applications: ['电磁学', '电机工程', '磁悬浮技术']
  },
  {
    id: 'uf12',
    name: '变化的引力场产生电磁场',
    category: '场论',
    formula: '$$\frac{\partial^{2}\overline{A}}{\partial t^{2}} = \frac{\overline{V}}{f}\left(\overline{\nabla}\cdot\overline{E}\right) - \frac{C^{2}}{f}\left(\overline{\nabla}\times\overline{B}\right)$$',
    description: '揭示引力场与电磁场的相互转化关系，表明变化的引力场可以产生电磁场。',
    variables: [
      { name: '$\overline{A}$', description: '引力场强度', unit: 'm/s²' },
      { name: '$t$', description: '时间', unit: 's' },
      { name: '$\overline{V}$', description: '物体运动速度', unit: 'm/s' },
      { name: '$f$', description: '常数', unit: '无' },
      { name: '$\overline{\nabla}\cdot\overline{E}$', description: '电场散度', unit: 'V/m²' },
      { name: '$C$', description: '时空同一化常数', unit: 'm/s' },
      { name: '$\overline{\nabla}\times\overline{B}$', description: '磁场旋度', unit: 'A/m²' }
    ],
    applications: ['场论统一', '引力电磁统一', '新能源研究']
  },
  {
    id: 'uf13',
    name: '磁矢势方程',
    category: '电磁理论',
    formula: '$$\vec{\nabla} \times \vec{A} = \frac{\vec{B}}{f}$$',
    description: '描述磁矢势与磁场的关系，表明磁场是磁矢势的旋度，是电磁理论的基础方程。',
    variables: [
      { name: '$\vec{\nabla} \times \vec{A}$', description: '磁矢势的旋度', unit: 'T' },
      { name: '$\vec{A}$', description: '磁矢势', unit: 'Wb/m' },
      { name: '$\vec{B}$', description: '磁感应强度', unit: 'T' },
      { name: '$f$', description: '常数', unit: '无' }
    ],
    applications: ['电磁学', '量子力学', '超导理论']
  },
  {
    id: 'uf14',
    name: '变化的引力场产生电场',
    category: '场论',
    formula: '$$\vec{E} = -f\frac{d\vec{A}}{dt}$$',
    description: '揭示引力场变化如何产生电场，表明变化的引力场可以直接产生电场，是引力电磁统一的重要方程。',
    variables: [
      { name: '$\vec{E}$', description: '电场强度', unit: 'V/m' },
      { name: '$f$', description: '常数', unit: '无' },
      { name: '$\frac{d\vec{A}}{dt}$', description: '引力场强度变化率', unit: 'm/s³' },
      { name: '$\vec{A}$', description: '引力场强度', unit: 'm/s²' },
      { name: '$t$', description: '时间', unit: 's' }
    ],
    applications: ['场论统一', '引力电磁统一', '能源技术']
  },
  {
    id: 'uf15',
    name: '变化的磁场产生引力场和电场',
    category: '场论',
    formula: '$$\frac{d\overrightarrow{B}}{dt} = \frac{-\overrightarrow{A}\times\overrightarrow{E}}{c^2} - \frac{\overrightarrow{V}}{c^{2}}\times\frac{d\overrightarrow{E}}{dt}$$',
    description: '揭示磁场变化如何产生引力场和电场，表明磁场变化可以同时影响引力场和电场，是场论统一的关键方程。',
    variables: [
      { name: '$\frac{d\overrightarrow{B}}{dt}$', description: '磁感应强度变化率', unit: 'T/s' },
      { name: '$\overrightarrow{A}$', description: '引力场强度', unit: 'm/s²' },
      { name: '$\overrightarrow{E}$', description: '电场强度', unit: 'V/m' },
      { name: '$c$', description: '光速', unit: 'm/s' },
      { name: '$\overrightarrow{V}$', description: '物体运动速度', unit: 'm/s' },
      { name: '$\frac{d\overrightarrow{E}}{dt}$', description: '电场强度变化率', unit: 'V/(m·s)' }
    ],
    applications: ['场论统一', '引力电磁统一', '粒子物理']
  },
  {
    id: 'uf16',
    name: '统一场论能量方程',
    category: '能量理论',
    formula: '$$e = m_0 c^2 = mc^2\sqrt{1 - \frac{v^2}{c^2}}$$',
    description: '描述能量与质量、速度的关系，是相对论能量方程的扩展，表明能量是质量与光速平方的乘积，考虑了速度对质量的影响。',
    variables: [
      { name: '$e$', description: '能量', unit: 'J' },
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
    category: '航天技术',
    formula: '$$\vec{F} = (\vec{C} - \vec{V})\frac{dm}{dt}$$',
    description: '为超光速飞行提供理论基础，表明推力可以通过质量变化率和速度差产生，是未来航天技术的理论支撑。',
    variables: [
      { name: '$\vec{F}$', description: '推力', unit: 'N' },
      { name: '$\vec{C}$', description: '时空同一化常数', unit: 'm/s' },
      { name: '$\vec{V}$', description: '飞行器速度', unit: 'm/s' },
      { name: '$\frac{dm}{dt}$', description: '质量变化率', unit: 'kg/s' }
    ],
    applications: ['航天技术', '超光速理论', '未来能源']
  },
  {
    id: 'uf18',
    name: '核力场定义方程',
    category: '核物理',
    formula: '$$\mathbf{D} = - G m \frac{ \mathbf{C} - 3 \frac{\mathbf{R}}{r} \dot{r} }{r^3}$$',
    description: '定义核力场为质量物体在空间中产生的特殊场效应，考虑了物体的运动状态，是核力理论的基础。',
    variables: [
      { name: '$\mathbf{D}$', description: '核力场强度', unit: 'N/kg' },
      { name: '$G$', description: '万有引力常数', unit: 'N·m²/kg²' },
      { name: '$m$', description: '质量', unit: 'kg' },
      { name: '$\mathbf{C}$', description: '时空同一化常数', unit: 'm/s' },
      { name: '$\mathbf{R}$', description: '位置矢量', unit: 'm' },
      { name: '$r$', description: '距离', unit: 'm' },
      { name: '$\dot{r}$', description: '距离变化率', unit: 'm/s' }
    ],
    applications: ['核物理', '粒子物理', '核能技术']
  },
  {
    id: 'uf19',
    name: '引力光速统一方程',
    category: '基本常数',
    formula: '$$Z = Gc/2$$',
    description: '揭示万有引力常数与光速的内在联系，表明引力常数和光速不是独立的，而是存在内在的数学关系。',
    variables: [
      { name: '$Z$', description: '引力光速统一常数', unit: 'N·m²/(kg²·s)' },
      { name: '$G$', description: '万有引力常数', unit: 'N·m²/kg²' },
      { name: '$c$', description: '光速', unit: 'm/s' }
    ],
    applications: ['基本物理常数研究', '统一场论', '宇宙学']
  }
];

export default unifiedFieldTheoryFormulas;
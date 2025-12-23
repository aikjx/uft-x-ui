// 简单的测试脚本，用于手动测试ResourceManager
const { ResourceManager } = require('./dist/utils/ResourceManager')

// 测试资源加载
async function testResourceLoading() {
  console.log('开始测试ResourceManager...')

  try {
    const resourceManager = ResourceManager.getInstance()

    // 测试加载纹理资源
    console.log('测试加载纹理资源...')
    const textureId = 'test-texture'
    const textureUrl = 'test-texture.png'

    const result = await resourceManager.loadResource(textureId, textureUrl, 'texture')
    console.log('纹理资源加载成功:', result)

    // 测试批量加载
    console.log('测试批量加载资源...')
    const resources = [
      { id: 'batch-texture1', url: 'batch-texture1.png', type: 'texture' },
      { id: 'batch-texture2', url: 'batch-texture2.png', type: 'texture' }
    ]

    const batchResult = await resourceManager.loadBatchResources(resources)
    console.log('批量加载成功:', batchResult)

    console.log('所有测试通过!')
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 运行测试
testResourceLoading()

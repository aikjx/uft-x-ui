// 测试ResourceManager的功能
import { ResourceManager } from './src/utils/ResourceManager.js';
import { ResourceType, ResourceStatus } from './src/utils/ResourceManager.js';

async function testResourceManager() {
  console.log('测试ResourceManager...');
  
  // 获取单例实例
  const rm = ResourceManager.getInstance();
  
  // 创建一个模拟加载器
  const mockLoader = {
    load: (url, onLoad, onProgress, onError) => {
      console.log(`加载URL: ${url}`);
      // 立即调用onLoad
      setTimeout(() => {
        onLoad({ data: 'test-data' });
      }, 100);
    }
  };
  
  // 注入模拟加载器
  rm.injectLoader('texture', mockLoader);
  
  try {
    console.log('开始加载资源...');
    const result = await rm.loadResource('test-id', 'test-url.png', 'texture');
    console.log('资源加载成功:', result);
    
    // 检查资源状态
    const resourceEntry = rm['resources'].get('test-id');
    console.log('资源条目:', resourceEntry);
    console.log('资源状态:', resourceEntry.metadata.status);
    
  } catch (error) {
    console.error('资源加载失败:', error);
  }
  
  // 清理
  rm.dispose();
  console.log('测试完成');
}

testResourceManager();
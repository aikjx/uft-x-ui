// 测试环境全局设置

// 模拟 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟 ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟 IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(),
}));

// 模拟 requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
  return 1;
};

// 模拟 cancelAnimationFrame
global.cancelAnimationFrame = jest.fn();

// 模拟 performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  timeOrigin: Date.now(),
};

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

global.localStorage = localStorageMock;

// 模拟 sessionStorage
global.sessionStorage = { ...localStorageMock };

// 模拟 fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
  })
);

// 模拟 URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

// 模拟 Three.js 相关模块
jest.mock('three', () => {
  const THREE = jest.requireActual('three');
  return {
    ...THREE,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      domElement: document.createElement('canvas'),
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
    })),
  };
});

// 全局测试工具函数
global.testUtils = {
  // 等待异步操作完成
  waitForAsync: (timeout = 100) => new Promise(resolve => setTimeout(resolve, timeout)),
  
  // 模拟用户输入
  simulateUserInput: (element, value) => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },
  
  // 模拟拖拽操作
  simulateDrag: (element, startX, startY, endX, endY) => {
    element.dispatchEvent(new MouseEvent('mousedown', {
      clientX: startX,
      clientY: startY,
      bubbles: true
    }));
    
    document.dispatchEvent(new MouseEvent('mousemove', {
      clientX: endX,
      clientY: endY,
      bubbles: true
    }));
    
    document.dispatchEvent(new MouseEvent('mouseup', {
      clientX: endX,
      clientY: endY,
      bubbles: true
    }));
  },
  
  // 模拟滚动
  simulateScroll: (element, scrollTop) => {
    element.scrollTop = scrollTop;
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
  },
  
  // 模拟窗口大小变化
  simulateResize: (width, height) => {
    window.innerWidth = width;
    window.innerHeight = height;
    window.dispatchEvent(new Event('resize'));
  }
};

// 测试环境全局变量
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:3001';
process.env.REACT_APP_DEBUG_MODE = 'false';

// 错误处理增强
const originalConsoleError = console.error;
console.error = (...args) => {
  // 过滤掉某些已知的测试警告
  if (args[0] && 
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: useLayoutEffect does nothing on the server'))) {
    return;
  }
  originalConsoleError(...args);
};

// 测试结束时的清理
afterAll(() => {
  // 恢复原始 console.error
  console.error = originalConsoleError;
  
  // 清理所有模拟
  jest.clearAllMocks();
});
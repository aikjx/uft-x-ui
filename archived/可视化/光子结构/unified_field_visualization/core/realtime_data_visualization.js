// 统一场论可视化系统 - 实时数据流和网络可视化
// 版本: v1.0
// 功能: 实现实时数据的流处理、网络数据可视化和数据可视化

class RealtimeDataVisualization {
  constructor() {
    this.dataStreams = new Map();
    this.networkGraphs = new Map();
    this.dataProcessors = new Map();
    this.visualizationComponents = new Map();
    this.dataBuffer = new Map();
    this.stats = new Map();
    this.init();
  }

  init() {
    console.log('🌊 实时数据流可视化系统初始化');
    this.initDataStreams();
    this.initNetworkGraphs();
    this.initDataProcessors();
    this.initVisualizationComponents();
    console.log('📈 实时数据流可视化系统初始化完成');
  }

  initDataStreams() {
    // 初始化数据流
    this.createDataStream('physics_data', {
      type: 'physics',
      frequency: 60, // 每秒60次更新
      bufferSize: 1000,
      compression: 'gzip'
    });
    
    this.createDataStream('network_data', {
      type: 'network',
      frequency: 30, // 每秒30次更新
      bufferSize: 500,
      compression: 'none'
    });
    
    this.createDataStream('sensor_data', {
      type: 'sensor',
      frequency: 100, // 每秒100次更新
      bufferSize: 2000,
      compression: 'gzip'
    });
    
    console.log('🔄 数据流系统初始化完成');
  }

  initNetworkGraphs() {
    // 初始化网络图
    this.createNetworkGraph('physics_network', {
      type: 'physics',
      nodeCount: 100,
      edgeCount: 200,
      layout: 'force-directed',
      physics: true
    });
    
    this.createNetworkGraph('communication_network', {
      type: 'communication',
      nodeCount: 50,
      edgeCount: 150,
      layout: 'circular',
      physics: false
    });
    
    console.log('🖇️ 网络图系统初始化完成');
  }

  initDataProcessors() {
    // 初始化数据处理器
    this.createDataProcessor('realtime_processor', {
      type: 'realtime',
      processingRate: 1000, // 每秒处理1000个数据点
      bufferSize: 5000,
      parallelProcessing: true
    });
    
    this.createDataProcessor('batch_processor', {
      type: 'batch',
      processingRate: 500, // 每秒处理500个数据点
      bufferSize: 10000,
      parallelProcessing: false
    });
    
    console.log('⚙️ 数据处理器系统初始化完成');
  }

  initVisualizationComponents() {
    // 初始化可视化组件
    this.createVisualizationComponent('realtime_chart', {
      type: 'chart',
      updateRate: 60, // 每秒60次更新
      dataSource: 'sensor_data',
      visualizationType: 'line'
    });
    
    this.createVisualizationComponent('network_visualization', {
      type: 'network',
      updateRate: 30, // 每秒30次更新
      dataSource: 'network_data',
      visualizationType: 'force-directed'
    });
    
    this.createVisualizationComponent('heatmap_visualization', {
      type: 'heatmap',
      updateRate: 15, // 每秒15次更新
      dataSource: 'physics_data',
      visualizationType: 'density'
    });
    
    console.log('🎨 可视化组件系统初始化完成');
  }

  createDataStream(name, options) {
    const dataStream = {
      name: name,
      options: options,
      data: [],
      lastUpdate: 0,
      subscribers: new Set(),
      stats: {
        dataPoints: 0,
        bandwidth: 0,
        latency: 0,
        errors: 0
      },
      push: (data) => this.pushData(name, data),
      subscribe: (callback) => this.subscribeToStream(name, callback),
      unsubscribe: (callback) => this.unsubscribeFromStream(name, callback)
    };
    
    this.dataStreams.set(name, dataStream);
    this.dataBuffer.set(name, []);
    this.stats.set(name, dataStream.stats);
  }

  createNetworkGraph(name, options) {
    const networkGraph = {
      name: name,
      options: options,
      nodes: new Map(),
      edges: new Map(),
      layout: options.layout || 'force-directed',
      physics: options.physics || true,
      stats: {
        nodes: 0,
        edges: 0,
        density: 0,
        clusteringCoefficient: 0
      },
      addNode: (node) => this.addNetworkNode(name, node),
      addEdge: (edge) => this.addNetworkEdge(name, edge),
      removeNode: (nodeId) => this.removeNetworkNode(name, nodeId),
      removeEdge: (edgeId) => this.removeNetworkEdge(name, edgeId)
    };
    
    this.networkGraphs.set(name, networkGraph);
  }

  createDataProcessor(name, options) {
    const dataProcessor = {
      name: name,
      options: options,
      queue: [],
      processing: false,
      stats: {
        processedData: 0,
        processingTime: 0,
        queueSize: 0,
        errors: 0
      },
      process: (data) => this.processData(name, data),
      batchProcess: (dataArray) => this.batchProcessData(name, dataArray)
    };
    
    this.dataProcessors.set(name, dataProcessor);
  }

  createVisualizationComponent(name, options) {
    const visualizationComponent = {
      name: name,
      options: options,
      data: [],
      lastRender: 0,
      stats: {
        renders: 0,
        renderTime: 0,
        fps: 0,
        errors: 0
      },
      update: (data) => this.updateVisualization(name, data),
      render: (canvas) => this.renderVisualization(name, canvas)
    };
    
    this.visualizationComponents.set(name, visualizationComponent);
  }

  // 数据流方法
  pushData(streamName, data) {
    const stream = this.dataStreams.get(streamName);
    if (!stream) return false;
    
    const timestamp = Date.now();
    const dataPoint = {
      timestamp: timestamp,
      data: data,
      latency: timestamp - stream.lastUpdate
    };
    
    stream.data.push(dataPoint);
    stream.lastUpdate = timestamp;
    stream.stats.dataPoints++;
    stream.stats.bandwidth = JSON.stringify(data).length * stream.options.frequency;
    stream.stats.latency = dataPoint.latency;
    
    // 限制数据缓冲区大小
    if (stream.data.length > stream.options.bufferSize) {
      stream.data.shift();
    }
    
    // 通知订阅者
    stream.subscribers.forEach(callback => {
      try {
        callback(dataPoint);
      } catch (error) {
        stream.stats.errors++;
        console.error(`❌ 数据流订阅者错误: ${error.message}`);
      }
    });
    
    // 存储到缓冲区
    const buffer = this.dataBuffer.get(streamName);
    buffer.push(dataPoint);
    if (buffer.length > stream.options.bufferSize * 2) {
      buffer.splice(0, buffer.length - stream.options.bufferSize * 2);
    }
    
    return true;
  }

  subscribeToStream(streamName, callback) {
    const stream = this.dataStreams.get(streamName);
    if (stream) {
      stream.subscribers.add(callback);
      return true;
    }
    return false;
  }

  unsubscribeFromStream(streamName, callback) {
    const stream = this.dataStreams.get(streamName);
    if (stream) {
      stream.subscribers.delete(callback);
      return true;
    }
    return false;
  }

  // 网络图方法
  addNetworkNode(graphName, node) {
    const graph = this.networkGraphs.get(graphName);
    if (!graph) return false;
    
    graph.nodes.set(node.id, {
      ...node,
      timestamp: Date.now()
    });
    graph.stats.nodes = graph.nodes.size;
    graph.stats.density = this.calculateNetworkDensity(graph);
    graph.stats.clusteringCoefficient = this.calculateClusteringCoefficient(graph);
    
    return true;
  }

  addNetworkEdge(graphName, edge) {
    const graph = this.networkGraphs.get(graphName);
    if (!graph) return false;
    
    graph.edges.set(`${edge.source}-${edge.target}`, {
      ...edge,
      id: `${edge.source}-${edge.target}`,
      timestamp: Date.now()
    });
    graph.stats.edges = graph.edges.size;
    graph.stats.density = this.calculateNetworkDensity(graph);
    graph.stats.clusteringCoefficient = this.calculateClusteringCoefficient(graph);
    
    return true;
  }

  removeNetworkNode(graphName, nodeId) {
    const graph = this.networkGraphs.get(graphName);
    if (!graph) return false;
    
    graph.nodes.delete(nodeId);
    
    // 移除相关边
    const edgesToRemove = [];
    graph.edges.forEach((edge, edgeId) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        edgesToRemove.push(edgeId);
      }
    });
    
    edgesToRemove.forEach(edgeId => {
      graph.edges.delete(edgeId);
    });
    
    graph.stats.nodes = graph.nodes.size;
    graph.stats.edges = graph.edges.size;
    graph.stats.density = this.calculateNetworkDensity(graph);
    graph.stats.clusteringCoefficient = this.calculateClusteringCoefficient(graph);
    
    return true;
  }

  removeNetworkEdge(graphName, edgeId) {
    const graph = this.networkGraphs.get(graphName);
    if (!graph) return false;
    
    graph.edges.delete(edgeId);
    graph.stats.edges = graph.edges.size;
    graph.stats.density = this.calculateNetworkDensity(graph);
    graph.stats.clusteringCoefficient = this.calculateClusteringCoefficient(graph);
    
    return true;
  }

  calculateNetworkDensity(graph) {
    const nodeCount = graph.nodes.size;
    const edgeCount = graph.edges.size;
    if (nodeCount < 2) return 0;
    const maxEdges = nodeCount * (nodeCount - 1);
    return edgeCount / maxEdges;
  }

  calculateClusteringCoefficient(graph) {
    // 简化的聚类系数计算
    const nodeCount = graph.nodes.size;
    if (nodeCount < 3) return 0;
    
    let totalCoefficient = 0;
    graph.nodes.forEach((node, nodeId) => {
      const neighbors = new Set();
      graph.edges.forEach(edge => {
        if (edge.source === nodeId) neighbors.add(edge.target);
        if (edge.target === nodeId) neighbors.add(edge.source);
      });
      
      const k = neighbors.size;
      if (k < 2) return;
      
      let triangleCount = 0;
      const neighborArray = Array.from(neighbors);
      for (let i = 0; i < neighborArray.length; i++) {
        for (let j = i + 1; j < neighborArray.length; j++) {
          if (graph.edges.has(`${neighborArray[i]}-${neighborArray[j]}`) || 
              graph.edges.has(`${neighborArray[j]}-${neighborArray[i]}`)) {
            triangleCount++;
          }
        }
      }
      
      const coefficient = triangleCount / (k * (k - 1) / 2);
      totalCoefficient += coefficient;
    });
    
    return totalCoefficient / nodeCount;
  }

  // 数据处理器方法
  processData(processorName, data) {
    const processor = this.dataProcessors.get(processorName);
    if (!processor) return false;
    
    processor.queue.push(data);
    processor.stats.queueSize = processor.queue.length;
    
    // 处理队列
    if (!processor.processing) {
      this.processQueue(processorName);
    }
    
    return true;
  }

  batchProcessData(processorName, dataArray) {
    const processor = this.dataProcessors.get(processorName);
    if (!processor) return false;
    
    processor.queue.push(...dataArray);
    processor.stats.queueSize = processor.queue.length;
    
    // 处理队列
    if (!processor.processing) {
      this.processQueue(processorName);
    }
    
    return true;
  }

  async processQueue(processorName) {
    const processor = this.dataProcessors.get(processorName);
    if (!processor || processor.processing) return;
    
    processor.processing = true;
    
    while (processor.queue.length > 0) {
      const startTime = Date.now();
      const batchSize = Math.min(processor.options.processingRate / 10, processor.queue.length);
      const batch = processor.queue.splice(0, batchSize);
      
      try {
        await this.processBatch(processorName, batch);
        processor.stats.processedData += batch.length;
        processor.stats.processingTime = Date.now() - startTime;
      } catch (error) {
        processor.stats.errors++;
        console.error(`❌ 数据处理错误: ${error.message}`);
      }
      
      // 控制处理速率
      await new Promise(resolve => setTimeout(resolve, 1000 / processor.options.processingRate * batchSize));
    }
    
    processor.processing = false;
  }

  processBatch(processorName, batch) {
    // 处理数据批次
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟数据处理
        batch.forEach(data => {
          // 处理单个数据点
        });
        resolve();
      }, 10);
    });
  }

  // 可视化组件方法
  updateVisualization(componentName, data) {
    const component = this.visualizationComponents.get(componentName);
    if (!component) return false;
    
    component.data.push(data);
    if (component.data.length > 100) {
      component.data.shift();
    }
    
    return true;
  }

  renderVisualization(componentName, canvas) {
    const component = this.visualizationComponents.get(componentName);
    if (!component) return false;
    
    const startTime = Date.now();
    const ctx = canvas.getContext('2d');
    
    switch (component.options.visualizationType) {
      case 'line':
        this.renderLineChart(ctx, component, canvas);
        break;
      case 'force-directed':
        this.renderForceDirectedGraph(ctx, component, canvas);
        break;
      case 'density':
        this.renderDensityHeatmap(ctx, component, canvas);
        break;
      default:
        this.renderDefaultVisualization(ctx, component, canvas);
    }
    
    const endTime = Date.now();
    component.stats.renderTime = endTime - startTime;
    component.stats.renders++;
    component.stats.fps = 1000 / (endTime - component.lastRender || 16);
    component.lastRender = endTime;
    
    return true;
  }

  renderLineChart(ctx, component, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (component.data.length < 2) return;
    
    // 绘制网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 绘制数据线
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxValue = Math.max(...component.data.map(d => d.value || 0));
    const minValue = Math.min(...component.data.map(d => d.value || 0));
    const valueRange = maxValue - minValue || 1;
    
    component.data.forEach((dataPoint, index) => {
      const x = (index / (component.data.length - 1)) * canvas.width;
      const y = canvas.height - ((dataPoint.value - minValue) / valueRange) * canvas.height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }

  renderForceDirectedGraph(ctx, component, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const graph = this.networkGraphs.get(component.options.dataSource);
    if (!graph) return;
    
    // 绘制边
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
    ctx.lineWidth = 1;
    graph.edges.forEach(edge => {
      const source = graph.nodes.get(edge.source);
      const target = graph.nodes.get(edge.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x || canvas.width / 2, source.y || canvas.height / 2);
        ctx.lineTo(target.x || canvas.width / 2, target.y || canvas.height / 2);
        ctx.stroke();
      }
    });
    
    // 绘制节点
    graph.nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x || canvas.width / 2, node.y || canvas.height / 2, node.size || 5, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || 'rgba(0, 255, 255, 0.8)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  renderDensityHeatmap(ctx, component, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (component.data.length < 1) return;
    
    // 创建热力图
    const gridSize = 20;
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    const densityGrid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
    
    // 计算密度
    component.data.forEach(dataPoint => {
      const gridX = Math.floor((dataPoint.x || Math.random()) * gridWidth);
      const gridY = Math.floor((dataPoint.y || Math.random()) * gridHeight);
      if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
        densityGrid[gridY][gridX]++;
      }
    });
    
    // 绘制热力图
    const maxDensity = Math.max(...densityGrid.flat());
    densityGrid.forEach((row, y) => {
      row.forEach((density, x) => {
        const intensity = density / maxDensity || 0;
        const color = this.getHeatmapColor(intensity);
        ctx.fillStyle = color;
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
      });
    });
  }

  renderDefaultVisualization(ctx, component, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Arial';
    ctx.fillText(`Visualization: ${component.name}`, 20, 30);
    ctx.fillText(`Data points: ${component.data.length}`, 20, 50);
  }

  getHeatmapColor(intensity) {
    if (intensity < 0.2) {
      return `rgba(0, 0, ${Math.floor(intensity * 5 * 255)}, 0.5)`;
    } else if (intensity < 0.4) {
      return `rgba(0, ${Math.floor((intensity - 0.2) * 5 * 255)}, 255, 0.5)`;
    } else if (intensity < 0.6) {
      return `rgba(${Math.floor((intensity - 0.4) * 5 * 255)}, 255, ${Math.floor((0.6 - intensity) * 5 * 255)}, 0.5)`;
    } else if (intensity < 0.8) {
      return `rgba(255, ${Math.floor((0.8 - intensity) * 5 * 255)}, 0, 0.5)`;
    } else {
      return `rgba(255, 0, 0, ${0.5 + (intensity - 0.8) * 2.5})`;
    }
  }

  // 实时数据处理
  processRealtimeData(data) {
    // 分发数据到不同的数据流
    if (data.type === 'physics') {
      this.pushData('physics_data', data);
    } else if (data.type === 'network') {
      this.pushData('network_data', data);
    } else if (data.type === 'sensor') {
      this.pushData('sensor_data', data);
    }
    
    // 处理数据
    this.processData('realtime_processor', data);
    
    // 更新可视化
    this.visualizationComponents.forEach((component, name) => {
      if (component.options.dataSource === data.type + '_data') {
        component.update(data);
      }
    });
  }

  // 网络数据处理
  processNetworkData(nodeData, edgeData) {
    // 更新网络图
    const graph = this.networkGraphs.get('physics_network');
    if (graph) {
      // 添加节点
      nodeData.forEach(node => {
        this.addNetworkNode('physics_network', node);
      });
      
      // 添加边
      edgeData.forEach(edge => {
        this.addNetworkEdge('physics_network', edge);
      });
    }
    
    // 更新网络可视化
    this.updateVisualization('network_visualization', {
      nodes: nodeData,
      edges: edgeData
    });
  }

  // 统计方法
  getStreamStats(streamName) {
    return this.stats.get(streamName) || null;
  }

  getAllStreamStats() {
    const stats = {};
    this.stats.forEach((stat, name) => {
      stats[name] = stat;
    });
    return stats;
  }

  getNetworkStats(graphName) {
    const graph = this.networkGraphs.get(graphName);
    return graph ? graph.stats : null;
  }

  getProcessorStats(processorName) {
    const processor = this.dataProcessors.get(processorName);
    return processor ? processor.stats : null;
  }

  getVisualizationStats(componentName) {
    const component = this.visualizationComponents.get(componentName);
    return component ? component.stats : null;
  }

  // 性能监控
  getPerformanceMetrics() {
    const metrics = {
      streams: {},
      networks: {},
      processors: {},
      visualizations: {}
    };
    
    this.dataStreams.forEach((stream, name) => {
      metrics.streams[name] = stream.stats;
    });
    
    this.networkGraphs.forEach((graph, name) => {
      metrics.networks[name] = graph.stats;
    });
    
    this.dataProcessors.forEach((processor, name) => {
      metrics.processors[name] = processor.stats;
    });
    
    this.visualizationComponents.forEach((component, name) => {
      metrics.visualizations[name] = component.stats;
    });
    
    return metrics;
  }

  // 工具方法
  compressData(data) {
    // 简化的数据压缩
    return JSON.stringify(data);
  }

  decompressData(compressedData) {
    // 简化的数据解压
    return JSON.parse(compressedData);
  }

  // 清理方法
  dispose() {
    this.dataStreams.clear();
    this.networkGraphs.clear();
    this.dataProcessors.clear();
    this.visualizationComponents.clear();
    this.dataBuffer.clear();
    this.stats.clear();
    console.log('🧹 实时数据流可视化系统资源清理完成');
  }
}

// 导出实时数据流可视化系统实例
const realtimeDataVisualization = new RealtimeDataVisualization();
window.RealtimeDataVisualization = RealtimeDataVisualization;
window.realtimeDataVisualization = realtimeDataVisualization;

console.log('🚀 实时数据流可视化系统初始化完成');

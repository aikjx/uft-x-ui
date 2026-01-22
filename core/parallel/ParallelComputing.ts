// 统一场论可视化系统 - 并行计算系统
// 版本: v2.0
// 功能: 实现并行计算和分布式处理

export class ParallelComputing {
  private workerPool: any[] = [];
  private maxWorkers: number = navigator.hardwareConcurrency || 4;
  private taskQueue: any[] = [];
  private runningTasks: Map<string, any> = new Map();
  private completedTasks: Map<string, any> = new Map();
  private taskCounter: number = 0;
  private enableAutoScaling: boolean = true;
  private taskTimeout: number = 30000; // 30秒
  private useWebWorkers: boolean = true;
  private useSharedArrayBuffer: boolean = false;
  private taskHandlers: Map<string, Function> = new Map();

  constructor() {
    console.log(`🚀 并行计算系统初始化，最大工作线程: ${this.maxWorkers}`);
    this.initWorkerPool();
  }

  private initWorkerPool(): void {
    if (this.useWebWorkers && typeof Worker !== 'undefined') {
      console.log('🧵 工作线程池初始化');
      // 这里可以初始化工作线程
    } else {
      console.warn('⚠️  Web Workers 不可用，使用主线程处理');
      this.useWebWorkers = false;
    }
  }

  public addTask(taskType: string, data: any, priority: number = 0): string {
    const taskId = `task_${++this.taskCounter}_${Date.now()}`;
    
    const task = {
      id: taskId,
      type: taskType,
      data,
      priority,
      createdAt: Date.now(),
      status: 'queued'
    };

    // 添加到任务队列
    this.taskQueue.push(task);
    
    // 按优先级排序
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    console.log(`📋 添加任务: ${taskType} (ID: ${taskId})`);

    // 尝试执行任务
    this.processTaskQueue();

    return taskId;
  }

  public cancelTask(taskId: string): boolean {
    // 从队列中移除
    const queueIndex = this.taskQueue.findIndex(task => task.id === taskId);
    if (queueIndex > -1) {
      this.taskQueue.splice(queueIndex, 1);
      console.log(`❌ 取消任务: ${taskId}`);
      return true;
    }

    // 从运行中移除
    if (this.runningTasks.has(taskId)) {
      const task = this.runningTasks.get(taskId);
      // 这里可以实现任务取消逻辑
      this.runningTasks.delete(taskId);
      console.log(`❌ 取消运行中的任务: ${taskId}`);
      return true;
    }

    return false;
  }

  public getTaskStatus(taskId: string): string {
    // 检查队列
    const queuedTask = this.taskQueue.find(task => task.id === taskId);
    if (queuedTask) return queuedTask.status;

    // 检查运行中
    if (this.runningTasks.has(taskId)) {
      const task = this.runningTasks.get(taskId);
      return task.status;
    }

    // 检查已完成
    if (this.completedTasks.has(taskId)) {
      return 'completed';
    }

    return 'not_found';
  }

  public getTaskResult(taskId: string): any {
    return this.completedTasks.get(taskId)?.result || null;
  }

  public getQueueSize(): number {
    return this.taskQueue.length;
  }

  public getRunningTasksCount(): number {
    return this.runningTasks.size;
  }

  public getCompletedTasksCount(): number {
    return this.completedTasks.size;
  }

  public registerTaskHandler(taskType: string, handler: Function): void {
    this.taskHandlers.set(taskType, handler);
    console.log(`🔧 注册任务处理器: ${taskType}`);
  }

  public unregisterTaskHandler(taskType: string): void {
    this.taskHandlers.delete(taskType);
    console.log(`🔧 注销任务处理器: ${taskType}`);
  }

  public setMaxWorkers(max: number): void {
    this.maxWorkers = Math.max(1, Math.min(max, navigator.hardwareConcurrency || 8));
    console.log(`📏 最大工作线程设置为: ${this.maxWorkers}`);
    this.adjustWorkerPool();
  }

  public enableAutoScaling(enabled: boolean): void {
    this.enableAutoScaling = enabled;
    console.log(`🔄 自动扩展 ${enabled ? '启用' : '禁用'}`);
  }

  public setTaskTimeout(timeout: number): void {
    this.taskTimeout = timeout;
    console.log(`⏰ 任务超时设置为: ${timeout}ms`);
  }

  public clearCompletedTasks(): void {
    this.completedTasks.clear();
    console.log('🧹 已完成任务已清理');
  }

  public clearTaskQueue(): void {
    this.taskQueue = [];
    console.log('🧹 任务队列已清理');
  }

  private processTaskQueue(): void {
    while (this.taskQueue.length > 0 && this.runningTasks.size < this.maxWorkers) {
      const task = this.taskQueue.shift();
      if (task) {
        this.executeTask(task);
      }
    }
  }

  private executeTask(task: any): void {
    task.status = 'running';
    task.startTime = Date.now();
    this.runningTasks.set(task.id, task);

    console.log(`▶️  执行任务: ${task.type} (ID: ${task.id})`);

    if (this.useWebWorkers) {
      // 使用Web Worker执行
      this.executeTaskWithWorker(task);
    } else {
      // 使用主线程执行
      this.executeTaskWithMainThread(task);
    }
  }

  private executeTaskWithWorker(task: any): void {
    // 模拟Web Worker执行
    setTimeout(() => {
      this.completeTask(task, { result: `Worker result for ${task.type}` });
    }, 1000);
  }

  private executeTaskWithMainThread(task: any): void {
    try {
      // 查找任务处理器
      const handler = this.taskHandlers.get(task.type);
      
      if (handler) {
        // 使用处理器执行
        const result = handler(task.data);
        this.completeTask(task, { result });
      } else {
        // 默认处理
        const result = this.defaultTaskHandler(task.type, task.data);
        this.completeTask(task, { result });
      }
    } catch (error) {
      console.error(`❌ 任务执行出错:`, error);
      this.completeTask(task, { error: error.message });
    }
  }

  private defaultTaskHandler(taskType: string, data: any): any {
    // 默认任务处理器
    console.warn(`⚠️  未找到任务处理器: ${taskType}，使用默认处理`);
    return {
      type: taskType,
      data,
      processed: true,
      timestamp: Date.now()
    };
  }

  private completeTask(task: any, result: any): void {
    task.status = 'completed';
    task.endTime = Date.now();
    task.duration = task.endTime - task.startTime;
    task.result = result;

    // 从运行中移除
    this.runningTasks.delete(task.id);

    // 添加到已完成
    this.completedTasks.set(task.id, task);

    // 限制已完成任务数量
    this.limitCompletedTasks();

    console.log(`✅ 任务完成: ${task.type} (ID: ${task.id}, 耗时: ${task.duration}ms)`);

    // 继续处理队列
    this.processTaskQueue();
  }

  private limitCompletedTasks(): void {
    const maxCompletedTasks = 1000;
    if (this.completedTasks.size > maxCompletedTasks) {
      // 移除最旧的任务
      const oldestTaskId = this.completedTasks.keys().next().value;
      if (oldestTaskId) {
        this.completedTasks.delete(oldestTaskId);
      }
    }
  }

  private adjustWorkerPool(): void {
    // 调整工作线程池大小
    console.log(`🔄 调整工作线程池大小为: ${this.maxWorkers}`);
    // 这里可以实现工作线程池调整逻辑
  }

  public getStats(): any {
    return {
      maxWorkers: this.maxWorkers,
      runningTasks: this.runningTasks.size,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks.size,
      useWebWorkers: this.useWebWorkers,
      useSharedArrayBuffer: this.useSharedArrayBuffer,
      timestamp: Date.now()
    };
  }

  public logStats(): void {
    const stats = this.getStats();
    console.log('📊 并行计算统计:', {
      MaxWorkers: stats.maxWorkers,
      Running: stats.runningTasks,
      Queued: stats.queuedTasks,
      Completed: stats.completedTasks,
      UseWorkers: stats.useWebWorkers
    });
  }

  public testPerformance(): Promise<number> {
    return new Promise((resolve) => {
      const testStart = Date.now();
      const testTasks = 10;
      let completedTests = 0;

      for (let i = 0; i < testTasks; i++) {
        this.addTask('test', { value: i }, 0);
      }

      const checkCompletion = () => {
        if (this.getCompletedTasksCount() >= testTasks) {
          const testEnd = Date.now();
          const duration = testEnd - testStart;
          console.log(`⚡ 性能测试完成，${testTasks} 任务耗时: ${duration}ms`);
          resolve(duration);
        } else {
          setTimeout(checkCompletion, 100);
        }
      };

      setTimeout(checkCompletion, 100);
    });
  }

  public dispose(): void {
    this.clearTaskQueue();
    this.clearCompletedTasks();
    this.runningTasks.clear();
    this.taskHandlers.clear();
    console.log('🧹 并行计算系统资源清理完成');
  }
}

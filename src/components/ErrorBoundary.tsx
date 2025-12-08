import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      hasError: true,
      error,
      errorInfo
    });

    // 记录错误到控制台（生产环境可以发送到错误监控服务）
    console.error('Uncaught Error:', error, errorInfo);

    // 可以在这里添加错误上报逻辑
    // reportErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 使用自定义 fallback 或默认错误页面
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-[#050508] via-[#0a0a1a] to-[#151530] flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full bg-gray-900/80 backdrop-blur-lg border border-red-500/30 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* 错误图标 */}
            <div className="bg-red-500/20 px-6 py-8 text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 5, 0] }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="inline-block"
              >
                <div className="text-6xl mb-4">⚠️</div>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">系统出错了</h2>
              <p className="text-gray-400">抱歉，应用遇到了意外错误。</p>
            </div>

            {/* 错误详情 */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">错误信息</h3>
                <p className="text-red-400 font-mono text-sm break-all">
                  {this.state.error?.message || '未知错误'}
                </p>
              </div>

              {/* 仅在开发环境显示完整堆栈 */}
              {import.meta.env.DEV && this.state.errorInfo && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 max-h-60 overflow-auto">
                  <h3 className="text-lg font-semibold text-white mb-2">错误堆栈</h3>
                  <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex space-x-4 justify-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重试
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  返回首页
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* 调试信息 */}
          {import.meta.env.DEV && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 text-center text-gray-500 text-sm"
            >
              <p>开发环境：完整错误信息已记录到控制台</p>
            </motion.div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

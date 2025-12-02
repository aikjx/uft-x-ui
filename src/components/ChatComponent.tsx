import React, { useState } from 'react';
import { cn } from '../utils';

const ChatComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('发送消息:', message);
      setMessage('');
    }
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 聊天按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/30"
      >
        <span className="text-white text-2xl">💬</span>
      </button>
      
      {/* 聊天窗口 */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-gray-900 rounded-xl shadow-2xl shadow-blue-500/20 border border-gray-700 overflow-hidden animate-fade-in-down">
          {/* 聊天窗口头部 */}
          <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">智能助手</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* 聊天窗口内容 */}
          <div className="h-64 p-4 overflow-y-auto bg-gray-900">
            <div className="mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">AI</div>
                <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-gray-300">👋 Hi，想聊点什么～</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 聊天窗口输入 */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                placeholder="输入您的问题... (Enter 发送，Shift+Enter 换行)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                发送
              </button>
            </form>
            <p className="mt-2 text-xs text-gray-500 text-center">内容由AI生成，仅供参考</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
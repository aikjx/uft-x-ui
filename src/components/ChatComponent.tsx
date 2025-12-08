import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

const ChatComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  // 检测设备类型
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('发送消息:', message);
      setMessage('');
    }
  };
  
  // 移动端优化：点击外部关闭聊天窗口
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const chatElement = document.querySelector('.chat-component');
      if (chatElement && isOpen && !chatElement.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isMobile && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);
  
  return (
    <div className="fixed bottom-6 right-6 z-50 chat-component">
      {/* 聊天按钮 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: isOpen ? 0 : 0,
          rotate: isOpen ? 180 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-white text-2xl">{isOpen ? '✕' : '💬'}</span>
      </motion.button>
      
      {/* 聊天窗口 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.9,
          y: isOpen ? 0 : 20
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          'absolute bottom-20 right-0 bg-gray-900 rounded-xl shadow-2xl shadow-blue-500/20 border border-gray-700 overflow-hidden',
          isOpen ? 'block' : 'hidden',
          isMobile 
            ? 'w-[calc(100vw-3rem)] max-w-[320px] left-0 right-0 mx-auto' 
            : 'w-80'
        )}
      >
        {/* 聊天窗口头部 */}
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">智能助手</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* 聊天窗口内容 */}
        <div className={cn(
          'p-4 overflow-y-auto bg-gray-900',
          isMobile ? 'h-60' : 'h-64'
        )}>
          <div className="mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm shadow-lg shadow-blue-500/20">AI</div>
              <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm text-gray-300">👋 Hi，想聊点什么～</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 聊天窗口输入 */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <form onSubmit={handleSend} className="flex gap-2 flex-col sm:flex-row">
            <input
              type="text"
              placeholder={isMobile ? "输入您的问题..." : "输入您的问题... (Enter 发送，Shift+Enter 换行)"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30"
              disabled={!message.trim()}
              style={{ opacity: !message.trim() ? 0.6 : 1, cursor: !message.trim() ? 'not-allowed' : 'pointer' }}
            >
              发送
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-500 text-center">内容由AI生成，仅供参考</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatComponent;
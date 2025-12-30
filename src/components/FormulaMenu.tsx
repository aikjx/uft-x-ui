import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// 公式数据类型
interface Formula {
  id: number;
  name: string;
  expression: string;
  description: string;
}

interface FormulaMenuProps {
  formulas: Formula[];
  selectedFormula: Formula | null;
  onSelectFormula: (formula: Formula) => void;
  isOpen: boolean;
}

const FormulaMenu = React.memo(({ 
  formulas, 
  selectedFormula, 
  onSelectFormula,
  isOpen
}: FormulaMenuProps) => {
  // 搜索功能
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFormulas, setFilteredFormulas] = useState<Formula[]>(formulas);

  // 根据搜索词过滤公式 - 带防抖和优先级排序
  useEffect(() => {
    // 搜索防抖，延迟300ms执行搜索
    const searchTimer = setTimeout(() => {
      const term = searchTerm.trim().toLowerCase();
      
      if (term === '') {
        setFilteredFormulas(formulas);
        return;
      }
      
      // 高级搜索逻辑，带优先级排序
      const searchResults = formulas.map(formula => {
        let score = 0;
        
        // 精确匹配公式ID，优先级最高
        if (formula.id.toString() === term) {
          score += 100;
        }
        // 部分匹配公式ID
        else if (formula.id.toString().includes(term)) {
          score += 50;
        }
        
        // 精确匹配公式名称
        if (formula.name.toLowerCase() === term) {
          score += 90;
        }
        // 公式名称开头匹配
        else if (formula.name.toLowerCase().startsWith(term)) {
          score += 70;
        }
        // 公式名称包含匹配
        else if (formula.name.toLowerCase().includes(term)) {
          score += 40;
        }
        
        // 公式描述匹配
        if (formula.description.toLowerCase().includes(term)) {
          score += 20;
        }
        
        return { formula, score };
      })
      .filter(item => item.score > 0) // 只保留匹配结果
      .sort((a, b) => b.score - a.score) // 按匹配度降序排序
      .map(item => item.formula); // 提取公式对象
      
      setFilteredFormulas(searchResults);
    }, 300);
    
    return () => clearTimeout(searchTimer);
  }, [searchTerm, formulas]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed lg:relative top-0 left-0 w-72 h-full bg-gray-800/95 backdrop-blur-md border-r border-indigo-900/50 overflow-y-auto z-40 transition-all duration-300 shadow-xl"
        >
          {/* 顶部标题栏 */}
          <div className="sticky top-0 z-10 p-4 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-sm border-b border-indigo-700/50 shadow-lg">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            >
              统一场论公式集
            </motion.h2>
            <p className="text-xs text-center text-gray-400 mt-1">v3.0 | 共{formulas.length}个公式</p>
            
            {/* 搜索框 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative mt-4"
            >
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <i className="fa fa-search"></i>
              </span>
              <input
                type="text"
                placeholder="搜索公式..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-indigo-500/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </motion.div>
          </div>

          {/* 公式列表 */}
          <div className="p-3 space-y-2">
            {filteredFormulas.map((formula, index) => (
              <motion.div
              key={formula.id}
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ 
                delay: 0.03 * index, 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
              whileHover={{ 
                x: 8, 
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.96,
                backgroundColor: 'rgba(99, 102, 241, 0.2)'
              }}
              onClick={() => onSelectFormula(formula)}
              className={cn(
                "menu-item flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300",
                selectedFormula?.id === formula.id
                  ? "bg-gradient-to-r from-indigo-600/50 to-purple-600/50 border border-indigo-500/50 shadow-lg"
                  : "hover:bg-gray-700/50 border border-transparent"
              )}
            >
              <motion.div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 font-medium mr-3"
                whileHover={{ 
                  scale: 1.2, 
                  backgroundColor: 'rgba(99, 102, 241, 0.3)',
                  transition: { duration: 0.2 }
                }}
              >
                {formula.id}
              </motion.div>
              <div className="flex-grow">
                <h3 className="font-medium text-sm truncate">{formula.name}</h3>
              </div>
              {selectedFormula?.id === formula.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10 
                  }}
                  className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
                />
              )}
            </motion.div>
            ))}
          </div>

          {/* 底部信息 */}
          <div className="p-4 mt-auto bg-gray-800/80 border-t border-indigo-900/50">
            <p className="text-xs text-gray-400 text-center">
              张祥前统一场论可视化平台
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              &copy; {new Date().getFullYear()} 物理前沿探索
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default FormulaMenu;
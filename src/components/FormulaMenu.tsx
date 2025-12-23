import { useState, useEffect } from 'react';
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

const FormulaMenu: React.FC<FormulaMenuProps> = ({ 
  formulas, 
  selectedFormula, 
  onSelectFormula,
  isOpen
}) => {
  // 搜索功能
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFormulas, setFilteredFormulas] = useState<Formula[]>(formulas);

  // 根据搜索词过滤公式
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFormulas(formulas);
    } else {
      const filtered = formulas.filter(formula => 
        formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formula.id.toString().includes(searchTerm)
      );
      setFilteredFormulas(filtered);
    }
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ x: 5, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectFormula(formula)}
                className={cn(
                  "menu-item flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300",
                  selectedFormula?.id === formula.id
                    ? "bg-gradient-to-r from-indigo-600/50 to-purple-600/50 border border-indigo-500/50 shadow-lg"
                    : "hover:bg-gray-700/50 border border-transparent"
                )}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 font-medium mr-3">
                  {formula.id}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-sm truncate">{formula.name}</h3>
                </div>
                {selectedFormula?.id === formula.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-400"
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
};

export default FormulaMenu;
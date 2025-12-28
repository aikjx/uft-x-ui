import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
          <Route 
            path="/" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Home />
              </motion.div>
            } 
          />
          <Route 
            path="/other" 
            element={
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-center text-xl flex items-center justify-center h-screen"
              >
                Other Page - Coming Soon
              </motion.div>
            } 
          />
        </Routes>
      </AnimatePresence>
    </AuthContext.Provider>
  );
}

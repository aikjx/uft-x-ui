/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

function getPlugins() {
  const plugins = [react(), tsconfigPaths()];
  return plugins;
}

export default defineConfig({
  plugins: getPlugins(),
  optimizeDeps: {
    // Only scan index.html and source files for dependencies
    // This prevents Vite from scanning archived HTML files that might contain broken imports
    entries: ['index.html', 'src/**/*.{ts,tsx}'] 
  }
});

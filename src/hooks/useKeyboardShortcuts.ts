import { useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface UseKeyboardShortcutsProps {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  onToggleInfoPanel?: () => void;
  onToggleFullscreen?: () => void;
  onResetCamera?: () => void;
}

export const useKeyboardShortcuts = ({
  camera,
  controls,
  onToggleInfoPanel,
  onToggleFullscreen,
  onResetCamera
}: UseKeyboardShortcutsProps) => {
  // 键盘事件处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 防止在输入框中触发快捷键
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }
    
    switch (event.key.toLowerCase()) {
      case 'i':
        // 切换信息框显示/隐藏
        event.preventDefault();
        onToggleInfoPanel?.();
        break;
        
      case 'f':
        // 切换全屏模式
        event.preventDefault();
        onToggleFullscreen?.();
        break;
        
      case 'r':
        // 重置相机位置
        event.preventDefault();
        onResetCamera?.();
        break;
        
      case ' ': // 空格键
        // 切换自动旋转
        event.preventDefault();
        controls.autoRotate = !controls.autoRotate;
        break;
        
      case 'arrowup':
        // 向上移动相机
        event.preventDefault();
        camera.translateY(0.5);
        break;
        
      case 'arrowdown':
        // 向下移动相机
        event.preventDefault();
        camera.translateY(-0.5);
        break;
        
      case 'arrowleft':
        // 向左移动相机
        event.preventDefault();
        camera.translateX(-0.5);
        break;
        
      case 'arrowright':
        // 向右移动相机
        event.preventDefault();
        camera.translateX(0.5);
        break;
        
      case 'w':
        // 向前移动相机
        event.preventDefault();
        camera.translateZ(-0.5);
        break;
        
      case 's':
        // 向后移动相机
        event.preventDefault();
        camera.translateZ(0.5);
        break;
        
      case 'a':
        // 向左移动相机
        event.preventDefault();
        camera.translateX(-0.5);
        break;
        
      case 'd':
        // 向右移动相机
        event.preventDefault();
        camera.translateX(0.5);
        break;
        
      case 'q':
        // 向上移动相机
        event.preventDefault();
        camera.translateY(0.5);
        break;
        
      case 'e':
        // 向下移动相机
        event.preventDefault();
        camera.translateY(-0.5);
        break;
        
      case 'z':
        // 放大
        event.preventDefault();
        camera.zoom *= 1.1;
        camera.updateProjectionMatrix();
        break;
        
      case 'x':
        // 缩小
        event.preventDefault();
        camera.zoom *= 0.9;
        camera.updateProjectionMatrix();
        break;
        
      default:
        break;
    }
  }, [camera, controls, onToggleInfoPanel, onToggleFullscreen, onResetCamera]);
  
  // 添加键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

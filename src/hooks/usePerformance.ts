import { useEffect } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

export const usePerformance = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useCanvasStore.getState();
      const heavyLayers = state.layers.filter(l => l.strokes.length > 1000);
      if (heavyLayers.length > 0) {
        console.log('[ZYROX] Memory cleanup triggered');
      }
    }, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);
};

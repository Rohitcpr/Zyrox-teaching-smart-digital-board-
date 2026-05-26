import { useEffect, useRef } from "react";
import { useCanvasStore } from "../store/useCanvasStore";
import { useAppStore } from "../store/useAppStore";

export const usePerformance = () => {
  const memoryTimer = useRef<any>(null);

  useEffect(() => {
    // Clear old strokes from memory every 5 min
    memoryTimer.current = setInterval(() => {
      const store = useCanvasStore.getState();
      const layers = store.layers;
      // Keep max 1000 strokes per layer
      const optimized = layers.map((l) => ({
        ...l,
        strokes: l.strokes.slice(-1000),
      }));
      if (JSON.stringify(optimized) !== JSON.stringify(layers)) {
        useCanvasStore.setState({ layers: optimized });
      }
    }, 300000);

    return () => clearInterval(memoryTimer.current);
  }, []);
};

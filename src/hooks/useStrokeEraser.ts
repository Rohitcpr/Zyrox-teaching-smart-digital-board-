import { useCanvasStore } from '../store/useCanvasStore';
import { Point } from '../types/canvas.types';

export const useStrokeEraser = () => {
  const layers = useCanvasStore((s) => s.layers);
  const activeLayerId = useCanvasStore((s) => s.activeLayerId);

  const eraseStrokeAtPoint = (point: Point) => {
    const state = useCanvasStore.getState();
    const updatedLayers = state.layers.map((layer) => {
      if (!layer.visible || layer.locked) return layer;
      const filteredStrokes = layer.strokes.filter((stroke) => {
        return !stroke.points.some((p) => {
          const dx = p.x - point.x;
          const dy = p.y - point.y;
          return Math.sqrt(dx * dx + dy * dy) < 20;
        });
      });
      return { ...layer, strokes: filteredStrokes };
    });

    useCanvasStore.setState({
      layers: updatedLayers,
      isDirty: true,
    });
  };

  return { eraseStrokeAtPoint };
};

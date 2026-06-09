import { useRef } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

export const useTwoFingerGesture = () => {
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const touchStartRef = useRef<{ time: number; x: number; y: number }[]>([]);
  const gestureHandledRef = useRef(false);

  const onTouchStart = (evt: any) => {
    const touches = evt.nativeEvent.touches;
    gestureHandledRef.current = false;
    touchStartRef.current = Array.from(touches).map((t: any) => ({
      time: Date.now(),
      x: t.pageX,
      y: t.pageY,
    }));
  };

  const onTouchEnd = (evt: any): boolean => {
    const touches = evt.nativeEvent.changedTouches;
    
    // Only trigger if EXACTLY 2 fingers
    if (touchStartRef.current.length !== 2) return false;
    if (gestureHandledRef.current) return false;

    // Must be quick swipe < 400ms
    const elapsed = Date.now() - touchStartRef.current[0].time;
    if (elapsed > 400) return false;

    // Both fingers must have moved significantly (min 40px)
    const moved = touchStartRef.current.every((start, i) => {
      const t = Array.from(touches)[i] as any;
      if (!t) return false;
      const dx = t.pageX - start.x;
      const dy = t.pageY - start.y;
      return Math.sqrt(dx*dx + dy*dy) > 40;
    });

    if (!moved) return false;

    // Check direction — horizontal swipe only
    const dx0 = (Array.from(touches)[0] as any)?.pageX - touchStartRef.current[0].x;
    if (Math.abs(dx0) < 40) return false;

    gestureHandledRef.current = true;
    if (dx0 < 0) {
      undo();
    } else {
      redo();
    }
    return true;
  };

  return { onTouchStart, onTouchEnd };
};

import { useRef } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

export const useTwoFingerGesture = () => {
  const undo = useCanvasStore.getState().undo;
  const redo = useCanvasStore.getState().redo;
  const cancelStroke = useCanvasStore.getState().cancelStroke;
  
  const touchCount = useRef(0);
  const gestureHandled = useRef(false);

  const onTouchStart = (evt: any) => {
    touchCount.current = evt.nativeEvent.touches.length;
    gestureHandled.current = false;
  };

  const onTouchEnd = (evt: any) => {
    const count = touchCount.current;
    
    if (count === 2 && !gestureHandled.current) {
      gestureHandled.current = true;
      cancelStroke();
      undo();
      return true;
    }
    
    if (count === 3 && !gestureHandled.current) {
      gestureHandled.current = true;
      cancelStroke();
      redo();
      return true;
    }
    
    return false;
  };

  return { onTouchStart, onTouchEnd };
};

import { useRef } from 'react';

// Palm rejection — agar touch area bahut bada ho toh ignore karo
// Android pe haath canvas ko touch karta hai toh random strokes bante hain

const MAX_TOUCH_SIZE = 40; // pixels — finger se bada = palm

export const usePalmRejection = () => {
  const isRejected = useRef(false);

  const shouldReject = (evt: any): boolean => {
    const { touchHistory } = evt;
    
    // Multiple touches = pan/zoom gesture ya palm
    if (touchHistory && Object.keys(touchHistory.touchBank).length > 1) {
      isRejected.current = true;
      return true;
    }

    // Touch size check
    const touch = evt.nativeEvent;
    if (touch.touchMajor && touch.touchMajor > MAX_TOUCH_SIZE) {
      isRejected.current = true;
      return true;
    }

    isRejected.current = false;
    return false;
  };

  const reset = () => {
    isRejected.current = false;
  };

  return { shouldReject, reset, isRejected };
};

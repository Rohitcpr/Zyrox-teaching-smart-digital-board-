import { InteractionManager } from 'react-native';

// Defer heavy operations after animations
export const runAfterInteractions = (fn: () => void) => {
  InteractionManager.runAfterInteractions(fn);
};

// Throttle function — limit how often a function runs
export const throttle = <T extends (...args: any[]) => any>(fn: T, limit: number): T => {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn(...args);
    }
  }) as T;
};

// Debounce — wait until user stops
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
};

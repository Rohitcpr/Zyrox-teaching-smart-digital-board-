import { useRef } from 'react';
import { PanResponder, Animated, useWindowDimensions } from 'react-native';

export const useDraggable = (initialX: number, initialY: number) => {
  const { width, height } = useWindowDimensions();
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const currentPos = useRef({ x: initialX, y: initialY });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        pan.setOffset({ x: currentPos.current.x, y: currentPos.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        const newX = Math.max(0, Math.min(currentPos.current.x + gs.dx, width - 70));
        const newY = Math.max(60, Math.min(currentPos.current.y + gs.dy, height - 70));
        currentPos.current = { x: newX, y: newY };
        pan.setValue({ x: newX, y: newY });
      },
    })
  ).current;

  return { pan, panResponder, currentPos };
};

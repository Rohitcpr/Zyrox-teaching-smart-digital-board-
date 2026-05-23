import { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

export const useZoomPan = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const scaleValue = useRef(1);
  const txValue = useRef(0);
  const tyValue = useRef(0);
  const lastScale = useRef(1);
  const lastTx = useRef(0);
  const lastTy = useRef(0);
  const initialDistance = useRef<number | null>(null);
  const initialMidX = useRef(0);
  const initialMidY = useRef(0);
  const isZooming = useRef(false);

  const getDistance = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getMid = (touches: any[]) => ({
    x: (touches[0].pageX + touches[1].pageX) / 2,
    y: (touches[0].pageY + touches[1].pageY) / 2,
  });

  const resetZoom = () => {
    scaleValue.current = 1;
    txValue.current = 0;
    tyValue.current = 0;
    lastScale.current = 1;
    lastTx.current = 0;
    lastTy.current = 0;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) =>
      evt.nativeEvent.touches.length === 2,
    onMoveShouldSetPanResponder: (evt) =>
      evt.nativeEvent.touches.length === 2,

    onPanResponderGrant: (evt) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 2) {
        isZooming.current = true;
        initialDistance.current = getDistance(touches);
        const mid = getMid(touches);
        initialMidX.current = mid.x;
        initialMidY.current = mid.y;
      }
    },

    onPanResponderMove: (evt) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 2 && initialDistance.current) {
        const newDist = getDistance(touches);
        const newScale = Math.max(0.3, Math.min(8, lastScale.current * (newDist / initialDistance.current)));
        const mid = getMid(touches);
        const newTx = lastTx.current + (mid.x - initialMidX.current);
        const newTy = lastTy.current + (mid.y - initialMidY.current);

        scaleValue.current = newScale;
        txValue.current = newTx;
        tyValue.current = newTy;

        scale.setValue(newScale);
        translateX.setValue(newTx);
        translateY.setValue(newTy);
      }
    },

    onPanResponderRelease: () => {
      lastScale.current = scaleValue.current;
      lastTx.current = txValue.current;
      lastTy.current = tyValue.current;
      initialDistance.current = null;
      isZooming.current = false;
    },
  });

  return { scale, translateX, translateY, panResponder, resetZoom, isZooming };
};

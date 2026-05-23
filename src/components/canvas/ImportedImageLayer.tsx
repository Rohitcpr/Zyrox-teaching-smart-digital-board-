import React, { useRef, useState } from 'react';
import {
  Animated, PanResponder, View, StyleSheet,
  TouchableOpacity, Image, useWindowDimensions, Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  uri: string;
  name?: string;
  onRemove: () => void;
}

export const ImportedImageLayer: React.FC<Props> = ({ uri, name, onRemove }) => {
  const { width, height } = useWindowDimensions();
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [, forceUpdate] = useState(0);

  const sizeRef = useRef({ w: width * 0.85, h: height * 0.55 });
  const aspectRatio = useRef((width * 0.85) / (height * 0.55));
  const isLockedRef = useRef(false);

  const pan = useRef(new Animated.ValueXY({ x: (width - width * 0.85) / 2, y: 80 })).current;
  const currentPos = useRef({ x: (width - width * 0.85) / 2, y: 80 });
  const lastPinchDist = useRef(null);
  const isPinching = useRef(false);

  const getDist = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isLockedRef.current === false,
      onMoveShouldSetPanResponder: () => isLockedRef.current === false,
      onPanResponderGrant: (e) => {
        if (e.nativeEvent.touches.length === 1) {
          pan.setOffset({ x: currentPos.current.x, y: currentPos.current.y });
          pan.setValue({ x: 0, y: 0 });
          setIsDragging(true);
        }
      },
      onPanResponderMove: (e, gs) => {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2) {
          isPinching.current = true;
          const dist = getDist(Array.from(touches));
          if (lastPinchDist.current !== null) {
            const ratio = dist / lastPinchDist.current;
            const newW = Math.max(80, Math.min(width * 3, sizeRef.current.w * ratio));
            sizeRef.current = { w: newW, h: newW / aspectRatio.current };
            forceUpdate((n) => n + 1);
          }
          lastPinchDist.current = dist;
        } else if (touches.length === 1 && isPinching.current === false) {
          Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(e, gs);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (isPinching.current === false) {
          pan.flattenOffset();
          currentPos.current = {
            x: currentPos.current.x + gs.dx,
            y: currentPos.current.y + gs.dy,
          };
        }
        isPinching.current = false;
        lastPinchDist.current = null;
        setIsDragging(false);
      },
    })
  ).current;

  const cornerRef = useRef({ startW: 0 });
  const cornerResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { cornerRef.current.startW = sizeRef.current.w; },
      onPanResponderMove: (_, gs) => {
        const newW = Math.max(80, Math.min(width * 3, cornerRef.current.startW + gs.dx));
        sizeRef.current = { w: newW, h: newW / aspectRatio.current };
        forceUpdate((n) => n + 1);
      },
    })
  ).current;

  const handleFit = () => {
    sizeRef.current = { w: width, h: width / aspectRatio.current };
    pan.setValue({ x: 0, y: 0 });
    currentPos.current = { x: 0, y: 0 };
    forceUpdate((n) => n + 1);
  };
  const handleShrink = () => {
    const newW = Math.max(80, sizeRef.current.w - 80);
    sizeRef.current = { w: newW, h: newW / aspectRatio.current };
    forceUpdate((n) => n + 1);
  };
  const handleGrow = () => {
    const newW = Math.min(sizeRef.current.w + 80, width * 3);
    sizeRef.current = { w: newW, h: newW / aspectRatio.current };
    forceUpdate((n) => n + 1);
  };
  const handleLock = () => {
    isLockedRef.current = isLockedRef.current === false;
    setIsLocked(isLockedRef.current);
  };
  const handleOpacity = () =>
    setOpacity((o) => parseFloat((o <= 0.25 ? 1 : o - 0.25).toFixed(2)));

  const { w, h } = sizeRef.current;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        isDragging && styles.dragging,
      ]}
      {...panResponder.panHandlers}
    >
      {showControls && (
        <View pointerEvents="none" style={[styles.selectionBorder, { width: w, height: h }]} />
      )}
      <TouchableOpacity activeOpacity={1} onPress={() => setShowControls((s) => s === false)}>
        <Image source={{ uri }} style={{ width: w, height: h, borderRadius: 4, opacity }} resizeMode="contain" />
      </TouchableOpacity>

      {showControls && isLocked === false && (
        <View {...cornerResponder.panHandlers} style={styles.cornerHandle}>
          <Ionicons name="resize" size={12} color="#fff" />
        </View>
      )}

      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleFit} style={styles.ctrlBtn}>
            <Ionicons name="scan-outline" size={13} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShrink} style={styles.ctrlBtn}>
            <Ionicons name="remove" size={13} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleGrow} style={styles.ctrlBtn}>
            <Ionicons name="add" size={13} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpacity} style={styles.ctrlBtn}>
            <Ionicons name="eye-outline" size={13} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLock} style={[styles.ctrlBtn, isLocked && styles.lockActive]}>
            <Ionicons name={isLocked ? 'lock-closed' : 'lock-open'} size={13} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRemove} style={[styles.ctrlBtn, styles.deleteBtn]}>
            <Ionicons name="trash" size={13} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {isDragging && (
        <View style={styles.sizeTag}>
          <Text style={styles.sizeText}>{Math.round(w)} x {Math.round(h)}</Text>
        </View>
      )}
      {showControls && name && (
        <View style={styles.nameTag}>
          <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
        </View>
      )}
      {opacity < 1 && (
        <View style={styles.opacityBadge}>
          <Text style={styles.opacityText}>{Math.round(opacity * 100)}%</Text>
        </View>
      )}
      {isLocked && (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={10} color="#F59E0B" />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 5 },
  dragging: { opacity: 0.8 },
  selectionBorder: { position: 'absolute', borderWidth: 1.5, borderColor: 'rgba(124,58,237,0.7)', borderRadius: 4, borderStyle: 'dashed', zIndex: 1 },
  cornerHandle: { position: 'absolute', bottom: -12, right: -12, width: 28, height: 28, backgroundColor: 'rgba(124,58,237,0.95)', borderRadius: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', zIndex: 10 },
  controls: { position: 'absolute', top: -36, right: 0, flexDirection: 'row', gap: 4 },
  ctrlBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(124,58,237,0.85)', alignItems: 'center', justifyContent: 'center' },
  lockActive: { backgroundColor: '#F59E0B' },
  deleteBtn: { backgroundColor: '#EF4444' },
  sizeTag: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(10,10,20,0.75)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  sizeText: { fontSize: 9, color: '#fff', fontWeight: '600' },
  nameTag: { position: 'absolute', bottom: -22, left: 0, backgroundColor: 'rgba(10,10,20,0.75)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, maxWidth: 200 },
  nameText: { fontSize: 9, color: 'rgba(255,255,255,0.75)' },
  opacityBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(10,10,20,0.75)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  opacityText: { fontSize: 9, color: '#fff', fontWeight: '600' },
  lockBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(245,158,11,0.15)', padding: 4, borderRadius: 6 },
});

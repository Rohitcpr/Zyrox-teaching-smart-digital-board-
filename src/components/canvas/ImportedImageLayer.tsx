import React, { useRef, useState, useCallback } from 'react';
import {
  Animated, PanResponder, View, StyleSheet,
  Image, useWindowDimensions, Text, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  id: string;
  uri: string;
  editMode: boolean;
  onRemove: (id: string) => void;
}

export const ImportedImageLayer: React.FC<Props> = ({ id, uri, editMode, onRemove }) => {
  const { width, height } = useWindowDimensions();
  const [imgW, setImgW] = useState(width);
  const [imgH, setImgH] = useState(height * 0.55);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 50 })).current;
  const posRef = useRef({ x: 0, y: 50 });
  const sizeRef = useRef({ w: width, h: height * 0.55 });
  const lastPinchRef = useRef<number | null>(null);
  const isActive = useRef(false);

  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return null;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        if (!editMode) return false;
        isActive.current = true;
        return true;
      },
      onStartShouldSetPanResponderCapture: () => editMode,
      onMoveShouldSetPanResponder: () => editMode && isActive.current,
      onMoveShouldSetPanResponderCapture: () => editMode && isActive.current,

      onPanResponderGrant: (evt) => {
        if (!editMode) return;
        const touches = Array.from(evt.nativeEvent.touches);
        if (touches.length === 2) {
          lastPinchRef.current = getDistance(touches);
          sizeRef.current = { w: imgW, h: imgH };
        } else {
          pan.setOffset({ x: posRef.current.x, y: posRef.current.y });
          pan.setValue({ x: 0, y: 0 });
        }
      },

      onPanResponderMove: (evt, gs) => {
        if (!editMode) return;
        const touches = Array.from(evt.nativeEvent.touches);
        if (touches.length === 2) {
          const dist = getDistance(touches);
          if (dist && lastPinchRef.current) {
            const scale = dist / lastPinchRef.current;
            setImgW(Math.max(80, Math.min(sizeRef.current.w * scale, width * 2)));
            setImgH(Math.max(60, Math.min(sizeRef.current.h * scale, height * 2)));
          }
        } else if (touches.length === 1) {
          pan.x.setValue(gs.dx);
          pan.y.setValue(gs.dy);
        }
      },

      onPanResponderRelease: (_, gs) => {
        isActive.current = false;
        pan.flattenOffset();
        posRef.current.x += gs.dx;
        posRef.current.y += gs.dy;
        lastPinchRef.current = null;
      },

      onPanResponderTerminate: () => {
        isActive.current = false;
        pan.flattenOffset();
        lastPinchRef.current = null;
      },
    })
  ).current;

  const handleRemove = useCallback(() => {
    // Fully reset all state before removing
    isActive.current = false;
    lastPinchRef.current = null;
    pan.setValue({ x: 0, y: 0 });
    pan.setOffset({ x: 0, y: 0 });
    onRemove(id);
  }, [id, onRemove]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        editMode && styles.editActive,
      ]}
      {...(editMode ? panResponder.panHandlers : {})}
      pointerEvents={editMode ? 'box-only' : 'none'}
    >
      <Image
        source={{ uri }}
        style={{ width: imgW, height: imgH }}
        resizeMode="contain"
      />

      {editMode && (
        <>
          {/* Corner handles */}
          <View style={[styles.handle, styles.handleTL]} />
          <View style={[styles.handle, styles.handleTR]} />
          <View style={[styles.handle, styles.handleBL]} />
          <View style={[styles.handle, styles.handleBR]} />

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => { setImgW(width); setImgH(height * 0.6); pan.setValue({ x: 0, y: 0 }); posRef.current = { x: 0, y: 0 }; }}
              style={styles.ctrlBtn}
            >
              <Ionicons name="scan-outline" size={13} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRemove} style={[styles.ctrlBtn, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="trash" size={13} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.editTag}>
            <Text style={styles.editTagText}>EDIT — Drag/Pinch to resize</Text>
          </View>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 5 },
  editActive: { borderWidth: 1.5, borderColor: 'rgba(59,130,246,0.70)', borderRadius: 6 },
  handle: { position: 'absolute', width: 12, height: 12, borderRadius: 3, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#fff' },
  handleTL: { top: -6, left: -6 },
  handleTR: { top: -6, right: -6 },
  handleBL: { bottom: -6, left: -6 },
  handleBR: { bottom: -6, right: -6 },
  controls: { position: 'absolute', top: -34, right: 0, flexDirection: 'row', gap: 4 },
  ctrlBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(124,58,237,0.90)', alignItems: 'center', justifyContent: 'center' },
  editTag: { position: 'absolute', bottom: -24, left: 0, right: 0, alignItems: 'center' },
  editTagText: { fontSize: 9, color: 'rgba(59,130,246,0.90)', fontWeight: '700' },
});

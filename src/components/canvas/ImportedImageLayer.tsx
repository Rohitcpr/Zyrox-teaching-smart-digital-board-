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
  const lastPinchRef = useRef<number | null>(null);
  const baseSizeRef = useRef({ w: width, h: height * 0.55 });

  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return null;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const editModeRef = useRef(editMode);
  editModeRef.current = editMode;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editModeRef.current,
      onStartShouldSetPanResponderCapture: () => editModeRef.current,
      onMoveShouldSetPanResponder: () => editModeRef.current,
      onMoveShouldSetPanResponderCapture: () => editModeRef.current,

      onPanResponderGrant: (evt) => {
        if (!editModeRef.current) return;
        const touches = Array.from(evt.nativeEvent.touches);
        if (touches.length >= 2) {
          lastPinchRef.current = getDistance(touches);
          baseSizeRef.current = { w: imgW, h: imgH };
        } else {
          pan.setOffset({ x: posRef.current.x, y: posRef.current.y });
          pan.setValue({ x: 0, y: 0 });
        }
      },

      onPanResponderMove: (evt, gs) => {
        if (!editModeRef.current) return;
        const touches = Array.from(evt.nativeEvent.touches);
        if (touches.length >= 2) {
          const dist = getDistance(touches);
          if (dist && lastPinchRef.current) {
            const scale = dist / lastPinchRef.current;
            setImgW(Math.max(80, Math.min(baseSizeRef.current.w * scale, width * 2)));
            setImgH(Math.max(60, Math.min(baseSizeRef.current.h * scale, height * 2)));
          }
        } else {
          pan.x.setValue(gs.dx);
          pan.y.setValue(gs.dy);
        }
      },

      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        posRef.current.x += gs.dx;
        posRef.current.y += gs.dy;
        lastPinchRef.current = null;
      },

      onPanResponderTerminate: () => {
        pan.flattenOffset();
        lastPinchRef.current = null;
      },
    })
  ).current;

  const handleRemove = useCallback(() => {
    lastPinchRef.current = null;
    onRemove(id);
  }, [id, onRemove]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        editMode && styles.editBorder,
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
          <View style={[styles.handle, styles.tl]} />
          <View style={[styles.handle, styles.tr]} />
          <View style={[styles.handle, styles.bl]} />
          <View style={[styles.handle, styles.br]} />
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => {
                setImgW(width);
                setImgH(height * 0.6);
                pan.setValue({ x: 0, y: 0 });
                posRef.current = { x: 0, y: 0 };
              }}
              style={styles.ctrlBtn}
            >
              <Ionicons name="scan-outline" size={13} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRemove} style={[styles.ctrlBtn, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="trash" size={13} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.editHint}>Drag to move • Pinch to resize</Text>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 5 },
  editBorder: { borderWidth: 1.5, borderColor: 'rgba(59,130,246,0.70)', borderRadius: 6 },
  handle: { position: 'absolute', width: 12, height: 12, borderRadius: 3, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#fff' },
  tl: { top: -6, left: -6 },
  tr: { top: -6, right: -6 },
  bl: { bottom: -6, left: -6 },
  br: { bottom: -6, right: -6 },
  controls: { position: 'absolute', top: -34, right: 0, flexDirection: 'row', gap: 4 },
  ctrlBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(124,58,237,0.90)', alignItems: 'center', justifyContent: 'center' },
  editHint: { position: 'absolute', bottom: -22, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: 'rgba(59,130,246,0.80)', fontWeight: '600' },
});

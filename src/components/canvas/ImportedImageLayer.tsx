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

export const ImportedImageLayer: React.FC<Props> = ({ uri, onRemove }) => {
  const { width, height } = useWindowDimensions();
  const [imgW, setImgW] = useState(width);
  const [imgH, setImgH] = useState(height * 0.55);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 50 })).current;
  const posRef = useRef({ x: 0, y: 50 });
  const dragEnabled = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      // CRITICAL: Only capture touch when drag is enabled
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => dragEnabled.current,
      onMoveShouldSetPanResponderCapture: () => false,

      onPanResponderGrant: () => {
        pan.setOffset({ x: posRef.current.x, y: posRef.current.y });
        pan.setValue({ x: 0, y: 0 });
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        posRef.current = {
          x: posRef.current.x + gs.dx,
          y: posRef.current.y + gs.dy,
        };
        dragEnabled.current = false;
        setIsDragging(false);
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        dragEnabled.current = false;
        setIsDragging(false);
      },
    })
  ).current;

  const handleLongPress = () => {
    dragEnabled.current = true;
    setIsDragging(true);
  };

  const fitScreen = () => {
    setImgW(width);
    setImgH(height * 0.6);
    pan.setValue({ x: 0, y: 0 });
    posRef.current = { x: 0, y: 0 };
  };

  const handleRemove = () => {
    // Reset drag state before removing
    dragEnabled.current = false;
    setIsDragging(false);
    pan.setValue({ x: 0, y: 0 });
    onRemove();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        isDragging && styles.dragging,
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <Image
          source={{ uri }}
          style={[styles.image, { width: imgW, height: imgH }]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Drag handle — always visible */}
      <View style={styles.dragHandle} {...panResponder.panHandlers}>
        <Ionicons name="reorder-three" size={18} color="rgba(255,255,255,0.6)" />
      </View>

      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={fitScreen} style={styles.ctrlBtn}>
            <Ionicons name="scan-outline" size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setImgW(w => Math.max(w - 60, 100)); setImgH(h => Math.max(h - 40, 80)); }} style={styles.ctrlBtn}>
            <Ionicons name="remove" size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setImgW(w => Math.min(w + 60, width * 1.5)); setImgH(h => Math.min(h + 40, height)); }} style={styles.ctrlBtn}>
            <Ionicons name="add" size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRemove} style={[styles.ctrlBtn, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="trash" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {isDragging && (
        <View style={styles.dragTag}>
          <Ionicons name="move" size={10} color="#3B82F6" />
          <Text style={styles.dragTagText}>Moving</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 5,
  },
  dragging: { opacity: 0.85 },
  image: { borderRadius: 4 },
  dragHandle: {
    position: 'absolute',
    bottom: -22, left: '50%',
    transform: [{ translateX: -20 }],
    width: 40, height: 20,
    backgroundColor: 'rgba(10,10,20,0.75)',
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    top: -34, right: 0,
    flexDirection: 'row', gap: 4,
  },
  ctrlBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: 'rgba(124,58,237,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  dragTag: {
    position: 'absolute', top: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(59,130,246,0.85)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6,
  },
  dragTagText: { fontSize: 9, color: '#fff', fontWeight: '700' },
});

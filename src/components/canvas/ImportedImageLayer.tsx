import React, { useRef, useState } from 'react';
import {
  Animated, PanResponder, View, StyleSheet,
  TouchableOpacity, Image, useWindowDimensions,
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
  const [imgH, setImgH] = useState(height * 0.6);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 60 })).current;
  const currentPos = useRef({ x: 0, y: 60 });

  // Long press timer for drag activation
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragEnabled = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => dragEnabled.current,

      onPanResponderGrant: () => {
        pan.setOffset({ x: currentPos.current.x, y: currentPos.current.y });
        pan.setValue({ x: 0, y: 0 });
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        currentPos.current = {
          x: currentPos.current.x + gs.dx,
          y: currentPos.current.y + gs.dy,
        };
        dragEnabled.current = false;
        setIsDragging(false);
      },
    })
  ).current;

  const handleLongPress = () => {
    dragEnabled.current = true;
    setIsDragging(true);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        isDragging && styles.dragging,
      ]}
    >
      {/* Image — not interactive for drawing */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
        onLongPress={handleLongPress}
        delayLongPress={600}
      >
        <Image
          source={{ uri }}
          style={[styles.image, { width: imgW, height: imgH }]}
          resizeMode="contain"
          pointerEvents="none"
        />
      </TouchableOpacity>

      {/* Long press drag handle */}
      <View {...panResponder.panHandlers} style={styles.dragHandle}>
        <Ionicons name="reorder-three" size={16} color="rgba(255,255,255,0.5)" />
      </View>

      {/* Controls */}
      {showControls && (
        <View style={styles.controls}>
          {/* Fit screen */}
          <TouchableOpacity
            onPress={() => { setImgW(width); setImgH(height * 0.65); pan.setValue({ x: 0, y: 0 }); currentPos.current = { x: 0, y: 0 }; }}
            style={styles.ctrlBtn}
          >
            <Ionicons name="scan-outline" size={13} color="#fff" />
          </TouchableOpacity>
          {/* Smaller */}
          <TouchableOpacity onPress={() => { setImgW((w) => Math.max(w - 60, 120)); setImgH((h) => Math.max(h - 40, 80)); }} style={styles.ctrlBtn}>
            <Ionicons name="remove" size={13} color="#fff" />
          </TouchableOpacity>
          {/* Larger */}
          <TouchableOpacity onPress={() => { setImgW((w) => Math.min(w + 60, width * 1.5)); setImgH((h) => Math.min(h + 40, height)); }} style={styles.ctrlBtn}>
            <Ionicons name="add" size={13} color="#fff" />
          </TouchableOpacity>
          {/* Delete */}
          <TouchableOpacity onPress={onRemove} style={[styles.ctrlBtn, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="trash" size={13} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {isDragging && (
        <View style={styles.dragIndicator}>
          <Ionicons name="move" size={12} color="#3B82F6" />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 5 },
  dragging: { opacity: 0.85 },
  image: { borderRadius: 4 },
  dragHandle: {
    position: 'absolute', bottom: -20, left: '50%',
    transform: [{ translateX: -16 }],
    width: 32, height: 18,
    backgroundColor: 'rgba(10,10,20,0.70)',
    borderRadius: 6, alignItems: 'center', justifyContent: 'center',
  },
  controls: {
    position: 'absolute', top: -32, right: 0,
    flexDirection: 'row', gap: 4,
  },
  ctrlBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(124,58,237,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  dragIndicator: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: 'rgba(59,130,246,0.80)',
    paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: 6,
  },
});

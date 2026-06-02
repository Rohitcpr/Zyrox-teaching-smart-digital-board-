import React, { useRef, useState } from 'react';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props { onClose: () => void; }

export const SpotlightTool: React.FC<Props> = ({ onClose }) => {
  const { width, height } = useWindowDimensions();
  const [size, setSize] = useState(140);
  const pan = useRef(new Animated.ValueXY({ x: width/2 - 70, y: height/2 - 70 })).current;
  const pos = useRef({ x: width/2 - 70, y: height/2 - 70 });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({ x: pos.current.x, y: pos.current.y });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gs) => {
      pan.flattenOffset();
      pos.current = { x: pos.current.x + gs.dx, y: pos.current.y + gs.dy };
    },
  })).current;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 150 }]} pointerEvents="box-none">
      {/* Dark overlay with hole */}
      <View style={[styles.darkOverlay, { width, height }]} pointerEvents="none" />

      {/* Spotlight circle */}
      <Animated.View
        style={[
          styles.spotlight,
          { width: size, height: size, borderRadius: size/2,
            transform: [{ translateX: pan.x }, { translateY: pan.y }] }
        ]}
        {...panResponder.panHandlers}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setSize(s => Math.max(60, s-20))} style={styles.ctrlBtn}>
          <Ionicons name="remove" size={14} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.sizeText}>{size}</Text>
        <TouchableOpacity onPress={() => setSize(s => Math.min(350, s+20))} style={styles.ctrlBtn}>
          <Ionicons name="add" size={14} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={[styles.ctrlBtn, { backgroundColor: '#EF4444' }]}>
          <Ionicons name="close" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  darkOverlay: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.78)' },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#fff',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  controls: {
    position: 'absolute', bottom: 80, right: 16,
    flexDirection: 'row', alignItems: 'center',
    gap: 8, backgroundColor: 'rgba(10,10,20,0.85)',
    padding: 8, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  ctrlBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(124,58,237,0.80)', alignItems: 'center', justifyContent: 'center' },
  sizeText: { color: '#fff', fontSize: 12, fontWeight: '700', minWidth: 30, textAlign: 'center' },
});

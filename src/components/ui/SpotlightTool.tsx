import React, { useRef, useState } from 'react';
import { View, StyleSheet, Animated, PanResponder, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props { onClose: () => void; }

export const SpotlightTool: React.FC<Props> = ({ onClose }) => {
  const { width, height } = useWindowDimensions();
  const [size, setSize] = useState(120);
  const pan = useRef(new Animated.ValueXY({ x: width / 2 - 60, y: height / 2 - 60 })).current;
  const pos = useRef({ x: width / 2 - 60, y: height / 2 - 60 });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { pan.setOffset({ x: pos.current.x, y: pos.current.y }); pan.setValue({ x: 0, y: 0 }); },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gs) => { pan.flattenOffset(); pos.current = { x: pos.current.x + gs.dx, y: pos.current.y + gs.dy }; },
  })).current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={[styles.dark, { width, height }]} pointerEvents="none" />
      <Animated.View style={[styles.spotlight, { width: size, height: size, borderRadius: size / 2, transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} {...panResponder.panHandlers} />
      <View style={styles.controls} pointerEvents="box-none">
        <TouchableOpacity onPress={() => setSize(s => Math.max(s - 20, 60))} style={styles.ctrlBtn}><Ionicons name="remove" size={14} color="#fff" /></TouchableOpacity>
        <TouchableOpacity onPress={() => setSize(s => Math.min(s + 20, 300))} style={styles.ctrlBtn}><Ionicons name="add" size={14} color="#fff" /></TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={[styles.ctrlBtn, { backgroundColor: '#EF4444' }]}><Ionicons name="close" size={14} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dark: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.75)' },
  spotlight: { position: 'absolute', backgroundColor: 'transparent', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', shadowColor: '#fff', shadowOpacity: 0.5, shadowRadius: 20, elevation: 20 },
  controls: { position: 'absolute', bottom: 60, right: 16, gap: 8 },
  ctrlBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(124,58,237,0.85)', alignItems: 'center', justifyContent: 'center' },
});

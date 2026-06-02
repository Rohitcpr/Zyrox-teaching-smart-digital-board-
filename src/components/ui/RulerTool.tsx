import React, { useRef, useState } from 'react';
import { Animated, PanResponder, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT } from '../../constants/colors';

interface Props { onClose: () => void; }

export const RulerTool: React.FC<Props> = ({ onClose }) => {
  const pan = useRef(new Animated.ValueXY({ x: 40, y: 200 })).current;
  const pos = useRef({ x: 40, y: 200 });
  const [rotation, setRotation] = useState(0);

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

  const marks = Array.from({ length: 21 }, (_, i) => i);

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: `${rotation}deg` }] }
    ]} {...panResponder.panHandlers}>
      <View style={styles.rulerBody}>
        {marks.map((i) => (
          <View key={i} style={styles.markGroup}>
            <View style={[styles.mark, { height: i % 5 === 0 ? 18 : i % 2 === 0 ? 12 : 8 }]} />
            {i % 5 === 0 && <Text style={styles.markLabel}>{i}</Text>}
          </View>
        ))}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setRotation(r => r - 15)} style={styles.ctrlBtn}>
          <Ionicons name="arrow-undo" size={12} color="#5C4000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRotation(r => r + 15)} style={styles.ctrlBtn}>
          <Ionicons name="arrow-redo" size={12} color="#5C4000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={[styles.ctrlBtn, { backgroundColor: '#EF4444' }]}>
          <Ionicons name="close" size={12} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 200 },
  rulerBody: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: 'rgba(250,240,180,0.95)',
    borderRadius: 4, paddingHorizontal: 4,
    paddingBottom: 4, borderWidth: 1.5,
    borderColor: '#B8860B', height: 52,
  },
  markGroup: { width: 16, alignItems: 'center', justifyContent: 'flex-end', height: 44 },
  mark: { width: 1.5, backgroundColor: '#5C4000' },
  markLabel: { fontSize: 7, color: '#5C4000', fontWeight: '700', marginTop: 2 },
  controls: {
    position: 'absolute', top: -28, right: 0,
    flexDirection: 'row', gap: 4,
  },
  ctrlBtn: {
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: 'rgba(250,240,180,0.95)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#B8860B',
  },
});

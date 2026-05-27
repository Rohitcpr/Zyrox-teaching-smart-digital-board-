import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT } from '../../constants/colors';

interface Props { onClose: () => void; }

export const RulerTool: React.FC<Props> = ({ onClose }) => {
  const pan = useRef(new Animated.ValueXY({ x: 40, y: 200 })).current;
  const pos = useRef({ x: 40, y: 200 });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { pan.setOffset({ x: pos.current.x, y: pos.current.y }); pan.setValue({ x: 0, y: 0 }); },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gs) => { pan.flattenOffset(); pos.current = { x: pos.current.x + gs.dx, y: pos.current.y + gs.dy }; },
  })).current;

  const marks = Array.from({ length: 21 }, (_, i) => i);

  return (
    <Animated.View style={[styles.ruler, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} {...panResponder.panHandlers}>
      <View style={styles.rulerBody}>
        {marks.map((i) => (
          <View key={i} style={styles.markGroup}>
            <View style={[styles.mark, { height: i % 5 === 0 ? 16 : 8 }]} />
            {i % 5 === 0 && <Text style={styles.markLabel}>{i}</Text>}
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Ionicons name="close" size={12} color={TEXT.secondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ruler: { position: 'absolute', zIndex: 200, flexDirection: 'row', alignItems: 'flex-end' },
  rulerBody: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'rgba(250,240,180,0.92)', borderRadius: 4, paddingHorizontal: 4, paddingBottom: 4, borderWidth: 1, borderColor: '#B8860B', height: 44 },
  markGroup: { width: 16, alignItems: 'center', justifyContent: 'flex-end', height: 36 },
  mark: { width: 1.5, backgroundColor: '#5C4000' },
  markLabel: { fontSize: 7, color: '#5C4000', fontWeight: '700', marginTop: 1 },
  closeBtn: { position: 'absolute', top: -10, right: -10, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(10,10,20,0.90)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
});

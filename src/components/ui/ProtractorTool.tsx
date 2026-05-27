import React, { useRef } from 'react';
import { Animated, PanResponder, TouchableOpacity, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { TEXT } from '../../constants/colors';

interface Props { onClose: () => void; }

export const ProtractorTool: React.FC<Props> = ({ onClose }) => {
  const pan = useRef(new Animated.ValueXY({ x: 80, y: 150 })).current;
  const pos = useRef({ x: 80, y: 150 });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { pan.setOffset({ x: pos.current.x, y: pos.current.y }); pan.setValue({ x: 0, y: 0 }); },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gs) => { pan.flattenOffset(); pos.current = { x: pos.current.x + gs.dx, y: pos.current.y + gs.dy }; },
  })).current;

  const r = 90;
  const cx = 100; const cy = 100;
  const marks = Array.from({ length: 19 }, (_, i) => i * 10);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} {...panResponder.panHandlers}>
      <Svg width={200} height={110}>
        <Path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`} fill="rgba(220,220,255,0.85)" stroke="#7C3AED" strokeWidth={2} />
        {marks.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = cx + (r - 8) * Math.cos(Math.PI - rad);
          const y1 = cy - (r - 8) * Math.sin(rad);
          const x2 = cx + r * Math.cos(Math.PI - rad);
          const y2 = cy - r * Math.sin(rad);
          return <Line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5C3A8A" strokeWidth={deg % 30 === 0 ? 2 : 1} />;
        })}
        {[0, 30, 60, 90, 120, 150, 180].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const tx = cx + (r - 18) * Math.cos(Math.PI - rad);
          const ty = cy - (r - 18) * Math.sin(rad);
          return <SvgText key={deg} x={tx} y={ty + 3} fontSize={8} fill="#3A1A6A" textAnchor="middle">{deg}</SvgText>;
        })}
      </Svg>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Ionicons name="close" size={12} color={TEXT.secondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 200 },
  closeBtn: { position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(10,10,20,0.90)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
});

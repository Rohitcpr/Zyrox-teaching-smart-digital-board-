import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GlassPanel } from '../ui/GlassPanel';
import { useToolStore } from '../../store/useToolStore';
import { BRAND, TEXT } from '../../constants/colors';
import type { ShapeType } from '../../types/shape.types';

const SHAPES: { id: ShapeType; icon: string }[] = [
  { id: 'line',      icon: '╱' },
  { id: 'arrow',     icon: '→' },
  { id: 'rectangle', icon: '▭' },
  { id: 'circle',    icon: '◯' },
  { id: 'triangle',  icon: '△' },
];

export const ShapeToolbar: React.FC = () => {
  const activeShape = useToolStore((s) => s.activeShape);
  const setActiveShape = useToolStore((s) => s.setActiveShape);

  return (
    <GlassPanel style={styles.panel}>
      <Text style={styles.label}>Shapes</Text>
      <View style={styles.row}>
        {SHAPES.map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => setActiveShape(s.id)}
            style={[styles.btn, activeShape === s.id && styles.activeBtn]}
          >
            <Text style={[styles.icon, activeShape === s.id && styles.activeIcon]}>
              {s.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  panel: { padding: 12 },
  label: {
    color: TEXT.secondary,
    fontSize: 11,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  btn: {
    width: 52, height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeBtn: {
    backgroundColor: 'rgba(124,58,237,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.55)',
  },
  icon: { fontSize: 22, color: TEXT.secondary },
  activeIcon: { color: BRAND.primaryLight },
});

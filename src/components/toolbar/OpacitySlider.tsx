import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassPanel } from '../ui/GlassPanel';
import { useToolStore } from '../../store/useToolStore';
import { BRAND, TEXT } from '../../constants/colors';

const OPACITIES = [0.1, 0.25, 0.5, 0.75, 0.9, 1];

export const OpacitySlider: React.FC = () => {
  const opacity = useToolStore((s) => s.opacity);
  const setOpacity = useToolStore((s) => s.setOpacity);
  const color = useToolStore((s) => s.color);

  return (
    <GlassPanel style={styles.panel}>
      <Text style={styles.label}>Opacity: {Math.round(opacity * 100)}%</Text>
      <View style={styles.row}>
        {OPACITIES.map((o) => (
          <TouchableOpacity
            key={o}
            onPress={() => setOpacity(o)}
            style={[styles.btn, opacity === o && styles.activeBtn]}
          >
            <View style={[styles.dot, { backgroundColor: color, opacity: o }]} />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  btn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 12,
  },
  activeBtn: {
    backgroundColor: 'rgba(124,58,237,0.18)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.55)',
  },
  dot: {
    width: 28, height: 28, borderRadius: 14,
  },
});

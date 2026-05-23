import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GlassPanel } from '../ui/GlassPanel';
import { useAppStore } from '../../store/useAppStore';

const BG_COLORS = [
  '#0A0A0F', '#1A1A2E', '#0D1117',
  '#1C1C1C', '#2D1B69', '#1A0A2E',
  '#FFFFFF', '#F5F5F0', '#FFFEF0',
  '#0A1628', '#0D2137', '#162032',
];

export const CanvasBackground: React.FC = () => {
  const setBgColor = useAppStore((s) => s.setBgColor);
  const bgColor = useAppStore((s) => s.bgColor);

  return (
    <GlassPanel style={styles.panel}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {BG_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setBgColor(c)}
            style={[
              styles.swatch,
              { backgroundColor: c },
              bgColor === c && styles.selected,
            ]}
          />
        ))}
      </ScrollView>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  panel: { paddingVertical: 10 },
  row: { paddingHorizontal: 14, alignItems: 'center', gap: 10 },
  swatch: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  selected: {
    borderWidth: 3, borderColor: '#A855F7',
    transform: [{ scale: 1.2 }],
  },
});

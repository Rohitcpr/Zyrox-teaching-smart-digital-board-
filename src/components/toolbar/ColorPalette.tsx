import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { GlassPanel } from '../ui/GlassPanel';
import { TOOL_COLORS, BRAND } from '../../constants/colors';
import { useToolStore } from '../../store/useToolStore';

export const ColorPalette: React.FC = () => {
  const color = useToolStore((s) => s.color);
  const setColor = useToolStore((s) => s.setColor);
  return (
    <GlassPanel style={styles.panel}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TOOL_COLORS.map((c) => (
          <TouchableOpacity
            key={c} onPress={() => setColor(c)} activeOpacity={0.75}
            style={[styles.swatch, { backgroundColor: c }, color === c && styles.selected]}
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
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
  },
  selected: {
    borderWidth: 2.5, borderColor: BRAND.primaryLight,
    transform: [{ scale: 1.18 }],
  },
});

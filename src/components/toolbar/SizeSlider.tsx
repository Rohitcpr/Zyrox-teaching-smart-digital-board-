import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassPanel } from '../ui/GlassPanel';
import { useToolStore } from '../../store/useToolStore';
import { BRAND, TEXT } from '../../constants/colors';

const SIZES = [2, 4, 6, 10, 16, 24, 36];

export const SizeSlider: React.FC = () => {
  const size = useToolStore((s) => s.size);
  const setSize = useToolStore((s) => s.setSize);

  return (
    <GlassPanel style={styles.panel}>
      <Text style={styles.label}>Size: {size}px</Text>
      <View style={styles.row}>
        {SIZES.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSize(s)}
            style={[styles.btn, size === s && styles.activeBtn]}
          >
            <View
              style={[
                styles.dot,
                {
                  width: Math.min(s * 1.5, 36),
                  height: Math.min(s * 1.5, 36),
                  borderRadius: Math.min(s * 1.5, 36) / 2,
                  backgroundColor: size === s ? BRAND.primaryLight : TEXT.secondary,
                },
              ]}
            />
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeBtn: {
    backgroundColor: 'rgba(124,58,237,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.55)',
  },
  dot: {
    opacity: 0.9,
  },
});

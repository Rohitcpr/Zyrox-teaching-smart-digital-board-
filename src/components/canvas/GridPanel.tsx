import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GlassPanel } from '../ui/GlassPanel';
import { useAppStore } from '../../store/useAppStore';
import { BRAND, TEXT } from '../../constants/colors';

type GridType = 'none' | 'dots' | 'lines' | 'squares';

const GRIDS: { id: GridType; label: string; icon: string }[] = [
  { id: 'none',    label: 'None',    icon: '✕' },
  { id: 'dots',    label: 'Dots',    icon: '⋯' },
  { id: 'lines',   label: 'Lines',   icon: '≡' },
  { id: 'squares', label: 'Squares', icon: '⊞' },
];

export const GridPanel: React.FC = () => {
  const gridType = useAppStore((s) => s.gridType);
  const setGridType = useAppStore((s) => s.setGridType);

  return (
    <GlassPanel style={styles.panel}>
      <Text style={styles.label}>Grid</Text>
      <View style={styles.row}>
        {GRIDS.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => setGridType(g.id)}
            style={[styles.btn, gridType === g.id && styles.activeBtn]}
          >
            <Text style={[styles.icon, gridType === g.id && styles.activeIcon]}>
              {g.icon}
            </Text>
            <Text style={[styles.btnLabel, gridType === g.id && styles.activeIcon]}>
              {g.label}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  btn: {
    width: 64, height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 4,
  },
  activeBtn: {
    backgroundColor: 'rgba(124,58,237,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.55)',
  },
  icon: {
    fontSize: 18,
    color: TEXT.secondary,
  },
  btnLabel: {
    fontSize: 10,
    color: TEXT.secondary,
  },
  activeIcon: {
    color: BRAND.primaryLight,
  },
});

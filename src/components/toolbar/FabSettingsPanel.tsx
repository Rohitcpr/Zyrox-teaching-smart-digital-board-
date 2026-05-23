import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GlassPanel } from '../ui/GlassPanel';
import { useFabSettings } from '../../hooks/useFabSettings';
import { BRAND, TEXT } from '../../constants/colors';

const SIZES = [36, 44, 52, 60, 70];
const OPACITIES = [0.3, 0.5, 0.7, 0.85, 1];

export const FabSettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { fabSize, fabOpacity, setFabSize, setFabOpacity } = useFabSettings();

  return (
    <GlassPanel style={styles.panel}>
      <Text style={styles.label}>Button Size</Text>
      <View style={styles.row}>
        {SIZES.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setFabSize(s)}
            style={[styles.btn, fabSize === s && styles.activeBtn]}
          >
            <View style={[styles.dot, { width: s * 0.5, height: s * 0.5, borderRadius: s * 0.25, backgroundColor: fabSize === s ? BRAND.primaryLight : TEXT.secondary }]} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 12 }]}>Transparency</Text>
      <View style={styles.row}>
        {OPACITIES.map((o) => (
          <TouchableOpacity
            key={o}
            onPress={() => setFabOpacity(o)}
            style={[styles.btn, fabOpacity === o && styles.activeBtn]}
          >
            <View style={[styles.opacityDot, { opacity: o, backgroundColor: fabOpacity === o ? BRAND.primaryLight : TEXT.secondary }]} />
            <Text style={[styles.opacityText, { color: fabOpacity === o ? BRAND.primaryLight : TEXT.disabled }]}>
              {Math.round(o * 100)}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
        <Text style={styles.doneTxt}>Done</Text>
      </TouchableOpacity>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  panel: { padding: 16 },
  label: { color: TEXT.secondary, fontSize: 11, letterSpacing: 1, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'space-around' },
  btn: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  activeBtn: {
    backgroundColor: 'rgba(124,58,237,0.18)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.55)',
  },
  dot: {},
  opacityDot: { width: 20, height: 20, borderRadius: 10, marginBottom: 2 },
  opacityText: { fontSize: 9 },
  doneBtn: {
    marginTop: 14, padding: 10, borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.20)',
    alignItems: 'center',
  },
  doneTxt: { color: BRAND.primaryLight, fontWeight: '700', fontSize: 13 },
});

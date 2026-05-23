import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { GlassPanel } from './GlassPanel';
import { useToolStore } from '../../store/useToolStore';
import { BRAND, TEXT, TOOL_COLORS } from '../../constants/colors';

const EXTENDED_COLORS = [
  '#FFFFFF','#F0F0FF','#EF4444','#F97316','#EAB308','#22C55E',
  '#3B82F6','#8B5CF6','#EC4899','#14B8A6','#000000','#1E1E2E',
  '#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9A3C',
  '#00B4D8','#E63946','#2DC653','#FB5607','#FFBE0B','#8338EC',
  '#3A86FF','#FF006E','#06D6A0','#118AB2','#073B4C','#FFD166',
];

interface Props { onClose: () => void; }

export const CustomColorPicker: React.FC<Props> = ({ onClose }) => {
  const color = useToolStore((s) => s.color);
  const setColor = useToolStore((s) => s.setColor);
  const [hexInput, setHexInput] = useState(color);

  const applyHex = () => {
    const clean = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      setColor(clean);
    }
  };

  return (
    <GlassPanel style={styles.panel}>
      <Text style={styles.title}>Color Picker</Text>

      {/* Current color preview */}
      <View style={[styles.preview, { backgroundColor: color }]} />

      {/* Hex input */}
      <View style={styles.hexRow}>
        <TextInput
          value={hexInput}
          onChangeText={setHexInput}
          style={styles.hexInput}
          placeholder="#FFFFFF"
          placeholderTextColor={TEXT.disabled}
          autoCapitalize="characters"
          maxLength={7}
        />
        <TouchableOpacity onPress={applyHex} style={styles.applyBtn}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Color grid */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.grid}>
          {EXTENDED_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => { setColor(c); setHexInput(c); }}
              style={[styles.swatch, { backgroundColor: c }, color === c && styles.activeSwatch]}
            />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
        <Text style={styles.doneTxt}>Done</Text>
      </TouchableOpacity>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  panel: { padding: 16, maxHeight: 420 },
  title: { fontSize: 13, fontWeight: '800', color: TEXT.primary, letterSpacing: 1, marginBottom: 12 },
  preview: { width: '100%', height: 40, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  hexRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  hexInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: TEXT.primary, fontSize: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  applyBtn: { backgroundColor: BRAND.primary, borderRadius: 10, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  applyText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  scroll: { maxHeight: 200 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  activeSwatch: { borderWidth: 3, borderColor: BRAND.primaryLight, transform: [{ scale: 1.15 }] },
  doneBtn: { marginTop: 12, padding: 10, backgroundColor: 'rgba(124,58,237,0.20)', borderRadius: 10, alignItems: 'center' },
  doneTxt: { color: BRAND.primaryLight, fontWeight: '700', fontSize: 13 },
});

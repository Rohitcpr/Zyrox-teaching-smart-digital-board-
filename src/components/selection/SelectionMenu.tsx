import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassPanel } from '../ui/GlassPanel';
import { useSelectionStore } from '../../store/useSelectionStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useToolStore } from '../../store/useToolStore';
import { BRAND, TEXT, TOOL_COLORS } from '../../constants/colors';
import type { SelectionBox } from '../../types/selection.types';

interface Props {
  box: SelectionBox;
  onClose: () => void;
}

export const SelectionMenu: React.FC<Props> = ({ box, onClose }) => {
  const { selectedItems, clearSelection } = useSelectionStore();
  const { layers, activeLayerId } = useCanvasStore();
  const color = useToolStore((s) => s.color);
  const [showColors, setShowColors] = useState(false);

  const count = selectedItems.strokeIds.length;

  const handleDelete = () => {
    Alert.alert('Delete', `Delete ${count} item(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          const state = useCanvasStore.getState();
          useCanvasStore.setState({
            layers: state.layers.map((l) => ({
              ...l,
              strokes: l.strokes.filter((s) => !selectedItems.strokeIds.includes(s.id)),
            })),
            isDirty: true,
          });
          clearSelection();
          onClose();
        },
      },
    ]);
  };

  const handleCopy = () => {
    const state = useCanvasStore.getState();
    const { generateId } = require('../../utils/strokeUtils');
    const selected = state.layers.flatMap((l) => l.strokes).filter((s) => selectedItems.strokeIds.includes(s.id));
    const copied = selected.map((s) => ({
      ...s, id: generateId(),
      points: s.points.map((p) => ({ ...p, x: p.x + 25, y: p.y + 25 })),
    }));
    useCanvasStore.setState((st) => ({
      layers: st.layers.map((l) =>
        l.id === st.activeLayerId ? { ...l, strokes: [...l.strokes, ...copied] } : l
      ),
      isDirty: true,
    }));
    clearSelection();
    onClose();
  };

  const handleColorChange = (newColor: string) => {
    useCanvasStore.setState((st) => ({
      layers: st.layers.map((l) => ({
        ...l,
        strokes: l.strokes.map((s) =>
          selectedItems.strokeIds.includes(s.id) ? { ...s, color: newColor } : s
        ),
      })),
      isDirty: true,
    }));
    setShowColors(false);
    clearSelection();
    onClose();
  };

  const menuTop = Math.max(60, box.y - 80);
  const menuLeft = Math.max(8, Math.min(box.x, 180));

  return (
    <GlassPanel style={[styles.menu, { top: menuTop, left: menuLeft }]}>
      <Text style={styles.count}>{count} selected</Text>

      {showColors ? (
        <View style={styles.colorGrid}>
          {['#FFFFFF','#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899'].map((c) => (
            <TouchableOpacity key={c} onPress={() => handleColorChange(c)}
              style={[styles.colorDot, { backgroundColor: c }]} />
          ))}
          <TouchableOpacity onPress={() => setShowColors(false)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={12} color={TEXT.secondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setShowColors(true)} style={[styles.btn, { borderColor: '#A855F7' + '50' }]}>
            <Ionicons name="color-palette" size={16} color="#A855F7" />
            <Text style={[styles.btnLabel, { color: '#A855F7' }]}>Color</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCopy} style={[styles.btn, { borderColor: '#3B82F6' + '50' }]}>
            <Ionicons name="copy-outline" size={16} color="#3B82F6" />
            <Text style={[styles.btnLabel, { color: '#3B82F6' }]}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={[styles.btn, { borderColor: '#EF4444' + '50' }]}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={[styles.btnLabel, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { clearSelection(); onClose(); }} style={[styles.btn, { borderColor: '#6B7280' + '50' }]}>
            <Ionicons name="close" size={16} color="#6B7280" />
            <Text style={[styles.btnLabel, { color: '#6B7280' }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  menu: { position: 'absolute', zIndex: 200, padding: 10, minWidth: 220 },
  count: { fontSize: 9, fontWeight: '800', color: TEXT.disabled, letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  btnLabel: { fontSize: 10, fontWeight: '600' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  colorDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  backBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
});

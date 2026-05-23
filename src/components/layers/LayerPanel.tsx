import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCanvasStore } from '../../store/useCanvasStore';
import { BRAND, GLASS, SURFACE, TEXT } from '../../constants/colors';
import { generateId } from '../../utils/strokeUtils';

export const LayerPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const layers = useCanvasStore((s) => s.layers);
  const activeLayerId = useCanvasStore((s) => s.activeLayerId);

  const addLayer = () => {
    const newLayer = {
      id: generateId(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      strokes: [],
    };
    useCanvasStore.setState((s) => ({
      layers: [...s.layers, newLayer],
      activeLayerId: newLayer.id,
    }));
  };

  const toggleVisible = (id: string) => {
    useCanvasStore.setState((s) => ({
      layers: s.layers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l),
    }));
  };

  const toggleLock = (id: string) => {
    useCanvasStore.setState((s) => ({
      layers: s.layers.map((l) => l.id === id ? { ...l, locked: !l.locked } : l),
    }));
  };

  const deleteLayer = (id: string) => {
    if (layers.length === 1) return;
    useCanvasStore.setState((s) => ({
      layers: s.layers.filter((l) => l.id !== id),
      activeLayerId: s.activeLayerId === id ? s.layers[0].id : s.activeLayerId,
    }));
  };

  const setActive = (id: string) => {
    useCanvasStore.setState({ activeLayerId: id });
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Layers</Text>
          <TouchableOpacity onPress={addLayer} style={styles.addBtn}>
            <Ionicons name="add" size={22} color={BRAND.primaryLight} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {[...layers].reverse().map((layer) => (
            <TouchableOpacity
              key={layer.id}
              onPress={() => setActive(layer.id)}
              style={[styles.layerRow, activeLayerId === layer.id && styles.activeRow]}
            >
              <View style={styles.layerInfo}>
                <Text style={styles.layerName}>{layer.name}</Text>
                <Text style={styles.layerSub}>{layer.strokes.length} strokes</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleVisible(layer.id)} style={styles.actionBtn}>
                  <Ionicons name={layer.visible ? 'eye' : 'eye-off'} size={16} color={layer.visible ? BRAND.primaryLight : TEXT.disabled} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleLock(layer.id)} style={styles.actionBtn}>
                  <Ionicons name={layer.locked ? 'lock-closed' : 'lock-open'} size={16} color={layer.locked ? '#EAB308' : TEXT.disabled} />
                </TouchableOpacity>
                {layers.length > 1 && (
                  <TouchableOpacity onPress={() => deleteLayer(layer.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 200, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: { width: 240, backgroundColor: SURFACE.bgSecondary, borderLeftWidth: 1, borderLeftColor: GLASS.border, paddingTop: 52 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: GLASS.border },
  title: { fontSize: 14, fontWeight: '800', color: TEXT.primary, letterSpacing: 1 },
  addBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  layerRow: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 8, marginTop: 8, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  activeRow: { backgroundColor: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.40)' },
  layerInfo: { flex: 1 },
  layerName: { fontSize: 13, fontWeight: '600', color: TEXT.primary },
  layerSub: { fontSize: 10, color: TEXT.disabled, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});

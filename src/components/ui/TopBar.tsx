import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useNotebookStore } from '../../store/useNotebookStore';
import { ExportPanel } from '../export/ExportPanel';
import { TEXT, BRAND } from '../../constants/colors';

interface Props {
  pageId?: string;
  onImportPress?: () => void;
  onLayerPress?: () => void;
}

export const TopBar: React.FC<Props> = ({ pageId = 'page_001', onImportPress, onLayerPress }) => {
  const router = useRouter();
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const undoStack = useCanvasStore((s) => s.undoStack);
  const redoStack = useCanvasStore((s) => s.redoStack);
  const saveCanvas = useCanvasStore((s) => s.saveCanvas);
  const [showMenu, setShowMenu] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleBack = async () => {
    await saveCanvas(pageId);
    await useNotebookStore.getState().saveToRecent(pageId);
    router.push('/home');
  };

  const MENU_ITEMS = [
    { icon: 'trash-outline',              label: 'Clear Board',       color: '#EF4444', onPress: () => { useCanvasStore.getState().clearCanvas(); setShowMenu(false); } },
    { icon: 'cloud-download-outline',     label: 'Import PDF/Image',  color: '#22C55E', onPress: () => { setShowMenu(false); onImportPress?.(); } },
    { icon: 'share-outline',              label: 'Export / Share',    color: '#3B82F6', onPress: () => { setShowMenu(false); setShowExport(true); } },
    { icon: 'easel-outline',              label: 'Presentation',      color: BRAND.primaryLight, onPress: () => { setShowMenu(false); router.push('/presentation'); } },
    { icon: 'layers-outline',             label: 'Layers',            color: '#A855F7', onPress: () => { setShowMenu(false); onLayerPress?.(); } },
    { icon: 'settings-outline',           label: 'Settings',          color: TEXT.secondary, onPress: () => { setShowMenu(false); router.push('/settings'); } },
    { icon: 'information-circle-outline', label: 'About ZYROX',       color: TEXT.disabled, onPress: () => setShowMenu(false) },
  ];

  return (
    <>
      {/* Floating glass buttons — no header bar */}
      <View style={styles.floatingBar}>
        {/* Back button — left */}
        <TouchableOpacity onPress={handleBack} style={styles.glassBtn}>
          <Ionicons name="arrow-back" size={18} color={TEXT.secondary} />
        </TouchableOpacity>

        {/* Right controls */}
        <View style={styles.rightGroup}>
          <TouchableOpacity onPress={undo} disabled={undoStack.length === 0} style={styles.glassBtn}>
            <Ionicons name="arrow-undo" size={18} color={undoStack.length > 0 ? TEXT.secondary : TEXT.disabled} />
          </TouchableOpacity>

          <TouchableOpacity onPress={redo} disabled={redoStack.length === 0} style={styles.glassBtn}>
            <Ionicons name="arrow-redo" size={18} color={redoStack.length > 0 ? TEXT.secondary : TEXT.disabled} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.glassBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color={TEXT.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <TouchableOpacity style={styles.backdrop} onPress={() => setShowMenu(false)} />
          <View style={styles.dropdown}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity key={item.label} onPress={item.onPress} style={styles.dropItem}>
                <Ionicons name={item.icon as any} size={16} color={item.color} />
                <Text style={styles.dropLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {showExport && <ExportPanel onClose={() => setShowExport(false)} pageId={pageId} />}
    </>
  );
};

const styles = StyleSheet.create({
  floatingBar: {
    position: 'absolute',
    top: 12, left: 10, right: 10,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightGroup: { flexDirection: 'row', gap: 4 },
  glassBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(10,10,15,0.60)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 98 },
  dropdown: {
    position: 'absolute', top: 54, right: 10,
    backgroundColor: 'rgba(15,15,26,0.97)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    zIndex: 99, minWidth: 210, overflow: 'hidden',
  },
  dropItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropLabel: { fontSize: 13, fontWeight: '500', color: TEXT.primary },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePageStore } from '../../store/usePageStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { BRAND, GLASS, SURFACE, TEXT } from '../../constants/colors';

interface Props {
  onClose: () => void;
  onPageSelect: (pageId: string) => void;
}

export const PageSidebar: React.FC<Props> = ({ onClose, onPageSelect }) => {
  const { pages, activePageId, addPage, copyPage, deletePage, setActivePage, reorderPages } = usePageStore();
  const { clearCanvas, saveCanvas, loadCanvas } = useCanvasStore();

  const handleAddPage = async () => {
    await saveCanvas(activePageId);
    const newId = addPage();
    clearCanvas();
    onPageSelect(newId);
    onClose();
  };

  const handleCopyPage = async (pageId: string) => {
    await saveCanvas(activePageId);
    const newId = await copyPage(pageId);
    await loadCanvas(newId);
    onPageSelect(newId);
    onClose();
  };

  const handleSelectPage = async (pageId: string) => {
    if (pageId === activePageId) { onClose(); return; }
    await saveCanvas(activePageId);
    setActivePage(pageId);
    await loadCanvas(pageId);
    onPageSelect(pageId);
    onClose();
  };

  const handleDelete = (pageId: string) => {
    if (pages.length === 1) return;
    Alert.alert('Delete Page', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePage(pageId) },
    ]);
  };

  const moveUp = (i: number) => { if (i > 0) reorderPages(i, i - 1); };
  const moveDown = (i: number) => { if (i < pages.length - 1) reorderPages(i, i + 1); };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={styles.sidebar}>
        <View style={styles.header}>
          <Text style={styles.title}>Pages  <Text style={styles.count}>{pages.length}</Text></Text>
          <TouchableOpacity onPress={handleAddPage} style={styles.addBtn}>
            <Ionicons name="add" size={22} color={BRAND.primaryLight} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
          {pages.map((page, index) => (
            <View key={page.id} style={[styles.pageRow, activePageId === page.id && styles.activeRow]}>

              {/* Reorder arrows */}
              <View style={styles.reorderCol}>
                <TouchableOpacity onPress={() => moveUp(index)} style={styles.arrowBtn}>
                  <Ionicons name="chevron-up" size={14} color={index === 0 ? TEXT.disabled : TEXT.secondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => moveDown(index)} style={styles.arrowBtn}>
                  <Ionicons name="chevron-down" size={14} color={index === pages.length - 1 ? TEXT.disabled : TEXT.secondary} />
                </TouchableOpacity>
              </View>

              {/* Page info */}
              <TouchableOpacity style={styles.pageInfo} onPress={() => handleSelectPage(page.id)}>
                <View style={styles.thumb}>
                  <Text style={styles.thumbNum}>{index + 1}</Text>
                </View>
                <View>
                  <Text style={styles.pageName}>{page.name}</Text>
                  <Text style={styles.pageStatus}>{activePageId === page.id ? '● Active' : 'Tap to open'}</Text>
                </View>
              </TouchableOpacity>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleCopyPage(page.id)} style={styles.actionBtn}>
                  <Ionicons name="copy-outline" size={15} color={BRAND.primaryLight} />
                </TouchableOpacity>
                {pages.length > 1 && (
                  <TouchableOpacity onPress={() => handleDelete(page.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={15} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={handleAddPage} style={styles.newBtn}>
          <Ionicons name="add-circle-outline" size={18} color={BRAND.primaryLight} />
          <Text style={styles.newBtnText}>New Page</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 200, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sidebar: {
    width: 270, backgroundColor: SURFACE.bgSecondary,
    borderLeftWidth: 1, borderLeftColor: GLASS.border,
    paddingTop: 52,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: GLASS.border,
  },
  title: { fontSize: 14, fontWeight: '800', color: TEXT.primary, letterSpacing: 1 },
  count: { color: TEXT.disabled, fontWeight: '400' },
  addBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  pageRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 8, marginTop: 8,
    borderRadius: 12, borderWidth: 1, borderColor: 'transparent',
    overflow: 'hidden',
  },
  activeRow: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderColor: 'rgba(124,58,237,0.35)',
  },

  reorderCol: { alignItems: 'center', paddingHorizontal: 4 },
  arrowBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },

  pageInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  thumb: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(124,58,237,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbNum: { fontSize: 12, fontWeight: '700', color: BRAND.primaryLight },
  pageName: { fontSize: 12, fontWeight: '600', color: TEXT.primary },
  pageStatus: { fontSize: 10, color: TEXT.disabled, marginTop: 1 },

  actions: { flexDirection: 'row', paddingRight: 8, gap: 4 },
  actionBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  newBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, margin: 12,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(124,58,237,0.30)',
  },
  newBtnText: { fontSize: 13, fontWeight: '600', color: BRAND.primaryLight },
});

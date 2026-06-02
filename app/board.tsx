import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawingCanvas } from '../src/components/canvas/DrawingCanvas';
import { GridOverlay } from '../src/components/canvas/GridOverlay';
import { GridPanel } from '../src/components/canvas/GridPanel';
import { CanvasBackground } from '../src/components/canvas/CanvasBackground';
import { ShapeToolbar } from '../src/components/shapes/ShapeToolbar';
import { FloatingToolbar } from '../src/components/toolbar/FloatingToolbar';
import { ColorPalette } from '../src/components/toolbar/ColorPalette';
import { SizeSlider } from '../src/components/toolbar/SizeSlider';
import { OpacitySlider } from '../src/components/toolbar/OpacitySlider';
import { TopBar } from '../src/components/ui/TopBar';
import { Toast } from '../src/components/ui/Toast';
import { CustomColorPicker } from '../src/components/ui/CustomColorPicker';
import { LayerPanel } from '../src/components/layers/LayerPanel';
import { PageSidebar } from '../src/components/pages/PageSidebar';
import { PageFab } from '../src/components/pages/PageFab';
import { ImportPanel } from '../src/components/import/ImportPanel';
import { ImportedImageLayer }
import { PDFViewerLayer } from '../src/components/canvas/ImportedImageLayer';
import { StickyNote } from '../src/components/canvas/StickyNote';
import { useCanvasStore } from '../src/store/useCanvasStore';
import { useAppStore } from '../src/store/useAppStore';
import { usePageStore } from '../src/store/usePageStore';
import { useStickyStore } from '../src/store/useStickyStore';
import { useAutoSave } from '../src/hooks/useAutoSave';
import { useZoomPan } from '../src/hooks/useZoomPan';
import { TEXT } from '../src/constants/colors';

interface ImportedItem {
  id: string; type: string; uri: string; name: string;
}

export default function BoardScreen() {
  const { pageId: initialPageId, isNew } = useLocalSearchParams<{ pageId: string; isNew: string }>();
  const [currentPageId, setCurrentPageId] = useState(initialPageId || 'page_001');
  const [showPageSidebar, setShowPageSidebar] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importedItems, setImportedItems] = useState<ImportedItem[]>([]);
  
  // CRITICAL: editMode only for imported image manipulation
  const [editMode, setEditMode] = useState(false);

  const loadCanvas = useCanvasStore((s) => s.loadCanvas);
  const initCanvas = useCanvasStore((s) => s.initCanvas);
  const isColorPaletteOpen = useAppStore((s) => s.isColorPaletteOpen);
  const isSizeSliderOpen = useAppStore((s) => s.isSizeSliderOpen);
  const isOpacitySliderOpen = useAppStore((s) => s.isOpacitySliderOpen);
  const isGridPanelOpen = useAppStore((s) => s.isGridPanelOpen);
  const isShapePanelOpen = useAppStore((s) => s.isShapePanelOpen);
  const isBgPanelOpen = useAppStore((s) => s.isBgPanelOpen);
  const closeAllPanels = useAppStore((s) => s.closeAllPanels);
  const toastMessage = useAppStore((s) => s.toastMessage);
  const toastVisible = useAppStore((s) => s.toastVisible);
  const gridType = useAppStore((s) => s.gridType);
  const bgColor = useAppStore((s) => s.bgColor);
  const loadPages = usePageStore((s) => s.loadPages);
  const stickies = useStickyStore((s) => s.stickies);
  const removeSticky = useStickyStore((s) => s.removeSticky);

  const lastTap = useRef(0);
  const fabCloseRef = useRef<(() => void) | null>(null);
  const { scale, translateX, translateY, panResponder, resetZoom } = useZoomPan();

  // CRITICAL: Always start in draw mode
  useEffect(() => { setEditMode(false); }, []);

  useEffect(() => {
    loadPages();
    if (isNew === 'true') initCanvas();
    else loadCanvas(currentPageId);
  }, [currentPageId]);

  const handleCanvasTap = useCallback(() => {
    closeAllPanels();
    const now = Date.now();
    if (now - lastTap.current < 300) resetZoom();
    lastTap.current = now;
    fabCloseRef.current?.();
  }, []);

  // CRITICAL FIX: Never auto-set editMode on import
  const handleImportSuccess = useCallback((type: string, uri: string, name: string) => {
    setImportedItems(prev => [...prev, { id: `import_${Date.now()}`, type, uri, name }]);
    // Stay in DRAW mode - user manually switches to edit
    setEditMode(false);
  }, []);

  // CRITICAL FIX: Force draw mode on remove
  const handleRemoveItem = useCallback((id: string) => {
    setImportedItems(prev => prev.filter(i => i.id !== id));
    setEditMode(false);
  }, []);

  const switchToDraw = useCallback(() => setEditMode(false), []);
  const switchToEdit = useCallback(() => setEditMode(true), []);

  useAutoSave(currentPageId);

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>

      {/* FULLSCREEN CANVAS */}
      <View style={[styles.canvas, { backgroundColor: bgColor }]}>
        <GridOverlay type={gridType} />

        {/* Imported images */}
        {importedItems.map((item) => (
          <ImportedImageLayer
            key={item.id}
            id={item.id}
            uri={item.uri}
            editMode={editMode}
            onRemove={handleRemoveItem}
          />
        ))}

        {/* Drawing canvas */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { transform: [{ translateX }, { translateY }, { scale }] }]}
          pointerEvents={editMode ? 'none' : 'auto'}
        >
          <View style={StyleSheet.absoluteFill} {...(!editMode ? panResponder.panHandlers : {})}>
            <DrawingCanvas onTap={handleCanvasTap} bgColor={bgColor} disabled={editMode} />
          </View>
        </Animated.View>

        {/* Sticky notes */}
        {stickies.map((s) => (
          <StickyNote key={s.id} id={s.id} onRemove={removeSticky} />
        ))}
      </View>

      {/* Top Controls */}
      <TopBar pageId={currentPageId} onImportPress={() => setShowImport(true)} onLayerPress={() => setShowLayerPanel(true)} />

      {/* Draw/Edit toggle - ONLY when imports exist */}
      {importedItems.length > 0 && (
        <View style={styles.modeBar}>
          <TouchableOpacity onPress={switchToDraw} style={[styles.modeBtn, !editMode && styles.modeDraw]}>
            <Ionicons name="pencil" size={12} color={!editMode ? '#A855F7' : TEXT.disabled} />
            <Text style={[styles.modeTxt, !editMode && { color: '#A855F7' }]}>Draw</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={switchToEdit} style={[styles.modeBtn, editMode && styles.modeEdit]}>
            <Ionicons name="move" size={12} color={editMode ? '#3B82F6' : TEXT.disabled} />
            <Text style={[styles.modeTxt, editMode && { color: '#3B82F6' }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Panels */}
      {isColorPaletteOpen && <View style={styles.floatPanel}><ColorPalette /></View>}
      {isSizeSliderOpen && <View style={styles.floatPanel}><SizeSlider /></View>}
      {isOpacitySliderOpen && <View style={styles.floatPanel}><OpacitySlider /></View>}
      {isGridPanelOpen && <View style={styles.floatPanel}><GridPanel /></View>}
      {isShapePanelOpen && <View style={styles.floatPanel}><ShapeToolbar /></View>}
      {isBgPanelOpen && <View style={styles.floatPanel}><CanvasBackground /></View>}
      {showColorPicker && <View style={styles.floatPanel}><CustomColorPicker onClose={() => setShowColorPicker(false)} /></View>}

      {showPageSidebar && <PageSidebar onClose={() => setShowPageSidebar(false)} onPageSelect={(id) => { setCurrentPageId(id); setEditMode(false); }} />}
      {showLayerPanel && <LayerPanel onClose={() => setShowLayerPanel(false)} />}
      {showImport && <ImportPanel onClose={() => setShowImport(false)} onImportSuccess={handleImportSuccess} />}

      <Toast message={toastMessage} visible={toastVisible} />
      <FloatingToolbar
        onToolSelect={() => { switchToDraw(); handleCanvasTap(); }}
        onCloseRef={(fn) => { fabCloseRef.current = fn; }}
        onLayerPress={() => setShowLayerPanel(true)}
        onColorPickerPress={() => setShowColorPicker(true)}
      />
      <PageFab onPress={() => setShowPageSidebar(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  canvas: { ...StyleSheet.absoluteFillObject },
  floatPanel: { position: 'absolute', bottom: 80, left: 80, right: 12, zIndex: 50 },
  modeBar: {
    position: 'absolute', top: 52, alignSelf: 'center',
    left: '50%', transform: [{ translateX: -52 }],
    flexDirection: 'row',
    backgroundColor: 'rgba(8,8,8,0.92)',
    borderRadius: 12, padding: 3, gap: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 101,
  },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 9, borderWidth: 1, borderColor: 'transparent',
  },
  modeDraw: { backgroundColor: 'rgba(168,85,247,0.15)', borderColor: 'rgba(168,85,247,0.40)' },
  modeEdit: { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.40)' },
  modeTxt: { fontSize: 10, fontWeight: '700', color: TEXT.disabled },
});

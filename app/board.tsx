import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
import { ModeToggle } from '../src/components/ui/ModeToggle';
import { Toast } from '../src/components/ui/Toast';
import { CustomColorPicker } from '../src/components/ui/CustomColorPicker';
import { LayerPanel } from '../src/components/layers/LayerPanel';
import { PageSidebar } from '../src/components/pages/PageSidebar';
import { PageFab } from '../src/components/pages/PageFab';
import { ImportPanel } from '../src/components/import/ImportPanel';
import { ImportedImageLayer } from '../src/components/canvas/ImportedImageLayer';
import { PDFViewerLayer } from '../src/components/canvas/PDFViewerLayer';
import { StickyNote } from '../src/components/canvas/StickyNote';
import { useCanvasStore } from '../src/store/useCanvasStore';
import { useAppStore } from '../src/store/useAppStore';
import { usePageStore } from '../src/store/usePageStore';
import { useStickyStore } from '../src/store/useStickyStore';
import { useAutoSave } from '../src/hooks/useAutoSave';
import { useZoomPan } from '../src/hooks/useZoomPan';

interface ImportedItem {
  id: string;
  type: string;
  uri: string;
  name: string;
}

export default function BoardScreen() {
  const { pageId: initialPageId, isNew } = useLocalSearchParams<{ pageId: string; isNew: string }>();
  const [currentPageId, setCurrentPageId] = useState(initialPageId || 'page_001');
  const [showPageSidebar, setShowPageSidebar] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importedItems, setImportedItems] = useState<ImportedItem[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showProtractor, setShowProtractor] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const lastTap = useRef(0);
  const fabCloseRef = useRef<(() => void) | null>(null);

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

  const { scale, translateX, translateY, panResponder, resetZoom } = useZoomPan();

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) resetZoom();
    lastTap.current = now;
  };

  const handleCanvasTap = () => {
    closeAllPanels();
    handleDoubleTap();
    fabCloseRef.current?.();
  };

  const handleRemoveItem = (id: string) => {
    setImportedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Save before switching page (Block F - stability)
  const prevPageId = useRef(currentPageId);
  useEffect(() => {
    const prev = prevPageId.current;
    if (prev !== currentPageId) {
      useCanvasStore.getState().saveCanvas(prev);
    }
    prevPageId.current = currentPageId;
    loadPages();
    if (isNew === 'true') initCanvas();
    else loadCanvas(currentPageId);
  }, [currentPageId]);

  useAutoSave(currentPageId);
  usePerformance();
  

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>

      <View style={[styles.canvas, { backgroundColor: bgColor }]} {...panResponder.panHandlers}>
        <GridOverlay type={gridType} />

        {/* PDF layers — render karo drawing ke neeche */}
        {importedItems
          .filter((item) => item.type === 'pdf')
          .map((item) => (
            <PDFViewerLayer
              key={item.id}
              uri={item.uri}
              name={item.name}
              onRemove={() => handleRemoveItem(item.id)}
            />
          ))}

        {/* Image layers */}
        {importedItems
          .filter((item) => item.type === 'image')
          .map((item) => (
            <ImportedImageLayer
              key={item.id}
              uri={item.uri}
              name={item.name}
              onRemove={() => handleRemoveItem(item.id)}
            />
          ))}

        <Animated.View style={[StyleSheet.absoluteFill, {
          transform: [{ translateX }, { translateY }, { scale }],
        }]}>
          <DrawingCanvas onTap={handleCanvasTap} bgColor={bgColor} />
        </Animated.View>

        {stickies.map((s) => (
          <StickyNote key={s.id} id={s.id} onRemove={removeSticky} />
        ))}
      </View>

      <TopBar
        pageId={currentPageId}
        onImportPress={() => setShowImport(true)}
        onTimerPress={() => setShowTimer((t) => t === false)}
        onRulerPress={() => setShowRuler((r) => r === false)}
        onSpotlightPress={() => setShowSpotlight((s) => s === false)}
        onProtractorPress={() => setShowProtractor((p) => p === false)}
        onTablePress={() => setShowTable((t) => t === false)}
        onLayerPress={() => setShowLayerPanel(true)}
      />

      {isColorPaletteOpen && <View style={styles.floatPanel}><ColorPalette /></View>}
      {isSizeSliderOpen && <View style={styles.floatPanel}><SizeSlider /></View>}
      {isOpacitySliderOpen && <View style={styles.floatPanel}><OpacitySlider /></View>}
      {isGridPanelOpen && <View style={styles.floatPanel}><GridPanel /></View>}
      {isShapePanelOpen && <View style={styles.floatPanel}><ShapeToolbar /></View>}
      {isBgPanelOpen && <View style={styles.floatPanel}><CanvasBackground /></View>}
      {showColorPicker && (
        <View style={styles.floatPanel}>
          <CustomColorPicker onClose={() => setShowColorPicker(false)} />
        </View>
      )}

      {showPageSidebar && (
        <PageSidebar
          onClose={() => setShowPageSidebar(false)}
          onPageSelect={(id) => setCurrentPageId(id)}
        />
      )}
      {showLayerPanel && <LayerPanel onClose={() => setShowLayerPanel(false)} />}
      {showTimer && <BoardTimer onClose={() => setShowTimer(false)} />}
      {showRuler && <RulerTool onClose={() => setShowRuler(false)} />}
      {showSpotlight && <SpotlightTool onClose={() => setShowSpotlight(false)} />}
      {showProtractor && <ProtractorTool onClose={() => setShowProtractor(false)} />}
      {showTable && <TableTool onClose={() => setShowTable(false)} />}
      {showImport && (
        <ImportPanel
          onClose={() => setShowImport(false)}
          onImportSuccess={(type, uri, name) =>
            setImportedItems((prev) => [
              ...prev,
              { id: 'import_' + Date.now(), type, uri, name },
            ])
          }
        />
      )}

      {showTimer && <BoardTimer onClose={() => setShowTimer(false)} />}
      {showRuler && <RulerTool onClose={() => setShowRuler(false)} />}
      {showSpotlight && <SpotlightTool onClose={() => setShowSpotlight(false)} />}
      {showProtractor && <ProtractorTool onClose={() => setShowProtractor(false)} />}
      {showTable && <TableTool onClose={() => setShowTable(false)} />}
      <Toast message={toastMessage} visible={toastVisible} />
      <FloatingToolbar
        onToolSelect={handleCanvasTap}
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
});

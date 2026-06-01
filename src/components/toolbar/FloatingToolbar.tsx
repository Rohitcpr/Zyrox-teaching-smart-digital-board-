import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, useWindowDimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, TEXT } from '../../constants/colors';
import { useToolStore } from '../../store/useToolStore';
import { useAppStore } from '../../store/useAppStore';
import { useFabSettings } from '../../hooks/useFabSettings';
import { useDraggable } from '../../hooks/useDraggable';
import { useStickyStore } from '../../store/useStickyStore';
import type { ToolType } from '../../types/canvas.types';

const TOOLS: { id: ToolType; icon: string; label: string; color: string }[] = [
  { id: 'pen',          icon: 'pencil',        label: 'Pen',      color: '#A855F7' },
  { id: 'marker',       icon: 'brush',         label: 'Marker',   color: '#3B82F6' },
  { id: 'highlighter',  icon: 'color-filter',  label: 'Highlight',color: '#EAB308' },
  { id: 'pencil',       icon: 'create-outline',label: 'Pencil',   color: '#D4D4D4' },
  { id: 'eraser',       icon: 'square-outline',label: 'Eraser',   color: '#6B7280' },
  { id: 'stroke_eraser',icon: 'cut',           label: 'S.Erase',  color: '#EF4444' },
  { id: 'text',         icon: 'text',          label: 'Text',     color: '#22C55E' },
  { id: 'select',       icon: 'scan-outline',  label: 'Select',   color: '#F97316' },
];

type SubPanel = 'none'|'color'|'size'|'opacity'|'grid'|'shape'|'bg';

interface Props {
  onToolSelect?: () => void;
  onCloseRef?: (fn: () => void) => void;
  onLayerPress?: () => void;
  onColorPickerPress?: () => void;
}

export const FloatingToolbar: React.FC<Props> = ({ onToolSelect, onCloseRef, onLayerPress, onColorPickerPress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subPanel, setSubPanel] = useState<SubPanel>('none');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const { pan, panResponder, currentPos } = useDraggable(16, height - 120);

  const tool = useToolStore((s) => s.tool);
  const color = useToolStore((s) => s.color);
  const size = useToolStore((s) => s.size);
  const setTool = useToolStore((s) => s.setTool);
  const toggleColorPalette = useAppStore((s) => s.toggleColorPalette);
  const toggleSizeSlider = useAppStore((s) => s.toggleSizeSlider);
  const toggleOpacitySlider = useAppStore((s) => s.toggleOpacitySlider);
  const toggleGridPanel = useAppStore((s) => s.toggleGridPanel);
  const toggleShapePanel = useAppStore((s) => s.toggleShapePanel);
  const toggleBgPanel = useAppStore((s) => s.toggleBgPanel);
  const closeAllPanels = useAppStore((s) => s.closeAllPanels);
  const addSticky = useStickyStore((s) => s.addSticky);
  const { fabSize, fabOpacity } = useFabSettings();

  const isBottomHalf = currentPos.current.y > height / 2;

  const closeMenu = () => {
    Animated.spring(fadeAnim, { toValue: 0, useNativeDriver: true }).start(() => {
      setIsOpen(false);
      setSubPanel('none');
    });
    closeAllPanels();
  };

  useEffect(() => { onCloseRef?.(closeMenu); }, []);

  const openMenu = () => {
    setIsOpen(true);
    Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleSub = (s: SubPanel, fn: () => void) => {
    if (subPanel === s) { setSubPanel('none'); closeAllPanels(); }
    else { setSubPanel(s); closeAllPanels(); fn(); }
  };

  const handleTool = (t: ToolType) => {
    setTool(t);
    closeMenu();
    onToolSelect?.();
  };

  const currentTool = TOOLS.find((t) => t.id === tool);
  const menuPosition = isBottomHalf ? { bottom: fabSize + 12 } : { top: fabSize + 12 };
  const menuWidth = Math.min(width - 32, 340);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}>
      {isOpen && (
        <>
          {/* Dark backdrop overlay */}
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} pointerEvents="none" />

          <Animated.View style={[
            styles.menu, menuPosition, { width: menuWidth },
            {
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim.interpolate({ inputRange: [0,1], outputRange: [0.92,1] }) }]
            }
          ]}>
            {/* TOOLS */}
            <Text style={styles.sectionLabel}>TOOLS</Text>
            <View style={styles.row}>
              {TOOLS.map((t) => (
                <TouchableOpacity key={t.id} onPress={() => handleTool(t.id)}
                  style={[styles.chip, tool === t.id && { backgroundColor: t.color + '28', borderColor: t.color }]}>
                  <Ionicons name={t.icon as any} size={16} color={tool === t.id ? t.color : TEXT.secondary} />
                  <Text style={[styles.chipLabel, { color: tool === t.id ? t.color : TEXT.secondary }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            {/* SETTINGS */}
            <Text style={styles.sectionLabel}>SETTINGS</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => handleSub('color', toggleColorPalette)}
                style={[styles.chip, subPanel === 'color' && styles.activeChip]}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={styles.chipLabel}>Color</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { closeMenu(); onColorPickerPress?.(); }} style={styles.chip}>
                <Ionicons name="color-wand-outline" size={14} color={TEXT.secondary} />
                <Text style={styles.chipLabel}>Custom</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSub('size', toggleSizeSlider)}
                style={[styles.chip, subPanel === 'size' && styles.activeChip]}>
                <View style={{ width: Math.max(5,Math.min(size*1.5,14)), height: Math.max(5,Math.min(size*1.5,14)), borderRadius: 7, backgroundColor: color }} />
                <Text style={styles.chipLabel}>Size</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSub('opacity', toggleOpacitySlider)}
                style={[styles.chip, subPanel === 'opacity' && styles.activeChip]}>
                <Ionicons name="water" size={14} color={subPanel==='opacity' ? BRAND.primaryLight : TEXT.secondary} />
                <Text style={styles.chipLabel}>Opacity</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSub('grid', toggleGridPanel)}
                style={[styles.chip, subPanel === 'grid' && styles.activeChip]}>
                <Ionicons name="grid" size={14} color={subPanel==='grid' ? BRAND.primaryLight : TEXT.secondary} />
                <Text style={styles.chipLabel}>Grid</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSub('shape', toggleShapePanel)}
                style={[styles.chip, subPanel === 'shape' && styles.activeChip]}>
                <Ionicons name="shapes" size={14} color={subPanel==='shape' ? BRAND.primaryLight : TEXT.secondary} />
                <Text style={styles.chipLabel}>Shape</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSub('bg', toggleBgPanel)}
                style={[styles.chip, subPanel === 'bg' && styles.activeChip]}>
                <Ionicons name="color-palette" size={14} color={subPanel==='bg' ? BRAND.primaryLight : TEXT.secondary} />
                <Text style={styles.chipLabel}>Board</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { closeMenu(); onLayerPress?.(); }} style={styles.chip}>
                <Ionicons name="layers" size={14} color={TEXT.secondary} />
                <Text style={styles.chipLabel}>Layers</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { addSticky(); closeMenu(); }} style={styles.chip}>
                <Ionicons name="document-text-outline" size={14} color="#FEF08A" />
                <Text style={[styles.chipLabel, { color: '#FEF08A' }]}>Sticky</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}

      <View {...panResponder.panHandlers}>
        <TouchableOpacity
          onPress={isOpen ? closeMenu : openMenu}
          style={[styles.fab, {
            width: fabSize, height: fabSize,
            borderRadius: fabSize / 2,
            opacity: fabOpacity,
            backgroundColor: isOpen ? '#1E1E2E' : BRAND.primary,
            borderColor: currentTool?.color ?? BRAND.primaryLight,
          }]}
        >
          {isOpen
            ? <Ionicons name="close" size={fabSize * 0.42} color="#fff" />
            : <Ionicons name={(currentTool?.icon ?? 'pencil') as any} size={fabSize * 0.42} color="#fff" />
          }
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', zIndex: 100 },
  backdrop: {
    position: 'absolute',
    top: -2000, left: -2000,
    right: -2000, bottom: -2000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: -1,
  },
  menu: {
    position: 'absolute',
    backgroundColor: 'rgba(8,8,12,0.98)',
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.30)',
    padding: 12, gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  sectionLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: 'rgba(255,255,255,0.40)' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 7,
    borderRadius: 9, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  activeChip: { backgroundColor: 'rgba(124,58,237,0.25)', borderColor: 'rgba(124,58,237,0.60)' },
  chipLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.80)' },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  fab: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, elevation: 10 },
});

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { GlassPanel } from '../ui/GlassPanel';
import { ToolButton } from './ToolButton';
import { useToolStore } from '../../store/useToolStore';
import { useAppStore } from '../../store/useAppStore';
import { TOOL_DEFINITIONS } from '../../constants/tools';
import type { ToolType } from '../../types/canvas.types';

export const PrimaryToolbar: React.FC = () => {
  const tool = useToolStore((s) => s.tool);
  const color = useToolStore((s) => s.color);
  const setTool = useToolStore((s) => s.setTool);
  const toggleColorPalette = useAppStore((s) => s.toggleColorPalette);
  const toggleSizeSlider = useAppStore((s) => s.toggleSizeSlider);
  const toggleOpacitySlider = useAppStore((s) => s.toggleOpacitySlider);
  const toggleGridPanel = useAppStore((s) => s.toggleGridPanel);
  const toggleShapePanel = useAppStore((s) => s.toggleShapePanel);
  const toggleBgPanel = useAppStore((s) => s.toggleBgPanel);

  return (
    <GlassPanel style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <ToolButton icon="ellipse" onPress={toggleColorPalette} iconColor={color} />
        <ToolButton icon="resize" onPress={toggleSizeSlider} />
        <ToolButton icon="water" onPress={toggleOpacitySlider} />
        <ToolButton icon="grid" onPress={toggleGridPanel} />
        <ToolButton icon="shapes" onPress={toggleShapePanel} isActive={tool === 'shape'} />
        <ToolButton icon="color-palette" onPress={toggleBgPanel} />
        <View style={styles.divider} />
        {TOOL_DEFINITIONS.map((t) => (
          <ToolButton
            key={t.id}
            icon={t.icon as keyof typeof import('@expo/vector-icons').Ionicons.glyphMap}
            onPress={() => setTool(t.id as ToolType)}
            isActive={tool === t.id}
          />
        ))}
      </ScrollView>
    </GlassPanel>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8, paddingVertical: 7 },
  row: { alignItems: 'center', gap: 2 },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 5 },
});

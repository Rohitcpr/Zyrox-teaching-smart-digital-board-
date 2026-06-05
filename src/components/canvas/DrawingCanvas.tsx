import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Svg from 'react-native-svg';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useToolStore } from '../../store/useToolStore';
import { useSelectionStore } from '../../store/useSelectionStore';
import { StrokeRenderer } from './StrokeRenderer';
import { ActiveStroke } from './ActiveStroke';
import { SelectionOverlay } from './SelectionOverlay';
import { ShapeRenderer } from '../shapes/ShapeRenderer';
import { ActiveShape } from '../shapes/ActiveShape';
import { TextRenderer } from '../text/TextRenderer';
import { TextTool } from '../text/TextTool';
import { SelectionMenu } from '../selection/SelectionMenu';
import { useStrokeEraser } from '../../hooks/useStrokeEraser';

interface Props {
  onTap?: () => void;
  bgColor?: string;
  disabled?: boolean;
}

export const DrawingCanvas: React.FC<Props> = React.memo(({ onTap, bgColor = '#0A0A0F', disabled = false }) => {
  const beginStroke = useCanvasStore((s) => s.beginStroke);
  const addPoint = useCanvasStore((s) => s.addPoint);
  const endStroke = useCanvasStore((s) => s.endStroke);
  const cancelStroke = useCanvasStore((s) => s.cancelStroke);
  const beginShape = useCanvasStore((s) => s.beginShape);
  const updateShape = useCanvasStore((s) => s.updateShape);
  const endShape = useCanvasStore((s) => s.endShape);
  const addTextItem = useCanvasStore((s) => s.addTextItem);
  const layers = useCanvasStore((s) => s.layers);
  const shapes = useCanvasStore((s) => s.shapes);
  const textItems = useCanvasStore((s) => s.textItems);
  const activeStrokePoints = useCanvasStore((s) => s.activeStrokePoints);
  const activeShapeStart = useCanvasStore((s) => s.activeShapeStart);
  const activeShapeEnd = useCanvasStore((s) => s.activeShapeEnd);

  const tool = useToolStore((s) => s.tool);
  const color = useToolStore((s) => s.color);
  const size = useToolStore((s) => s.size);
  const opacity = useToolStore((s) => s.opacity);
  const activeShape = useToolStore((s) => s.activeShape);

  const { isSelecting, selectionBox, selectedItems, startSelection, updateSelection, endSelection, clearSelection } = useSelectionStore();
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const { eraseStrokeAtPoint } = useStrokeEraser();

  const toolRef = useRef({ tool, color, size, opacity, activeShape, disabled });
  toolRef.current = { tool, color, size, opacity, activeShape, disabled };

  const strokeActiveRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const drawGesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .maxPointers(1)
    .onBegin((e) => {
      if (toolRef.current.disabled) return;
      const { tool, color, size, opacity } = toolRef.current;
      const x = e.x;
      const y = e.y;

      strokeActiveRef.current = false;
      lastPosRef.current = { x, y };
      onTap?.();
      setShowSelectionMenu(false);

      if (tool === 'text') {
        setTextPos({ x, y });
      } else if (tool === 'select') {
        clearSelection();
        startSelection(x, y);
      } else if (tool === 'stroke_eraser') {
        eraseStrokeAtPoint({ x, y });
      } else if (tool === 'shape') {
        beginShape({ x, y });
      } else {
        beginStroke({ x, y, timestamp: Date.now() });
        strokeActiveRef.current = true;
      }
    })
    .onUpdate((e) => {
      if (toolRef.current.disabled) return;
      const { tool } = toolRef.current;
      const x = e.x;
      const y = e.y;

      // Distance check
      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 4 && tool !== 'stroke_eraser') return;

      // Jump filter - ignore > 150px jumps
      if (distSq > 22500) {
        lastPosRef.current = { x, y };
        return;
      }

      lastPosRef.current = { x, y };

      if (tool === 'select') {
        updateSelection(x, y);
      } else if (tool === 'stroke_eraser') {
        eraseStrokeAtPoint({ x, y });
      } else if (tool === 'shape') {
        updateShape({ x, y });
      } else if (strokeActiveRef.current) {
        addPoint({ x, y, timestamp: Date.now() });
      }
    })
    .onEnd(() => {
      if (toolRef.current.disabled) return;
      const { tool, color, size, opacity, activeShape } = toolRef.current;
      const wasActive = strokeActiveRef.current;
      strokeActiveRef.current = false;

      if (tool === 'select') {
        endSelection();
        setTimeout(() => setShowSelectionMenu(true), 100);
        return;
      }
      if (tool === 'text' || tool === 'stroke_eraser') return;

      if (tool === 'shape') {
        const start = useCanvasStore.getState().activeShapeStart;
        const end = useCanvasStore.getState().activeShapeEnd;
        if (!start || !end) return;
        endShape({ type: activeShape, startX: start.x, startY: start.y, endX: end.x, endY: end.y, color, size, opacity });
        return;
      }

      if (wasActive) {
        const points = useCanvasStore.getState().activeStrokePoints;
        if (points.length < 2) { cancelStroke(); return; }
        endStroke({ tool, color, size, opacity });
      }
    })
    .onFinalize(() => {
      // Always reset on any end
      if (strokeActiveRef.current) {
        strokeActiveRef.current = false;
        try { cancelStroke(); } catch(e) {}
      }
    });

  const allStrokes = useMemo(
    () => layers.filter((l) => l.visible).flatMap((l) => l.strokes),
    [layers]
  );

  if (disabled) {
    return (
      <View style={[styles.canvas, { backgroundColor: bgColor }]}>
        <Svg style={StyleSheet.absoluteFill}>
          <ShapeRenderer shapes={shapes} />
          <TextRenderer items={textItems} />
          <StrokeRenderer strokes={allStrokes} eraserColor={bgColor} />
        </Svg>
      </View>
    );
  }

  return (
    <GestureDetector gesture={drawGesture}>
      <View style={[styles.canvas, { backgroundColor: bgColor }]}>
        <Svg style={StyleSheet.absoluteFill}>
          <ShapeRenderer shapes={shapes} />
          <TextRenderer items={textItems} />
          <StrokeRenderer strokes={allStrokes} eraserColor={bgColor} />
          <ActiveStroke
            points={activeStrokePoints}
            color={color} size={size} opacity={opacity}
            tool={tool} eraserColor={bgColor}
          />
          {tool === 'shape' && activeShapeStart && activeShapeEnd && (
            <ActiveShape type={activeShape}
              startX={activeShapeStart.x} startY={activeShapeStart.y}
              endX={activeShapeEnd.x} endY={activeShapeEnd.y}
              color={color} size={size} opacity={opacity} />
          )}
          <SelectionOverlay box={selectionBox} isSelecting={isSelecting} />
        </Svg>

        {showSelectionMenu && selectionBox && selectedItems.strokeIds.length > 0 && (
          <SelectionMenu box={selectionBox} onClose={() => { setShowSelectionMenu(false); clearSelection(); }} />
        )}

        {textPos && (
          <TextTool x={textPos.x} y={textPos.y}
            onDone={(text, x, y) => { addTextItem({ text, x, y, color, fontSize: Math.max(size * 4, 16), opacity }); setTextPos(null); }}
            onCancel={() => setTextPos(null)}
          />
        )}
      </View>
    </GestureDetector>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';
const styles = StyleSheet.create({ canvas: { flex: 1 } });

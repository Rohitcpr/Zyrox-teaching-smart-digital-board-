import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
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
import { useTwoFingerGesture } from '../../hooks/useTwoFingerGesture';
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
  const { onTouchStart, onTouchEnd } = useTwoFingerGesture();

  const toolRef = useRef({ tool, color, size, opacity, activeShape, disabled });
  toolRef.current = { tool, color, size, opacity, activeShape, disabled };

  const isDrawingRef = useRef(false);
  const strokeActiveRef = useRef(false);
  const lastPosRef = useRef<{x:number,y:number}|null>(null);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => !toolRef.current.disabled,
    onMoveShouldSetPanResponder: () => !toolRef.current.disabled,
    onPanResponderTerminationRequest: () => true,

    onPanResponderGrant: (evt) => {
      if (toolRef.current.disabled) return;
      if (evt.nativeEvent.touches.length > 1) {
        isDrawingRef.current = false;
        strokeActiveRef.current = false;
        try { cancelStroke(); } catch(e) {}
        return;
      }
      try {
        onTouchStart(evt);
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        const { tool } = toolRef.current;
        
        isDrawingRef.current = true;
        strokeActiveRef.current = false;
        lastPosRef.current = { x, y };
        
        onTap?.();
        setShowSelectionMenu(false);

        if (tool === 'text') {
          setTextPos({ x, y });
          isDrawingRef.current = false;
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
      } catch(e) {
        isDrawingRef.current = false;
        strokeActiveRef.current = false;
      }
    },

    onPanResponderMove: (evt) => {
      if (toolRef.current.disabled) return;
      if (!isDrawingRef.current) return;
      if (evt.nativeEvent.touches.length > 1) {
        isDrawingRef.current = false;
        strokeActiveRef.current = false;
        try { cancelStroke(); } catch(e) {}
        return;
      }
      try {
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        const { tool } = toolRef.current;

        const last = lastPosRef.current;
        if (last) {
          const dx = x - last.x;
          const dy = y - last.y;
          const d = dx*dx + dy*dy;
          if (d < 4) return; // min 2px
          if (d > 22500) { // max 150px jump
            lastPosRef.current = { x, y };
            return;
          }
        }
        lastPosRef.current = { x, y };

        if (tool === 'select') updateSelection(x, y);
        else if (tool === 'stroke_eraser') eraseStrokeAtPoint({ x, y });
        else if (tool === 'shape') updateShape({ x, y });
        else if (strokeActiveRef.current) addPoint({ x, y, timestamp: Date.now() });
      } catch(e) {}
    },

    onPanResponderRelease: (evt) => {
      const wasDrawing = isDrawingRef.current;
      const wasStroke = strokeActiveRef.current;
      isDrawingRef.current = false;
      strokeActiveRef.current = false;
      lastPosRef.current = null;

      if (!wasDrawing || toolRef.current.disabled) return;
      try {
        const wasGesture = onTouchEnd(evt);
        if (wasGesture) return;

        const { tool, color, size, opacity, activeShape } = toolRef.current;
        if (tool === 'select') { endSelection(); setTimeout(() => setShowSelectionMenu(true), 100); return; }
        if (tool === 'text' || tool === 'stroke_eraser') return;
        if (tool === 'shape') {
          const s = useCanvasStore.getState().activeShapeStart;
          const e = useCanvasStore.getState().activeShapeEnd;
          if (s && e) endShape({ type: activeShape, startX: s.x, startY: s.y, endX: e.x, endY: e.y, color, size, opacity });
          return;
        }
        if (wasStroke) {
          const pts = useCanvasStore.getState().activeStrokePoints;
          if (pts.length < 2) { cancelStroke(); return; }
          endStroke({ tool, color, size, opacity });
        }
      } catch(e) { try { cancelStroke(); } catch(e2) {} }
    },

    onPanResponderTerminate: () => {
      isDrawingRef.current = false;
      strokeActiveRef.current = false;
      lastPosRef.current = null;
      try { cancelStroke(); } catch(e) {}
    },
  })).current;

  const allStrokes = useMemo(
    () => layers.filter(l => l.visible).flatMap(l => l.strokes),
    [layers]
  );

  return (
    <View style={[styles.canvas, { backgroundColor: bgColor }]} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        <ShapeRenderer shapes={shapes} />
        <TextRenderer items={textItems} />
        <StrokeRenderer strokes={allStrokes} eraserColor={bgColor} />
        <ActiveStroke points={activeStrokePoints} color={color} size={size} opacity={opacity} tool={tool} eraserColor={bgColor} />
        {tool === 'shape' && activeShapeStart && activeShapeEnd && (
          <ActiveShape type={activeShape} startX={activeShapeStart.x} startY={activeShapeStart.y} endX={activeShapeEnd.x} endY={activeShapeEnd.y} color={color} size={size} opacity={opacity} />
        )}
        <SelectionOverlay box={selectionBox} isSelecting={isSelecting} />
      </Svg>
      {showSelectionMenu && selectionBox && selectedItems.strokeIds.length > 0 && (
        <SelectionMenu box={selectionBox} onClose={() => { setShowSelectionMenu(false); clearSelection(); }} />
      )}
      {textPos && (
        <TextTool x={textPos.x} y={textPos.y}
          onDone={(text, x, y) => { addTextItem({ text, x, y, color, fontSize: Math.max(size*4, 16), opacity }); setTextPos(null); }}
          onCancel={() => setTextPos(null)}
        />
      )}
    </View>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';
const styles = StyleSheet.create({ canvas: { flex: 1 } });

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
import { usePalmRejection } from '../../hooks/usePalmRejection';
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

  const toolRef = useRef({ tool, color, size, opacity, activeShape, disabled });
  toolRef.current = { tool, color, size, opacity, activeShape, disabled };

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const touchCountRef = useRef(0);
  const strokeStartedRef = useRef(false);

  const { shouldReject, reset } = usePalmRejection();
  const { onTouchStart, onTouchEnd } = useTwoFingerGesture();
  const { eraseStrokeAtPoint } = useStrokeEraser();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !toolRef.current.disabled,
      onMoveShouldSetPanResponder: () => !toolRef.current.disabled,

      onPanResponderGrant: (evt) => {
        if (toolRef.current.disabled) return;
        try {
          touchCountRef.current = evt.nativeEvent.touches.length;
          onTouchStart(evt);

          if (evt.nativeEvent.touches.length > 1) {
            // Multi-touch — cancel any active stroke
            if (strokeStartedRef.current) {
              try { cancelStroke(); } catch(e) {}
              strokeStartedRef.current = false;
            }
            isDrawingRef.current = false;
            return;
          }

          if (shouldReject(evt)) { isDrawingRef.current = false; return; }

          const { locationX, locationY } = evt.nativeEvent;
          const { tool } = toolRef.current;
          onTap?.();
          setShowSelectionMenu(false);
          lastPointRef.current = { x: locationX, y: locationY };
          isDrawingRef.current = true;
          strokeStartedRef.current = false;

          if (tool === 'select') {
            clearSelection();
            startSelection(locationX, locationY);
          } else if (tool === 'text') {
            setTextPos({ x: locationX, y: locationY });
            isDrawingRef.current = false;
          } else if (tool === 'stroke_eraser') {
            eraseStrokeAtPoint({ x: locationX, y: locationY });
          } else if (tool === 'shape') {
            beginShape({ x: locationX, y: locationY });
          } else {
            beginStroke({ x: locationX, y: locationY, timestamp: Date.now() });
            strokeStartedRef.current = true;
          }
        } catch(e) {
          isDrawingRef.current = false;
          strokeStartedRef.current = false;
        }
      },

      onPanResponderMove: (evt) => {
        if (toolRef.current.disabled) return;
        try {
          // If more fingers join — stop drawing
          if (evt.nativeEvent.touches.length > 1) {
            if (strokeStartedRef.current) {
              try { cancelStroke(); } catch(e) {}
              strokeStartedRef.current = false;
            }
            isDrawingRef.current = false;
            return;
          }

          if (!isDrawingRef.current) return;

          const { locationX, locationY } = evt.nativeEvent;
          const { tool } = toolRef.current;

          // Distance filter — prevent too many points
          const last = lastPointRef.current;
          if (last && tool !== 'select' && tool !== 'stroke_eraser') {
            const dx = locationX - last.x;
            const dy = locationY - last.y;
            if (dx * dx + dy * dy < 4) return; // min 2px
          }
          lastPointRef.current = { x: locationX, y: locationY };

          if (tool === 'select') {
            updateSelection(locationX, locationY);
          } else if (tool === 'stroke_eraser') {
            eraseStrokeAtPoint({ x: locationX, y: locationY });
          } else if (tool === 'shape') {
            updateShape({ x: locationX, y: locationY });
          } else if (strokeStartedRef.current) {
            addPoint({ x: locationX, y: locationY, timestamp: Date.now() });
          }
        } catch(e) {}
      },

      onPanResponderRelease: (evt) => {
        if (toolRef.current.disabled) {
          isDrawingRef.current = false;
          strokeStartedRef.current = false;
          return;
        }
        try {
          const wasGesture = onTouchEnd(evt);
          reset();

          const wasDrawing = isDrawingRef.current;
          const wasStroke = strokeStartedRef.current;

          isDrawingRef.current = false;
          strokeStartedRef.current = false;
          lastPointRef.current = null;

          if (wasGesture || !wasDrawing) return;

          const { tool, color, size, opacity, activeShape } = toolRef.current;

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
          } else if (wasStroke) {
            const points = useCanvasStore.getState().activeStrokePoints;
            if (points.length < 2) { cancelStroke(); return; }
            endStroke({ tool, color, size, opacity });
          }
        } catch(e) {
          isDrawingRef.current = false;
          strokeStartedRef.current = false;
        }
      },

      onPanResponderTerminate: () => {
        // CRITICAL: Always reset on terminate
        isDrawingRef.current = false;
        strokeStartedRef.current = false;
        lastPointRef.current = null;
        try { reset(); cancelStroke(); } catch(e) {}
      },

      // CRITICAL: Allow termination so system can reset
      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  const allStrokes = useMemo(
    () => layers.filter((l) => l.visible).flatMap((l) => l.strokes),
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
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';
const styles = StyleSheet.create({ canvas: { flex: 1 } });

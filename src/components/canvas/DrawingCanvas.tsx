import React, { useRef, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, PanResponder } from "react-native";
import Svg from "react-native-svg";
import { useCanvasStore } from "../../store/useCanvasStore";
import { useToolStore } from "../../store/useToolStore";
import { useSelectionStore } from "../../store/useSelectionStore";
import { useInteractionStore } from "../../store/useInteractionStore";
import { StrokeRenderer } from "./StrokeRenderer";
import { ActiveStroke } from "./ActiveStroke";
import { SelectionOverlay } from "./SelectionOverlay";
import { ShapeRenderer } from "../shapes/ShapeRenderer";
import { ActiveShape } from "../shapes/ActiveShape";
import { TextRenderer } from "../text/TextRenderer";
import { TextTool } from "../text/TextTool";
import { TextEditMenu } from "../text/TextEditMenu";
import { SelectionMenu } from "../selection/SelectionMenu";
import { usePalmRejection } from "../../hooks/usePalmRejection";
import { useTwoFingerGesture } from "../../hooks/useTwoFingerGesture";
import { useStrokeEraser } from "../../hooks/useStrokeEraser";

interface Props {
  onTap?: () => void;
  bgColor?: string;
}

export const DrawingCanvas: React.FC<Props> = ({ onTap, bgColor = "#0A0A0F" }) => {
  // ✅ Single store subscription - reduces re-renders
  const beginStroke   = useCanvasStore((s) => s.beginStroke);
  const addPoint      = useCanvasStore((s) => s.addPoint);
  const endStroke     = useCanvasStore((s) => s.endStroke);
  const cancelStroke  = useCanvasStore((s) => s.cancelStroke);
  const beginShape    = useCanvasStore((s) => s.beginShape);
  const updateShape   = useCanvasStore((s) => s.updateShape);
  const endShape      = useCanvasStore((s) => s.endShape);
  const addTextItem    = useCanvasStore((s) => s.addTextItem);
  const updateTextItem = useCanvasStore((s) => s.updateTextItem);
  const deleteTextItem = useCanvasStore((s) => s.deleteTextItem);

  // ✅ Memoized - only re-renders when layers change
  const layers            = useCanvasStore((s) => s.layers);
  const shapes            = useCanvasStore((s) => s.shapes);
  const textItems         = useCanvasStore((s) => s.textItems);
  const activeStrokePoints = useCanvasStore((s) => s.activeStrokePoints);
  const activeShapeStart  = useCanvasStore((s) => s.activeShapeStart);
  const activeShapeEnd    = useCanvasStore((s) => s.activeShapeEnd);

  const tool        = useToolStore((s) => s.tool);
  const color       = useToolStore((s) => s.color);
  const size        = useToolStore((s) => s.size);
  const opacity     = useToolStore((s) => s.opacity);
  const activeShape = useToolStore((s) => s.activeShape);

  const interactionMode = useInteractionStore((s) => s.mode);

  const {
    isSelecting, selectionBox, selectedItems,
    startSelection, updateSelection, endSelection, clearSelection,
  } = useSelectionStore();

  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const [editingText, setEditingText] = useState<any>(null);
  const [selectedTextItem, setSelectedTextItem] = useState<any>(null);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);

  // ✅ Ref for tool state - no re-render on tool change inside PanResponder
  const toolRef = useRef({ tool, color, size, opacity, activeShape, interactionMode });
  toolRef.current = { tool, color, size, opacity, activeShape, interactionMode };

  const isDrawingRef  = useRef(false);
  const lastPointRef  = useRef<{ x: number; y: number } | null>(null);
  const pointCountRef = useRef(0);

  const { shouldReject, reset } = usePalmRejection();
  const { onTouchStart, onTouchEnd } = useTwoFingerGesture();
  const { eraseStrokeAtPoint } = useStrokeEraser();

  // ✅ Memoize allStrokes - expensive computation
  const allStrokes = useMemo(
    () => layers.filter((l) => l.visible).flatMap((l) => l.strokes),
    [layers]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => toolRef.current.interactionMode !== "edit",
      onMoveShouldSetPanResponder: () => isDrawingRef.current,

      onPanResponderGrant: (evt) => {
        onTouchStart(evt);
        if (evt.nativeEvent.touches.length > 1) { isDrawingRef.current = false; return; }
        if (shouldReject(evt)) { isDrawingRef.current = false; return; }
        if (toolRef.current.interactionMode === "edit") { isDrawingRef.current = false; return; }

        const { locationX, locationY } = evt.nativeEvent;
        const { tool } = toolRef.current;
        onTap?.();
        setShowSelectionMenu(false);
        lastPointRef.current = { x: locationX, y: locationY };
        pointCountRef.current = 0;

        if (tool === "select") {
          clearSelection();
          startSelection(locationX, locationY);
          isDrawingRef.current = true;
        } else if (tool === "text") {
          setTextPos({ x: locationX, y: locationY });
          isDrawingRef.current = false;
        } else if (tool === "stroke_eraser") {
          eraseStrokeAtPoint({ x: locationX, y: locationY });
          isDrawingRef.current = true;
        } else if (tool === "shape") {
          beginShape({ x: locationX, y: locationY });
          isDrawingRef.current = true;
        } else {
          beginStroke({ x: locationX, y: locationY, timestamp: Date.now() });
          isDrawingRef.current = true;
        }
      },

      onPanResponderMove: (evt) => {
        if (evt.nativeEvent.touches.length > 1) return;
        if (!isDrawingRef.current) return;

        const { locationX, locationY } = evt.nativeEvent;
        const { tool, size } = toolRef.current;

        // ✅ Dynamic threshold based on tool size - smoother + faster
        const minDist = tool === "eraser" ? 2 : Math.max(1, size * 0.3);
        const last = lastPointRef.current;
        if (last && tool !== "select" && tool !== "stroke_eraser") {
          const dx = locationX - last.x;
          const dy = locationY - last.y;
          if (dx * dx + dy * dy < minDist * minDist) return;
        }
        lastPointRef.current = { x: locationX, y: locationY };
        pointCountRef.current++;

        if (tool === "select") {
          updateSelection(locationX, locationY);
        } else if (tool === "stroke_eraser") {
          eraseStrokeAtPoint({ x: locationX, y: locationY });
        } else if (tool === "shape") {
          updateShape({ x: locationX, y: locationY });
        } else {
          addPoint({ x: locationX, y: locationY, timestamp: Date.now() });
        }
      },

      onPanResponderRelease: (evt) => {
        const wasGesture = onTouchEnd(evt);
        reset();
        isDrawingRef.current = false;
        lastPointRef.current = null;
        if (wasGesture) return;

        const { tool, color, size, opacity, activeShape } = toolRef.current;

        if (tool === "select") {
          endSelection();
          setTimeout(() => setShowSelectionMenu(true), 100);
          return;
        }
        if (tool === "text" || tool === "stroke_eraser") return;
        if (tool === "shape") {
          const start = useCanvasStore.getState().activeShapeStart;
          const end   = useCanvasStore.getState().activeShapeEnd;
          if (!start || !end) return;
          endShape({ type: activeShape, startX: start.x, startY: start.y, endX: end.x, endY: end.y, color, size, opacity });
        } else {
          const points = useCanvasStore.getState().activeStrokePoints;
          if (points.length < 2) { cancelStroke(); return; }
          endStroke({ tool, color, size, opacity });
        }
      },

      onPanResponderTerminate: () => {
        isDrawingRef.current = false;
        lastPointRef.current = null;
        reset();
        cancelStroke();
      },
    })
  ).current;

  return (
    <View style={[styles.canvas, { backgroundColor: bgColor }]} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        <ShapeRenderer shapes={shapes} />
        <TextRenderer items={textItems} onTap={(item) => setSelectedTextItem(item)} />
        <StrokeRenderer strokes={allStrokes} eraserColor={bgColor} />
        <ActiveStroke
          points={activeStrokePoints}
          color={color}
          size={size}
          opacity={opacity}
          tool={tool}
          eraserColor={bgColor}
        />
        {tool === "shape" && activeShapeStart && activeShapeEnd && (
          <ActiveShape
            type={activeShape}
            startX={activeShapeStart.x}
            startY={activeShapeStart.y}
            endX={activeShapeEnd.x}
            endY={activeShapeEnd.y}
            color={color}
            size={size}
            opacity={opacity}
          />
        )}
        <SelectionOverlay box={selectionBox} isSelecting={isSelecting} />
      </Svg>

      {showSelectionMenu && selectionBox && selectedItems.strokeIds.length > 0 && (
        <SelectionMenu
          box={selectionBox}
          onClose={() => { setShowSelectionMenu(false); clearSelection(); }}
        />
      )}

      {editingText && (
        <TextTool
          x={editingText.x}
          y={editingText.y}
          initialText={editingText.text}
          initialFontSize={editingText.fontSize}
          initialFontWeight={editingText.fontWeight ?? "500"}
          initialFontStyle={editingText.fontStyle ?? "normal"}
          onDone={(text, x, y, fontWeight, fontStyle, fontSize) => {
            updateTextItem(editingText.id, { text, fontWeight, fontStyle, fontSize });
            setEditingText(null);
          }}
          onCancel={() => setEditingText(null)}
        />
      )}
      {textPos && (
        <TextTool
          x={textPos.x}
          y={textPos.y}
          onDone={(text, x, y, fontWeight, fontStyle, fontSize) => {
            addTextItem({ text, x, y, color, fontSize, opacity, fontWeight, fontStyle });
            setTextPos(null);
          }}
          onCancel={() => setTextPos(null)}
        />
      )}
      {selectedTextItem && (
        <TextEditMenu
          item={selectedTextItem}
          onUpdate={(id, changes) => {
            updateTextItem(id, changes);
            setSelectedTextItem((prev: any) => prev ? { ...prev, ...changes } : null);
          }}
          onDelete={(id) => {
            deleteTextItem(id);
            setSelectedTextItem(null);
          }}
          onEdit={(item) => {
            setEditingText(item);
            setSelectedTextItem(null);
          }}
          onClose={() => setSelectedTextItem(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({ canvas: { flex: 1 } });

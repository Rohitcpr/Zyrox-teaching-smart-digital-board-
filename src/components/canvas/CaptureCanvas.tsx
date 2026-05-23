import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Svg from 'react-native-svg';
import { StrokeRenderer } from './StrokeRenderer';
import { ShapeRenderer } from '../shapes/ShapeRenderer';
import { TextRenderer } from '../text/TextRenderer';
import { useCanvasStore } from '../../store/useCanvasStore';

export interface CaptureCanvasRef {
  capture: () => Promise<string>;
}

interface Props {
  bgColor?: string;
  width: number;
  height: number;
}

export const CaptureCanvas = forwardRef<CaptureCanvasRef, Props>(
  ({ bgColor = '#0A0A0F', width, height }, ref) => {
    const viewShotRef = useRef<ViewShot>(null);
    const layers = useCanvasStore((s) => s.layers);
    const shapes = useCanvasStore((s) => s.shapes);
    const textItems = useCanvasStore((s) => s.textItems);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        if (!viewShotRef.current) throw new Error('ViewShot not ready');
        const uri = await (viewShotRef.current as any).capture();
        return uri;
      },
    }));

    const allStrokes = layers.filter((l) => l.visible).flatMap((l) => l.strokes);

    return (
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1.0 }}
        style={[styles.container, { width, height, backgroundColor: bgColor }]}
      >
        <Svg width={width} height={height}>
          <ShapeRenderer shapes={shapes} />
          <TextRenderer items={textItems} />
          <StrokeRenderer strokes={allStrokes} eraserColor={bgColor} />
        </Svg>
      </ViewShot>
    );
  }
);

CaptureCanvas.displayName = 'CaptureCanvas';

const styles = StyleSheet.create({
  container: { position: 'absolute', left: -9999, top: -9999 },
});

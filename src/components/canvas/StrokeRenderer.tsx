import React, { memo } from 'react';
import { G, Path } from 'react-native-svg';
import type { Stroke } from '../../types/canvas.types';
import { pointsToSvgPath } from '../../utils/strokeUtils';

interface Props {
  strokes: Stroke[];
  eraserColor?: string;
}

export const StrokeRenderer: React.FC<Props> = memo(({ strokes, eraserColor = '#0A0A0F' }) => (
  <G>
    {strokes.map((stroke) => {
      const d = pointsToSvgPath(stroke.points);
      if (!d) return null;
      const isEraser = stroke.tool === 'eraser';
      const isHighlighter = stroke.tool === 'highlighter';
      return (
        <Path
          key={stroke.id}
          d={d}
          stroke={isEraser ? eraserColor : stroke.color}
          strokeWidth={isEraser ? stroke.size * 2 : isHighlighter ? stroke.size * 1.5 : stroke.size}
          strokeOpacity={isHighlighter ? Math.min(stroke.opacity, 0.45) : stroke.opacity}
          strokeLinecap={isHighlighter ? 'square' : 'round'}
          strokeLinejoin={isHighlighter ? 'bevel' : 'round'}
          fill="none"
        />
      );
    })}
  </G>
));

StrokeRenderer.displayName = 'StrokeRenderer';

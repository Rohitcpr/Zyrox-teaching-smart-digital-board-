import React, { memo } from 'react';
import { Path } from 'react-native-svg';
import type { Point } from '../../types/canvas.types';
import { pointsToSvgPath } from '../../utils/strokeUtils';

interface Props {
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  tool: string;
  eraserColor?: string;
}

export const ActiveStroke: React.FC<Props> = memo(({ points, color, size, opacity, tool, eraserColor = '#0A0A0F' }) => {
  if (points.length < 2) return null;
  const d = pointsToSvgPath(points);
  const isEraser = tool === 'eraser';
  return (
    <Path
      d={d}
      stroke={isEraser ? eraserColor : color}
      strokeWidth={isEraser ? size * 2 : size}
      strokeOpacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
});

ActiveStroke.displayName = 'ActiveStroke';

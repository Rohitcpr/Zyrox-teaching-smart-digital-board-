import React, { memo } from 'react';
import { Path, Circle } from 'react-native-svg';
import type { Point, ToolType } from '../../types/canvas.types';
import { pointsToSvgPath } from '../../utils/strokeUtils';

interface Props {
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  tool: ToolType;
  eraserColor: string;
}

export const ActiveStroke: React.FC<Props> = memo(({ points, color, size, opacity, tool, eraserColor }) => {
  if (points.length === 0) return null;

  const isEraser = tool === 'eraser';
  const strokeColor = isEraser ? eraserColor : color;
  const strokeWidth = tool === 'highlighter' ? size * 2.5 : size;
  const strokeOpacity = tool === 'highlighter' ? 0.38 : opacity;

  if (points.length === 1) {
    return (
      <Circle
        cx={points[0].x} cy={points[0].y}
        r={strokeWidth / 2}
        fill={strokeColor}
        fillOpacity={strokeOpacity}
      />
    );
  }

  const path = pointsToSvgPath(points);

  return (
    <Path
      d={path}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}, (prev, next) => {
  // Only re-render when points actually change
  return prev.points === next.points &&
    prev.color === next.color &&
    prev.size === next.size &&
    prev.opacity === next.opacity &&
    prev.tool === next.tool;
});

ActiveStroke.displayName = 'ActiveStroke';

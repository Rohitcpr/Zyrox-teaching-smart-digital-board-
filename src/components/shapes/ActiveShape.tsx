import React, { memo } from 'react';
import { Path } from 'react-native-svg';
import type { ShapeType } from '../../types/shape.types';
import { generateShapePath } from '../../utils/shapeUtils';

interface Props {
  type: ShapeType;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  opacity: number;
}

export const ActiveShape: React.FC<Props> = memo((props) => {
  const { color, size, opacity, ...rest } = props;
  const d = generateShapePath({
    ...rest,
    id: 'active',
    color,
    size,
    opacity,
    layerId: '',
    createdAt: 0,
  });

  if (!d) return null;

  return (
    <Path
      d={d}
      stroke={color}
      strokeWidth={size}
      strokeOpacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray="6,4"
    />
  );
});

ActiveShape.displayName = 'ActiveShape';

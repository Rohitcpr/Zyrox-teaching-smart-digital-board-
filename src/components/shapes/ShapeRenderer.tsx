import React, { memo } from 'react';
import { G, Path } from 'react-native-svg';
import type { Shape } from '../../types/shape.types';
import { generateShapePath } from '../../utils/shapeUtils';

interface Props {
  shapes: Shape[];
}

export const ShapeRenderer: React.FC<Props> = memo(({ shapes }) => (
  <G>
    {shapes.map((shape) => {
      const d = generateShapePath(shape);
      if (!d) return null;
      return (
        <Path
          key={shape.id}
          d={d}
          stroke={shape.color}
          strokeWidth={shape.size}
          strokeOpacity={shape.opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    })}
  </G>
));

ShapeRenderer.displayName = 'ShapeRenderer';

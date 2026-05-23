import React, { memo } from 'react';
import { G, Rect, Line } from 'react-native-svg';
import type { SelectionBox } from '../../types/selection.types';

interface Props {
  box: SelectionBox | null;
  isSelecting: boolean;
}

export const SelectionOverlay: React.FC<Props> = memo(({ box, isSelecting }) => {
  if (!box || box.width < 5 || box.height < 5) return null;

  return (
    <G>
      {/* Selection rectangle */}
      <Rect
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        stroke="#7C3AED"
        strokeWidth={1.5}
        strokeDasharray="6,4"
        fill="rgba(124,58,237,0.08)"
        rx={4}
      />
      {/* Corner handles */}
      {[
        { x: box.x, y: box.y },
        { x: box.x + box.width, y: box.y },
        { x: box.x, y: box.y + box.height },
        { x: box.x + box.width, y: box.y + box.height },
      ].map((corner, i) => (
        <Rect
          key={i}
          x={corner.x - 5}
          y={corner.y - 5}
          width={10}
          height={10}
          rx={2}
          fill="#7C3AED"
          stroke="#fff"
          strokeWidth={1}
        />
      ))}
    </G>
  );
});

SelectionOverlay.displayName = 'SelectionOverlay';

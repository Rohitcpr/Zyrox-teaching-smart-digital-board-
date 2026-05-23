import React, { memo } from 'react';
import { G, Text as SvgText } from 'react-native-svg';

export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  opacity: number;
}

interface Props {
  items: TextItem[];
}

export const TextRenderer: React.FC<Props> = memo(({ items }) => (
  <G>
    {items.map((item) => (
      <SvgText
        key={item.id}
        x={item.x}
        y={item.y}
        fill={item.color}
        fontSize={item.fontSize}
        fillOpacity={item.opacity}
        fontWeight="500"
      >
        {item.text}
      </SvgText>
    ))}
  </G>
));

TextRenderer.displayName = 'TextRenderer';

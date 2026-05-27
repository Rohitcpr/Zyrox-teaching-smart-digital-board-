import React, { memo } from "react";
import { G, Text as SvgText } from "react-native-svg";

export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  opacity: number;
  fontWeight?: string;
  fontStyle?: string;
}

interface Props {
  items: TextItem[];
  onTap?: (item: TextItem) => void;
}

export const TextRenderer: React.FC<Props> = memo(({ items, onTap }) => (
  <G>
    {items.map((item) => (
      <SvgText
        key={item.id}
        x={item.x}
        y={item.y}
        fill={item.color}
        fontSize={item.fontSize}
        fillOpacity={item.opacity}
        fontWeight={item.fontWeight ?? "500"}
        fontStyle={item.fontStyle ?? "normal"}
        onPress={() => onTap?.(item)}
      >
        {item.text}
      </SvgText>
    ))}
  </G>
));

TextRenderer.displayName = "TextRenderer";

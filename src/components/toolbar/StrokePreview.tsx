import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useToolStore } from '../../store/useToolStore';

export const StrokePreview: React.FC = () => {
  const color = useToolStore((s) => s.color);
  const size = useToolStore((s) => s.size);
  const opacity = useToolStore((s) => s.opacity);
  const tool = useToolStore((s) => s.tool);

  const isEraser = tool === 'eraser';
  const dotColor = isEraser ? '#555577' : color;
  const radius = Math.min(size / 2, 20);
  const boxSize = 48;

  return (
    <View style={styles.container}>
      <Svg width={boxSize} height={boxSize}>
        <Circle
          cx={boxSize / 2}
          cy={boxSize / 2}
          r={radius}
          fill={dotColor}
          fillOpacity={opacity}
          stroke={isEraser ? '#7C3AED' : 'transparent'}
          strokeWidth={isEraser ? 1.5 : 0}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

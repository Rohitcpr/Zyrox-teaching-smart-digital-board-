import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';

type GridType = 'none' | 'dots' | 'lines' | 'squares';

interface Props { type: GridType; }

export const GridOverlay: React.FC<Props> = memo(({ type }) => {
  const { width, height } = useWindowDimensions();

  if (type === 'none') return null;

  const spacing = 40;
  const color = 'rgba(124,58,237,0.22)';
  const dotColor = 'rgba(168,85,247,0.40)';

  if (type === 'dots') {
    const dots: React.ReactNode[] = [];
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        dots.push(<Circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill={dotColor} />);
      }
    }
    return (
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        {dots}
      </Svg>
    );
  }

  if (type === 'lines') {
    const lines: React.ReactNode[] = [];
    for (let y = spacing; y < height; y += spacing) {
      lines.push(<Line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={0.8} />);
    }
    return (
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        {lines}
      </Svg>
    );
  }

  if (type === 'squares') {
    const lines: React.ReactNode[] = [];
    for (let x = 0; x <= width; x += spacing) {
      lines.push(<Line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke={color} strokeWidth={0.8} />);
    }
    for (let y = 0; y <= height; y += spacing) {
      lines.push(<Line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={0.8} />);
    }
    return (
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        {lines}
      </Svg>
    );
  }

  return null;
});

GridOverlay.displayName = 'GridOverlay';

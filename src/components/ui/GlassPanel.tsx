import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { GLASS } from '../../constants/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GlassPanel: React.FC<Props> = ({ children, style }) => (
  <View style={[styles.panel, style]}>{children}</View>
);

const styles = StyleSheet.create({
  panel: {
    backgroundColor: GLASS.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GLASS.border,
    overflow: 'hidden',
  },
});

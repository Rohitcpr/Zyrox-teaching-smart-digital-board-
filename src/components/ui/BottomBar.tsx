import React from 'react';
import { View, StyleSheet } from 'react-native';

// Bottom bar removed — all controls in TopBar 3-dot menu
export const BottomBar: React.FC = () => <View style={styles.empty} />;

const styles = StyleSheet.create({
  empty: { height: 0 },
});

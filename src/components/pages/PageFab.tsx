import React, { useRef, useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '../../constants/colors';
import { useDraggable } from '../../hooks/useDraggable';
import { useFabSettings } from '../../hooks/useFabSettings';

interface Props {
  onPress: () => void;
}

export const PageFab: React.FC<Props> = ({ onPress }) => {
  const { width, height } = useWindowDimensions();
  const { pan, panResponder } = useDraggable(width - 80, height - 100);
  const { fabSize, fabOpacity } = useFabSettings();

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
    >
      <View {...panResponder.panHandlers}>
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles.fab,
            {
              width: fabSize, height: fabSize,
              borderRadius: fabSize / 2,
              opacity: fabOpacity,
            },
          ]}
        >
          <Ionicons name="add" size={fabSize * 0.45} color={BRAND.primaryLight} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 100 },
  fab: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.50)',
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
  },
});

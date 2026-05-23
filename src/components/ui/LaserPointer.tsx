import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

interface Props {
  onExit: () => void;
}

export const LaserPointer: React.FC<Props> = ({ onExit }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setPos({ x: locationX, y: locationY });
        setVisible(true);
        Animated.spring(scale, { toValue: 1.3, useNativeDriver: true }).start();
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setPos({ x: locationX, y: locationY });
      },
      onPanResponderRelease: () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        setVisible(false);
      },
    })
  ).current;

  return (
    <View style={styles.overlay} {...panResponder.panHandlers}>
      {visible && (
        <Animated.View
          style={[
            styles.dot,
            {
              left: pos.x - 15,
              top: pos.y - 15,
              transform: [{ scale }],
            },
          ]}
        >
          <View style={styles.innerDot} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  dot: {
    position: 'absolute',
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(239,68,68,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  innerDot: {
    width: 12, height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 10,
  },
});

import React, { useRef, useState } from "react";
import {
  Animated, PanResponder, View, StyleSheet,
  TouchableOpacity, Image, useWindowDimensions, Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  uri: string;
  name?: string;
  onRemove: () => void;
}

export const ImportedImageLayer: React.FC<Props> = ({ uri, name, onRemove }) => {
  const { width, height } = useWindowDimensions();
  const [showControls, setShowControls] = useState(true);
  const [, forceUpdate] = useState(0);

  const sizeRef = useRef({ w: width * 0.85, h: height * 0.55 });
  const aspectRatio = useRef((width * 0.85) / (height * 0.55));

  const pan = useRef(new Animated.ValueXY({ x: (width - width * 0.85) / 2, y: 80 })).current;
  const currentPos = useRef({ x: (width - width * 0.85) / 2, y: 80 });
  const lastPinchDist = useRef(null);
  const isPinching = useRef(false);
  const lastSize = useRef({ w: width * 0.85, h: height * 0.55 });

  const getDist = (touches) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        if (e.nativeEvent.touches.length === 1) {
          pan.setOffset({ x: currentPos.current.x, y: currentPos.current.y });
          pan.setValue({ x: 0, y: 0 });
        }
        if (e.nativeEvent.touches.length === 2) {
          lastSize.current = { ...sizeRef.current };
          lastPinchDist.current = getDist(Array.from(e.nativeEvent.touches));
          isPinching.current = true;
        }
      },

      onPanResponderMove: (e, gs) => {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2) {
          isPinching.current = true;
          const dist = getDist(Array.from(touches));
          if (lastPinchDist.current !== null) {
            const scale = dist / lastPinchDist.current;
            const newW = Math.max(80, Math.min(width * 3, lastSize.current.w * scale));
            sizeRef.current = { w: newW, h: newW / aspectRatio.current };
            forceUpdate((n) => n + 1);
          }
        } else if (touches.length === 1 && isPinching.current === false) {
          Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(e, gs);
        }
      },

      onPanResponderRelease: (_, gs) => {
        if (isPinching.current === false) {
          pan.flattenOffset();
          currentPos.current = {
            x: currentPos.current.x + gs.dx,
            y: currentPos.current.y + gs.dy,
          };
        }
        isPinching.current = false;
        lastPinchDist.current = null;
      },
    })
  ).current;

  const { w, h } = sizeRef.current;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity activeOpacity={1} onPress={() => setShowControls((s) => s === false)}>
        <Image
          source={{ uri }}
          style={{ width: w, height: h, borderRadius: 4 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={onRemove} style={styles.deleteBtn}>
            <Ionicons name="close" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {showControls && name && (
        <View style={styles.nameTag}>
          <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: "absolute", zIndex: 5 },
  controls: { position: "absolute", top: -18, right: 0 },
  deleteBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(239,68,68,0.9)",
    alignItems: "center", justifyContent: "center",
  },
  nameTag: {
    position: "absolute", bottom: -18, left: 0,
    backgroundColor: "rgba(10,10,20,0.75)",
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, maxWidth: 200,
  },
  nameText: { fontSize: 9, color: "rgba(255,255,255,0.75)" },
});

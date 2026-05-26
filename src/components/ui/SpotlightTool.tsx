import React, { useRef, useState } from "react";
import {
  Animated, PanResponder, View, StyleSheet,
  TouchableOpacity, Text, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  onClose: () => void;
}

export const SpotlightTool: React.FC<Props> = ({ onClose }) => {
  const { width, height } = useWindowDimensions();
  const [size, setSize] = useState(120);
  const [opacity, setOpacity] = useState(0.82);

  const pan = useRef(new Animated.ValueXY({ x: width / 2 - 60, y: height / 2 - 60 })).current;
  const currentPos = useRef({ x: width / 2 - 60, y: height / 2 - 60 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: currentPos.current.x, y: currentPos.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        currentPos.current = {
          x: currentPos.current.x + gs.dx,
          y: currentPos.current.y + gs.dy,
        };
      },
    })
  ).current;

  return (
    <>
      {/* Dark overlay — 4 sides around spotlight */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 80 }]}>
        {/* Top */}
        <Animated.View style={{
          position: "absolute", left: 0, right: 0, top: 0,
          height: Animated.add(pan.y, 0),
          backgroundColor: "rgba(0,0,0," + opacity + ")",
        }} />
        {/* Bottom */}
        <Animated.View style={{
          position: "absolute", left: 0, right: 0,
          top: Animated.add(pan.y, size),
          bottom: 0,
          backgroundColor: "rgba(0,0,0," + opacity + ")",
        }} />
        {/* Left */}
        <Animated.View style={{
          position: "absolute",
          top: pan.y,
          left: 0,
          width: pan.x,
          height: size,
          backgroundColor: "rgba(0,0,0," + opacity + ")",
        }} />
        {/* Right */}
        <Animated.View style={{
          position: "absolute",
          top: pan.y,
          left: Animated.add(pan.x, size),
          right: 0,
          height: size,
          backgroundColor: "rgba(0,0,0," + opacity + ")",
        }} />
      </View>

      {/* Spotlight circle — draggable */}
      <Animated.View
        style={[
          styles.spotlight,
          {
            width: size, height: size, borderRadius: size / 2,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setSize((s) => Math.max(60, s - 20))} style={styles.ctrlBtn}>
          <Ionicons name="remove" size={14} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSize((s) => Math.min(400, s + 20))} style={styles.ctrlBtn}>
          <Ionicons name="add" size={14} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setOpacity((o) => o >= 0.95 ? 0.5 : o + 0.1)} style={styles.ctrlBtn}>
          <Ionicons name="contrast-outline" size={14} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={[styles.ctrlBtn, styles.closeBtn]}>
          <Ionicons name="close" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  spotlight: {
    position: "absolute",
    zIndex: 81,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },
  controls: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    zIndex: 95,
    backgroundColor: "rgba(10,10,20,0.85)",
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
  },
  ctrlBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(124,58,237,0.7)",
    alignItems: "center", justifyContent: "center",
  },
  closeBtn: { backgroundColor: "rgba(239,68,68,0.8)" },
});

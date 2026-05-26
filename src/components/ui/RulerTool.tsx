import React, { useRef, useState } from "react";
import {
  Animated, PanResponder, View, StyleSheet,
  Text, useWindowDimensions,
} from "react-native";

interface Props {
  onClose: () => void;
}

export const RulerTool: React.FC<Props> = ({ onClose }) => {
  const { width } = useWindowDimensions();
  const [angle, setAngle] = useState(0);
  const [, forceUpdate] = useState(0);

  const pan = useRef(new Animated.ValueXY({ x: 20, y: 300 })).current;
  const currentPos = useRef({ x: 20, y: 300 });
  const rulerWidth = width * 0.88;

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

  // Rotate responder
  const rotateStart = useRef(0);
  const rotateResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { rotateStart.current = angle; },
      onPanResponderMove: (_, gs) => {
        const newAngle = rotateStart.current + gs.dx * 0.5;
        setAngle(newAngle);
      },
    })
  ).current;

  // Ruler ticks
  const ticks = [];
  const totalCm = 20;
  for (let i = 0; i <= totalCm * 10; i++) {
    const isCm = i % 10 === 0;
    const isMid = i % 5 === 0;
    ticks.push(
      <View
        key={i}
        style={{
          position: "absolute",
          left: (i / (totalCm * 10)) * (rulerWidth - 40) + 20,
          bottom: 0,
          width: 1,
          height: isCm ? 18 : isMid ? 12 : 7,
          backgroundColor: isCm ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)",
        }}
      />
    );
    if (isCm && i > 0) {
      ticks.push(
        <Text
          key={"l" + i}
          style={{
            position: "absolute",
            left: (i / (totalCm * 10)) * (rulerWidth - 40) + 20 - 5,
            bottom: 20,
            fontSize: 8,
            color: "rgba(255,255,255,0.75)",
            fontWeight: "600",
          }}
        >
          {i / 10}
        </Text>
      );
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: rulerWidth,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate: angle + "deg" },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Ruler body */}
      <View style={[styles.ruler, { width: rulerWidth }]}>
        {ticks}

        {/* CM label */}
        <Text style={styles.cmLabel}>cm</Text>

        {/* Close button */}
        <View
          {...rotateResponder.panHandlers}
          style={styles.rotateHandle}
        >
          <Text style={styles.rotateText}>↻</Text>
        </View>

        <Text
          onPress={onClose}
          style={styles.closeBtn}
        >
          ✕
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: "absolute", zIndex: 90 },
  ruler: {
    height: 44,
    backgroundColor: "rgba(30,20,60,0.95)",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(124,58,237,0.6)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  cmLabel: {
    position: "absolute",
    left: 4,
    bottom: 20,
    fontSize: 7,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
  },
  rotateHandle: {
    position: "absolute",
    right: 32,
    top: 4,
    width: 22,
    height: 22,
    backgroundColor: "rgba(124,58,237,0.5)",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  rotateText: { fontSize: 12, color: "#fff" },
  closeBtn: {
    position: "absolute",
    right: 6,
    top: 6,
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(239,68,68,0.4)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
});

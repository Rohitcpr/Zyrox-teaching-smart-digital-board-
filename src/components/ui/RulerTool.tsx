import React, { useRef, useState } from "react";
import { Animated, PanResponder, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props { onClose: () => void; }

export const RulerTool: React.FC<Props> = ({ onClose }) => {
  const [angle, setAngle] = useState(0);
  const [, forceUpdate] = useState(0);
  const pan = useRef(new Animated.ValueXY({ x: 20, y: 300 })).current;
  const currentPos = useRef({ x: 20, y: 300 });
  const rulerW = 320;
  const rotateStart = useRef(0);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({ x: currentPos.current.x, y: currentPos.current.y });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gs) => {
      pan.flattenOffset();
      currentPos.current = { x: currentPos.current.x + gs.dx, y: currentPos.current.y + gs.dy };
    },
  })).current;

  const rotateResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { rotateStart.current = angle; },
    onPanResponderMove: (_, gs) => { setAngle(rotateStart.current + gs.dx * 0.5); },
  })).current;

  const ticks = [];
  for (let i = 0; i <= 200; i++) {
    const isCm = i % 10 === 0;
    const isMid = i % 5 === 0;
    ticks.push(
      <View key={i} style={{
        position: "absolute", left: (i / 200) * (rulerW - 40) + 20,
        bottom: 0, width: 1,
        height: isCm ? 18 : isMid ? 12 : 7,
        backgroundColor: isCm ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
      }} />
    );
    if (isCm && i > 0) {
      ticks.push(
        <Text key={"l"+i} style={{
          position: "absolute",
          left: (i / 200) * (rulerW - 40) + 20 - 5,
          bottom: 20, fontSize: 8,
          color: "rgba(255,255,255,0.75)", fontWeight: "600",
        }}>{i / 10}</Text>
      );
    }
  }

  return (
    <Animated.View style={[styles.container, {
      transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: angle + "deg" }],
    }]} {...panResponder.panHandlers}>
      <View style={[styles.ruler, { width: rulerW }]}>
        {ticks}
        <Text style={styles.cmLabel}>cm</Text>
        <View {...rotateResponder.panHandlers} style={styles.rotateHandle}>
          <Text style={{ fontSize: 12, color: "#fff" }}>↻</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={11} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: "absolute", zIndex: 90 },
  ruler: { height: 44, backgroundColor: "rgba(30,20,60,0.95)", borderRadius: 6, borderWidth: 1.5, borderColor: "rgba(124,58,237,0.6)", overflow: "hidden", justifyContent: "flex-end" },
  cmLabel: { position: "absolute", left: 4, bottom: 20, fontSize: 7, color: "rgba(255,255,255,0.5)", fontWeight: "700" },
  rotateHandle: { position: "absolute", right: 32, top: 4, width: 22, height: 22, backgroundColor: "rgba(124,58,237,0.5)", borderRadius: 11, alignItems: "center", justifyContent: "center" },
  closeBtn: { position: "absolute", right: 6, top: 6, width: 20, height: 20, backgroundColor: "rgba(239,68,68,0.7)", borderRadius: 5, alignItems: "center", justifyContent: "center" },
});

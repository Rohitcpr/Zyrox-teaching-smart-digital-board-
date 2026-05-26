import React, { useRef, useState } from "react";
import {
  Animated, PanResponder, View, StyleSheet,
  Text, TouchableOpacity, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";

interface Props {
  onClose: () => void;
}

export const ProtractorTool: React.FC<Props> = ({ onClose }) => {
  const { width } = useWindowDimensions();
  const [angle, setAngle] = useState(0);
  const [size, setSize] = useState(160);

  const pan = useRef(new Animated.ValueXY({ x: width / 2 - 80, y: 200 })).current;
  const currentPos = useRef({ x: width / 2 - 80, y: 200 });

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

  const rotateStart = useRef(0);
  const rotateResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { rotateStart.current = angle; },
      onPanResponderMove: (_, gs) => {
        setAngle(rotateStart.current + gs.dx * 0.6);
      },
    })
  ).current;

  const r = size;
  const cx = r;
  const cy = r;

  // Build semicircle path
  const buildArc = () => {
    const startX = 0;
    const startY = r;
    const endX = r * 2;
    const endY = r;
    return "M " + startX + " " + startY + " A " + r + " " + r + " 0 0 1 " + endX + " " + endY + " Z";
  };

  // Degree marks
  const marks = [];
  for (let deg = 0; deg <= 180; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const inner = isMajor ? r - 18 : r - 10;
    const x1 = cx + r * Math.cos(Math.PI - rad);
    const y1 = cy - r * Math.sin(Math.PI - rad);
    const x2 = cx + inner * Math.cos(Math.PI - rad);
    const y2 = cy - inner * Math.sin(Math.PI - rad);
    const lx = cx + (r - 26) * Math.cos(Math.PI - rad);
    const ly = cy - (r - 26) * Math.sin(Math.PI - rad);

    marks.push(
      <Line key={"l" + deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.7)" strokeWidth={isMajor ? 1.5 : 0.8} />
    );
    if (isMajor) {
      marks.push(
        <SvgText key={"t" + deg} x={lx} y={ly + 3} fontSize="8" fill="rgba(255,255,255,0.85)" textAnchor="middle" fontWeight="600">
          {deg}
        </SvgText>
      );
    }
  }

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: angle + "deg" }] }]}
      {...panResponder.panHandlers}
    >
      <Svg width={r * 2} height={r + 20}>
        {/* Semicircle */}
        <Path d={buildArc()} fill="rgba(30,20,60,0.92)" stroke="rgba(124,58,237,0.8)" strokeWidth={2} />
        {/* Center dot */}
        <Circle cx={cx} cy={cy} r={4} fill="rgba(124,58,237,0.9)" />
        {/* Baseline */}
        <Line x1={0} y1={cy} x2={r * 2} y2={cy} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
        {/* Degree marks */}
        {marks}
      </Svg>

      {/* Rotate handle */}
      <View {...rotateResponder.panHandlers} style={styles.rotateHandle}>
        <Text style={styles.rotateText}>↻</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setSize((s) => Math.max(100, s - 20))} style={styles.ctrlBtn}>
          <Ionicons name="remove" size={12} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSize((s) => Math.min(220, s + 20))} style={styles.ctrlBtn}>
          <Ionicons name="add" size={12} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={[styles.ctrlBtn, styles.closeBtn]}>
          <Ionicons name="close" size={12} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: "absolute", zIndex: 90 },
  rotateHandle: {
    position: "absolute", bottom: 24, left: "50%",
    marginLeft: -14, width: 28, height: 28,
    backgroundColor: "rgba(124,58,237,0.7)",
    borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  rotateText: { fontSize: 14, color: "#fff" },
  controls: {
    position: "absolute", top: -32, right: 0,
    flexDirection: "row", gap: 4,
  },
  ctrlBtn: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: "rgba(124,58,237,0.85)",
    alignItems: "center", justifyContent: "center",
  },
  closeBtn: { backgroundColor: "rgba(239,68,68,0.85)" },
});

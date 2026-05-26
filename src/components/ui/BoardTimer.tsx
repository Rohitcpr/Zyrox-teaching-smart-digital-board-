import React, { useRef, useState, useEffect } from "react";
import {
  Animated, PanResponder, View, StyleSheet,
  TouchableOpacity, Text, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  onClose: () => void;
}

export const BoardTimer: React.FC<Props> = ({ onClose }) => {
  const { width } = useWindowDimensions();
  const [seconds, setSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [inputMode, setInputMode] = useState(false);
  const [customMin, setCustomMin] = useState("5");
  const intervalRef = useRef(null);

  const pan = useRef(new Animated.ValueXY({ x: width / 2 - 80, y: 100 })).current;
  const currentPos = useRef({ x: width / 2 - 80, y: 100 });

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

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setIsRunning(false);
            clearInterval(intervalRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(300);
  };

  const handleAdd = (s: number) => {
    setSeconds((prev) => prev + s);
  };

  const isWarning = seconds <= 30 && seconds > 0;
  const isDone = seconds === 0;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
      {...panResponder.panHandlers}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="timer-outline" size={13} color="rgba(255,255,255,0.6)" />
        <Text style={styles.headerText}>TIMER</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={13} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Time Display */}
      <Text style={[styles.timeText, isWarning && styles.timeWarning, isDone && styles.timeDone]}>
        {formatTime(seconds)}
      </Text>

      {isDone && (
        <Text style={styles.doneText}>Time Up!</Text>
      )}

      {/* Quick add buttons */}
      <View style={styles.quickRow}>
        {[1, 5, 10].map((m) => (
          <TouchableOpacity key={m} onPress={() => handleAdd(m * 60)} style={styles.quickBtn}>
            <Text style={styles.quickText}>+{m}m</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleReset} style={styles.ctrlBtn}>
          <Ionicons name="refresh" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsRunning((r) => r === false)}
          style={[styles.playBtn, isRunning && styles.pauseBtn]}
        >
          <Ionicons name={isRunning ? "pause" : "play"} size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSeconds((s) => Math.max(0, s - 60))} style={styles.ctrlBtn}>
          <Ionicons name="remove" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute", zIndex: 100,
    backgroundColor: "rgba(15,15,30,0.95)",
    borderRadius: 16, padding: 16, width: 180,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.4)",
    alignItems: "center", gap: 10,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 6, width: "100%" },
  headerText: { flex: 1, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: "700", letterSpacing: 1 },
  closeBtn: { padding: 2 },
  timeText: { fontSize: 42, fontWeight: "800", color: "#fff", letterSpacing: 2 },
  timeWarning: { color: "#F59E0B" },
  timeDone: { color: "#EF4444" },
  doneText: { fontSize: 11, color: "#EF4444", fontWeight: "700" },
  quickRow: { flexDirection: "row", gap: 6 },
  quickBtn: { backgroundColor: "rgba(124,58,237,0.3)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  quickText: { fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  controls: { flexDirection: "row", alignItems: "center", gap: 10 },
  ctrlBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  playBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(124,58,237,0.9)", alignItems: "center", justifyContent: "center" },
  pauseBtn: { backgroundColor: "rgba(239,68,68,0.9)" },
});

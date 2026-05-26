import React, { useRef, useState } from "react";
import {
  Animated, PanResponder, View, StyleSheet,
  Text, TouchableOpacity, TextInput, ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  onClose: () => void;
}

export const TableTool: React.FC<Props> = ({ onClose }) => {
  const { width } = useWindowDimensions();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [cells, setCells] = useState<string[][]>(
    Array(3).fill(null).map(() => Array(3).fill(""))
  );

  const pan = useRef(new Animated.ValueXY({ x: 20, y: 100 })).current;
  const currentPos = useRef({ x: 20, y: 100 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 || Math.abs(gs.dy) > 8,
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

  const updateCell = (r: number, c: number, val: string) => {
    const updated = cells.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? val : cell))
    );
    setCells(updated);
  };

  const addRow = () => {
    setRows((r) => r + 1);
    setCells((prev) => [...prev, Array(cols).fill("")]);
  };

  const addCol = () => {
    setCols((c) => c + 1);
    setCells((prev) => prev.map((row) => [...row, ""]));
  };

  const removeRow = () => {
    if (rows <= 1) return;
    setRows((r) => r - 1);
    setCells((prev) => prev.slice(0, -1));
  };

  const removeCol = () => {
    if (cols <= 1) return;
    setCols((c) => c - 1);
    setCells((prev) => prev.map((row) => row.slice(0, -1)));
  };

  const cellW = Math.min(90, (width - 60) / cols);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
    >
      {/* Header - draggable */}
      <View style={styles.header} {...panResponder.panHandlers}>
        <Ionicons name="grid-outline" size={13} color="rgba(255,255,255,0.6)" />
        <Text style={styles.headerText}>TABLE  {rows}x{cols}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={15} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            {cells.map((row, ri) => (
              <View key={ri} style={styles.row}>
                {row.map((cell, ci) => (
                  <TextInput
                    key={ci}
                    value={cell}
                    onChangeText={(val) => updateCell(ri, ci, val)}
                    style={[
                      styles.cell,
                      { width: cellW },
                      ri === 0 && styles.headerCell,
                    ]}
                    placeholder="-"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    multiline
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={addRow} style={styles.ctrlBtn}>
          <Ionicons name="add" size={12} color="#fff" />
          <Text style={styles.ctrlText}>Row</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={removeRow} style={styles.ctrlBtn}>
          <Ionicons name="remove" size={12} color="#fff" />
          <Text style={styles.ctrlText}>Row</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={addCol} style={styles.ctrlBtn}>
          <Ionicons name="add" size={12} color="#fff" />
          <Text style={styles.ctrlText}>Col</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={removeCol} style={styles.ctrlBtn}>
          <Ionicons name="remove" size={12} color="#fff" />
          <Text style={styles.ctrlText}>Col</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute", zIndex: 90,
    backgroundColor: "rgba(15,15,30,0.96)",
    borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.4)",
    maxWidth: 360, maxHeight: 400,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerText: {
    flex: 1, fontSize: 10, color: "rgba(255,255,255,0.5)",
    fontWeight: "700", letterSpacing: 1,
  },
  row: { flexDirection: "row" },
  cell: {
    height: 36, borderWidth: 0.5,
    borderColor: "rgba(124,58,237,0.35)",
    color: "#fff", fontSize: 11,
    paddingHorizontal: 6, paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  headerCell: {
    backgroundColor: "rgba(124,58,237,0.2)",
    fontWeight: "700",
  },
  controls: {
    flexDirection: "row", gap: 6,
    marginTop: 10, justifyContent: "center",
  },
  ctrlBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(124,58,237,0.6)",
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8,
  },
  ctrlText: { fontSize: 10, color: "#fff", fontWeight: "600" },
});

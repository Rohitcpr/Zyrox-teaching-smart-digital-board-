import React, { useState, useRef } from "react";
import {
  View, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BRAND, TEXT, GLASS } from "../../constants/colors";
import { useToolStore } from "../../store/useToolStore";

interface Props {
  x: number;
  y: number;
  initialText?: string;
  initialFontSize?: number;
  initialFontWeight?: string;
  initialFontStyle?: string;
  onDone: (text: string, x: number, y: number, fontWeight: string, fontStyle: string, fontSize: number) => void;
  onCancel: () => void;
}

export const TextTool: React.FC<Props> = ({
  x, y,
  initialText = "",
  initialFontSize,
  initialFontWeight = "500",
  initialFontStyle = "normal",
  onDone,
  onCancel,
}) => {
  const [value, setValue]         = useState(initialText);
  const [fontWeight, setFontWeight] = useState(initialFontWeight);
  const [fontStyle, setFontStyle]   = useState(initialFontStyle);
  const [fontSize, setFontSize]     = useState<number | null>(null);
  const color = useToolStore((s) => s.color);
  const size  = useToolStore((s) => s.size);
  const inputRef = useRef<TextInput>(null);

  const actualSize = fontSize ?? initialFontSize ?? Math.max(size * 4, 16);

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const isBold   = fontWeight === "bold";
  const isItalic = fontStyle === "italic";

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity style={styles.backdrop} onPress={onCancel} />
      <View style={[styles.inputBox, { top: y, left: Math.min(x, 140) }]}>

        {/* Format toolbar */}
        <View style={styles.formatBar}>
          <TouchableOpacity
            onPress={() => setFontWeight(isBold ? "500" : "bold")}
            style={[styles.fmtBtn, isBold && styles.fmtActive]}
          >
            <Text style={[styles.fmtText, isBold && styles.fmtTextActive]}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFontStyle(isItalic ? "normal" : "italic")}
            style={[styles.fmtBtn, isItalic && styles.fmtActive]}
          >
            <Text style={[styles.fmtText, { fontStyle: "italic" }, isItalic && styles.fmtTextActive]}>I</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setValue((v) => v === v.toUpperCase() ? v.toLowerCase() : v.toUpperCase())}
            style={styles.fmtBtn}
          >
            <Text style={styles.fmtText}>AA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFontSize((s) => Math.max((s ?? actualSize) - 4, 8))}
            style={styles.fmtBtn}
          >
            <Ionicons name="remove" size={14} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <Text style={styles.sizeText}>{actualSize}px</Text>
          <TouchableOpacity
            onPress={() => setFontSize((s) => Math.min((s ?? actualSize) + 4, 72))}
            style={styles.fmtBtn}
          >
            <Ionicons name="add" size={14} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={setValue}
          style={[
            styles.input,
            {
              color,
              fontSize: actualSize,
              fontWeight: fontWeight as any,
              fontStyle: fontStyle as any,
            },
          ]}
          placeholder="Type here..."
          placeholderTextColor={TEXT.disabled}
          multiline
          autoCorrect={false}
        />

        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Ionicons name="close" size={20} color={TEXT.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => value.trim() && onDone(value, x, y, fontWeight, fontStyle, actualSize)}
            style={styles.doneBtn}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 200 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  inputBox: {
    position: "absolute", minWidth: 220, maxWidth: 320,
    backgroundColor: GLASS.backgroundLight,
    borderRadius: 14, borderWidth: 1,
    borderColor: BRAND.primary, padding: 12, gap: 8,
  },
  formatBar: {
    flexDirection: "row", alignItems: "center",
    gap: 6, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)",
  },
  fmtBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  fmtActive: { backgroundColor: "rgba(124,58,237,0.6)" },
  fmtText: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "700" },
  fmtTextActive: { color: "#fff" },
  sizeText: { fontSize: 10, color: "rgba(255,255,255,0.5)", minWidth: 36, textAlign: "center" },
  input: { minHeight: 48, maxHeight: 160, fontWeight: "500" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  cancelBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  doneBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: BRAND.primary,
    alignItems: "center", justifyContent: "center",
  },
});

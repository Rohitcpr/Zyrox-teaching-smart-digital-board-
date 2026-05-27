import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextItem } from "./TextRenderer";

interface Props {
  item: TextItem;
  onUpdate: (id: string, changes: Partial<TextItem>) => void;
  onDelete: (id: string) => void;
  onEdit: (item: TextItem) => void;
  onClose: () => void;
}

export const TextEditMenu: React.FC<Props> = ({ item, onUpdate, onDelete, onEdit, onClose }) => {
  const { width } = useWindowDimensions();
  const menuX = Math.min(item.x + 10, width - 220);
  const menuY = Math.max(item.y - 160, 60);

  const isUppercase = item.text === item.text.toUpperCase();
  const isBold      = item.fontWeight === "bold";
  const isItalic    = item.fontStyle === "italic";
  const isHeading   = item.fontSize >= 32;

  const ACTIONS = [
    {
      icon: "create-outline", label: "Edit",
      active: false,
      onPress: () => { onEdit(item); onClose(); },
    },
    {
      icon: "text-outline", label: "Bold",
      active: isBold,
      onPress: () => onUpdate(item.id, { fontWeight: isBold ? "500" : "bold" }),
    },
    {
      icon: "italic", label: "Italic",
      active: isItalic,
      onPress: () => onUpdate(item.id, { fontStyle: isItalic ? "normal" : "italic" }),
    },
    {
      icon: "arrow-up-outline", label: "CAPS",
      active: isUppercase,
      onPress: () => onUpdate(item.id, {
        text: isUppercase ? item.text.toLowerCase() : item.text.toUpperCase()
      }),
    },
    {
      icon: "text", label: "Heading",
      active: isHeading,
      onPress: () => onUpdate(item.id, { fontSize: isHeading ? 16 : 36 }),
    },
    {
      icon: "add-circle-outline", label: "Bigger",
      active: false,
      onPress: () => onUpdate(item.id, { fontSize: Math.min(item.fontSize + 4, 72) }),
    },
    {
      icon: "remove-circle-outline", label: "Smaller",
      active: false,
      onPress: () => onUpdate(item.id, { fontSize: Math.max(item.fontSize - 4, 8) }),
    },
    {
      icon: "trash-outline", label: "Delete",
      active: false, danger: true,
      onPress: () => { onDelete(item.id); onClose(); },
    },
  ];

  return (
    <>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.menu, { left: menuX, top: menuY }]}>
        <View style={styles.header}>
          <Text style={styles.headerText} numberOfLines={1}>
            {item.text.slice(0, 20)}{item.text.length > 20 ? "..." : ""}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={14} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>
        <View style={styles.grid}>
          {ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={action.onPress}
              style={[
                styles.btn,
                action.active && styles.btnActive,
                action.danger && styles.btnDanger,
              ]}
            >
              <Ionicons
                name={action.icon as any}
                size={16}
                color={action.danger ? "#EF4444" : action.active ? "#fff" : "rgba(255,255,255,0.7)"}
              />
              <Text style={[
                styles.btnLabel,
                action.active && styles.btnLabelActive,
                action.danger && styles.btnLabelDanger,
              ]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: "absolute", zIndex: 300,
    backgroundColor: "rgba(15,15,30,0.97)",
    borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.4)",
    width: 210, elevation: 10,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerText: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: "600", flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  btn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  btnActive: {
    backgroundColor: "rgba(124,58,237,0.5)",
    borderColor: "rgba(124,58,237,0.8)",
  },
  btnDanger: { borderColor: "rgba(239,68,68,0.3)" },
  btnLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  btnLabelActive: { color: "#fff" },
  btnLabelDanger: { color: "#EF4444" },
});

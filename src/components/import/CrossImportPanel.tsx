import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNotebookStore } from "../../store/useNotebookStore";
import { useCanvasStore } from "../../store/useCanvasStore";
import { GlassPanel } from "../ui/GlassPanel";
import { BRAND, TEXT } from "../../constants/colors";

interface Props {
  onClose: () => void;
}

export const CrossImportPanel: React.FC<Props> = ({ onClose }) => {
  const { notebooks, recentBoards, saveToRecent } = useNotebookStore();
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [step, setStep] = useState<"board" | "destination">("board");

  const handleImport = async () => {
    if (!selectedBoard || !selectedNotebook || !selectedChapter) {
      Alert.alert("Select all", "Please select board, notebook and chapter");
      return;
    }
    const board = recentBoards.find((b) => b.id === selectedBoard);
    if (!board) return;
    await saveToRecent(board.pageId, board.name, selectedNotebook, selectedChapter, board.tags);
    Alert.alert("Imported!", "Board copied to selected notebook chapter");
    onClose();
  };

  const selectedBoardData = recentBoards.find((b) => b.id === selectedBoard);
  const selectedNb = notebooks.find((n) => n.id === selectedNotebook);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <GlassPanel style={styles.panel}>
        <View style={styles.header}>
          <Ionicons name="git-merge-outline" size={16} color={BRAND.primaryLight} />
          <Text style={styles.title}>Cross Import</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={TEXT.secondary} />
          </TouchableOpacity>
        </View>

        {step === "board" ? (
          <>
            <Text style={styles.stepLabel}>STEP 1 — Select Board to Import</Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {recentBoards.slice(0, 20).map((board) => (
                <TouchableOpacity
                  key={board.id}
                  onPress={() => setSelectedBoard(board.id)}
                  style={[styles.item, selectedBoard === board.id && styles.itemActive]}
                >
                  <Ionicons name="easel-outline" size={14} color={selectedBoard === board.id ? BRAND.primaryLight : TEXT.secondary} />
                  <Text style={[styles.itemText, selectedBoard === board.id && styles.itemTextActive]} numberOfLines={1}>
                    {board.name}
                  </Text>
                  {selectedBoard === board.id && (
                    <Ionicons name="checkmark-circle" size={14} color={BRAND.primaryLight} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => selectedBoard && setStep("destination")}
              style={[styles.nextBtn, !selectedBoard && styles.nextBtnDisabled]}
            >
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.stepLabel}>STEP 2 — Select Destination</Text>
            <Text style={styles.selectedInfo}>
              Board: {selectedBoardData?.name}
            </Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {notebooks.map((nb) => (
                <View key={nb.id}>
                  <TouchableOpacity
                    onPress={() => { setSelectedNotebook(nb.id); setSelectedChapter(null); }}
                    style={[styles.nbItem, selectedNotebook === nb.id && { borderColor: nb.color + "60" }]}
                  >
                    <View style={[styles.nbDot, { backgroundColor: nb.color }]} />
                    <Text style={styles.nbName}>{nb.name}</Text>
                    <Ionicons name={selectedNotebook === nb.id ? "chevron-up" : "chevron-down"} size={12} color={TEXT.disabled} />
                  </TouchableOpacity>
                  {selectedNotebook === nb.id && nb.chapters.map((ch) => (
                    <TouchableOpacity
                      key={ch.id}
                      onPress={() => setSelectedChapter(ch.id)}
                      style={[styles.chItem, selectedChapter === ch.id && styles.chItemActive]}
                    >
                      <Ionicons name="document-text-outline" size={12} color={selectedChapter === ch.id ? nb.color : TEXT.disabled} />
                      <Text style={[styles.chName, selectedChapter === ch.id && { color: nb.color }]}>
                        {ch.name}
                      </Text>
                      {selectedChapter === ch.id && (
                        <Ionicons name="checkmark" size={12} color={nb.color} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
            <View style={styles.bottomBtns}>
              <TouchableOpacity onPress={() => setStep("board")} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleImport}
                style={[styles.importBtn, (!selectedChapter) && styles.nextBtnDisabled]}
              >
                <Ionicons name="git-merge-outline" size={14} color="#fff" />
                <Text style={styles.importBtnText}>Import</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </GlassPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 300, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  panel: { width: "90%", maxHeight: "80%", padding: 20, zIndex: 301 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  title: { flex: 1, fontSize: 15, fontWeight: "800", color: "#F0F0FF" },
  closeBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  stepLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 2, color: TEXT.disabled, marginBottom: 12 },
  selectedInfo: { fontSize: 11, color: BRAND.primaryLight, marginBottom: 8, fontWeight: "600" },
  list: { maxHeight: 280 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, marginBottom: 6, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  itemActive: { backgroundColor: "rgba(124,58,237,0.15)", borderColor: "rgba(124,58,237,0.4)" },
  itemText: { flex: 1, fontSize: 12, color: TEXT.secondary },
  itemTextActive: { color: "#F0F0FF", fontWeight: "600" },
  nbItem: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, marginBottom: 4, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  nbDot: { width: 8, height: 8, borderRadius: 4 },
  nbName: { flex: 1, fontSize: 12, color: "#F0F0FF", fontWeight: "600" },
  chItem: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8, marginLeft: 16, marginBottom: 4, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" },
  chItemActive: { backgroundColor: "rgba(124,58,237,0.1)", borderColor: "rgba(124,58,237,0.3)" },
  chName: { flex: 1, fontSize: 11, color: TEXT.secondary },
  bottomBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  backBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center" },
  backBtnText: { color: TEXT.secondary, fontWeight: "600", fontSize: 13 },
  importBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, borderRadius: 10, backgroundColor: BRAND.primary },
  importBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  nextBtn: { marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: BRAND.primary, alignItems: "center" },
  nextBtnDisabled: { backgroundColor: "rgba(124,58,237,0.3)" },
  nextBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});

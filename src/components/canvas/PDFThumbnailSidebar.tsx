import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  totalPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
  onClose: () => void;
}

export const PDFThumbnailSidebar: React.FC<Props> = ({ totalPages, currentPage, onPageSelect, onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Pages</Text>
        <Text style={styles.pageCount}>{totalPages}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={13} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <TouchableOpacity key={page} onPress={() => onPageSelect(page)} style={styles.thumbCard}>
            <View style={[styles.thumbBox, currentPage === page && styles.thumbBoxActive]}>
              <Ionicons name="document-text" size={20} color={currentPage === page ? "#7C3AED" : "rgba(255,255,255,0.3)"} />
              <Text style={[styles.pageNum, currentPage === page && styles.pageNumActive]}>{page}</Text>
            </View>
            {currentPage === page && <View style={styles.activeDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, top: 0, bottom: 0, width: 70, backgroundColor: "rgba(10,10,20,0.97)", borderRightWidth: 1, borderRightColor: "rgba(124,58,237,0.3)", zIndex: 50 },
  header: { paddingTop: 50, paddingBottom: 10, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)", alignItems: "center", gap: 2 },
  headerText: { fontSize: 9, fontWeight: "800", color: "#F0F0FF", letterSpacing: 1 },
  pageCount: { fontSize: 9, color: "rgba(255,255,255,0.4)" },
  closeBtn: { marginTop: 4, width: 22, height: 22, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  scrollContent: { padding: 6, gap: 6, alignItems: "center" },
  thumbCard: { alignItems: "center", gap: 2 },
  thumbBox: { width: 50, height: 64, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", gap: 4 },
  thumbBoxActive: { backgroundColor: "rgba(124,58,237,0.15)", borderColor: "rgba(124,58,237,0.6)" },
  pageNum: { fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: "700" },
  pageNumActive: { color: "#7C3AED" },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#7C3AED" },
});

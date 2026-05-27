import React, { useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, useWindowDimensions,
} from "react-native";
import Pdf from "react-native-pdf";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  uri: string;
  totalPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
  onClose: () => void;
}

export const PDFThumbnailSidebar: React.FC<Props> = ({
  uri, totalPages, currentPage, onPageSelect, onClose,
}) => {
  const { height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Pages</Text>
        <Text style={styles.pageCount}>{totalPages} total</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={14} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <TouchableOpacity
            key={page}
            onPress={() => onPageSelect(page)}
            style={[styles.thumbCard, currentPage === page && styles.thumbActive]}
          >
            <View style={styles.thumbContainer}>
              <Pdf
                source={{ uri, cache: true }}
                page={page}
                style={styles.thumbPdf}
                enablePaging={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
              {currentPage === page && (
                <View style={styles.activeOverlay}>
                  <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                </View>
              )}
            </View>
            <Text style={[styles.pageNum, currentPage === page && styles.pageNumActive]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: 90,
    backgroundColor: "rgba(10,10,20,0.96)",
    borderRightWidth: 1,
    borderRightColor: "rgba(124,58,237,0.3)",
    zIndex: 50,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    gap: 2,
  },
  headerText: { fontSize: 10, fontWeight: "800", color: "#F0F0FF", letterSpacing: 1 },
  pageCount: { fontSize: 9, color: "rgba(255,255,255,0.4)" },
  closeBtn: {
    marginTop: 6, width: 24, height: 24,
    borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  scrollContent: { padding: 8, gap: 8 },
  thumbCard: { alignItems: "center", gap: 4 },
  thumbContainer: {
    width: 66, height: 90,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#1a1a2e",
  },
  thumbActive: { transform: [{ scale: 1.05 }] },
  thumbPdf: { width: 66, height: 90 },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(124,58,237,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  pageNum: { fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: "600" },
  pageNumActive: { color: "#7C3AED" },
});

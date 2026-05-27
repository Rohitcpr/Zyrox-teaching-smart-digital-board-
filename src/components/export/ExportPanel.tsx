import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import Svg from "react-native-svg";
import { GlassPanel } from "../ui/GlassPanel";
import { StrokeRenderer } from "../canvas/StrokeRenderer";
import { ShapeRenderer } from "../shapes/ShapeRenderer";
import { TextRenderer } from "../text/TextRenderer";
import { useCanvasStore } from "../../store/useCanvasStore";
import { useAppStore } from "../../store/useAppStore";
import { BRAND, TEXT } from "../../constants/colors";

interface Props {
  onClose: () => void;
  pageId: string;
}

type ExportStatus = "idle" | "loading" | "done" | "error";

const generateFilename = (ext: string): string => {
  const now = new Date();
  const d = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
  const t = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0");
  return "ZYROX_" + d + "_" + t + "." + ext;
};

export const ExportPanel: React.FC<Props> = ({ onClose, pageId }) => {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const viewShotRef = useRef<any>(null);
  const { width, height } = useWindowDimensions();

  const layers    = useCanvasStore((s) => s.layers);
  const shapes    = useCanvasStore((s) => s.shapes);
  const textItems = useCanvasStore((s) => s.textItems);
  const bgColor   = useAppStore((s) => s.bgColor);

  const allStrokes = layers.filter((l) => l.visible).flatMap((l) => l.strokes);

  // Request media permission
  const requestPerm = async () => {
    const { status: perm } = await MediaLibrary.requestPermissionsAsync();
    return perm === "granted";
  };

  // PNG Export
  const handleExportPNG = async () => {
    setStatus("loading");
    setStatusMsg("Capturing board...");
    try {
      const uri = await viewShotRef.current.capture();
      setStatus("done");
      setStatusMsg("PNG ready!");
      Alert.alert("PNG Export", "What would you like to do?", [
        {
          text: "Save to Gallery",
          onPress: async () => {
            if (await requestPerm()) {
              await MediaLibrary.saveToLibraryAsync(uri);
              Alert.alert("Saved!", "Image saved to gallery");
            }
          },
        },
        {
          text: "Share",
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "image/png" });
          },
        },
        { text: "OK" },
      ]);
    } catch (e) {
      setStatus("error");
      setStatusMsg("PNG export failed");
    }
  };

  // JPEG Export
  const handleExportJPEG = async () => {
    setStatus("loading");
    setStatusMsg("Capturing board...");
    try {
      const uri = await viewShotRef.current.capture({
        format: "jpg",
        quality: 0.92,
      });
      setStatus("done");
      setStatusMsg("JPEG ready!");
      Alert.alert("JPEG Export", "What would you like to do?", [
        {
          text: "Save to Gallery",
          onPress: async () => {
            if (await requestPerm()) {
              await MediaLibrary.saveToLibraryAsync(uri);
              Alert.alert("Saved!", "Image saved to gallery");
            }
          },
        },
        {
          text: "Share",
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "image/jpeg" });
          },
        },
        { text: "OK" },
      ]);
    } catch (e) {
      setStatus("error");
      setStatusMsg("JPEG export failed");
    }
  };

  // PDF Export
  const handleExportPDF = async () => {
    setStatus("loading");
    setStatusMsg("Creating PDF...");
    try {
      const uri = await viewShotRef.current.capture({ format: "png", quality: 1.0 });
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const html = "<html><body style=\"margin:0;padding:0;background:" + bgColor + "\"><img src=\"data:image/png;base64," + base64 + "\" style=\"width:100%;height:auto;\" /></body></html>";
      const { uri: pdfUri } = await Print.printToFileAsync({ html, base64: false });
      const dest = FileSystem.documentDirectory + generateFilename("pdf");
      await FileSystem.moveAsync({ from: pdfUri, to: dest });
      setStatus("done");
      setStatusMsg("PDF ready!");
      Alert.alert("PDF Export", "What would you like to do?", [
        {
          text: "Share PDF",
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(dest, { mimeType: "application/pdf" });
          },
        },
        { text: "OK" },
      ]);
    } catch (e) {
      setStatus("error");
      setStatusMsg("PDF export failed");
    }
  };

  // ZYROX Project File Export
  const handleExportZyrox = async () => {
    setStatus("loading");
    setStatusMsg("Saving project...");
    try {
      const canvasData = useCanvasStore.getState();
      const projectData = {
        version: "1.0",
        pageId,
        exportedAt: Date.now(),
        layers: canvasData.layers,
        shapes: canvasData.shapes,
        textItems: canvasData.textItems,
      };
      const json = JSON.stringify(projectData);
      const dest  = FileSystem.documentDirectory + generateFilename("zyrox");
      await FileSystem.writeAsStringAsync(dest, json, { encoding: FileSystem.EncodingType.UTF8 });
      setStatus("done");
      setStatusMsg("Project saved!");
      Alert.alert("Project Export", "ZYROX project file created!", [
        {
          text: "Share File",
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(dest, { mimeType: "application/json" });
          },
        },
        { text: "OK" },
      ]);
    } catch (e) {
      setStatus("error");
      setStatusMsg("Project export failed");
    }
  };

  const OPTIONS = [
    { icon: "image-outline",      label: "PNG",     sub: "High quality",   color: "#22C55E", onPress: handleExportPNG },
    { icon: "image",              label: "JPEG",    sub: "Compressed",     color: "#F59E0B", onPress: handleExportJPEG },
    { icon: "document-outline",   label: "PDF",     sub: "Shareable doc",  color: "#EF4444", onPress: handleExportPDF },
    { icon: "save-outline",       label: ".zyrox",  sub: "Project file",   color: "#A855F7", onPress: handleExportZyrox },
  ];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      {/* Hidden capture view */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1.0 }}
        style={[styles.hiddenCanvas, { width, height, backgroundColor: bgColor }]}
      >
        <Svg width={width} height={height}>
          <ShapeRenderer shapes={shapes} />
          <TextRenderer items={textItems} />
          <StrokeRenderer strokes={allStrokes} eraserColor={bgColor} />
        </Svg>
      </ViewShot>

      <GlassPanel style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Export Board</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={TEXT.secondary} />
          </TouchableOpacity>
        </View>

        {status === "loading" ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={BRAND.primaryLight} />
            <Text style={styles.loadingText}>{statusMsg}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                onPress={opt.onPress}
                style={[styles.card, { borderColor: opt.color + "40" }]}
              >
                <View style={[styles.iconBox, { backgroundColor: opt.color + "20" }]}>
                  <Ionicons name={opt.icon as any} size={24} color={opt.color} />
                </View>
                <Text style={styles.cardLabel}>{opt.label}</Text>
                <Text style={styles.cardSub}>{opt.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {status === "done" && (
          <View style={styles.successBar}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.successText}>{statusMsg}</Text>
          </View>
        )}
        {status === "error" && (
          <View style={styles.errorBar}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{statusMsg}</Text>
          </View>
        )}
      </GlassPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 300, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  hiddenCanvas: { position: "absolute", left: -9999, top: -9999 },
  panel: { width: "92%", padding: 20, zIndex: 301 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 16, fontWeight: "800", color: "#F0F0FF", letterSpacing: 1 },
  closeBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { width: "47%", padding: 14, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 8 },
  iconBox: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontSize: 13, fontWeight: "700", color: "#F0F0FF" },
  cardSub: { fontSize: 10, color: TEXT.disabled, textAlign: "center" },
  loadingBox: { alignItems: "center", padding: 30, gap: 12 },
  loadingText: { fontSize: 13, color: TEXT.secondary },
  successBar: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, padding: 10, backgroundColor: "rgba(34,197,94,0.12)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(34,197,94,0.30)" },
  successText: { fontSize: 12, color: "#22C55E", fontWeight: "600" },
  errorBar: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, padding: 10, backgroundColor: "rgba(239,68,68,0.12)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(239,68,68,0.30)" },
  errorText: { fontSize: 12, color: "#EF4444", fontWeight: "600" },
});

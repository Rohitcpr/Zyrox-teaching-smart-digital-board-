import React, { useRef, useState, useCallback } from "react";
import {
  Animated, PanResponder, View, StyleSheet,
  TouchableOpacity, Text, useWindowDimensions, Alert,
} from "react-native";
import Pdf from "react-native-pdf";
import { Ionicons } from "@expo/vector-icons";
import { PDFThumbnailSidebar } from "./PDFThumbnailSidebar";

interface Props {
  uri: string;
  name?: string;
  interactive?: boolean;
  onRemove: () => void;
}

export const PDFViewerLayer: React.FC<Props> = ({ uri, name, onRemove, interactive = false }) => {
  const { width, height } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);
  const [blankPages, setBlankPages] = useState<number[]>([]);
  const [, forceUpdate] = useState(0);

  const sizeRef = useRef({ w: width * 0.92, h: height * 0.72 });
  const aspectRatio = useRef((width * 0.92) / (height * 0.72));
  const isLockedRef = useRef(false);
  const pan = useRef(new Animated.ValueXY({ x: width * 0.04, y: 60 })).current;
  const currentPos = useRef({ x: width * 0.04, y: 60 });
  const lastPinchDist = useRef(null);
  const lastSize = useRef({ w: width * 0.92, h: height * 0.72 });
  const isPinching = useRef(false);

  const totalPagesWithBlanks = totalPages + blankPages.length;
  const isBlankPage = blankPages.includes(currentPage);

  const getDist = (touches) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => interactive && isLockedRef.current === false,
    onMoveShouldSetPanResponder: () => interactive && isLockedRef.current === false,
    onPanResponderGrant: (e) => {
      const touches = e.nativeEvent.touches;
      if (touches.length === 2) {
        isPinching.current = true;
        lastSize.current = { ...sizeRef.current };
        lastPinchDist.current = getDist(Array.from(touches));
      } else {
        pan.setOffset({ x: currentPos.current.x, y: currentPos.current.y });
        pan.setValue({ x: 0, y: 0 });
      }
    },
    onPanResponderMove: (e, gs) => {
      const touches = e.nativeEvent.touches;
      if (touches.length === 2) {
        isPinching.current = true;
        const dist = getDist(Array.from(touches));
        if (lastPinchDist.current !== null) {
          const scale = dist / lastPinchDist.current;
          const newW = Math.max(200, Math.min(width * 2.5, lastSize.current.w * scale));
          sizeRef.current = { w: newW, h: newW / aspectRatio.current };
          forceUpdate((n) => n + 1);
        }
        lastPinchDist.current = dist;
      } else if (touches.length === 1 && isPinching.current === false) {
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(e, gs);
      }
    },
    onPanResponderRelease: (_, gs) => {
      if (isPinching.current === false) {
        pan.flattenOffset();
        currentPos.current = { x: currentPos.current.x + gs.dx, y: currentPos.current.y + gs.dy };
      }
      isPinching.current = false;
      lastPinchDist.current = null;
    },
  })).current;

  const cornerRef = useRef({ startW: 0 });
  const cornerResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => interactive,
    onMoveShouldSetPanResponder: () => interactive,
    onPanResponderGrant: () => { cornerRef.current.startW = sizeRef.current.w; },
    onPanResponderMove: (_, gs) => {
      const newW = Math.max(200, Math.min(width * 2.5, cornerRef.current.startW + gs.dx));
      sizeRef.current = { w: newW, h: newW / aspectRatio.current };
      forceUpdate((n) => n + 1);
    },
  })).current;

  const handleFit = () => {
    sizeRef.current = { w: width * 0.95, h: height * 0.78 };
    pan.setValue({ x: 0, y: 0 });
    currentPos.current = { x: 0, y: 0 };
    forceUpdate((n) => n + 1);
  };

  const handleInsertBlankPage = () => {
    const insertAfter = currentPage;
    setBlankPages((prev) => [...prev, insertAfter + 0.5].sort((a, b) => a - b));
    Alert.alert("Blank Page Added", "Blank page inserted after page " + insertAfter);
  };

  const handleRemoveBlankPage = () => {
    if (!isBlankPage) return;
    setBlankPages((prev) => prev.filter((p) => p !== currentPage));
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const { w, h } = sizeRef.current;
  const realPage = isBlankPage ? 1 : currentPage - blankPages.filter((b) => b < currentPage).length;

  return (
    <>
      {showThumbs && interactive && (
        <PDFThumbnailSidebar
          uri={uri}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageSelect={(p) => { setCurrentPage(p); setShowThumbs(false); }}
          onClose={() => setShowThumbs(false)}
        />
      )}

      <Animated.View
        style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }, (!interactive ? { pointerEvents: "none" } : {})]}
        {...(interactive ? panResponder.panHandlers : {})}
      >
        {interactive && showControls && (
          <View pointerEvents="none" style={[styles.selectionBorder, { width: w, height: h }]} />
        )}

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => interactive && setShowControls((s) => s === false)}
          pointerEvents={interactive ? "auto" : "none"}
        >
          {isBlankPage ? (
            <View style={[styles.blankPage, { width: w, height: h }]}>
              <Ionicons name="document-outline" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.blankText}>Blank Page</Text>
              <Text style={styles.blankSub}>Draw freely here</Text>
            </View>
          ) : (
            <Pdf
              source={{ uri, cache: true }}
              page={realPage}
              onLoadComplete={(pages) => setTotalPages(pages)}
              onPageChanged={(page) => setCurrentPage(page)}
              style={{ width: w, height: h, borderRadius: 6, backgroundColor: "#1a1a2e" }}
              enablePaging={true}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              trustAllCerts={false}
            />
          )}
        </TouchableOpacity>

        {/* Page Navigation */}
        {interactive && showControls && totalPagesWithBlanks > 1 && (
          <View style={styles.pageNav}>
            <TouchableOpacity
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={[styles.navBtn, currentPage === 1 && styles.navDisabled]}
            >
              <Ionicons name="chevron-back" size={14} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowThumbs((s) => s === false)} style={styles.pageCounter}>
              <Ionicons name="grid-outline" size={10} color="rgba(255,255,255,0.6)" />
              <Text style={styles.pageText}>{currentPage} / {totalPagesWithBlanks}</Text>
              {isBlankPage && <Text style={styles.blankBadge}>BLANK</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentPage((p) => Math.min(totalPagesWithBlanks, p + 1))}
              style={[styles.navBtn, currentPage === totalPagesWithBlanks && styles.navDisabled]}
            >
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {interactive && showControls && isLocked === false && (
          <View {...cornerResponder.panHandlers} style={styles.cornerHandle}>
            <Ionicons name="resize" size={12} color="#fff" />
          </View>
        )}

        {/* Controls */}
        {interactive && showControls && (
          <View style={styles.controls}>
            <TouchableOpacity onPress={handleFit} style={styles.ctrlBtn}>
              <Ionicons name="scan-outline" size={12} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowThumbs((s) => s === false)} style={styles.ctrlBtn}>
              <Ionicons name="grid-outline" size={12} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleInsertBlankPage} style={styles.ctrlBtn}>
              <Ionicons name="add-circle-outline" size={12} color="#fff" />
            </TouchableOpacity>
            {isBlankPage && (
              <TouchableOpacity onPress={handleRemoveBlankPage} style={[styles.ctrlBtn, { backgroundColor: "rgba(239,68,68,0.7)" }]}>
                <Ionicons name="remove-circle-outline" size={12} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => { isLockedRef.current = isLockedRef.current === false; setIsLocked(isLockedRef.current); }}
              style={[styles.ctrlBtn, isLocked && styles.lockActive]}
            >
              <Ionicons name={isLocked ? "lock-closed" : "lock-open"} size={12} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRemove} style={[styles.ctrlBtn, styles.deleteBtn]}>
              <Ionicons name="trash" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {name && (
          <View style={[styles.nameTag, !interactive && { opacity: 0.5 }]}>
            <Ionicons name="document-text" size={9} color="#EF4444" />
            <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
            {!interactive && <Text style={styles.drawModeText}> Draw Mode</Text>}
          </View>
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { position: "absolute", zIndex: 5 },
  selectionBorder: { position: "absolute", borderWidth: 1.5, borderColor: "rgba(239,68,68,0.7)", borderRadius: 6, borderStyle: "dashed", zIndex: 1 },
  cornerHandle: { position: "absolute", bottom: -12, right: -12, width: 28, height: 28, backgroundColor: "rgba(239,68,68,0.9)", borderRadius: 7, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff", zIndex: 10 },
  controls: { position: "absolute", top: -36, right: 0, flexDirection: "row", gap: 4 },
  ctrlBtn: { width: 26, height: 26, borderRadius: 8, backgroundColor: "rgba(239,68,68,0.85)", alignItems: "center", justifyContent: "center" },
  lockActive: { backgroundColor: "#F59E0B" },
  deleteBtn: { backgroundColor: "#7C3AED" },
  pageNav: { position: "absolute", bottom: -44, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  navBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(239,68,68,0.85)", alignItems: "center", justifyContent: "center" },
  navDisabled: { backgroundColor: "rgba(100,100,100,0.4)" },
  pageCounter: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(10,10,20,0.85)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  pageText: { fontSize: 11, color: "#fff", fontWeight: "700" },
  blankBadge: { fontSize: 8, color: "#22C55E", fontWeight: "800", backgroundColor: "rgba(34,197,94,0.2)", paddingHorizontal: 4, borderRadius: 4 },
  nameTag: { position: "absolute", bottom: -22, left: 0, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(10,10,20,0.75)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, maxWidth: 250 },
  nameText: { fontSize: 9, color: "rgba(255,255,255,0.75)" },
  drawModeText: { fontSize: 9, color: "#22C55E", fontWeight: "700" },
  blankPage: { borderRadius: 6, backgroundColor: "#1a1a2e", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderStyle: "dashed" },
  blankText: { fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: "700" },
  blankSub: { fontSize: 10, color: "rgba(255,255,255,0.2)" },
});

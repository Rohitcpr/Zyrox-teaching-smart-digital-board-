import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  useWindowDimensions, Animated, PanResponder, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, BRAND } from '../../constants/colors';

interface Props {
  id: string;
  uri: string;
  editMode: boolean;
  onRemove: (id: string) => void;
}

export const PDFViewerLayer: React.FC<Props> = ({ id, uri, editMode, onRemove }) => {
  const { width, height } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfW, setPdfW] = useState(width);
  const [pdfH, setPdfH] = useState(height * 0.75);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 40 })).current;
  const posRef = useRef({ x: 0, y: 40 });
  const lastPinchRef = useRef<number | null>(null);
  const baseSizeRef = useRef({ w: width, h: height * 0.75 });
  const editModeRef = useRef(editMode);
  editModeRef.current = editMode;

  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return null;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editModeRef.current,
      onStartShouldSetPanResponderCapture: () => editModeRef.current,
      onMoveShouldSetPanResponder: () => editModeRef.current,
      onMoveShouldSetPanResponderCapture: () => editModeRef.current,

      onPanResponderGrant: (evt) => {
        const touches = Array.from(evt.nativeEvent.touches);
        if (touches.length >= 2) {
          lastPinchRef.current = getDistance(touches);
          baseSizeRef.current = { w: pdfW, h: pdfH };
        } else {
          pan.setOffset({ x: posRef.current.x, y: posRef.current.y });
          pan.setValue({ x: 0, y: 0 });
        }
      },

      onPanResponderMove: (evt, gs) => {
        const touches = Array.from(evt.nativeEvent.touches);
        if (touches.length >= 2) {
          const dist = getDistance(touches);
          if (dist && lastPinchRef.current) {
            const scale = dist / lastPinchRef.current;
            setPdfW(Math.max(200, Math.min(baseSizeRef.current.w * scale, width * 2)));
            setPdfH(Math.max(150, Math.min(baseSizeRef.current.h * scale, height * 2)));
          }
        } else {
          pan.x.setValue(gs.dx);
          pan.y.setValue(gs.dy);
        }
      },

      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        posRef.current.x += gs.dx;
        posRef.current.y += gs.dy;
        lastPinchRef.current = null;
      },

      onPanResponderTerminate: () => {
        pan.flattenOffset();
        lastPinchRef.current = null;
      },
    })
  ).current;

  // Try react-native-pdf
  let Pdf: any = null;
  try { Pdf = require('react-native-pdf').default; } catch (e) {}

  const filename = uri.split('/').pop() ?? 'document.pdf';

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        editMode && styles.editBorder,
      ]}
      {...(editMode ? panResponder.panHandlers : {})}
      pointerEvents={editMode ? 'box-only' : 'none'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="document-text" size={14} color="#EF4444" />
        <Text style={styles.filename} numberOfLines={1}>{filename}</Text>
        <Text style={styles.pageInfo}>{currentPage}/{totalPages}</Text>
        {editMode && (
          <TouchableOpacity onPress={() => onRemove(id)} style={styles.closeBtn}>
            <Ionicons name="close" size={14} color={TEXT.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* PDF Content */}
      <View style={[styles.pdfArea, { width: pdfW, height: pdfH }]}>
        {Pdf ? (
          <>
            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={BRAND.primaryLight} />
                <Text style={styles.loadingText}>Loading PDF...</Text>
              </View>
            )}
            <Pdf
              source={{ uri, cache: true }}
              style={[styles.pdf, { width: pdfW, height: pdfH }]}
              onLoadComplete={(pages: number) => {
                setTotalPages(pages);
                setLoading(false);
              }}
              onPageChanged={(page: number) => setCurrentPage(page)}
              onError={() => setLoading(false)}
              page={currentPage}
              enablePaging={true}
              horizontal={false}
              fitPolicy={0}
            />
          </>
        ) : (
          <View style={styles.fallback}>
            <Ionicons name="document-text-outline" size={48} color={TEXT.disabled} />
            <Text style={styles.fallbackTitle}>{filename}</Text>
            <Text style={styles.fallbackSub}>Draw over to annotate</Text>
            <Text style={styles.fallbackNote}>PDF viewer needs dev build</Text>
          </View>
        )}
      </View>

      {/* Page Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={[styles.navBtn, currentPage === 1 && styles.navBtnDisabled]}
        >
          <Ionicons name="chevron-back" size={16} color={TEXT.secondary} />
        </TouchableOpacity>
        <Text style={styles.pageText}>Page {currentPage} / {totalPages}</Text>
        <TouchableOpacity
          onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={[styles.navBtn, currentPage === totalPages && styles.navBtnDisabled]}
        >
          <Ionicons name="chevron-forward" size={16} color={TEXT.secondary} />
        </TouchableOpacity>
      </View>

      {/* Edit mode handles */}
      {editMode && (
        <>
          <View style={[styles.handle, styles.tl]} />
          <View style={[styles.handle, styles.tr]} />
          <View style={[styles.handle, styles.bl]} />
          <View style={[styles.handle, styles.br]} />
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => {
                setPdfW(width);
                setPdfH(height * 0.75);
                pan.setValue({ x: 0, y: 0 });
                posRef.current = { x: 0, y: 0 };
              }}
              style={styles.ctrlBtn}
            >
              <Ionicons name="scan-outline" size={13} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onRemove(id)} style={[styles.ctrlBtn, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="trash" size={13} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 5, borderRadius: 8, overflow: 'hidden' },
  editBorder: { borderWidth: 1.5, borderColor: 'rgba(59,130,246,0.70)' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(10,10,20,0.97)',
    paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  filename: { flex: 1, fontSize: 11, fontWeight: '600', color: TEXT.primary },
  pageInfo: { fontSize: 10, color: TEXT.disabled, fontWeight: '600' },
  closeBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  pdfArea: { backgroundColor: '#1a1a2e', position: 'relative' },
  pdf: { flex: 1 },
  loadingBox: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1a1a2e' },
  loadingText: { fontSize: 12, color: TEXT.secondary },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1a1a2e' },
  fallbackTitle: { fontSize: 13, fontWeight: '700', color: TEXT.primary },
  fallbackSub: { fontSize: 11, color: TEXT.secondary },
  fallbackNote: { fontSize: 10, color: TEXT.disabled },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(10,10,20,0.97)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  navBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  navBtnDisabled: { opacity: 0.3 },
  pageText: { fontSize: 11, color: TEXT.secondary, fontWeight: '600' },
  handle: { position: 'absolute', width: 12, height: 12, borderRadius: 3, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#fff' },
  tl: { top: -6, left: -6 },
  tr: { top: -6, right: -6 },
  bl: { bottom: -6, left: -6 },
  br: { bottom: -6, right: -6 },
  controls: { position: 'absolute', top: 36, right: -34, gap: 4 },
  ctrlBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(124,58,237,0.90)', alignItems: 'center', justifyContent: 'center' },
});

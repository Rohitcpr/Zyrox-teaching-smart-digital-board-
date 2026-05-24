import React, { useRef, useState } from 'react';
import {
  Animated, PanResponder, View, StyleSheet,
  TouchableOpacity, Text, useWindowDimensions,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  uri: string;
  name?: string;
  onRemove: () => void;
}

export const PDFViewerLayer: React.FC<Props> = ({ uri, name, onRemove }) => {
  const { width, height } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [, forceUpdate] = useState(0);

  const sizeRef = useRef({ w: width * 0.92, h: height * 0.72 });
  const aspectRatio = useRef((width * 0.92) / (height * 0.72));
  const isLockedRef = useRef(false);

  const pan = useRef(new Animated.ValueXY({ x: width * 0.04, y: 60 })).current;
  const currentPos = useRef({ x: width * 0.04, y: 60 });
  const lastPinchDist = useRef(null);
  const isPinching = useRef(false);

  const getDist = (touches) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isLockedRef.current === false,
      onMoveShouldSetPanResponder: () => isLockedRef.current === false,
      onPanResponderGrant: (e) => {
        if (e.nativeEvent.touches.length === 1) {
          pan.setOffset({ x: currentPos.current.x, y: currentPos.current.y });
          pan.setValue({ x: 0, y: 0 });
          setIsDragging(true);
        }
      },
      onPanResponderMove: (e, gs) => {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2) {
          isPinching.current = true;
          const dist = getDist(Array.from(touches));
          if (lastPinchDist.current !== null) {
            const ratio = dist / lastPinchDist.current;
            const newW = Math.max(200, Math.min(width * 2, sizeRef.current.w * ratio));
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
          currentPos.current = {
            x: currentPos.current.x + gs.dx,
            y: currentPos.current.y + gs.dy,
          };
        }
        isPinching.current = false;
        lastPinchDist.current = null;
        setIsDragging(false);
      },
    })
  ).current;

  const cornerRef = useRef({ startW: 0 });
  const cornerResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { cornerRef.current.startW = sizeRef.current.w; },
      onPanResponderMove: (_, gs) => {
        const newW = Math.max(200, Math.min(width * 2, cornerRef.current.startW + gs.dx));
        sizeRef.current = { w: newW, h: newW / aspectRatio.current };
        forceUpdate((n) => n + 1);
      },
    })
  ).current;

  const handleFit = () => {
    sizeRef.current = { w: width * 0.95, h: height * 0.78 };
    pan.setValue({ x: 0, y: 0 });
    currentPos.current = { x: 0, y: 0 };
    forceUpdate((n) => n + 1);
  };

  const { w, h } = sizeRef.current;
  const source = { uri, cache: true };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
      {...panResponder.panHandlers}
    >
      {showControls && (
        <View pointerEvents="none" style={[styles.selectionBorder, { width: w, height: h }]} />
      )}

      <TouchableOpacity activeOpacity={1} onPress={() => setShowControls((s) => s === false)}>
        <Pdf
          source={source}
          page={currentPage}
          onLoadComplete={(pages) => setTotalPages(pages)}
          onPageChanged={(page) => setCurrentPage(page)}
          style={{ width: w, height: h, borderRadius: 6, backgroundColor: '#1a1a2e' }}
          enablePaging={true}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          trustAllCerts={false}
        />
      </TouchableOpacity>

      {/* Page Navigation */}
      {totalPages > 1 && showControls && (
        <View style={styles.pageNav}>
          <TouchableOpacity
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={[styles.navBtn, currentPage === 1 && styles.navDisabled]}
          >
            <Ionicons name="chevron-back" size={14} color="#fff" />
          </TouchableOpacity>
          <View style={styles.pageCounter}>
            <Text style={styles.pageText}>{currentPage} / {totalPages}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={[styles.navBtn, currentPage === totalPages && styles.navDisabled]}
          >
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Corner resize */}
      {showControls && isLocked === false && (
        <View {...cornerResponder.panHandlers} style={styles.cornerHandle}>
          <Ionicons name="resize" size={12} color="#fff" />
        </View>
      )}

      {/* Controls */}
      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleFit} style={styles.ctrlBtn}>
            <Ionicons name="scan-outline" size={13} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { isLockedRef.current = isLockedRef.current === false; setIsLocked(isLockedRef.current); }}
            style={[styles.ctrlBtn, isLocked && styles.lockActive]}
          >
            <Ionicons name={isLocked ? 'lock-closed' : 'lock-open'} size={13} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRemove} style={[styles.ctrlBtn, styles.deleteBtn]}>
            <Ionicons name="trash" size={13} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Name tag */}
      {showControls && name && (
        <View style={styles.nameTag}>
          <Ionicons name="document-text" size={9} color="#EF4444" />
          <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
        </View>
      )}

      {isDragging && (
        <View style={styles.sizeTag}>
          <Text style={styles.sizeText}>{Math.round(w)} x {Math.round(h)}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', zIndex: 5 },
  selectionBorder: { position: 'absolute', borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.7)', borderRadius: 6, borderStyle: 'dashed', zIndex: 1 },
  cornerHandle: { position: 'absolute', bottom: -12, right: -12, width: 28, height: 28, backgroundColor: 'rgba(239,68,68,0.9)', borderRadius: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', zIndex: 10 },
  controls: { position: 'absolute', top: -36, right: 0, flexDirection: 'row', gap: 4 },
  ctrlBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.85)', alignItems: 'center', justifyContent: 'center' },
  lockActive: { backgroundColor: '#F59E0B' },
  deleteBtn: { backgroundColor: '#7C3AED' },
  pageNav: { position: 'absolute', bottom: -40, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  navBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.85)', alignItems: 'center', justifyContent: 'center' },
  navDisabled: { backgroundColor: 'rgba(100,100,100,0.4)' },
  pageCounter: { backgroundColor: 'rgba(10,10,20,0.85)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  pageText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  nameTag: { position: 'absolute', bottom: -22, left: 0, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(10,10,20,0.75)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, maxWidth: 220 },
  nameText: { fontSize: 9, color: 'rgba(255,255,255,0.75)' },
  sizeTag: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(10,10,20,0.75)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  sizeText: { fontSize: 9, color: '#fff', fontWeight: '600' },
});

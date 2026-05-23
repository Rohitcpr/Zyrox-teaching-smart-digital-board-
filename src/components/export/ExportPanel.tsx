import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import Svg from 'react-native-svg';
import { GlassPanel } from '../ui/GlassPanel';
import { StrokeRenderer } from '../canvas/StrokeRenderer';
import { ShapeRenderer } from '../shapes/ShapeRenderer';
import { TextRenderer } from '../text/TextRenderer';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useAppStore } from '../../store/useAppStore';
import { BRAND, TEXT } from '../../constants/colors';

interface Props {
  onClose: () => void;
  pageId: string;
}

type ExportStatus = 'idle' | 'loading' | 'done' | 'error';

const generateFilename = (ext: string): string => {
  const now = new Date();
  const d = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  const t = `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
  return `ZYROX_${d}_${t}.${ext}`;
};

export const ExportPanel: React.FC<Props> = ({ onClose, pageId }) => {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [lastUri, setLastUri] = useState('');
  const viewShotRef = useRef<any>(null);
  const { width, height } = useWindowDimensions();

  const layers = useCanvasStore((s) => s.layers);
  const shapes = useCanvasStore((s) => s.shapes);
  const textItems = useCanvasStore((s) => s.textItems);
  const bgColor = useAppStore((s) => s.bgColor);

  const allStrokes = layers.filter((l) => l.visible).flatMap((l) => l.strokes);

  const handleExportPNG = async () => {
    setStatus('loading');
    try {
      const uri = await viewShotRef.current.capture();
      setLastUri(uri);
      setStatus('done');

      Alert.alert('Export Ready!', 'Board captured as PNG', [
        {
          text: 'Save to Gallery',
          onPress: async () => {
            const { status: perm } = await MediaLibrary.requestPermissionsAsync();
            if (perm === 'granted') {
              await MediaLibrary.saveToLibraryAsync(uri);
              Alert.alert('Saved!', 'Image saved to gallery');
            }
          },
        },
        {
          text: 'Share',
          onPress: async () => {
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) await Sharing.shareAsync(uri, { mimeType: 'image/png' });
          },
        },
        { text: 'OK' },
      ]);
    } catch (e) {
      console.error(e);
      setStatus('error');
      Alert.alert('Export Failed', 'Please try again');
    }
  };

  const handleShare = async () => {
    if (!lastUri) { Alert.alert('Export PNG first'); return; }
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) await Sharing.shareAsync(lastUri);
  };

  const OPTIONS = [
    { icon: 'image-outline', label: 'PNG', sub: 'Save as image', color: '#22C55E', onPress: handleExportPNG },
    { icon: 'document-outline', label: 'PDF', sub: 'Coming soon', color: '#EF4444', onPress: () => Alert.alert('Coming Soon', 'PDF export coming in next update!') },
    { icon: 'share-outline', label: 'Share', sub: 'Share PNG', color: '#3B82F6', onPress: handleShare },
  ];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      {/* Hidden ViewShot for capture */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1.0 }}
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

        {status === 'loading' ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={BRAND.primaryLight} />
            <Text style={styles.loadingText}>Capturing board...</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                onPress={opt.onPress}
                style={[styles.card, { borderColor: opt.color + '40' }]}
              >
                <View style={[styles.iconBox, { backgroundColor: opt.color + '20' }]}>
                  <Ionicons name={opt.icon as any} size={26} color={opt.color} />
                </View>
                <Text style={styles.cardLabel}>{opt.label}</Text>
                <Text style={styles.cardSub}>{opt.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {status === 'done' && (
          <View style={styles.successBar}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.successText}>Export successful!</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.errorBar}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>Export failed. Try again.</Text>
          </View>
        )}
      </GlassPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 300, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  hiddenCanvas: { position: 'absolute', left: -9999, top: -9999 },
  panel: { width: '88%', padding: 20, zIndex: 301 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 16, fontWeight: '800', color: '#F0F0FF', letterSpacing: 1 },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  grid: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, padding: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 8 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 12, fontWeight: '700', color: '#F0F0FF' },
  cardSub: { fontSize: 10, color: TEXT.disabled, textAlign: 'center' },
  loadingBox: { alignItems: 'center', padding: 30, gap: 12 },
  loadingText: { fontSize: 13, color: TEXT.secondary },
  successBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, padding: 10, backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(34,197,94,0.30)' },
  successText: { fontSize: 12, color: '#22C55E', fontWeight: '600' },
  errorBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, padding: 10, backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.30)' },
  errorText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
});

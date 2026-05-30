import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, TEXT } from '../../constants/colors';

interface Props {
  uri: string;
  onRemove: () => void;
}

export const PDFViewerLayer: React.FC<Props> = ({ uri, onRemove }) => {
  const { width } = useWindowDimensions();
  const filename = uri.split('/').pop() ?? 'document.pdf';

  return (
    <View style={[styles.container, { width: width - 32 }]}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={20} color="#EF4444" />
        <Text style={styles.filename} numberOfLines={1}>{filename}</Text>
        <TouchableOpacity onPress={onRemove} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={TEXT.secondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Ionicons name="document-text-outline" size={48} color={TEXT.disabled} />
        <Text style={styles.title}>PDF Imported</Text>
        <Text style={styles.sub}>Draw over this area to annotate</Text>
        <Text style={styles.note}>Full PDF viewer available in Dev Build</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 60, left: 16,
    backgroundColor: 'rgba(10,10,20,0.95)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.30)',
    overflow: 'hidden', zIndex: 5,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  filename: { flex: 1, fontSize: 12, fontWeight: '600', color: TEXT.primary },
  closeBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  body: { alignItems: 'center', padding: 32, gap: 8 },
  title: { fontSize: 14, fontWeight: '700', color: TEXT.primary },
  sub: { fontSize: 12, color: TEXT.secondary },
  note: { fontSize: 10, color: TEXT.disabled, textAlign: 'center', marginTop: 4 },
});

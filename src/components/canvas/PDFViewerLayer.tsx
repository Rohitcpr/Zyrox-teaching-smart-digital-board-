import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT, BRAND } from '../../constants/colors';

// react-native-pdf needs dev build
// Expo Go me kaam nahi karta
// APK build ke baad enable hoga

interface Props {
  uri: string;
  onRemove: () => void;
}

export const PDFViewerLayer: React.FC<Props> = ({ uri, onRemove }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="document-text" size={40} color={BRAND.primaryLight} />
      <Text style={styles.text}>PDF imported</Text>
      <Text style={styles.sub}>Full PDF viewer in APK build</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100, left: 20,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.30)',
    zIndex: 5,
  },
  text: { color: TEXT.primary, fontWeight: '700', fontSize: 14 },
  sub: { color: TEXT.disabled, fontSize: 11 },
});

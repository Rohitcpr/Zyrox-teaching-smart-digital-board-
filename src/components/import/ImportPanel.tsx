import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { GlassPanel } from '../ui/GlassPanel';
import { useCanvasStore } from '../../store/useCanvasStore';
import { BRAND, TEXT } from '../../constants/colors';

interface Props {
  onClose: () => void;
  onImportSuccess: (type: string, uri: string, name: string) => void;
}

export const ImportPanel: React.FC<Props> = ({ onClose, onImportSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleImportPDF = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImportSuccess('pdf', asset.uri, asset.name);
        onClose();
      }
    } catch (e) {
      Alert.alert('Import Failed', 'Could not import PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleImportImage = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow gallery access to import images');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImportSuccess('image', asset.uri, asset.fileName ?? 'image.jpg');
        onClose();
      }
    } catch (e) {
      Alert.alert('Import Failed', 'Could not import image');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow camera access');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImportSuccess('image', asset.uri, 'camera_photo.jpg');
        onClose();
      }
    } catch (e) {
      Alert.alert('Failed', 'Could not open camera');
    } finally {
      setLoading(false);
    }
  };

  const OPTIONS = [
    {
      icon: 'document-text',
      label: 'Import PDF',
      sub: 'Annotate PDF file',
      color: '#EF4444',
      onPress: handleImportPDF,
    },
    {
      icon: 'image',
      label: 'Import Image',
      sub: 'PNG, JPG from gallery',
      color: '#22C55E',
      onPress: handleImportImage,
    },
    {
      icon: 'camera',
      label: 'Take Photo',
      sub: 'Use camera',
      color: '#3B82F6',
      onPress: handleTakePhoto,
    },
  ];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <GlassPanel style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Import</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={TEXT.secondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={BRAND.primaryLight} />
            <Text style={styles.loadingText}>Importing...</Text>
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
                  <Ionicons name={opt.icon as any} size={28} color={opt.color} />
                </View>
                <Text style={styles.cardLabel}>{opt.label}</Text>
                <Text style={styles.cardSub}>{opt.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </GlassPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 300,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  panel: { width: '88%', padding: 20, zIndex: 301 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  title: { fontSize: 16, fontWeight: '800', color: '#F0F0FF', letterSpacing: 1 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  grid: { flexDirection: 'row', gap: 12 },
  card: {
    flex: 1, padding: 14, alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, borderWidth: 1,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cardLabel: { fontSize: 12, fontWeight: '700', color: '#F0F0FF', textAlign: 'center' },
  cardSub: { fontSize: 10, color: TEXT.disabled, textAlign: 'center' },
  loadingBox: { alignItems: 'center', padding: 30, gap: 12 },
  loadingText: { fontSize: 13, color: TEXT.secondary },
});
// PDF handling already exists

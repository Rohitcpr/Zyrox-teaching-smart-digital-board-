import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawingCanvas } from '../src/components/canvas/DrawingCanvas';
import { LaserPointer } from '../src/components/ui/LaserPointer';
import { useAppStore } from '../src/store/useAppStore';
import { BRAND, TEXT } from '../src/constants/colors';

export default function PresentationScreen() {
  const router = useRouter();
  const bgColor = useAppStore((s) => s.bgColor);
  const [isLaserMode, setIsLaserMode] = useState(false);
  const [showControls, setShowControls] = useState(true);

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <StatusBar hidden />

      {/* Canvas */}
      <DrawingCanvas bgColor={bgColor} />

      {/* Laser overlay */}
      {isLaserMode && <LaserPointer onExit={() => setIsLaserMode(false)} />}

      {/* Controls bar — tap screen to show/hide */}
      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => router.back()} style={styles.btn}>
            <Ionicons name="arrow-back" size={22} color={TEXT.secondary} />
          </TouchableOpacity>

          <Text style={styles.title}>Presentation Mode</Text>

          <TouchableOpacity
            onPress={() => setIsLaserMode(!isLaserMode)}
            style={[styles.btn, isLaserMode && styles.activeBtn]}
          >
            <Ionicons name="radio-button-on" size={22} color={isLaserMode ? '#EF4444' : TEXT.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowControls(false)}
            style={styles.btn}
          >
            <Ionicons name="eye-off" size={22} color={TEXT.secondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Tap to show controls again */}
      {!showControls && (
        <TouchableOpacity
          style={styles.tapArea}
          onPress={() => setShowControls(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  controls: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 52, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(10,10,15,0.90)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.25)',
  },
  title: { fontSize: 13, fontWeight: '700', color: BRAND.primaryLight, letterSpacing: 2 },
  btn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  activeBtn: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.40)' },
  tapArea: { ...StyleSheet.absoluteFillObject },
});

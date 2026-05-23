import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useFabSettings } from '../../hooks/useFabSettings';
import { BRAND, SURFACE, TEXT, GLASS } from '../../constants/colors';

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { settings, updateSettings } = useAppStore();
  const { clearCanvas } = useCanvasStore();
  const { fabSize, fabOpacity, setFabSize, setFabOpacity } = useFabSettings();

  const FAB_SIZES = [36, 44, 52, 60, 70];
  const OPACITY_LEVELS = [0.3, 0.5, 0.7, 0.85, 1.0];

  const handleClearAll = () => {
    Alert.alert('Clear All Data', 'This will delete all boards. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => clearCanvas() },
    ]);
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  const Row: React.FC<{
    icon: string;
    label: string;
    sub?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    color?: string;
  }> = ({ icon, label, sub, right, onPress, color }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={[styles.rowIcon, { backgroundColor: (color ?? BRAND.primary) + '20' }]}>
        <Ionicons name={icon as any} size={18} color={color ?? BRAND.primaryLight} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={16} color={TEXT.disabled} />)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Canvas Settings */}
        <Section title="CANVAS">
          <Row
            icon="moon-outline"
            label="Auto Save"
            sub="Save every 30 seconds"
            right={
              <Switch
                value={settings.autoSave}
                onValueChange={(v) => updateSettings({ autoSave: v })}
                trackColor={{ true: BRAND.primary }}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <Row
            icon="grid-outline"
            label="Default Grid"
            sub="Set default grid type"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <Row
            icon="hand-left-outline"
            label="Palm Rejection"
            sub="Ignore palm touches"
            right={<Switch value={true} trackColor={{ true: BRAND.primary }} thumbColor="#fff" />}
          />
        </Section>

        {/* FAB Button Settings */}
        <Section title="FLOATING BUTTON">
          <Text style={styles.subLabel}>Button Size</Text>
          <View style={styles.chipRow}>
            {FAB_SIZES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setFabSize(s)}
                style={[styles.chip, fabSize === s && styles.activeChip]}
              >
                <View style={[styles.sizeDot, {
                  width: s * 0.4, height: s * 0.4,
                  borderRadius: s * 0.2,
                  backgroundColor: fabSize === s ? BRAND.primaryLight : TEXT.secondary,
                }]} />
                <Text style={[styles.chipLabel, fabSize === s && { color: BRAND.primaryLight }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.subLabel}>Button Transparency</Text>
          <View style={styles.chipRow}>
            {OPACITY_LEVELS.map((o) => (
              <TouchableOpacity
                key={o}
                onPress={() => setFabOpacity(o)}
                style={[styles.chip, fabOpacity === o && styles.activeChip]}
              >
                <View style={[styles.opacityDot, { opacity: o }]} />
                <Text style={[styles.chipLabel, fabOpacity === o && { color: BRAND.primaryLight }]}>
                  {Math.round(o * 100)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Performance */}
        <Section title="PERFORMANCE">
          <Row
            icon="speedometer-outline"
            label="Performance Mode"
            sub="Reduce animations for speed"
            right={<Switch value={false} trackColor={{ true: BRAND.primary }} thumbColor="#fff" />}
          />
          <View style={styles.divider} />
          <Row
            icon="battery-half-outline"
            label="Battery Saver"
            sub="Reduce background activity"
            right={<Switch value={false} trackColor={{ true: BRAND.primary }} thumbColor="#fff" />}
          />
        </Section>

        {/* Gestures */}
        <Section title="GESTURES">
          <Row icon="hand-right-outline" label="Two-finger Undo" sub="Swipe with 2 fingers" />
          <View style={styles.divider} />
          <Row icon="hand-right-outline" label="Three-finger Redo" sub="Swipe with 3 fingers" />
          <View style={styles.divider} />
          <Row icon="resize-outline" label="Pinch to Zoom" sub="Zoom in/out canvas" />
          <View style={styles.divider} />
          <Row icon="finger-print-outline" label="Double-tap Reset" sub="Reset zoom level" />
        </Section>

        {/* Storage */}
        <Section title="STORAGE">
          <Row
            icon="folder-outline"
            label="Export Location"
            sub="zyrox_exports/"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <Row
            icon="trash-outline"
            label="Clear All Data"
            sub="Delete all boards"
            color="#EF4444"
            onPress={handleClearAll}
          />
        </Section>

        {/* Future Modules */}
        <Section title="FUTURE FEATURES (Coming Soon)">
          <Row icon="cloud-outline" label="Cloud Sync" sub="Disabled — Coming soon" color="#6B7280" />
          <View style={styles.divider} />
          <Row icon="people-outline" label="Online Class" sub="Disabled — Coming soon" color="#6B7280" />
          <View style={styles.divider} />
          <Row icon="sparkles-outline" label="AI Assistant" sub="Disabled — Coming soon" color="#6B7280" />
        </Section>

        {/* About */}
        <Section title="ABOUT">
          <Row icon="information-circle-outline" label="ZYROX" sub="Smart Teaching Board v1.0" />
          <View style={styles.divider} />
          <Row icon="code-slash-outline" label="Built with" sub="React Native + Expo" />
        </Section>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SURFACE.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(124,58,237,0.20)',
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  title: { fontSize: 16, fontWeight: '800', color: '#F0F0FF', letterSpacing: 2 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: TEXT.disabled, marginBottom: 10 },
  sectionCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16, borderWidth: 1, borderColor: GLASS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 13, fontWeight: '600', color: TEXT.primary },
  rowSub: { fontSize: 11, color: TEXT.disabled, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 62 },
  subLabel: { fontSize: 11, color: TEXT.secondary, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 12, flexWrap: 'wrap' },
  chip: {
    alignItems: 'center', gap: 4, padding: 10,
    borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    minWidth: 52,
  },
  activeChip: { backgroundColor: 'rgba(124,58,237,0.18)', borderColor: 'rgba(124,58,237,0.50)' },
  chipLabel: { fontSize: 10, color: TEXT.secondary, fontWeight: '600' },
  sizeDot: {},
  opacityDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: BRAND.primaryLight },
});

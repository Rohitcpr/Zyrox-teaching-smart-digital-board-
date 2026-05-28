import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vent-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { BRAND, SURFACE, TEXT, GLASS } from '../../constants/colors';

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { settings, updateSettings } = useAppStore();
  const { clearCanvas } = useCanvasStore();
  const [autoSave, setAutoSave] = useState(true);
  const [palmReject, setPalmReject] = useState(true);
  const [perfMode, setPerfMode] = useState(false);

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  const Row: React.FC<{ icon: string; label: string; sub?: string; right?: React.ReactNode; onPress?: () => void; color?: string }> = ({ icon, label, sub, right, onPress, color }) => (
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={TEXT.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <Section title="CANVAS">
          <Row icon="moon-outline" label="Auto Save" sub="Save every 30 seconds"
            right={<Switch value={autoSave} onValueChange={setAutoSave} trackColor={{ true: BRAND.primary }} thumbColor="#fff" />} />
          <View style={styles.divider} />
          <Row icon="hand-left-outline" label="Palm Rejection" sub="Ignore palm touches"
            right={<Switch value={palmReject} onValueChange={setPalmReject} trackColor={{ true: BRAND.primary }} thumbColor="#fff" />} />
        </Section>

        <Section title="PERFORMANCE">
          <Row icon="speedometer-outline" label="Performance Mode" sub="Faster rendering"
            right={<Switch value={perfMode} onValueChange={setPerfMode} trackColor={{ true: BRAND.primary }} thumbColor="#fff" />} />
          <View style={styles.divider} />
          <Row icon="trash-outline" label="Clear All Data" sub="Delete all boards" color="#EF4444"
            onPress={() => Alert.alert('Clear All', 'Delete everything?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearCanvas },
            ])} />
        </Section>

        <Section title="FUTURE (Coming Soon)">
          <Row icon="cloud-outline" label="Cloud Sync" sub="Disabled" color="#6B7280" />
          <View style={styles.divider} />
          <Row icon="people-outline" label="Online Class" sub="Disabled" color="#6B7280" />
          <View style={styles.divider} />
          <Row icon="sparkles-outline" label="AI Assistant" sub="Disabled" color="#6B7280" />
        </Section>

        {/* ABOUT SECTION */}
        <Section title="ABOUT">
          <View style={styles.aboutCard}>
            <View style={styles.aboutLogoRow}>
              <View style={styles.aboutLogoDot} />
              <Text style={styles.aboutLogo}>ZYROX</Text>
            </View>
            <Text style={styles.aboutTagline}>Smart Teaching Board OS</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>

            <View style={styles.aboutDivider} />

            <View style={styles.aboutRow}>
              <Ionicons name="person-outline" size={14} color={BRAND.primaryLight} />
              <Text style={styles.aboutLabel}>Developer</Text>
              <Text style={styles.aboutValue}>Rohit</Text>
            </View>

            <View style={styles.aboutRow}>
              <Ionicons name="code-slash-outline" size={14} color="#22C55E" />
              <Text style={styles.aboutLabel}>Built with</Text>
              <Text style={styles.aboutValue}>React Native + Expo</Text>
            </View>

            <View style={styles.aboutRow}>
              <Ionicons name="logo-github" size={14} color={TEXT.secondary} />
              <Text style={styles.aboutLabel}>GitHub</Text>
              <Text style={styles.aboutValue}>Rohitcpr/Zyrox</Text>
            </View>

            <View style={styles.aboutRow}>
              <Ionicons name="heart-outline" size={14} color="#EF4444" />
              <Text style={styles.aboutLabel}>Made with</Text>
              <Text style={styles.aboutValue}>❤️ for Teachers</Text>
            </View>

            <View style={styles.aboutDivider} />

            <Text style={styles.aboutDesc}>
              ZYROX is a premium futuristic Smart Teaching Board designed for teachers, students, and educators. Built completely in Termux on Android. 🚀
            </Text>
          </View>
        </Section>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080810' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(124,58,237,0.20)' },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  title: { fontSize: 16, fontWeight: '800', color: '#F0F0FF', letterSpacing: 2 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: TEXT.disabled, marginBottom: 10 },
  sectionCard: { backgroundColor: GLASS.background, borderRadius: 16, borderWidth: 1, borderColor: GLASS.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 13, fontWeight: '600', color: TEXT.primary },
  rowSub: { fontSize: 11, color: TEXT.disabled, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 62 },
  aboutCard: { backgroundColor: GLASS.background, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)', padding: 20, gap: 12 },
  aboutLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aboutLogoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.primaryLight },
  aboutLogo: { fontSize: 22, fontWeight: '900', letterSpacing: 6, color: '#F0F0FF' },
  aboutTagline: { fontSize: 12, color: TEXT.secondary, letterSpacing: 2 },
  aboutVersion: { fontSize: 11, color: TEXT.disabled },
  aboutDivider: { height: 1, backgroundColor: 'rgba(124,58,237,0.20)' },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aboutLabel: { fontSize: 12, color: TEXT.disabled, flex: 1 },
  aboutValue: { fontSize: 12, fontWeight: '600', color: TEXT.primary },
  aboutDesc: { fontSize: 12, color: TEXT.secondary, lineHeight: 18 },
});

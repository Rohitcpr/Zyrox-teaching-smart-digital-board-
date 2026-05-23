import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, TextInput, Modal,
  Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BRAND, SURFACE, TEXT } from '../../constants/colors';
import { generateId } from '../../utils/strokeUtils';
import { useNotebookStore } from '../../store/useNotebookStore';
import { useCanvasStore } from '../../store/useCanvasStore';

const { width } = Dimensions.get('window');

const formatDate = (ts: number): string => {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
};

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { recentBoards, loadRecent, deleteEntry } = useNotebookStore();
  const { saveCanvas } = useCanvasStore();
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folders, setFolders] = useState([
    { name: 'Science',     id: 'nb_sci',   color: '#22C55E', icon: 'flask',    count: 0 },
    { name: 'Mathematics', id: 'nb_math',  color: '#3B82F6', icon: 'calculator', count: 0 },
    { name: 'Language',    id: 'nb_lang',  color: '#F97316', icon: 'language',  count: 0 },
  ]);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRecent();
    Animated.stagger(150, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, []);

  const openNewBoard = async () => {
    await saveCanvas('page_001');
    await useNotebookStore.getState().saveToRecent('page_001');
    const newId = `page_${generateId()}`;
    router.push({ pathname: '/board', params: { pageId: newId, isNew: 'true' } });
  };

  const createFolder = () => {
    if (!folderName.trim()) return;
    const colors = ['#A855F7','#EF4444','#EAB308','#14B8A6','#EC4899','#6366F1'];
    const icons = ['folder','book','library','school','clipboard','briefcase'];
    const idx = folders.length % colors.length;
    setFolders(p => [...p, { name: folderName.trim(), id: `nb_${generateId()}`, color: colors[idx], icon: icons[idx], count: 0 }]);
    setFolderName('');
    setShowNewFolder(false);
  };

  const QUICK_ACTIONS = [
    { icon: 'add-circle',          label: 'New Board',    sub: 'Fresh canvas',    color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', onPress: openNewBoard },
    { icon: 'time-outline',        label: 'Continue',     sub: 'Last board',      color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', onPress: () => router.push({ pathname: '/board', params: { pageId: 'page_001' } }) },
    { icon: 'document-text',       label: 'Import PDF',   sub: 'Annotate',        color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  onPress: openNewBoard },
    { icon: 'image-outline',       label: 'Import Image', sub: 'Draw over',       color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  onPress: openNewBoard },
  ];

  return (
    <View style={styles.screen}>
      {/* Ambient background glow */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-20, 0] }) }]
        }]}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.logoRow}>
                <View style={styles.logoDot} />
                <Text style={styles.logo}>ZYROX</Text>
              </View>
              <Text style={styles.tagline}>Smart Teaching OS</Text>
            </View>
            <TouchableOpacity style={styles.settingsGlass} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={18} color={TEXT.secondary} />
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { label: 'Boards', value: recentBoards.length.toString(), icon: 'easel-outline' },
              { label: 'Notebooks', value: folders.length.toString(), icon: 'folder-outline' },
              { label: 'Today', value: recentBoards.filter(b => Date.now() - b.savedAt < 86400000).length.toString(), icon: 'today-outline' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon as any} size={14} color={BRAND.primaryLight} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Start */}
        <Animated.View style={{ opacity: cardsAnim, transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0,1], outputRange: [20, 0] }) }] }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>QUICK START</Text>
          </View>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((action, i) => (
              <TouchableOpacity
                key={i}
                onPress={action.onPress}
                activeOpacity={0.75}
                style={[styles.quickCard, { backgroundColor: action.bg, borderColor: action.color + '30' }]}
              >
                <View style={[styles.quickIconBox, { backgroundColor: action.color + '25' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickLabel, { color: action.color }]}>{action.label}</Text>
                <Text style={styles.quickSub}>{action.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Recent Boards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT BOARDS</Text>
          <Text style={styles.sectionCount}>{recentBoards.length}</Text>
        </View>

        {recentBoards.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="easel-outline" size={36} color={TEXT.disabled} />
            <Text style={styles.emptyTitle}>No boards yet</Text>
            <Text style={styles.emptySub}>Create your first board</Text>
            <TouchableOpacity onPress={openNewBoard} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>New Board</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentBoards.slice(0, 8).map((board, i) => (
            <TouchableOpacity
              key={board.id}
              style={styles.recentCard}
              onPress={() => router.push({ pathname: '/board', params: { pageId: board.pageId } })}
              activeOpacity={0.75}
            >
              <View style={styles.recentLeft}>
                <View style={[styles.recentThumb, { backgroundColor: `hsl(${(i * 47) % 360}, 60%, 25%)` }]}>
                  <Ionicons name="easel" size={18} color={`hsl(${(i * 47) % 360}, 80%, 70%)`} />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName} numberOfLines={1}>{board.name}</Text>
                  <View style={styles.recentMeta}>
                    <Ionicons name="time-outline" size={10} color={TEXT.disabled} />
                    <Text style={styles.recentDate}>{formatDate(board.savedAt)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.recentRight}>
                <TouchableOpacity
                  onPress={() => Alert.alert('Delete', `Delete "${board.name}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(board.id) },
                  ])}
                  style={styles.recentDelete}
                >
                  <Ionicons name="trash-outline" size={14} color={TEXT.disabled} />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={14} color={TEXT.disabled} />
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Notebooks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NOTEBOOKS</Text>
          <TouchableOpacity onPress={() => setShowNewFolder(true)} style={styles.addBtn}>
            <Ionicons name="add" size={16} color={BRAND.primaryLight} />
            <Text style={styles.addBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notebookGrid}>
          {folders.map((nb) => (
            <TouchableOpacity key={nb.id} style={styles.notebookCard} activeOpacity={0.75}>
              <View style={[styles.nbIconBox, { backgroundColor: nb.color + '20' }]}>
                <Ionicons name="folder" size={22} color={nb.color} />
              </View>
              <Text style={styles.nbName}>{nb.name}</Text>
              <Text style={styles.nbCount}>{nb.count} boards</Text>
              <View style={[styles.nbGlow, { backgroundColor: nb.color + '10' }]} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.newNbCard} onPress={() => setShowNewFolder(true)} activeOpacity={0.75}>
            <Ionicons name="add-circle-outline" size={28} color={BRAND.primaryLight} />
            <Text style={styles.newNbText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Media Library */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MEDIA LIBRARY</Text>
        </View>
        <TouchableOpacity style={styles.mediaCard} onPress={openNewBoard} activeOpacity={0.75}>
          <View style={styles.mediaLeft}>
            <View style={styles.mediaIconBox}>
              <Ionicons name="cloud-download-outline" size={22} color="#22C55E" />
            </View>
            <View>
              <Text style={styles.mediaTitle}>Import Files</Text>
              <Text style={styles.mediaSub}>PDF, PNG, JPG from phone</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={TEXT.disabled} />
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* New Folder Modal */}
      <Modal visible={showNewFolder} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Notebook</Text>
            <TextInput
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Notebook name..."
              placeholderTextColor={TEXT.disabled}
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowNewFolder(false)} style={styles.modalCancel}>
                <Text style={{ color: TEXT.secondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createFolder} style={styles.modalCreate}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080810' },

  // Ambient glows
  glowTop: {
    position: 'absolute', top: -100, left: -50,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  glowBottom: {
    position: 'absolute', bottom: -100, right: -50,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(59,130,246,0.06)',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18 },

  // Header
  header: { paddingTop: 56, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.primaryLight },
  logo: { fontSize: 28, fontWeight: '900', letterSpacing: 6, color: '#F0F0FF' },
  tagline: { fontSize: 11, color: TEXT.disabled, letterSpacing: 3, marginTop: 4, marginLeft: 16 },
  settingsGlass: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.20)',
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, alignItems: 'center', gap: 4, padding: 12,
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.15)',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#F0F0FF' },
  statLabel: { fontSize: 9, color: TEXT.disabled, letterSpacing: 1 },

  // Section headers
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28, marginBottom: 14,
  },
  sectionTitle: { fontSize: 9, fontWeight: '800', letterSpacing: 3, color: TEXT.disabled },
  sectionCount: { fontSize: 10, color: TEXT.disabled },

  // Quick start
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: {
    width: (width - 48) / 2,
    padding: 16, borderRadius: 18,
    borderWidth: 1, gap: 8,
  },
  quickIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 13, fontWeight: '800' },
  quickSub: { fontSize: 10, color: TEXT.disabled },

  // Recent
  recentCard: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 12, marginBottom: 8,
  },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  recentThumb: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 13, fontWeight: '600', color: '#F0F0FF' },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  recentDate: { fontSize: 10, color: TEXT.disabled },
  recentRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recentDelete: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  // Empty
  emptyCard: {
    alignItems: 'center', padding: 36, gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: TEXT.secondary },
  emptySub: { fontSize: 11, color: TEXT.disabled },
  emptyBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.40)',
  },
  emptyBtnText: { color: BRAND.primaryLight, fontWeight: '700', fontSize: 12 },

  // Notebooks
  notebookGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  notebookCard: {
    width: (width - 56) / 3,
    padding: 14, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', gap: 6,
    overflow: 'hidden',
  },
  nbIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nbName: { fontSize: 11, fontWeight: '700', color: '#F0F0FF', textAlign: 'center' },
  nbCount: { fontSize: 9, color: TEXT.disabled },
  nbGlow: { position: 'absolute', bottom: -20, width: '150%', height: 40, borderRadius: 20 },
  newNbCard: {
    width: (width - 56) / 3,
    padding: 14, borderRadius: 16,
    backgroundColor: 'rgba(124,58,237,0.06)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.20)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  newNbText: { fontSize: 11, color: BRAND.primaryLight, fontWeight: '600' },

  // Media
  mediaCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(34,197,94,0.06)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.15)',
    padding: 14,
  },
  mediaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mediaIconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  mediaTitle: { fontSize: 13, fontWeight: '700', color: '#F0F0FF' },
  mediaSub: { fontSize: 10, color: TEXT.disabled, marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  modalBox: {
    width: '82%', backgroundColor: '#0F0F1A',
    borderRadius: 20, padding: 24, gap: 16,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#F0F0FF' },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10, padding: 12,
    color: '#F0F0FF', fontSize: 14,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.20)',
  },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: {
    flex: 1, padding: 12, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  modalCreate: {
    flex: 1, padding: 12, borderRadius: 10,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
  },

  // Add button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.30)',
  },
  addBtnText: { fontSize: 11, color: BRAND.primaryLight, fontWeight: '700' },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, TextInput, Modal, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BRAND, SURFACE, TEXT, GLASS } from '../../constants/colors';
import { generateId } from '../../utils/strokeUtils';
import { useNotebookStore } from '../../store/useNotebookStore';
import { useCanvasStore } from '../../store/useCanvasStore';

const { width } = Dimensions.get('window');

const formatDate = (ts: number): string => {
  const diff = Date.now() - ts;
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  const d = new Date(ts);
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
};

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { recentBoards, loadRecent, deleteEntry } = useNotebookStore();
  const { saveCanvas } = useCanvasStore();
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [activeTab, setActiveTab] = useState<'home'|'notebooks'|'recent'|'settings'>('home');
  const [folders, setFolders] = useState([
    { name: 'Science',     id: 'nb_sci',  color: '#10B981', icon: 'flask-outline',     count: 0 },
    { name: 'Mathematics', id: 'nb_math', color: '#3B82F6', icon: 'calculator-outline', count: 0 },
    { name: 'Language',    id: 'nb_lang', color: '#F59E0B', icon: 'language-outline',   count: 0 },
    { name: 'History',     id: 'nb_hist', color: '#EF4444', icon: 'time-outline',       count: 0 },
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadRecent();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const openNewBoard = async () => {
    try {
      await saveCanvas('page_001');
      await useNotebookStore.getState().saveToRecent('page_001');
    } catch(e) {}
    const newId = `page_${generateId()}`;
    router.push({ pathname: '/board', params: { pageId: newId, isNew: 'true' } });
  };

  const createFolder = () => {
    if (!folderName.trim()) return;
    const colors = ['#06B6D4','#8B5CF6','#EC4899','#F97316','#14B8A6'];
    const icons = ['folder-outline','book-outline','library-outline','school-outline','clipboard-outline'];
    const idx = folders.length % colors.length;
    setFolders(p => [...p, { name: folderName.trim(), id: `nb_${generateId()}`, color: colors[idx], icon: icons[idx], count: 0 }]);
    setFolderName('');
    setShowNewFolder(false);
  };

  const QUICK = [
    { icon: 'add-circle',    label: 'New Board',    sub: 'Fresh canvas',  color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', onPress: openNewBoard },
    { icon: 'time-outline',  label: 'Continue',     sub: 'Last board',    color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',  onPress: () => router.push({ pathname: '/board', params: { pageId: 'page_001' } }) },
    { icon: 'document-text', label: 'Import PDF',   sub: 'Annotate',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)', onPress: openNewBoard },
    { icon: 'image-outline', label: 'Import Image', sub: 'Draw over',     color: '#10B981', bg: 'rgba(16,185,129,0.12)', onPress: openNewBoard },
  ];

  const TABS = [
    { id: 'home',      icon: 'home-outline',     label: 'Home' },
    { id: 'notebooks', icon: 'folder-outline',   label: 'Notebooks' },
    { id: 'recent',    icon: 'time-outline',     label: 'Recent' },
    { id: 'settings',  icon: 'settings-outline', label: 'Settings' },
  ];

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.logoRow}>
              <View style={styles.logoPulse} />
              <Text style={styles.logo}>ZYROX</Text>
            </View>
            <Text style={styles.tagline}>Smart Teaching OS</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          {[
            { label: 'Boards',    value: String(recentBoards.length), icon: 'easel-outline',  color: '#60A5FA' },
            { label: 'Notebooks', value: String(folders.length),      icon: 'folder-outline', color: '#06B6D4' },
            { label: 'Today',     value: String(recentBoards.filter(b => Date.now() - b.savedAt < 86400000).length), icon: 'today-outline', color: '#10B981' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={16} color={s.color} />
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Text style={styles.sectionTitle}>QUICK START</Text>
      <View style={styles.quickGrid}>
        {QUICK.map((q, i) => (
          <TouchableOpacity key={i} onPress={q.onPress} activeOpacity={0.75}
            style={[styles.quickCard, { backgroundColor: q.bg, borderColor: q.color + '30' }]}>
            <View style={[styles.quickIcon, { backgroundColor: q.color + '20' }]}>
              <Ionicons name={q.icon as any} size={22} color={q.color} />
            </View>
            <Text style={[styles.quickLabel, { color: q.color }]}>{q.label}</Text>
            <Text style={styles.quickSub}>{q.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>RECENT BOARDS</Text>
        <Text style={styles.sectionCount}>{recentBoards.length}</Text>
      </View>

      {recentBoards.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="easel-outline" size={36} color={TEXT.disabled} />
          <Text style={styles.emptyTitle}>No boards yet</Text>
          <TouchableOpacity onPress={openNewBoard} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Create First Board</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recentBoards.slice(0, 5).map((board, i) => (
          <TouchableOpacity key={board.id} activeOpacity={0.75} style={styles.recentCard}
            onPress={() => router.push({ pathname: '/board', params: { pageId: board.pageId } })}>
            <View style={[styles.recentThumb, { backgroundColor: `hsl(${(i*47)%360},40%,20%)` }]}>
              <Ionicons name="easel" size={16} color={`hsl(${(i*47)%360},70%,65%)`} />
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName} numberOfLines={1}>{board.name}</Text>
              <Text style={styles.recentDate}>{formatDate(board.savedAt)}</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Delete', `Delete "${board.name}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(board.id) },
            ])} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={14} color={TEXT.disabled} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderNotebooks = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>MY NOTEBOOKS</Text>
        <TouchableOpacity onPress={() => setShowNewFolder(true)} style={styles.addBtn}>
          <Ionicons name="add" size={14} color="#60A5FA" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.nbGrid}>
        {folders.map((nb) => (
          <TouchableOpacity key={nb.id} activeOpacity={0.75} style={styles.nbCard}
            onPress={() => openNewBoard()}>
            <View style={[styles.nbIcon, { backgroundColor: nb.color + '20' }]}>
              <Ionicons name={nb.icon as any} size={24} color={nb.color} />
            </View>
            <Text style={styles.nbName} numberOfLines={1}>{nb.name}</Text>
            <Text style={styles.nbCount}>{nb.count} boards</Text>
            <TouchableOpacity style={styles.nbAddBtn} onPress={openNewBoard}>
              <Ionicons name="add-circle-outline" size={18} color={nb.color} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setShowNewFolder(true)} activeOpacity={0.75} style={styles.nbNewCard}>
          <Ionicons name="add-circle-outline" size={28} color="#60A5FA" />
          <Text style={styles.nbNewText}>New Notebook</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderRecent = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>ALL RECENT BOARDS</Text>
      {recentBoards.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="time-outline" size={36} color={TEXT.disabled} />
          <Text style={styles.emptyTitle}>No recent boards</Text>
          <TouchableOpacity onPress={openNewBoard} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Create Board</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recentBoards.map((board, i) => (
          <TouchableOpacity key={board.id} activeOpacity={0.75} style={styles.recentCard}
            onPress={() => router.push({ pathname: '/board', params: { pageId: board.pageId } })}>
            <View style={[styles.recentThumb, { backgroundColor: `hsl(${(i*47)%360},40%,20%)` }]}>
              <Ionicons name="easel" size={16} color={`hsl(${(i*47)%360},70%,65%)`} />
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName} numberOfLines={1}>{board.name}</Text>
              <Text style={styles.recentDate}>{formatDate(board.savedAt)}</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Delete', `Delete "${board.name}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(board.id) },
            ])} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={14} color={TEXT.disabled} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>SETTINGS</Text>
      {[
        { icon: 'settings-outline', label: 'Board Settings', color: '#60A5FA', onPress: () => router.push('/settings') },
        { icon: 'color-palette-outline', label: 'Theme', color: '#8B5CF6', onPress: () => {} },
        { icon: 'cloud-outline', label: 'Cloud Sync', color: '#6B7280', sub: 'Coming soon', onPress: () => {} },
        { icon: 'people-outline', label: 'Online Class', color: '#6B7280', sub: 'Coming soon', onPress: () => {} },
        { icon: 'sparkles-outline', label: 'AI Assistant', color: '#6B7280', sub: 'Coming soon', onPress: () => {} },
      ].map((item) => (
        <TouchableOpacity key={item.label} style={styles.settingRow} onPress={item.onPress}>
          <View style={[styles.settingIcon, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon as any} size={18} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            {item.sub && <Text style={styles.settingSub}>{item.sub}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={16} color={TEXT.disabled} />
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ABOUT</Text>
      <View style={styles.aboutCard}>
        <View style={styles.logoRow}>
          <View style={styles.logoPulse} />
          <Text style={styles.logo}>ZYROX</Text>
        </View>
        <Text style={styles.aboutSub}>Smart Teaching Board OS v1.0</Text>
        <View style={styles.aboutDivider} />
        {[
          { icon: 'person-outline', label: 'Developer', value: 'Rohit', color: '#60A5FA' },
          { icon: 'code-slash-outline', label: 'Built with', value: 'React Native + Expo', color: '#10B981' },
          { icon: 'logo-github', label: 'GitHub', value: 'Rohitcpr/Zyrox', color: TEXT.secondary },
          { icon: 'heart-outline', label: 'Made for', value: 'Teachers ❤️', color: '#EF4444' },
        ].map((row) => (
          <View key={row.label} style={styles.aboutRow}>
            <Ionicons name={row.icon as any} size={14} color={row.color} />
            <Text style={styles.aboutLabel}>{row.label}</Text>
            <Text style={styles.aboutValue}>{row.value}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.glowBlue} />
      <View style={styles.glowCyan} />

      <View style={styles.mainContent}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'notebooks' && renderNotebooks()}
        {activeTab === 'recent' && renderRecent()}
        {activeTab === 'settings' && renderSettings()}
      </View>

      {/* Bottom Navigation Bar — Jio style */}
      <View style={styles.bottomNav}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              style={styles.tabBtn}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrap, isActive && styles.tabIconActive]}>
                <Ionicons
                  name={tab.icon as any}
                  size={22}
                  color={isActive ? '#3B82F6' : TEXT.disabled}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal visible={showNewFolder} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Notebook</Text>
            <TextInput value={folderName} onChangeText={setFolderName}
              placeholder="Notebook name..." placeholderTextColor={TEXT.disabled}
              style={styles.modalInput} autoFocus />
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
  screen: { flex: 1, backgroundColor: '#080808' },
  glowBlue: { position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(59,130,246,0.06)' },
  glowCyan: { position: 'absolute', bottom: 80, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(6,182,212,0.04)' },
  mainContent: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 52 },
  header: { paddingBottom: 20 },
  headerTop: { marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#60A5FA' },
  logo: { fontSize: 26, fontWeight: '900', letterSpacing: 6, color: '#F0F0FF' },
  tagline: { fontSize: 10, color: TEXT.disabled, letterSpacing: 3, marginTop: 4, marginLeft: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', gap: 4, padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 9, color: TEXT.disabled, letterSpacing: 1 },
  sectionTitle: { fontSize: 9, fontWeight: '800', letterSpacing: 3, color: TEXT.disabled, marginTop: 20, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 12 },
  sectionCount: { fontSize: 10, color: TEXT.disabled },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { width: (width-42)/2, padding: 14, borderRadius: 16, borderWidth: 1, gap: 6 },
  quickIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 13, fontWeight: '800' },
  quickSub: { fontSize: 10, color: TEXT.disabled },
  emptyCard: { alignItems: 'center', padding: 32, gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: TEXT.secondary },
  emptyBtn: { marginTop: 6, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(59,130,246,0.20)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(59,130,246,0.40)' },
  emptyBtnText: { color: '#60A5FA', fontWeight: '700', fontSize: 12 },
  recentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 12, marginBottom: 8 },
  recentThumb: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 13, fontWeight: '600', color: TEXT.primary },
  recentDate: { fontSize: 10, color: TEXT.disabled, marginTop: 2 },
  deleteBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  nbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  nbCard: { width: (width-42)/2, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', gap: 6 },
  nbIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nbName: { fontSize: 13, fontWeight: '700', color: TEXT.primary, textAlign: 'center' },
  nbCount: { fontSize: 10, color: TEXT.disabled },
  nbAddBtn: { position: 'absolute', top: 8, right: 8 },
  nbNewCard: { width: (width-42)/2, padding: 16, borderRadius: 16, backgroundColor: 'rgba(59,130,246,0.06)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.20)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nbNewText: { fontSize: 12, color: '#60A5FA', fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(59,130,246,0.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(59,130,246,0.30)' },
  addBtnText: { fontSize: 11, color: '#60A5FA', fontWeight: '700' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 8 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 13, fontWeight: '600', color: TEXT.primary },
  settingSub: { fontSize: 10, color: TEXT.disabled, marginTop: 2 },
  aboutCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(59,130,246,0.20)', padding: 20, gap: 12 },
  aboutSub: { fontSize: 11, color: TEXT.disabled, letterSpacing: 1 },
  aboutDivider: { height: 1, backgroundColor: 'rgba(59,130,246,0.15)' },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aboutLabel: { fontSize: 12, color: TEXT.disabled, flex: 1 },
  aboutValue: { fontSize: 12, fontWeight: '600', color: TEXT.primary },

  // Bottom Navigation — Jio style
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0C0C0C',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabIconWrap: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  tabIconActive: { backgroundColor: 'rgba(59,130,246,0.15)' },
  tabLabel: { fontSize: 10, color: TEXT.disabled, fontWeight: '500' },
  tabLabelActive: { color: '#3B82F6', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { width: '82%', backgroundColor: '#0F0F0F', borderRadius: 20, padding: 24, gap: 16, borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: TEXT.primary },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, color: TEXT.primary, fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  modalCreate: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#1D4ED8', alignItems: 'center' },
});

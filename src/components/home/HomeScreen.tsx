import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, TextInput, Modal,
  Animated, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BRAND, TEXT } from "../../constants/colors";
import { generateId } from "../../utils/strokeUtils";
import { useNotebookStore } from "../../store/useNotebookStore";
import { CrossImportPanel } from "../import/CrossImportPanel";
import { useCanvasStore } from "../../store/useCanvasStore";

const { width } = Dimensions.get("window");

const formatDate = (ts: number): string => {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
};

const COLORS = ["#A855F7","#EF4444","#EAB308","#14B8A6","#EC4899","#6366F1","#22C55E","#3B82F6"];
const ICONS  = ["folder","book","library","school","clipboard","briefcase","flask","calculator"];

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { recentBoards, loadRecent, deleteEntry, notebooks, loadNotebooks, createNotebook, createChapter, deleteNotebook, searchBoards } = useNotebookStore();
  const { saveCanvas } = useCanvasStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [showNewNotebook, setShowNewNotebook] = useState(false);
  const [notebookName, setNotebookName] = useState("");

  const [showNewChapter, setShowNewChapter] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [selectedNotebookId, setSelectedNotebookId] = useState("");

  const [expandedNotebook, setExpandedNotebook] = useState<string | null>(null);
  const [showCrossImport, setShowCrossImport] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRecent();
    loadNotebooks();
    Animated.stagger(150, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(cardsAnim,  { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 0) {
      setIsSearching(true);
      setSearchResults(searchBoards(q));
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const openNewBoard = async () => {
    await saveCanvas("page_001");
    await useNotebookStore.getState().saveToRecent("page_001");
    const newId = "page_" + generateId();
    router.push({ pathname: "/board", params: { pageId: newId, isNew: "true" } });
  };

  const handleCreateNotebook = () => {
    if (!notebookName.trim()) return;
    const idx = notebooks.length % COLORS.length;
    createNotebook(notebookName.trim(), COLORS[idx], ICONS[idx]);
    setNotebookName("");
    setShowNewNotebook(false);
  };

  const handleCreateChapter = () => {
    if (!chapterName.trim() || !selectedNotebookId) return;
    createChapter(selectedNotebookId, chapterName.trim());
    setChapterName("");
    setShowNewChapter(false);
  };

  const QUICK_ACTIONS = [
    { icon: "add-circle",    label: "New Board",    sub: "Fresh canvas",  color: "#7C3AED", bg: "rgba(124,58,237,0.15)", onPress: openNewBoard },
    { icon: "time-outline",  label: "Continue",     sub: "Last board",    color: "#3B82F6", bg: "rgba(59,130,246,0.12)", onPress: () => router.push({ pathname: "/board", params: { pageId: "page_001" } }) },
    { icon: "document-text", label: "Import PDF",   sub: "Annotate",      color: "#EF4444", bg: "rgba(239,68,68,0.12)",  onPress: openNewBoard },
    { icon: "image-outline", label: "Import Image", sub: "Draw over",     color: "#22C55E", bg: "rgba(34,197,94,0.12)",  onPress: openNewBoard },
    { icon: "git-merge-outline", label: "Cross Import", sub: "Move between notebooks", color: "#A855F7", bg: "rgba(168,85,247,0.12)", onPress: () => setShowCrossImport(true) },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-20,0] }) }] }]}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.logoRow}>
                <View style={styles.logoDot} />
                <Text style={styles.logo}>ZYROX</Text>
              </View>
              <Text style={styles.tagline}>Smart Teaching OS</Text>
            </View>
            <TouchableOpacity style={styles.settingsGlass} onPress={() => router.push("/settings")}>
              <Ionicons name="settings-outline" size={18} color={TEXT.secondary} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: "Boards",    value: recentBoards.length.toString(),                                                         icon: "easel-outline" },
              { label: "Notebooks", value: notebooks.length.toString(),                                                            icon: "folder-outline" },
              { label: "Today",     value: recentBoards.filter((b) => Date.now() - b.savedAt < 86400000).length.toString(),        icon: "today-outline" },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon as any} size={14} color={BRAND.primaryLight} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={TEXT.disabled} />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search boards, tags..."
            placeholderTextColor={TEXT.disabled}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setIsSearching(false); }}>
              <Ionicons name="close-circle" size={16} color={TEXT.disabled} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        {isSearching && (
          <View style={styles.searchResults}>
            {searchResults.length === 0 ? (
              <Text style={styles.noResults}>No results found</Text>
            ) : (
              searchResults.map((board, i) => (
                <TouchableOpacity
                  key={board.id}
                  style={styles.recentCard}
                  onPress={() => router.push({ pathname: "/board", params: { pageId: board.pageId } })}
                >
                  <View style={styles.recentLeft}>
                    <View style={[styles.recentThumb, { backgroundColor: "hsl(" + ((i * 47) % 360) + ", 60%, 25%)" }]}>
                      <Ionicons name="easel" size={16} color={"hsl(" + ((i * 47) % 360) + ", 80%, 70%)"} />
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName} numberOfLines={1}>{board.name}</Text>
                      <View style={styles.tagsRow}>
                        {(board.tags ?? []).map((tag: string) => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={TEXT.disabled} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {!isSearching && (
          <>
            {/* Quick Start */}
            <Animated.View style={{ opacity: cardsAnim, transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }] }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>QUICK START</Text>
              </View>
              <View style={styles.quickGrid}>
                {QUICK_ACTIONS.map((action, i) => (
                  <TouchableOpacity key={i} onPress={action.onPress} activeOpacity={0.75}
                    style={[styles.quickCard, { backgroundColor: action.bg, borderColor: action.color + "30" }]}>
                    <View style={[styles.quickIconBox, { backgroundColor: action.color + "25" }]}>
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
                <TouchableOpacity key={board.id} style={styles.recentCard} activeOpacity={0.75}
                  onPress={() => router.push({ pathname: "/board", params: { pageId: board.pageId } })}>
                  <View style={styles.recentLeft}>
                    <View style={[styles.recentThumb, { backgroundColor: "hsl(" + ((i * 47) % 360) + ", 60%, 25%)" }]}>
                      <Ionicons name="easel" size={18} color={"hsl(" + ((i * 47) % 360) + ", 80%, 70%)"} />
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName} numberOfLines={1}>{board.name}</Text>
                      <View style={styles.recentMeta}>
                        <Ionicons name="time-outline" size={10} color={TEXT.disabled} />
                        <Text style={styles.recentDate}>{formatDate(board.savedAt)}</Text>
                      </View>
                      {(board.tags ?? []).length > 0 && (
                        <View style={styles.tagsRow}>
                          {(board.tags ?? []).map((tag: string) => (
                            <View key={tag} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.recentRight}>
                    <TouchableOpacity
                      onPress={() => Alert.alert("Delete", "Delete this board?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deleteEntry(board.id) },
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
              <TouchableOpacity onPress={() => setShowNewNotebook(true)} style={styles.addBtn}>
                <Ionicons name="add" size={16} color={BRAND.primaryLight} />
                <Text style={styles.addBtnText}>New</Text>
              </TouchableOpacity>
            </View>

            {notebooks.map((nb) => (
              <View key={nb.id} style={styles.notebookItem}>
                {/* Notebook header */}
                <TouchableOpacity
                  style={[styles.notebookHeader, { borderColor: nb.color + "40" }]}
                  onPress={() => setExpandedNotebook(expandedNotebook === nb.id ? null : nb.id)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.nbIconBox, { backgroundColor: nb.color + "20" }]}>
                    <Ionicons name="folder" size={18} color={nb.color} />
                  </View>
                  <View style={styles.nbInfo}>
                    <Text style={styles.nbName}>{nb.name}</Text>
                    <Text style={styles.nbCount}>{nb.chapters.length} chapters</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => Alert.alert("Delete", "Delete notebook?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deleteNotebook(nb.id) },
                    ])}
                    style={styles.nbDelete}
                  >
                    <Ionicons name="trash-outline" size={13} color={TEXT.disabled} />
                  </TouchableOpacity>
                  <Ionicons name={expandedNotebook === nb.id ? "chevron-up" : "chevron-down"} size={14} color={TEXT.disabled} />
                </TouchableOpacity>

                {/* Chapters */}
                {expandedNotebook === nb.id && (
                  <View style={styles.chaptersContainer}>
                    {nb.chapters.map((ch) => (
                      <TouchableOpacity key={ch.id} style={styles.chapterItem}
                        onPress={() => router.push({ pathname: "/board", params: { pageId: "page_" + generateId(), isNew: "true" } })}>
                        <Ionicons name="document-text-outline" size={13} color={nb.color} />
                        <Text style={styles.chapterName}>{ch.name}</Text>
                        <Text style={styles.chapterCount}>{ch.boardCount} boards</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.addChapterBtn}
                      onPress={() => { setSelectedNotebookId(nb.id); setShowNewChapter(true); }}
                    >
                      <Ionicons name="add" size={12} color={nb.color} />
                      <Text style={[styles.addChapterText, { color: nb.color }]}>Add Chapter</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.newNbCard} onPress={() => setShowNewNotebook(true)} activeOpacity={0.75}>
              <Ionicons name="add-circle-outline" size={22} color={BRAND.primaryLight} />
              <Text style={styles.newNbText}>New Notebook</Text>
            </TouchableOpacity>

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

            <View style={{ height: 60 }} />
          </>
        )}
      </ScrollView>

      {showCrossImport && <CrossImportPanel onClose={() => setShowCrossImport(false)} />}
      {/* New Notebook Modal */}
      <Modal visible={showNewNotebook} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Notebook</Text>
            <TextInput
              value={notebookName}
              onChangeText={setNotebookName}
              placeholder="Notebook name..."
              placeholderTextColor={TEXT.disabled}
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowNewNotebook(false)} style={styles.modalCancel}>
                <Text style={{ color: TEXT.secondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateNotebook} style={styles.modalCreate}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Chapter Modal */}
      <Modal visible={showNewChapter} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Chapter</Text>
            <TextInput
              value={chapterName}
              onChangeText={setChapterName}
              placeholder="Chapter name..."
              placeholderTextColor={TEXT.disabled}
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowNewChapter(false)} style={styles.modalCancel}>
                <Text style={{ color: TEXT.secondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateChapter} style={styles.modalCreate}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#080810" },
  glowTop: { position: "absolute", top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(124,58,237,0.08)" },
  glowBottom: { position: "absolute", bottom: -100, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: "rgba(59,130,246,0.06)" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18 },
  header: { paddingTop: 56, paddingBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.primaryLight },
  logo: { fontSize: 28, fontWeight: "900", letterSpacing: 6, color: "#F0F0FF" },
  tagline: { fontSize: 11, color: TEXT.disabled, letterSpacing: 3, marginTop: 4, marginLeft: 16 },
  settingsGlass: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(124,58,237,0.20)" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, alignItems: "center", gap: 4, padding: 12, backgroundColor: "rgba(124,58,237,0.08)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(124,58,237,0.15)" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#F0F0FF" },
  statLabel: { fontSize: 9, color: TEXT.disabled, letterSpacing: 1 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(124,58,237,0.20)", marginBottom: 16 },
  searchInput: { flex: 1, color: "#F0F0FF", fontSize: 13 },
  searchResults: { marginBottom: 16 },
  noResults: { textAlign: "center", color: TEXT.disabled, fontSize: 12, padding: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 28, marginBottom: 14 },
  sectionTitle: { fontSize: 9, fontWeight: "800", letterSpacing: 3, color: TEXT.disabled },
  sectionCount: { fontSize: 10, color: TEXT.disabled },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickCard: { width: (width - 48) / 2, padding: 16, borderRadius: 18, borderWidth: 1, gap: 8 },
  quickIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 13, fontWeight: "800" },
  quickSub: { fontSize: 10, color: TEXT.disabled },
  recentCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", padding: 12, marginBottom: 8 },
  recentLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  recentThumb: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 13, fontWeight: "600", color: "#F0F0FF" },
  recentMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  recentDate: { fontSize: 10, color: TEXT.disabled },
  recentRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  recentDelete: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag: { backgroundColor: "rgba(124,58,237,0.25)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 9, color: BRAND.primaryLight, fontWeight: "600" },
  emptyCard: { alignItems: "center", padding: 36, gap: 10, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  emptyTitle: { fontSize: 14, fontWeight: "700", color: TEXT.secondary },
  emptySub: { fontSize: 11, color: TEXT.disabled },
  emptyBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "rgba(124,58,237,0.25)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(124,58,237,0.40)" },
  emptyBtnText: { color: BRAND.primaryLight, fontWeight: "700", fontSize: 12 },
  notebookItem: { marginBottom: 8 },
  notebookHeader: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1, padding: 12 },
  nbIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  nbInfo: { flex: 1 },
  nbName: { fontSize: 13, fontWeight: "700", color: "#F0F0FF" },
  nbCount: { fontSize: 10, color: TEXT.disabled, marginTop: 2 },
  nbDelete: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  chaptersContainer: { marginLeft: 20, marginTop: 4, borderLeftWidth: 1, borderLeftColor: "rgba(124,58,237,0.25)", paddingLeft: 12 },
  chapterItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  chapterName: { flex: 1, fontSize: 12, color: "#F0F0FF", fontWeight: "600" },
  chapterCount: { fontSize: 10, color: TEXT.disabled },
  addChapterBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8 },
  addChapterText: { fontSize: 11, fontWeight: "700" },
  newNbCard: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, backgroundColor: "rgba(124,58,237,0.06)", borderWidth: 1, borderColor: "rgba(124,58,237,0.20)", borderStyle: "dashed", marginTop: 8 },
  newNbText: { fontSize: 12, color: BRAND.primaryLight, fontWeight: "600" },
  mediaCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(34,197,94,0.06)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(34,197,94,0.15)", padding: 14 },
  mediaLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  mediaIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(34,197,94,0.15)", alignItems: "center", justifyContent: "center" },
  mediaTitle: { fontSize: 13, fontWeight: "700", color: "#F0F0FF" },
  mediaSub: { fontSize: 10, color: TEXT.disabled, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center" },
  modalBox: { width: "82%", backgroundColor: "#0F0F1A", borderRadius: 20, padding: 24, gap: 16, borderWidth: 1, borderColor: "rgba(124,58,237,0.25)" },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#F0F0FF" },
  modalInput: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 12, color: "#F0F0FF", fontSize: 14, borderWidth: 1, borderColor: "rgba(124,58,237,0.20)" },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalCancel: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center" },
  modalCreate: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: BRAND.primary, alignItems: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "rgba(124,58,237,0.15)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(124,58,237,0.30)" },
  addBtnText: { fontSize: 11, color: BRAND.primaryLight, fontWeight: "700" },
});

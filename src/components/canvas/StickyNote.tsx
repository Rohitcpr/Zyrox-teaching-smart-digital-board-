import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = ['#FEF08A','#BBF7D0','#BAE6FD','#F9A8D4','#DDD6FE'];

interface Props {
  id: string;
  onRemove: (id: string) => void;
}

export const StickyNote: React.FC<Props> = ({ id, onRemove }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [editing, setEditing] = useState(true);
  const pan = useRef(new Animated.ValueXY({ x: 60, y: 120 })).current;
  const pos = useRef({ x: 60, y: 120 });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => !editing,
    onMoveShouldSetPanResponder: (_, gs) => !editing && (Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3),
    onPanResponderGrant: () => { pan.setOffset({ x: pos.current.x, y: pos.current.y }); pan.setValue({ x: 0, y: 0 }); },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gs) => { pan.flattenOffset(); pos.current = { x: pos.current.x + gs.dx, y: pos.current.y + gs.dy }; },
  })).current;

  return (
    <Animated.View style={[styles.note, { backgroundColor: color, transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} {...panResponder.panHandlers}>
      <View style={styles.header}>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 2 : 0 }]} />
          ))}
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.headerBtn}>
            <Ionicons name={editing ? 'checkmark' : 'pencil'} size={14} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onRemove(id)} style={styles.headerBtn}>
            <Ionicons name="close" size={14} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      {editing ? (
        <TextInput value={text} onChangeText={setText} placeholder="Write note..." placeholderTextColor="#999" style={styles.input} multiline autoFocus />
      ) : (
        <Text style={styles.noteText}>{text || 'Empty note'}</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  note: { position: 'absolute', width: 160, minHeight: 120, borderRadius: 8, padding: 8, zIndex: 20, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  colorRow: { flexDirection: 'row', gap: 4 },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderColor: '#333' },
  headerBtns: { flexDirection: 'row', gap: 4 },
  headerBtn: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.10)', alignItems: 'center', justifyContent: 'center' },
  input: { fontSize: 13, color: '#222', flex: 1 },
  noteText: { fontSize: 13, color: '#222' },
});

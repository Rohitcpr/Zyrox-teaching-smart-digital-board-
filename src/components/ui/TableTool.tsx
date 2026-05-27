import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, TEXT, GLASS } from '../../constants/colors';

interface Props { onClose: () => void; }

export const TableTool: React.FC<Props> = ({ onClose }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [cells, setCells] = useState<string[][]>(
    Array(3).fill(null).map(() => Array(3).fill(''))
  );

  const updateCell = (r: number, c: number, val: string) => {
    const next = cells.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? val : cell));
    setCells(next);
  };

  const addRow = () => { setRows(r => r + 1); setCells(p => [...p, Array(cols).fill('')]); };
  const addCol = () => { setCols(c => c + 1); setCells(p => p.map(r => [...r, ''])); };
  const removeRow = () => { if (rows > 1) { setRows(r => r - 1); setCells(p => p.slice(0, -1)); } };
  const removeCol = () => { if (cols > 1) { setCols(c => c - 1); setCells(p => p.map(r => r.slice(0, -1))); } };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Table</Text>
        <View style={styles.controls}>
          <TouchableOpacity onPress={addRow} style={styles.ctrlBtn}><Text style={styles.ctrlTxt}>+Row</Text></TouchableOpacity>
          <TouchableOpacity onPress={removeRow} style={styles.ctrlBtn}><Text style={styles.ctrlTxt}>-Row</Text></TouchableOpacity>
          <TouchableOpacity onPress={addCol} style={styles.ctrlBtn}><Text style={styles.ctrlTxt}>+Col</Text></TouchableOpacity>
          <TouchableOpacity onPress={removeCol} style={styles.ctrlBtn}><Text style={styles.ctrlTxt}>-Col</Text></TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={[styles.ctrlBtn, { backgroundColor: '#EF444430' }]}>
            <Ionicons name="close" size={13} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {cells.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((cell, ci) => (
                <TextInput key={ci} value={cell} onChangeText={v => updateCell(ri, ci, v)}
                  style={[styles.cell, ri === 0 && styles.headerCell]}
                  placeholder="..." placeholderTextColor={TEXT.disabled} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 60, left: 10, right: 10, zIndex: 200, backgroundColor: 'rgba(10,10,20,0.95)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(124,58,237,0.30)', padding: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 12, fontWeight: '800', color: TEXT.primary, letterSpacing: 1 },
  controls: { flexDirection: 'row', gap: 4 },
  ctrlBtn: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(124,58,237,0.20)' },
  ctrlTxt: { fontSize: 9, color: BRAND.primaryLight, fontWeight: '700' },
  row: { flexDirection: 'row' },
  cell: { width: 80, height: 32, borderWidth: 0.5, borderColor: 'rgba(124,58,237,0.30)', color: TEXT.primary, fontSize: 11, paddingHorizontal: 6, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerCell: { backgroundColor: 'rgba(124,58,237,0.15)', fontWeight: '700' },
});

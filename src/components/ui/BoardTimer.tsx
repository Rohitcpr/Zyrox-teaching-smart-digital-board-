import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, TEXT } from '../../constants/colors';

interface Props { onClose: () => void; }

export const BoardTimer: React.FC<Props> = ({ onClose }) => {
  const [seconds, setSeconds] = useState(300);
  const [isRunning, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
  };
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const isWarning = seconds <= 30;

  return (
    <View style={[styles.box, isWarning && { borderColor: '#EF4444' }]}>
      <Text style={[styles.time, isWarning && { color: '#EF4444' }]}>{mm}:{ss}</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setSeconds(s => s + 60)} style={styles.btn}><Text style={styles.btnTxt}>+1m</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setSeconds(s => s + 300)} style={styles.btn}><Text style={styles.btnTxt}>+5m</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setIsRunning(r => !r)} style={[styles.btn, { backgroundColor: BRAND.primary }]}>
          <Ionicons name={isRunning ? 'pause' : 'play'} size={14} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setIsRunning(false); setSeconds(300); }} style={styles.btn}>
          <Ionicons name="refresh" size={14} color={TEXT.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.btn}>
          <Ionicons name="close" size={14} color={TEXT.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: { position: 'absolute', top: 55, right: 10, backgroundColor: 'rgba(10,10,20,0.92)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(124,58,237,0.40)', padding: 12, zIndex: 200, alignItems: 'center', gap: 8 },
  time: { fontSize: 28, fontWeight: '800', color: '#F0F0FF', letterSpacing: 2 },
  row: { flexDirection: 'row', gap: 6 },
  btn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: TEXT.secondary, fontSize: 11, fontWeight: '700' },
});

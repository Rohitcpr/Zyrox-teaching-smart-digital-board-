import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, TEXT } from '../../constants/colors';

interface Props { onClose: () => void; }

export const BoardTimer: React.FC<Props> = ({ onClose }) => {
  const [seconds, setSeconds] = useState(300);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const isWarning = seconds <= 30 && seconds > 0;
  const isDone = seconds === 0;

  return (
    <View style={[styles.box, isWarning && styles.warning, isDone && styles.done]}>
      <Text style={[styles.time, isWarning && { color: '#EF4444' }, isDone && { color: '#EF4444' }]}>
        {isDone ? 'TIME UP!' : `${mm}:${ss}`}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setSeconds((s) => s + 60)} style={styles.btn}>
          <Text style={styles.btnTxt}>+1m</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSeconds((s) => s + 300)} style={styles.btn}>
          <Text style={styles.btnTxt}>+5m</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRunning((r) => !r)}
          style={[styles.btn, { backgroundColor: running ? '#EF444430' : BRAND.primary + '40' }]}
        >
          <Ionicons name={running ? 'pause' : 'play'} size={16} color={running ? '#EF4444' : BRAND.primaryLight} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setRunning(false); setSeconds(300); }} style={styles.btn}>
          <Ionicons name="refresh" size={16} color={TEXT.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.btn}>
          <Ionicons name="close" size={16} color={TEXT.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    position: 'absolute', top: 60, right: 10,
    backgroundColor: 'rgba(10,10,20,0.95)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.40)',
    padding: 16, zIndex: 200,
    alignItems: 'center', gap: 10,
    minWidth: 200,
  },
  warning: { borderColor: '#EF444460' },
  done: { borderColor: '#EF4444' },
  time: { fontSize: 36, fontWeight: '900', color: '#F0F0FF', letterSpacing: 3 },
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    minWidth: 36,
  },
  btnTxt: { color: TEXT.secondary, fontSize: 11, fontWeight: '700' },
});

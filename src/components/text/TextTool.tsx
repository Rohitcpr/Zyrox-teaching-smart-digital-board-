import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, TEXT, GLASS } from '../../constants/colors';
import { useToolStore } from '../../store/useToolStore';

interface Props {
  x: number;
  y: number;
  onDone: (text: string, x: number, y: number) => void;
  onCancel: () => void;
}

export const TextTool: React.FC<Props> = ({ x, y, onDone, onCancel }) => {
  const [value, setValue] = useState('');
  const color = useToolStore((s) => s.color);
  const size = useToolStore((s) => s.size);
  const inputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity style={styles.backdrop} onPress={onCancel} />
      <View style={[styles.inputBox, { top: y, left: Math.min(x, 160) }]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={setValue}
          style={[styles.input, { color, fontSize: Math.max(size * 4, 16) }]}
          placeholder="Type here..."
          placeholderTextColor={TEXT.disabled}
          multiline
          autoCorrect={false}
        />
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Ionicons name="close" size={20} color={TEXT.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => value.trim() && onDone(value, x, y)} style={styles.doneBtn}>
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 200 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  inputBox: {
    position: 'absolute', minWidth: 200, maxWidth: 300,
    backgroundColor: GLASS.backgroundLight,
    borderRadius: 14, borderWidth: 1, borderColor: BRAND.primary, padding: 12,
  },
  input: { minHeight: 48, maxHeight: 160, fontWeight: '500' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  cancelBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  doneBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: BRAND.primary, alignItems: 'center', justifyContent: 'center' },
});

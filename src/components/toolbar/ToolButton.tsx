import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND, TEXT } from '../../constants/colors';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isActive?: boolean;
  iconColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const ToolButton: React.FC<Props> = ({
  icon, onPress, isActive = false, iconColor, disabled = false, style,
}) => {
  const resolvedColor = disabled ? TEXT.disabled : iconColor ?? (isActive ? BRAND.primaryLight : TEXT.secondary);
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.65} style={[styles.btn, isActive && styles.active, style]}>
      {isActive && <View style={styles.glow} />}
      <Ionicons name={icon} size={21} color={resolvedColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  active: {
    backgroundColor: 'rgba(124,58,237,0.18)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.55)',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 13, backgroundColor: 'rgba(124,58,237,0.10)',
  },
});

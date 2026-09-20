import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';

const VastuGuideCard = ({ guide, onPress, style }) => {
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.sm, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.accent + '12' }]}>
        <Text style={styles.icon}>{guide.icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]}>{guide.name}</Text>
        <View style={styles.directionsRow}>
          <View style={[styles.dirPill, { backgroundColor: colors.success + '12' }]}>
            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
            <Text style={[styles.dirText, { color: colors.success }]}>{guide.preferredDirection}</Text>
          </View>
          <View style={[styles.dirPill, { backgroundColor: colors.info + '12' }]}>
            <Ionicons name="swap-horizontal" size={12} color={colors.info} />
            <Text style={[styles.dirText, { color: colors.info }]}>{guide.alternativeDirection}</Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 26,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  directionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dirPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  dirText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default VastuGuideCard;

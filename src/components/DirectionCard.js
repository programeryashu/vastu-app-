import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import DirectionBadge from './DirectionBadge';

const DirectionCard = ({ direction, onPress, style }) => {
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.sm, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <DirectionBadge
        shortName={direction.shortName}
        color={direction.color}
        size="lg"
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: colors.text }]}>{direction.direction}</Text>
          <Text style={[styles.tradName, { color: colors.textTertiary }]}>{direction.traditionalName}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: colors.info + '12' }]}>
            <Ionicons name="water" size={12} color={colors.info} />
            <Text style={[styles.metaText, { color: colors.info }]}>{direction.element}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: colors.accent + '12' }]}>
            <Ionicons name="star" size={12} color={colors.accent} />
            <Text style={[styles.metaText, { color: colors.accent }]}>{direction.deity}</Text>
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
  content: {
    flex: 1,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
  },
  tradName: {
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DirectionCard;

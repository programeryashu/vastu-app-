import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../styles/theme';

const DirectionBadge = ({ direction, shortName, color, size = 'md', style }) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  const sizes = {
    sm: { badge: 36, text: 12 },
    md: { badge: 44, text: 14 },
    lg: { badge: 56, text: 16 },
  };

  const s = sizes[size] || sizes.md;
  const badgeColor = color || colors.accent;

  return (
    <View
      style={[
        styles.badge,
        {
          width: s.badge,
          height: s.badge,
          borderRadius: s.badge / 2,
          backgroundColor: badgeColor + '18',
        },
        style,
      ]}
    >
      <Text style={[styles.shortName, { color: badgeColor, fontSize: s.text }]}>
        {shortName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortName: {
    fontWeight: '700',
  },
});

export default DirectionBadge;

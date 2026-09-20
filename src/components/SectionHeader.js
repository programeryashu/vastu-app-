import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../styles/theme';

const SectionHeader = ({ title, subtitle, style }) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: 4,
    lineHeight: 20,
  },
});

export default SectionHeader;

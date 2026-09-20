import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';

const InfoCard = ({ icon, iconColor, title, children, style }) => {
  const { colors, borderRadius, shadows } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs, style]}>
      {title && (
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconCircle, { backgroundColor: (iconColor || colors.info) + '15' }]}>
              <Ionicons name={icon} size={18} color={iconColor || colors.info} />
            </View>
          )}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    gap: 4,
  },
});

export default InfoCard;

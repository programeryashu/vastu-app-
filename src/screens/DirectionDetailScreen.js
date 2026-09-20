import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { getDirectionById } from '../data/vastuDirections';
import DirectionBadge from '../components/DirectionBadge';

const DirectionDetailScreen = ({ route }) => {
  const { directionId } = route.params;
  const direction = getDirectionById(directionId);
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();

  if (!direction) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Direction not found</Text>
      </View>
    );
  }

  const renderListItem = (item, index, color) => (
    <View key={index} style={styles.listItem}>
      <View style={[styles.listDot, { backgroundColor: color }]} />
      <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={[styles.hero, { backgroundColor: direction.color + '10', borderRadius: borderRadius.xl }]}>
          <DirectionBadge shortName={direction.shortName} color={direction.color} size="lg" />
          <Text style={[styles.dirName, { color: colors.text }]}>{direction.direction}</Text>
          <Text style={[styles.tradName, { color: colors.textSecondary }]}>{direction.traditionalName}</Text>
          <Text style={[styles.degreeRange, { color: colors.textTertiary }]}>{direction.degreeRange}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: colors.info + '12' }]}>
              <Ionicons name="water" size={14} color={colors.info} />
              <Text style={[styles.metaText, { color: colors.info }]}>{direction.element}</Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: colors.accent + '12' }]}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={[styles.metaText, { color: colors.accent }]}>{direction.deity}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.text }]}>{direction.description}</Text>

        {/* Recommended For */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended For</Text>
          </View>
          {direction.recommendedFor.map((item, i) => renderListItem(item, i, colors.success))}
        </View>

        {/* Traditionally Avoided */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="close-circle" size={18} color={colors.error} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Traditionally Avoided</Text>
          </View>
          {direction.avoid.map((item, i) => renderListItem(item, i, colors.error))}
        </View>

        {/* Tips */}
        <View style={[styles.tipCard, { backgroundColor: colors.accent + '08', borderRadius: borderRadius.lg, borderColor: colors.accent + '20' }]}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={18} color={colors.accent} />
            <Text style={[styles.tipTitle, { color: colors.accent }]}>Traditional Tip</Text>
          </View>
          <Text style={[styles.tipText, { color: colors.text }]}>{direction.details.tip}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    padding: 28,
    gap: 8,
  },
  dirName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tradName: {
    fontSize: 16,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  degreeRange: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  section: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  listText: {
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
  },
  tipCard: {
    padding: 18,
    borderWidth: 1,
    gap: 10,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DirectionDetailScreen;

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { remedies } from '../data/vastuKnowledge/remedies';
import { getSpaceById } from '../data/vastuKnowledge/spaces';
import { getDirectionById } from '../data/vastuKnowledge/directions';

const REMEDY_TYPES = {
  practical: { label: 'Practical', icon: '🔧', color: '#4A7C59' },
  placement: { label: 'Placement', icon: '📍', color: '#4A6FA5' },
  structural: { label: 'Structural', icon: '🏗️', color: '#C9893E' },
  traditional: { label: 'Traditional', icon: '🪷', color: '#9b59b6' },
};

const DIFFICULTY_LEVELS = {
  easy: { label: 'Easy', color: '#4A7C59' },
  moderate: { label: 'Moderate', color: '#C9893E' },
  hard: { label: 'Difficult', color: '#B54A4A' },
};

const RemedyDetailScreen = ({ route, navigation }) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const { remedyId } = route.params;

  const remedy = remedies.find((r) => r.id === remedyId);
  if (!remedy) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Remedy not found
        </Text>
      </View>
    );
  }

  const space = getSpaceById(remedy.spaceId);
  const direction = getDirectionById(remedy.directionId);
  const typeInfo = REMEDY_TYPES[remedy.type] || REMEDY_TYPES.practical;
  const difficultyInfo = DIFFICULTY_LEVELS[remedy.difficulty] || DIFFICULTY_LEVELS.easy;

  // Get related remedies (same space, different direction)
  const relatedRemedies = remedies
    .filter((r) => r.spaceId === remedy.spaceId && r.id !== remedy.id)
    .slice(0, 3);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: typeInfo.color + '10',
            borderRadius: borderRadius.xl,
            borderColor: typeInfo.color + '20',
          },
        ]}
      >
        <View style={styles.heroHeader}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: typeInfo.color + '20' },
            ]}
          >
            <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
            <Text style={[styles.typeLabel, { color: typeInfo.color }]}>
              {typeInfo.label} Remedy
            </Text>
          </View>
        </View>

        <Text style={[styles.heroTitle, { color: colors.text }]}>
          {remedy.title}
        </Text>

        {space && direction && (
          <View style={styles.heroMeta}>
            <View style={[styles.metaPill, { backgroundColor: colors.surface }]}>
              <Text style={styles.metaIcon}>{space.icon}</Text>
              <Text style={[styles.metaText, { color: colors.text }]}>
                {space.name}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
            <View style={[styles.metaPill, { backgroundColor: colors.surface }]}>
              <Text style={[styles.metaText, { color: colors.text }]}>
                {direction.shortName} — {direction.direction}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Description */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            borderColor: colors.border,
          },
          shadows.xs,
        ]}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
        </View>
        <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
          {remedy.description}
        </Text>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              borderColor: colors.border,
            },
            shadows.xs,
          ]}
        >
          <Ionicons name="speedometer" size={20} color={colors.primary} />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Difficulty
          </Text>
          <Text
            style={[styles.detailValue, { color: difficultyInfo.color }]}
          >
            {difficultyInfo.label}
          </Text>
        </View>

        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              borderColor: colors.border,
            },
            shadows.xs,
          ]}
        >
          <Ionicons name="wallet" size={20} color={colors.primary} />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Cost
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {remedy.cost ? remedy.cost.charAt(0).toUpperCase() + remedy.cost.slice(1) : 'Free'}
          </Text>
        </View>

        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              borderColor: colors.border,
            },
            shadows.xs,
          ]}
        >
          <Ionicons
            name={remedy.renovation ? 'hammer' : 'checkmark-circle'}
            size={20}
            color={remedy.renovation ? colors.warning : colors.success}
          />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Renovation
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: remedy.renovation ? colors.warning : colors.success },
            ]}
          >
            {remedy.renovation ? 'Required' : 'Not needed'}
          </Text>
        </View>
      </View>

      {/* Verification Status */}
      <View
        style={[
          styles.verificationCard,
          {
            backgroundColor:
              remedy.verificationStatus === 'verified'
                ? colors.successLight
                : colors.warningLight,
            borderRadius: borderRadius.lg,
          },
        ]}
      >
        <Ionicons
          name={
            remedy.verificationStatus === 'verified'
              ? 'checkmark-circle'
              : 'alert-circle'
          }
          size={18}
          color={
            remedy.verificationStatus === 'verified'
              ? colors.success
              : colors.warning
          }
        />
        <View style={styles.verificationContent}>
          <Text
            style={[
              styles.verificationLabel,
              {
                color:
                  remedy.verificationStatus === 'verified'
                    ? colors.success
                    : colors.warning,
              },
            ]}
          >
            {remedy.verificationStatus === 'verified'
              ? 'Verified Practice'
              : 'Commonly Repeated'}
          </Text>
          {remedy.verificationNote && (
            <Text
              style={[styles.verificationNote, { color: colors.textSecondary }]}
            >
              {remedy.verificationNote}
            </Text>
          )}
        </View>
      </View>

      {/* Related Remedies */}
      {relatedRemedies.length > 0 && (
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              borderColor: colors.border,
            },
            shadows.xs,
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="link" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Related Remedies for {space?.name}
            </Text>
          </View>
          {relatedRemedies.map((related) => {
            const relatedDir = getDirectionById(related.directionId);
            const relatedType = REMEDY_TYPES[related.type] || REMEDY_TYPES.practical;
            return (
              <TouchableOpacity
                key={related.id}
                style={[
                  styles.relatedItem,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() =>
                  navigation.push('RemedyDetail', { remedyId: related.id })
                }
              >
                <Text style={styles.relatedIcon}>{relatedType.icon}</Text>
                <View style={styles.relatedContent}>
                  <Text
                    style={[styles.relatedTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {related.title}
                  </Text>
                  <Text
                    style={[styles.relatedMeta, { color: colors.textSecondary }]}
                  >
                    {relatedDir?.shortName || '—'} • {relatedType.label}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={16} color={colors.textTertiary} />
        <Text style={[styles.disclaimerText, { color: colors.textTertiary }]}>
          This is traditional Vastu guidance. Results may vary. Consult a
          qualified Vastu practitioner for personalized advice.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  typeIcon: {
    fontSize: 14,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  verificationCard: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  verificationContent: {
    flex: 1,
    gap: 4,
  },
  verificationLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  verificationNote: {
    fontSize: 13,
    lineHeight: 18,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  relatedIcon: {
    fontSize: 18,
  },
  relatedContent: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  relatedMeta: {
    fontSize: 12,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
  },
});

export default RemedyDetailScreen;

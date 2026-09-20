import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { getPlacementSummary, getRelatedDirections, getAssessmentColor, getAssessmentLabel, getDirectionById, getSpaceById, getSourceById } from '../data/vastuKnowledge';

const PlacementDetailScreen = ({ route, navigation }) => {
  const { spaceId, directionId } = route.params;
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const summary = getPlacementSummary(spaceId, directionId);

  if (!summary.space || !summary.direction) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.error }}>Data not found</Text>
      </View>
    );
  }

  const { space, direction, rule, practicalRemedies, placementRemedies, structuralRemedies, traditionalRemedies } = summary;
  const assessmentColor = rule ? getAssessmentColor(rule.assessment) : colors.textSecondary;
  const assessmentLabel = rule ? getAssessmentLabel(rule.assessment) : 'No data available';

  const renderRemedy = (remedy, index) => (
    <View key={remedy.id} style={[styles.remedyCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs]}>
      <View style={styles.remedyHeader}>
        <View style={[styles.remedyNumber, { backgroundColor: assessmentColor + '15' }]}>
          <Text style={[styles.remedyNumberText, { color: assessmentColor }]}>{index + 1}</Text>
        </View>
        <View style={styles.remedyMeta}>
          <Text style={[styles.remedyTitle, { color: colors.text }]}>{remedy.title}</Text>
          <View style={styles.remedyTags}>
            <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>{remedy.difficulty}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>{remedy.costLevel}</Text>
            </View>
            {remedy.verificationStatus === 'verified' && (
              <View style={[styles.tag, { backgroundColor: colors.success + '15' }]}>
                <Text style={[styles.tagText, { color: colors.success }]}>Verified</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Text style={[styles.remedyDescription, { color: colors.text }]}>{remedy.description}</Text>
      {remedy.traditionalBasis && (
        <Text style={[styles.remedyBasis, { color: colors.textTertiary }]}>
          Traditional basis: {remedy.traditionalBasis}
        </Text>
      )}
    </View>
  );

  const renderRemedySection = (title, icon, items, color) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        {items.map((r, i) => renderRemedy(r, i))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderColor: colors.border }, shadows.sm]}>
          <View style={styles.headerRow}>
            <Text style={styles.headerIcon}>{space.icon}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.textTertiary} />
            <View style={[styles.dirBadge, { backgroundColor: direction.color + '15' }]}>
              <Text style={[styles.dirBadgeText, { color: direction.color }]}>{direction.shortName}</Text>
            </View>
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{space.name}</Text>
          <Text style={[styles.headerDirection, { color: colors.textSecondary }]}>
            in {direction.direction} ({direction.traditionalName})
          </Text>

          {/* Assessment Badge */}
          <View style={[styles.assessmentBadge, { backgroundColor: assessmentColor + '15' }]}>
            <Ionicons name={rule?.assessment === 'preferred' ? 'checkmark-circle' : rule?.assessment === 'discouraged' ? 'close-circle' : 'alert-circle'} size={18} color={assessmentColor} />
            <Text style={[styles.assessmentText, { color: assessmentColor }]}>{assessmentLabel}</Text>
          </View>
        </View>

        {/* Explanation */}
        {rule && (
          <View style={[styles.explanationCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs]}>
            <Text style={[styles.explanationLabel, { color: colors.textTertiary }]}>TRADITIONAL GUIDANCE</Text>
            <Text style={[styles.explanationText, { color: colors.text }]}>{rule.explanation}</Text>
          </View>
        )}

        {/* Alternatives */}
        {rule?.alternativeDirections?.length > 0 && (
          <View style={[styles.alternativesCard, { backgroundColor: colors.info + '08', borderRadius: borderRadius.lg, borderColor: colors.info + '20' }]}>
            <Text style={[styles.alternativesLabel, { color: colors.info }]}>Alternative Directions</Text>
            <View style={styles.alternativesRow}>
              {rule.alternativeDirections.map(altId => {
                const altDir = getDirectionById(altId);
                return altDir ? (
                  <View key={altId} style={[styles.altPill, { backgroundColor: colors.info + '15' }]}>
                    <Text style={[styles.altPillText, { color: colors.info }]}>{altDir.shortName} {altDir.direction}</Text>
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}

        {/* Remedies */}
        {renderRemedySection('Practical Improvements', 'hammer', practicalRemedies, colors.success)}
        {renderRemedySection('Placement Adjustments', 'move', placementRemedies, colors.info)}
        {renderRemedySection('Structural Options', 'construction', structuralRemedies, colors.warning)}
        {renderRemedySection('Traditional Practices', 'leaf', traditionalRemedies, colors.accent)}

        {/* Sources & Notes (Research Mode) */}
        {rule?.sourceNotes && (
          <View style={[styles.sourcesCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border, borderWidth: 1 }, shadows.xs]}>
            <View style={styles.sourcesHeader}>
              <Ionicons name="book" size={16} color={colors.accent} />
              <Text style={[styles.sourcesTitle, { color: colors.text }]}>Sources & Notes</Text>
            </View>
            <Text style={[styles.sourcesText, { color: colors.textSecondary }]}>{rule.sourceNotes}</Text>
            {rule.verificationStatus && (
              <View style={[styles.verificationBadge, { backgroundColor: rule.verificationStatus === 'verified' ? colors.success + '15' : colors.warning + '15' }]}>                <Ionicons name={rule.verificationStatus === 'verified' ? 'checkmark-circle' : 'alert-circle'} size={14} color={rule.verificationStatus === 'verified' ? colors.success : colors.warning} />                <Text style={[styles.verificationText, { color: rule.verificationStatus === 'verified' ? colors.success : colors.warning }]}>                  {rule.verificationStatus === 'verified' ? 'Commonly agreed across traditions' : 'Traditional guidance may vary'}                </Text>              </View>
            )}
          </View>
        )}

        {/* Related Directions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>All Assessments for {space.name}</Text>
          {getRelatedDirections(spaceId).map(item => (
            <TouchableOpacity
              key={item.direction.id}
              style={[styles.relatedRow, { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderColor: colors.border }, shadows.xs]}
              onPress={() => navigation.push('PlacementDetail', { spaceId, directionId: item.direction.id })}
            >
              <View style={[styles.relatedBadge, { backgroundColor: item.direction.color + '15' }]}>
                <Text style={[styles.relatedBadgeText, { color: item.direction.color }]}>{item.direction.shortName}</Text>
              </View>
              <Text style={[styles.relatedName, { color: colors.text }]}>{item.direction.direction}</Text>
              <View style={[styles.relatedAssessment, { backgroundColor: getAssessmentColor(item.assessment) + '15' }]}>
                <Text style={[styles.relatedAssessmentText, { color: getAssessmentColor(item.assessment) }]}>
                  {item.assessment.replace('_', ' ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },
  header: { padding: 24, borderWidth: 1, alignItems: 'center', gap: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  headerIcon: { fontSize: 32 },
  dirBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  dirBadgeText: { fontSize: 16, fontWeight: '800' },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  headerDirection: { fontSize: 15, fontWeight: '400' },
  assessmentBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 8 },
  assessmentText: { fontSize: 14, fontWeight: '700' },
  explanationCard: { padding: 18, borderWidth: 1, gap: 8 },
  explanationLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  explanationText: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  alternativesCard: { padding: 16, borderWidth: 1, gap: 10 },
  alternativesLabel: { fontSize: 14, fontWeight: '700' },
  alternativesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  altPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  altPillText: { fontSize: 13, fontWeight: '600' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  remedyCard: { padding: 16, borderWidth: 1, gap: 10 },
  remedyHeader: { flexDirection: 'row', gap: 12 },
  remedyNumber: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  remedyNumberText: { fontSize: 13, fontWeight: '800' },
  remedyMeta: { flex: 1, gap: 6 },
  remedyTitle: { fontSize: 15, fontWeight: '700' },
  remedyTags: { flexDirection: 'row', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  remedyDescription: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  remedyBasis: { fontSize: 12, fontWeight: '400', fontStyle: 'italic', lineHeight: 18 },
  relatedRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, gap: 10 },
  relatedBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  relatedBadgeText: { fontSize: 13, fontWeight: '800' },
  relatedName: { flex: 1, fontSize: 15, fontWeight: '600' },
  relatedAssessment: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  relatedAssessmentText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  sourcesCard: { padding: 16, gap: 10 },
  sourcesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sourcesTitle: { fontSize: 15, fontWeight: '700' },
  sourcesText: { fontSize: 13, fontWeight: '400', lineHeight: 18, fontStyle: 'italic' },
  verificationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  verificationText: { fontSize: 11, fontWeight: '600' },
});

export default PlacementDetailScreen;

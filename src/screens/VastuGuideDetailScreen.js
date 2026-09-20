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

const VastuGuideDetailScreen = ({ route, navigation }) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const { guideId, entry } = route.params || {};

  // Support both old format (guideId) and new database format (entry object)
  const data = entry || null;

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 16 }}>Entry not found</Text>
      </View>
    );
  }

  const directions = data.directions ? (typeof data.directions === 'string' ? JSON.parse(data.directions) : data.directions) : [];

  const getConfidenceColor = (conf) => {
    if (conf === 'HIGH') return colors.success;
    if (conf === 'MEDIUM') return colors.warning;
    return colors.error;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category & Confidence Header */}
        <View style={styles.headerRow}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.accent + '15' }]}>
            <Text style={[styles.categoryText, { color: colors.accent }]}>{data.category}</Text>
          </View>
          {data.confidence && (
            <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(data.confidence) + '15' }]}>
              <Text style={[styles.confidenceText, { color: getConfidenceColor(data.confidence) }]}>
                {data.confidence} Confidence
              </Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{data.issue_topic}</Text>

        {/* Subcategory */}
        {data.subcategory && (
          <Text style={[styles.subcategory, { color: colors.textSecondary }]}>{data.subcategory}</Text>
        )}

        {/* Directions */}
        {directions.length > 0 && (
          <View style={styles.directionsRow}>
            {directions.map((dir, idx) => (
              <View key={idx} style={[styles.directionPill, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="compass-outline" size={12} color={colors.info} />
                <Text style={[styles.directionText, { color: colors.info }]}>{dir}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        {data.description && (
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border, borderWidth: 1 }, shadows.xs]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={18} color={colors.text} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            </View>
            <Text style={[styles.sectionText, { color: colors.text }]}>{data.description}</Text>
          </View>
        )}

        {/* Recommendation */}
        {data.recommendation && (
          <View style={[styles.sectionCard, { backgroundColor: colors.success + '05', borderRadius: borderRadius.lg, borderColor: colors.success + '20', borderWidth: 1 }, shadows.xs]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[styles.sectionTitle, { color: colors.success }]}>Recommendation</Text>
            </View>
            <Text style={[styles.sectionText, { color: colors.text }]}>{data.recommendation}</Text>
          </View>
        )}

        {/* Expected Effect */}
        {data.expected_effect && (
          <View style={[styles.sectionCard, { backgroundColor: colors.warning + '05', borderRadius: borderRadius.lg, borderColor: colors.warning + '20', borderWidth: 1 }, shadows.xs]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={18} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.warning }]}>Expected Effect</Text>
            </View>
            <Text style={[styles.sectionText, { color: colors.text }]}>{data.expected_effect}</Text>
          </View>
        )}

        {/* Remedy */}
        {data.remedy && (
          <View style={[styles.sectionCard, { backgroundColor: colors.error + '05', borderRadius: borderRadius.lg, borderColor: colors.error + '20', borderWidth: 1 }, shadows.xs]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={18} color={colors.error} />
              <Text style={[styles.sectionTitle, { color: colors.error }]}>Remedy</Text>
            </View>
            <Text style={[styles.sectionText, { color: colors.text }]}>{data.remedy}</Text>
          </View>
        )}

        {/* Mantra / Spiritual Practice */}
        {data.mantra_spiritual_practice && (
          <View style={[styles.sectionCard, { backgroundColor: colors.accent + '05', borderRadius: borderRadius.lg, borderColor: colors.accent + '20', borderWidth: 1 }, shadows.xs]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flower" size={18} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>Mantra / Spiritual Practice</Text>
            </View>
            <Text style={[styles.sectionText, { color: colors.text }]}>{data.mantra_spiritual_practice}</Text>
          </View>
        )}

        {/* Source Text */}
        {data.source_text && (
          <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border, borderWidth: 1 }, shadows.xs]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book" size={18} color={colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Source Text (Sanskrit/Hindi)</Text>
            </View>
            <Text style={[styles.sourceText, { color: colors.text }]}>{data.source_text}</Text>
          </View>
        )}

        {/* Source Info */}
        <View style={[styles.sourceInfo, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={styles.sourceRow}>
            <Ionicons name="library" size={14} color={colors.textSecondary} />
            <Text style={[styles.sourceText2, { color: colors.textSecondary }]}>{data.source_book}</Text>
          </View>
          {data.chapter && (
            <View style={styles.sourceRow}>
              <Ionicons name="bookmark" size={14} color={colors.textSecondary} />
              <Text style={[styles.sourceText2, { color: colors.textSecondary }]}>{data.chapter}</Text>
            </View>
          )}
          {data.section && (
            <View style={styles.sourceRow}>
              <Ionicons name="folder" size={14} color={colors.textSecondary} />
              <Text style={[styles.sourceText2, { color: colors.textSecondary }]}>{data.section}</Text>
            </View>
          )}
          <View style={styles.sourceRow}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            <Text style={[styles.sourceText2, { color: colors.success }]}>{data.verification_status}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },
  headerRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  categoryBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  categoryText: { fontSize: 12, fontWeight: '700' },
  confidenceBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  confidenceText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, lineHeight: 30 },
  subcategory: { fontSize: 14, fontWeight: '500', marginTop: -8 },
  directionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  directionPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  directionText: { fontSize: 13, fontWeight: '600' },
  sectionCard: { padding: 18, gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionText: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  sourceText: { fontSize: 14, fontWeight: '400', lineHeight: 20, fontStyle: 'italic', color: '#666' },
  sourceInfo: { padding: 14, gap: 8 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sourceText2: { fontSize: 13, fontWeight: '500' },
});

export default VastuGuideDetailScreen;
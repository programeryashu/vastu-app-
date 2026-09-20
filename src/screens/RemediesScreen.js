import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { remedies, searchRemedies } from '../data/vastuKnowledge/remedies';
import { getSpaceById } from '../data/vastuKnowledge/spaces';
import { getDirectionById } from '../data/vastuKnowledge/directions';

const REMEDY_TYPES = [
  { key: 'practical', label: 'Practical', icon: '🔧', color: '#4A7C59' },
  { key: 'placement', label: 'Placement', icon: '📍', color: '#4A6FA5' },
  { key: 'structural', label: 'Structural', icon: '🏗️', color: '#C9893E' },
  { key: 'traditional', label: 'Traditional', icon: '🪷', color: '#9b59b6' },
];

const RemediesScreen = ({ navigation }) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredRemedies = useMemo(() => {
    let result = searchQuery ? searchRemedies(searchQuery) : remedies;
    if (selectedType !== 'all') {
      result = result.filter((r) => r.type === selectedType);
    }
    return result.sort((a, b) => {
      if (a.spaceId !== b.spaceId) return a.spaceId.localeCompare(b.spaceId);
      return a.priority - b.priority;
    });
  }, [searchQuery, selectedType]);

  const groupedRemedies = useMemo(() => {
    const groups = {};
    filteredRemedies.forEach((remedy) => {
      if (!groups[remedy.spaceId]) {
        groups[remedy.spaceId] = [];
      }
      groups[remedy.spaceId].push(remedy);
    });
    return groups;
  }, [filteredRemedies]);

  const getTypeColor = (type) => {
    const found = REMEDY_TYPES.find((t) => t.key === type);
    return found ? found.color : colors.textSecondary;
  };

  const getTypeIcon = (type) => {
    const found = REMEDY_TYPES.find((t) => t.key === type);
    return found ? found.icon : '📋';
  };

  const renderRemedyCard = (remedy) => {
    const space = getSpaceById(remedy.spaceId);
    const direction = getDirectionById(remedy.directionId);

    return (
      <TouchableOpacity
        key={remedy.id}
        style={[
          styles.remedyCard,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            borderColor: colors.border,
          },
          shadows.xs,
        ]}
        onPress={() =>
          navigation.navigate('RemedyDetail', {
            remedyId: remedy.id,
            spaceId: remedy.spaceId,
            directionId: remedy.directionId,
          })
        }
        activeOpacity={0.7}
      >
        <View style={styles.remedyHeader}>
          <View
            style={[
              styles.remedyTypeBadge,
              { backgroundColor: getTypeColor(remedy.type) + '15' },
            ]}
          >
            <Text style={styles.remedyTypeIcon}>{getTypeIcon(remedy.type)}</Text>
            <Text
              style={[styles.remedyTypeLabel, { color: getTypeColor(remedy.type) }]}
            >
              {remedy.type.charAt(0).toUpperCase() + remedy.type.slice(1)}
            </Text>
          </View>
          <View style={styles.remedyPriority}>
            {[...Array(remedy.priority)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.priorityDot,
                  { backgroundColor: getTypeColor(remedy.type) },
                ]}
              />
            ))}
          </View>
        </View>

        <Text style={[styles.remedyTitle, { color: colors.text }]} numberOfLines={2}>
          {remedy.title}
        </Text>

        {space && direction && (
          <View style={styles.remedyMeta}>
            <View style={[styles.metaPill, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={styles.metaIcon}>{space.icon}</Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {space.name}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={12} color={colors.textTertiary} />
            <View style={[styles.metaPill, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {direction.shortName}
              </Text>
            </View>
          </View>
        )}

        <Text
          style={[styles.remedyDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {remedy.description}
        </Text>

        <View style={styles.remedyFooter}>
          <View style={styles.remedyTags}>
            {remedy.difficulty && (
              <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                  {remedy.difficulty}
                </Text>
              </View>
            )}
            {remedy.cost && (
              <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                  {remedy.cost}
                </Text>
              </View>
            )}
            {remedy.renovation && (
              <View style={[styles.tag, { backgroundColor: colors.warningLight }]}>
                <Text style={[styles.tagText, { color: colors.warning }]}>
                  Renovation
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search remedies..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeFilter}
      >
        <TouchableOpacity
          style={[
            styles.typeChip,
            {
              backgroundColor:
                selectedType === 'all' ? colors.primary : colors.surface,
              borderColor: selectedType === 'all' ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setSelectedType('all')}
        >
          <Text
            style={[
              styles.typeChipText,
              { color: selectedType === 'all' ? '#FFF' : colors.text },
            ]}
          >
            All ({remedies.length})
          </Text>
        </TouchableOpacity>
        {REMEDY_TYPES.map((type) => {
          const count = remedies.filter((r) => r.type === type.key).length;
          return (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeChip,
                {
                  backgroundColor:
                    selectedType === type.key ? type.color + '15' : colors.surface,
                  borderColor:
                    selectedType === type.key ? type.color : colors.border,
                },
              ]}
              onPress={() => setSelectedType(type.key)}
            >
              <Text style={styles.typeChipIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.typeChipText,
                  {
                    color: selectedType === type.key ? type.color : colors.text,
                  },
                ]}
              >
                {type.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredRemedies.length} remedies found
        </Text>
      </View>

      {/* Remedies List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(groupedRemedies).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No remedies found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          Object.entries(groupedRemedies).map(([spaceId, items]) => {
            const space = getSpaceById(spaceId);
            return (
              <View key={spaceId} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>{space?.icon || '📋'}</Text>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {space?.name || spaceId}
                  </Text>
                  <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>
                    {items.length}
                  </Text>
                </View>
                {items.map((remedy) => renderRemedyCard(remedy))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
  },
  typeFilter: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  typeChipIcon: {
    fontSize: 14,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  remedyCard: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  remedyTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  remedyTypeIcon: {
    fontSize: 12,
  },
  remedyTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remedyPriority: {
    flexDirection: 'row',
    gap: 3,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  remedyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  remedyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  remedyDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  remedyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remedyTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RemediesScreen;

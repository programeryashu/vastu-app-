/**
 * VastuEntriesScreen
 * 
 * Browse and search all Vastu entries from the database.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { searchEntries, getCategories, getStats } from '../services/database';

const VastuEntriesScreen = ({ navigation }) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else if (selectedCategory) {
      filterByCategory(selectedCategory);
    } else {
      loadAllEntries();
    }
  }, [searchQuery, selectedCategory]);

  const loadData = async () => {
    try {
      const [cats, statsData] = await Promise.all([
        getCategories(),
        getStats(),
      ]);
      setCategories(cats);
      setStats(statsData);
      await loadAllEntries();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllEntries = async () => {
    const results = await searchEntries('');
    setEntries(results.slice(0, 50)); // Limit to 50 for performance
  };

  const performSearch = async () => {
    const results = await searchEntries(searchQuery);
    setEntries(results);
  };

  const filterByCategory = async (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      await loadAllEntries();
    } else {
      setSelectedCategory(category);
      const results = await searchEntries(category);
      setEntries(results);
    }
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Vastu Principles': colors.success,
      'Vastu Defects / Problems': colors.error,
      'Directions and Their Significance': colors.info,
      'Room Placement Recommendations': colors.warning,
      'Mantras / Prayers / Rituals': colors.accent,
      'Remedies / Corrective Actions': colors.error,
      'Spiritual Practice / Ritual': colors.accent,
    };
    return colorMap[category] || colors.textSecondary;
  };

  const renderEntry = ({ item }) => (
    <TouchableOpacity
      style={[styles.entryCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs]}
      onPress={() => navigation.navigate('VastuGuideDetail', { entry: item, guideId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.entryHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
            {item.category}
          </Text>
        </View>
        {item.confidence && (
          <View style={[styles.confidenceBadge, { backgroundColor: item.confidence === 'HIGH' ? colors.success + '15' : colors.warning + '15' }]}>
            <Text style={[styles.confidenceText, { color: item.confidence === 'HIGH' ? colors.success : colors.warning }]}>
              {item.confidence}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.entryTitle, { color: colors.text }]} numberOfLines={2}>
        {item.issue_topic}
      </Text>
      
      {item.description && (
        <Text style={[styles.entryDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      {item.directions && (
        <View style={styles.directionsRow}>
          {JSON.parse(item.directions).slice(0, 3).map((dir, idx) => (
            <View key={idx} style={[styles.directionBadge, { backgroundColor: colors.accent + '15' }]}>
              <Text style={[styles.directionText, { color: colors.accent }]}>{dir}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.entryFooter}>
        {item.remedy && (
          <View style={styles.footerItem}>
            <Ionicons name="medical" size={12} color={colors.success} />
            <Text style={[styles.footerText, { color: colors.success }]}>Has Remedy</Text>
          </View>
        )}
        {item.mantra_spiritual_practice && (
          <View style={styles.footerItem}>
            <Ionicons name="flower" size={12} color={colors.accent} />
            <Text style={[styles.footerText, { color: colors.accent }]}>Has Mantra</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading database...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search Vastu knowledge..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {stats.total} entries • {stats.withRemedies} remedies • {stats.withMantras} mantras
          </Text>
        </View>
      )}

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.category}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              { 
                backgroundColor: selectedCategory === item.category ? getCategoryColor(item.category) : colors.surface,
                borderColor: selectedCategory === item.category ? getCategoryColor(item.category) : colors.border,
              }
            ]}
            onPress={() => filterByCategory(item.category)}
          >
            <Text style={[
              styles.categoryChipText,
              { color: selectedCategory === item.category ? '#FFF' : colors.text }
            ]}>
              {item.category} ({item.count})
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Entries List */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={renderEntry}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? 'No entries found' : 'No entries available'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  entryCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  entryDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  directionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  directionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  directionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  entryFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
});

export default VastuEntriesScreen;
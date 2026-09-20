import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '../styles/theme';
import { vastuDirections } from '../data/vastuDirections';
import SearchBar from '../components/SearchBar';
import DirectionCard from '../components/DirectionCard';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';

const DirectionGuideScreen = ({ navigation }) => {
  const { colors, spacing } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDirections = useMemo(() => {
    if (!searchQuery.trim()) return vastuDirections;
    const query = searchQuery.toLowerCase();
    return vastuDirections.filter(
      (dir) =>
        dir.direction.toLowerCase().includes(query) ||
        dir.shortName.toLowerCase().includes(query) ||
        dir.traditionalName.toLowerCase().includes(query) ||
        dir.element.toLowerCase().includes(query) ||
        dir.deity.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Explore Directions"
          subtitle="Traditional Vastu guidance for each direction"
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, element, deity..."
          style={{ marginBottom: 16 }}
        />

        {searchQuery.length > 0 && (
          <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
            {filteredDirections.length} direction{filteredDirections.length !== 1 ? 's' : ''} found
          </Text>
        )}

        {filteredDirections.length > 0 ? (
          filteredDirections.map((dir) => (
            <DirectionCard
              key={dir.id}
              direction={dir}
              onPress={() => navigation.navigate('DirectionDetail', { directionId: dir.id })}
            />
          ))
        ) : (
          <EmptyState
            icon="compass-outline"
            title="No directions found"
            message="Try a different search term"
          />
        )}
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
    paddingBottom: 32,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
});

export default DirectionGuideScreen;

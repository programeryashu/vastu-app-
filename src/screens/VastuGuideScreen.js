import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '../styles/theme';
import { vastuGuideData } from '../data/vastuGuide';
import SearchBar from '../components/SearchBar';
import VastuGuideCard from '../components/VastuGuideCard';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';

const VastuGuideScreen = ({ navigation }) => {
  const { colors, spacing } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return vastuGuideData;
    const query = searchQuery.toLowerCase();
    return vastuGuideData.filter(
      (guide) =>
        guide.name.toLowerCase().includes(query) ||
        guide.preferredDirection.toLowerCase().includes(query) ||
        guide.alternativeDirection.toLowerCase().includes(query) ||
        guide.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="What Should Go Where?"
          subtitle="Traditional Vastu guidance for room and object placement"
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search rooms or directions..."
          style={{ marginBottom: 16 }}
        />

        {searchQuery.length > 0 && (
          <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
            {filteredGuides.length} item{filteredGuides.length !== 1 ? 's' : ''} found
          </Text>
        )}

        {filteredGuides.length > 0 ? (
          filteredGuides.map((guide) => (
            <VastuGuideCard
              key={guide.id}
              guide={guide}
              onPress={() => navigation.navigate('VastuGuideDetail', { guideId: guide.id })}
            />
          ))
        ) : (
          <EmptyState
            icon="home-outline"
            title="No items found"
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

export default VastuGuideScreen;

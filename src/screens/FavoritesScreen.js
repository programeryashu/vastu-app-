import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import EmptyState from '../components/EmptyState';

const FavoritesScreen = ({ navigation }) => {
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('vastu_favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch (e) {}
  };

  const removeFavorite = async (id) => {
    Alert.alert('Remove Favorite', 'Remove this item from your favorites?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = favorites.filter((f) => f.id !== id);
          setFavorites(updated);
          await AsyncStorage.setItem('vastu_favorites', JSON.stringify(updated));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {favorites.length > 0 ? (
          favorites.map((fav) => (
            <TouchableOpacity
              key={fav.id}
              style={[styles.favCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs]}
              onPress={() => {
                if (fav.type === 'direction') {
                  navigation.navigate('Directions', { screen: 'DirectionDetail', params: { directionId: fav.id } });
                } else {
                  navigation.navigate('VastuGuide', { screen: 'VastuGuideDetail', params: { guideId: fav.id } });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.favIcon, { backgroundColor: colors.accent + '12' }]}>
                <Ionicons name={fav.type === 'direction' ? 'compass' : 'home'} size={20} color={colors.accent} />
              </View>
              <View style={styles.favContent}>
                <Text style={[styles.favName, { color: colors.text }]}>{fav.name}</Text>
                <Text style={[styles.favType, { color: colors.textSecondary }]}>{fav.type === 'direction' ? 'Direction' : 'Guide'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeFavorite(fav.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="heart" size={20} color={colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            message="Save directions and guides you find useful"
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
    gap: 10,
  },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  favIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favContent: {
    flex: 1,
  },
  favName: {
    fontSize: 16,
    fontWeight: '600',
  },
  favType: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
});

export default FavoritesScreen;

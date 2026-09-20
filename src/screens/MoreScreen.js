import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';

const MoreScreen = ({ navigation }) => {
  const { colors, spacing, borderRadius, typography, shadows, isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [darkMode, setDarkMode] = useState(isDark);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('vastu_favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch (e) {}
  };

  const menuSections = [
    {
      title: 'Saved',
      items: [
        {
          id: 'favorites',
          icon: 'heart',
          label: 'Favorites',
          subtitle: `${favorites.length} saved items`,
          screen: 'Favorites',
        },
      ],
    },
    {
      title: 'Learn',
      items: [
        {
          id: 'about',
          icon: 'book',
          label: 'About Vastu',
          subtitle: 'Understanding traditional principles',
          screen: 'About',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          id: 'settings',
          icon: 'settings',
          label: 'Settings',
          subtitle: 'Theme, compass, language',
          screen: 'Settings',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {menuSections.map((section, sIndex) => (
          <View key={sIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title.toUpperCase()}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs]}>
              {section.items.map((item, iIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    iIndex < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                  ]}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.6}
                >
                  <View style={[styles.menuIcon, { backgroundColor: colors.accent + '12' }]}>
                    <Ionicons name={item.icon} size={20} color={colors.accent} />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
});

export default MoreScreen;

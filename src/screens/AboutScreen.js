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

const AboutScreen = () => {
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.accent + '08', borderRadius: borderRadius.xl, borderColor: colors.accent + '15' }]}>
          <Text style={styles.heroIcon}>🧭</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Vastu Compass</Text>
          <Text style={[styles.heroVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        </View>

        {/* About */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs]}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={20} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>About Vastu Shastra</Text>
          </View>
          <Text style={[styles.cardText, { color: colors.text }]}>
            Vastu Shastra is an ancient Indian system of architecture and design that integrates nature with the built environment. It provides traditional guidance on the orientation and layout of spaces to promote harmony and positive energy.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={[styles.card, { backgroundColor: colors.warning + '08', borderRadius: borderRadius.lg, borderColor: colors.warning + '20' }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color={colors.warning} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Important Note</Text>
          </View>
          <Text style={[styles.cardText, { color: colors.text }]}>
            This app provides educational information based on traditional Vastu principles. The recommendations presented here are based on traditional beliefs and practices and should not be interpreted as scientifically guaranteed advice.
          </Text>
        </View>

        {/* Elements */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }, shadows.xs]}>
          <View style={styles.cardHeader}>
            <Ionicons name="compass" size={20} color={colors.info} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>The Five Elements</Text>
          </View>
          <View style={styles.elementsGrid}>
            {[
              { name: 'Earth', icon: '🌍', color: colors.primary },
              { name: 'Water', icon: '💧', color: colors.info },
              { name: 'Fire', icon: '🔥', color: colors.error },
              { name: 'Air', icon: '💨', color: colors.success },
              { name: 'Space', icon: '✨', color: colors.accent },
            ].map((el) => (
              <View key={el.name} style={[styles.elementItem, { backgroundColor: el.color + '10' }]}>
                <Text style={styles.elementIcon}>{el.icon}</Text>
                <Text style={[styles.elementName, { color: colors.text }]}>{el.name}</Text>
              </View>
            ))}
          </View>
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
    padding: 32,
    borderWidth: 1,
    gap: 8,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroVersion: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  elementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  elementItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  elementIcon: {
    fontSize: 24,
  },
  elementName: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AboutScreen;

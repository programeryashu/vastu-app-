import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { getStats } from '../services/database';

const DAILY_TIPS = [
  'Traditional Vastu principles commonly associate the North-East with quiet and spiritual activities.',
  'According to traditional Vastu guidance, the South-East is often recommended for kitchens due to its fire element association.',
  'The North direction is traditionally believed to attract prosperity and new opportunities.',
  'Keeping the center of the home open and clutter-free is commonly recommended in Vastu traditions.',
  'Morning sunlight from the East is traditionally considered beneficial for health and vitality.',
  'The South-West corner is often recommended for the master bedroom in traditional Vastu guidance.',
  'According to traditional principles, the main entrance ideally faces East or North for positive energy flow.',
];

const HomeScreen = ({ navigation }) => {
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();
  const [dailyTip, setDailyTip] = useState('');
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() / 86400000) % DAILY_TIPS.length);
    setDailyTip(DAILY_TIPS[dayOfYear]);
    loadDbStats();
  }, []);

  const loadDbStats = async () => {
    try {
      const stats = await getStats();
      setDbStats(stats);
    } catch (error) {
      console.error('Error loading DB stats:', error);
    }
  };

  // 2-column grid of quick actions
  const quickActions = [
    { id: 'compass', icon: 'compass', label: 'Compass', sub: 'Find direction', screen: 'Compass', color: '#4A6FA5' },
    { id: 'explore', icon: 'map', label: 'Explore', sub: 'Directions & Guide', screen: 'Explore', color: '#C9A96E' },
    { id: 'remedies', icon: 'medical', label: 'Remedies', sub: 'Solutions & fixes', screen: 'Remedies', color: '#4A7C59' },
    { id: 'database', icon: 'book', label: 'Database', sub: '53 entries', screen: 'Explore', param: 'VastuEntries', color: '#7A6F63' },
  ];

  const stats = [
    { label: 'Directions', value: '8', color: '#4A6FA5' },
    { label: 'Entries', value: dbStats?.total || '53', color: '#C9A96E' },
    { label: 'Remedies', value: dbStats?.withRemedies || '9', color: '#4A7C59' },
    { label: 'Mantras', value: dbStats?.withMantras || '3', color: '#9b59b6' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Namaste 🙏</Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Vastu Compass</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileIcon, { backgroundColor: colors.accent + '15' }]}
            onPress={() => navigation.navigate('More')}
          >
            <Ionicons name="person" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* ── Compass CTA Card ── */}
        <TouchableOpacity
          style={[styles.compassCard, { backgroundColor: colors.primary, borderRadius: borderRadius.xl }]}
          onPress={() => navigation.navigate('Compass')}
          activeOpacity={0.85}
        >
          <View style={styles.compassCardContent}>
            <View style={styles.compassCardLeft}>
              <Text style={styles.compassCardLabel}>Live Compass</Text>
              <Text style={styles.compassCardSub}>Find your current direction</Text>
            </View>
            <View style={styles.compassCardIcon}>
              <Ionicons name="compass" size={36} color="#FFF" />
            </View>
          </View>
          <View style={styles.compassCardArrow}>
            <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.5)" />
          </View>
        </TouchableOpacity>

        {/* ── Quick Actions Grid (2×2) ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
        <View style={styles.grid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.gridCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }, shadows.xs]}
              onPress={() => {
                if (action.param) {
                  navigation.navigate(action.screen, { screen: action.param });
                } else {
                  navigation.navigate(action.screen);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.gridCardIcon, { backgroundColor: action.color + '12' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={[styles.gridCardLabel, { color: colors.text }]}>{action.label}</Text>
              <Text style={[styles.gridCardSub, { color: colors.textSecondary }]}>{action.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Daily Tip ── */}
        <View style={[styles.tipCard, { backgroundColor: colors.accent + '08', borderRadius: borderRadius.lg, borderColor: colors.accent + '18' }]}>
          <View style={styles.tipHeader}>
            <View style={[styles.tipIcon, { backgroundColor: colors.accent + '18' }]}>
              <Ionicons name="bulb" size={16} color={colors.accent} />
            </View>
            <Text style={[styles.tipTitle, { color: colors.accent }]}>Daily Insight</Text>
          </View>
          <Text style={[styles.tipText, { color: colors.text }]}>{dailyTip}</Text>
        </View>

        {/* ── Stats Row ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Knowledge Base</Text>
        <View style={styles.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: borderRadius.md }, shadows.xs]}>
              <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
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
  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Compass CTA ──
  compassCard: {
    padding: 20,
    marginBottom: 28,
  },
  compassCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compassCardLeft: {
    flex: 1,
  },
  compassCardLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  compassCardSub: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.65)',
  },
  compassCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassCardArrow: {
    position: 'absolute',
    right: 20,
    bottom: 16,
  },
  // ── Section Title ──
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  // ── Grid ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: '47%',
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#F0EBE5',
  },
  gridCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridCardLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  gridCardSub: {
    fontSize: 12,
    fontWeight: '400',
  },
  // ── Tip ──
  tipCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#F0EBE5',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});

export default HomeScreen;
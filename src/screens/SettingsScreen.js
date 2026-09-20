import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';

const SettingsScreen = () => {
  const { colors, spacing, borderRadius, typography, shadows, isDark } = useTheme();
  const [darkMode, setDarkMode] = useState(isDark);

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          icon: 'moon',
          label: 'Dark Mode',
          subtitle: 'Follow system or manual',
          type: 'toggle',
          value: darkMode,
          onToggle: (val) => {
            setDarkMode(val);
            Alert.alert('Theme', 'Theme changes will apply on next app launch.');
          },
        },
      ],
    },
    {
      title: 'Compass',
      items: [
        {
          id: 'calibration',
          icon: 'compass',
          label: 'Compass Calibration',
          subtitle: 'Improve accuracy',
          type: 'info',
          onPress: () => {
            Alert.alert(
              'Calibration Tip',
              'Move your phone in a figure-eight motion if direction readings appear inaccurate. This helps recalibrate the magnetometer sensor.'
            );
          },
        },
        {
          id: 'sensorInfo',
          icon: 'hardware-chip',
          label: 'Sensor Information',
          subtitle: 'Check device compatibility',
          type: 'info',
          onPress: () => {
            Alert.alert(
              'Sensor Info',
              'This app uses the device magnetometer sensor for compass functionality. If your device does not have a magnetometer, simulation mode will be used.'
            );
          },
        },
      ],
    },
    {
      title: 'Language',
      items: [
        {
          id: 'language',
          icon: 'language',
          label: 'Language',
          subtitle: 'English (default)',
          type: 'info',
          onPress: () => {
            Alert.alert('Coming Soon', 'Hindi language support will be available in a future update.');
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'version',
          icon: 'information-circle',
          label: 'Version',
          subtitle: '1.0.0',
          type: 'info',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sIndex) => (
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
                  onPress={item.onPress}
                  activeOpacity={item.type === 'toggle' ? 1 : 0.6}
                >
                  <View style={[styles.menuIcon, { backgroundColor: colors.accent + '12' }]}>
                    <Ionicons name={item.icon} size={20} color={colors.accent} />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.accent + '60' }}
                      thumbColor={item.value ? colors.accent : colors.textSecondary}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                  )}
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

export default SettingsScreen;

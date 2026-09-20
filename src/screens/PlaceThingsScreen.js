import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { spaces } from '../data/vastuKnowledge/spaces';
import { getDirectionById } from '../data/vastuKnowledge/directions';

const DIRECTION_POSITIONS = {
  'North-East': { x: 0.75, y: 0.15, label: 'NE' },
  'North': { x: 0.5, y: 0.05, label: 'N' },
  'North-West': { x: 0.25, y: 0.15, label: 'NW' },
  'East': { x: 0.9, y: 0.5, label: 'E' },
  'West': { x: 0.1, y: 0.5, label: 'W' },
  'South-East': { x: 0.75, y: 0.85, label: 'SE' },
  'South': { x: 0.5, y: 0.95, label: 'S' },
  'South-West': { x: 0.25, y: 0.85, label: 'SW' },
};

const PlaceThingsScreen = ({ navigation }) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState(null);

  const handleSpaceSelect = (space) => {
    setSelectedSpace(space);
    setSelectedDirection(null);
  };

  const handleDirectionSelect = (direction) => {
    setSelectedDirection(direction);
  };

  const getSpaceStatus = (space, directionId) => {
    if (space.preferredDirection === directionId) return 'preferred';
    if (space.alternativeDirection === directionId) return 'alternative';
    if (space.lessPreferred?.includes(directionId)) return 'lessPreferred';
    if (space.discouraged?.includes(directionId)) return 'discouraged';
    return 'neutral';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preferred': return '#4A7C59';
      case 'alternative': return '#4A6FA5';
      case 'lessPreferred': return '#C9893E';
      case 'discouraged': return '#B54A4A';
      default: return colors.textTertiary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'preferred': return 'Preferred';
      case 'alternative': return 'Alternative';
      case 'lessPreferred': return 'Less Preferred';
      case 'discouraged': return 'Discouraged';
      default: return 'Neutral';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Where Should Things Go?
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Tap a room to see where it's traditionally placed
        </Text>
      </View>

      {/* Space Selection */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Select a Room or Object
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.spaceList}
      >
        {spaces.map((space) => (
          <TouchableOpacity
            key={space.id}
            style={[
              styles.spaceChip,
              {
                backgroundColor:
                  selectedSpace?.id === space.id
                    ? colors.primary
                    : colors.surface,
                borderColor:
                  selectedSpace?.id === space.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handleSpaceSelect(space)}
          >
            <Text style={styles.spaceChipIcon}>{space.icon}</Text>
            <Text
              style={[
                styles.spaceChipLabel,
                {
                  color:
                    selectedSpace?.id === space.id ? '#FFF' : colors.text,
                },
              ]}
            >
              {space.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* House Map */}
      {selectedSpace && (
        <View style={styles.mapSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tap a Direction on the Map
          </Text>

          {/* Compass Map */}
          <View
            style={[
              styles.houseMap,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.xl,
                borderColor: colors.border,
              },
              shadows.md,
            ]}
          >
            {/* Direction Labels */}
            {Object.entries(DIRECTION_POSITIONS).map(([dir, pos]) => {
              const dirData = getDirectionById(dir.toLowerCase().replace('-', ''));
              const status = getSpaceStatus(selectedSpace, dir);
              const statusColor = getStatusColor(status);
              const isSelected = selectedDirection?.id === dirData?.id;

              return (
                <TouchableOpacity
                  key={dir}
                  style={[
                    styles.directionNode,
                    {
                      left: `${pos.x * 100}%`,
                      top: `${pos.y * 100}%`,
                      backgroundColor: isSelected ? statusColor : statusColor + '20',
                      borderColor: isSelected ? statusColor : statusColor + '40',
                      transform: [{ translateX: -22 }, { translateY: -22 }],
                    },
                  ]}
                  onPress={() => dirData && handleDirectionSelect(dirData)}
                >
                  <Text
                    style={[
                      styles.directionLabel,
                      { color: isSelected ? '#FFF' : statusColor },
                    ]}
                  >
                    {pos.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Center Label */}
            <View style={styles.centerLabel}>
              <Text style={[styles.centerText, { color: colors.textSecondary }]}>
                {selectedSpace.icon}
              </Text>
              <Text style={[styles.centerSpaceName, { color: colors.text }]}>
                {selectedSpace.name}
              </Text>
            </View>

            {/* Compass Rose */}
            <View style={[styles.compassRose, { borderColor: colors.border }]}>
              <Text style={[styles.compassN, { color: colors.primary }]}>N</Text>
              <Text style={[styles.compassS, { color: colors.textTertiary }]}>S</Text>
              <Text style={[styles.compassE, { color: colors.textTertiary }]}>E</Text>
              <Text style={[styles.compassW, { color: colors.textTertiary }]}>W</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4A7C59' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Preferred
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4A6FA5' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Alternative
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#C9893E' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Less Preferred
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#B54A4A' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Discouraged
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Direction Details */}
      {selectedSpace && selectedDirection && (
        <View style={styles.detailsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedSpace.icon} {selectedSpace.name} in {selectedDirection.direction}
          </Text>

          {/* Status Card */}
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor:
                  getStatusColor(getSpaceStatus(selectedSpace, selectedDirection.id)) + '10',
                borderRadius: borderRadius.lg,
                borderColor:
                  getStatusColor(getSpaceStatus(selectedSpace, selectedDirection.id)) + '30',
              },
            ]}
          >
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      getStatusColor(getSpaceStatus(selectedSpace, selectedDirection.id)) + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusLabel,
                    {
                      color: getStatusColor(
                        getSpaceStatus(selectedSpace, selectedDirection.id)
                      ),
                    },
                  ]}
                >
                  {getStatusLabel(getSpaceStatus(selectedSpace, selectedDirection.id))}
                </Text>
              </View>
            </View>

            <Text style={[styles.statusDescription, { color: colors.text }]}>
              {selectedSpace.detailedExplanation}
            </Text>

            {selectedSpace.variesByTradition && (
              <View style={styles.variationNote}>
                <Ionicons name="information-circle" size={16} color={colors.info} />
                <Text style={[styles.variationText, { color: colors.info }]}>
                  {selectedSpace.variesByTradition}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  borderColor: colors.border,
                },
                shadows.xs,
              ]}
              onPress={() =>
                navigation.navigate('VastuGuideDetail', {
                  spaceId: selectedSpace.id,
                })
              }
            >
              <Ionicons name="book" size={20} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Full Guide
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  borderColor: colors.border,
                },
                shadows.xs,
              ]}
              onPress={() =>
                navigation.navigate('PlacementDetail', {
                  spaceId: selectedSpace.id,
                  directionId: selectedDirection.id,
                })
              }
            >
              <Ionicons name="medkit" size={20} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Remedies
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* All Spaces Summary */}
      {!selectedSpace && (
        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Reference
          </Text>
          {spaces.map((space) => (
            <TouchableOpacity
              key={space.id}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  borderColor: colors.border,
                },
                shadows.xs,
              ]}
              onPress={() => handleSpaceSelect(space)}
            >
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>{space.icon}</Text>
              </View>
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryName, { color: colors.text }]}>
                  {space.name}
                </Text>
                <View style={styles.summaryDirections}>
                  <View
                    style={[
                      styles.directionPill,
                      { backgroundColor: '#4A7C59' + '15' },
                    ]}
                  >
                    <Text style={[styles.directionPillText, { color: '#4A7C59' }]}>
                      {space.preferredDirection}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.directionPill,
                      { backgroundColor: '#4A6FA5' + '15' },
                    ]}
                  >
                    <Text style={[styles.directionPillText, { color: '#4A6FA5' }]}>
                      {space.alternativeDirection}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  spaceList: {
    paddingBottom: 20,
    gap: 8,
  },
  spaceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  spaceChipIcon: {
    fontSize: 16,
  },
  spaceChipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  mapSection: {
    marginBottom: 24,
  },
  houseMap: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  directionNode: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  directionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerLabel: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -40 }, { translateY: -30 }],
    alignItems: 'center',
    width: 80,
    zIndex: 1,
  },
  centerText: {
    fontSize: 28,
    marginBottom: 4,
  },
  centerSpaceName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  compassRose: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassN: {
    position: 'absolute',
    top: 2,
    fontSize: 10,
    fontWeight: '700',
  },
  compassS: {
    position: 'absolute',
    bottom: 2,
    fontSize: 10,
    fontWeight: '500',
  },
  compassE: {
    position: 'absolute',
    right: 4,
    fontSize: 10,
    fontWeight: '500',
  },
  compassW: {
    position: 'absolute',
    left: 4,
    fontSize: 10,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: 24,
  },
  statusCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  variationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    borderRadius: 8,
  },
  variationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryIconText: {
    fontSize: 22,
  },
  summaryContent: {
    flex: 1,
  },
  summaryName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryDirections: {
    flexDirection: 'row',
    gap: 6,
  },
  directionPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  directionPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default PlaceThingsScreen;

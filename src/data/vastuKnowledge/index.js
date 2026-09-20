// ============================================================
// VASTU COMPASS — Knowledge Database Index
// Central export for all Vastu knowledge data
// ============================================================

export * from './directions';
export * from './spaces';
export * from './placementRules';
export * from './remedies';

import { vastuDirections, getDirectionById, getDirectionByRange, searchDirections } from './directions';
import { spaces, getSpaceById, searchSpaces } from './spaces';
import { placementRules, getRule, getRulesBySpace, getAssessmentColor, getAssessmentLabel, getAssessmentIcon } from './placementRules';
import { remedies, getRemediesBySpace, getRemediesBySpaceAndDirection, getNonRenovationRemedies, searchRemedies } from './remedies';

// ── Unified Search ──
export const searchAll = (query) => {
  if (!query || query.trim().length === 0) return [];

  const results = [];
  const q = query.toLowerCase().trim();

  // Search directions
  const dirResults = searchDirections(q);
  dirResults.forEach(d => {
    results.push({
      type: 'direction',
      id: d.id,
      title: d.direction,
      subtitle: `${d.traditionalName} • ${d.element}`,
      icon: d.icon,
      color: d.color,
      data: d,
    });
  });

  // Search spaces
  const spaceResults = searchSpaces(q);
  spaceResults.forEach(s => {
    results.push({
      type: 'space',
      id: s.id,
      title: s.name,
      subtitle: s.category,
      icon: s.icon,
      color: null,
      data: s,
    });
  });

  // Search placements
  placementRules.forEach(rule => {
    const space = getSpaceById(rule.spaceId);
    const dir = getDirectionById(rule.directionId);
    if (space && dir) {
      const searchText = `${space.name} ${dir.direction} ${rule.explanation} ${rule.assessment}`.toLowerCase();
      if (searchText.includes(q)) {
        results.push({
          type: 'placement',
          id: rule.id,
          title: `${space.name} → ${dir.direction}`,
          subtitle: getAssessmentLabel(rule.assessment),
          icon: space.icon,
          color: dir.color,
          data: { rule, space, direction: dir },
        });
      }
    }
  });

  // Search remedies
  const remedyResults = searchRemedies(q);
  remedyResults.forEach(r => {
    const space = getSpaceById(r.spaceId);
    const dir = getDirectionById(r.directionId);
    results.push({
      type: 'remedy',
      id: r.id,
      title: r.title,
      subtitle: `${space?.name || ''} • ${dir?.direction || ''}`,
      icon: space?.icon || '🔧',
      color: null,
      data: { remedy: r, space, direction: dir },
    });
  });

  return results;
};

// ── Get Placement Summary ──
export const getPlacementSummary = (spaceId, directionId) => {
  const space = getSpaceById(spaceId);
  const direction = getDirectionById(directionId);
  const rule = getRule(spaceId, directionId);
  const spaceRemedies = getRemediesBySpaceAndDirection(spaceId, directionId);

  return {
    space,
    direction,
    rule,
    remedies: spaceRemedies,
    practicalRemedies: spaceRemedies.filter(r => r.type === 'practical'),
    placementRemedies: spaceRemedies.filter(r => r.type === 'placement'),
    structuralRemedies: spaceRemedies.filter(r => r.type === 'structural'),
    traditionalRemedies: spaceRemedies.filter(r => r.type === 'traditional'),
  };
};

// ── Get Related Items ──
export const getRelatedDirections = (spaceId) => {
  const rules = placementRules.filter(r => r.spaceId === spaceId);
  return rules.map(rule => {
    const direction = getDirectionById(rule.directionId);
    return {
      direction,
      assessment: rule.assessment,
      explanation: rule.explanation,
    };
  });
};

// ── Statistics ──
export const getDatabaseStats = () => {
  return {
    directions: vastuDirections.length,
    spaces: spaces.length,
    placementRules: placementRules.length,
    remedies: remedies.length,
    verifiedItems: [
      ...vastuDirections.filter(d => d.verificationStatus === 'verified'),
      ...spaces.filter(s => s.verificationStatus === 'verified'),
      ...remedies.filter(r => r.verificationStatus === 'verified'),
    ].length,
    needsReview: [
      ...vastuDirections.filter(d => d.verificationStatus === 'needs_review'),
      ...spaces.filter(s => s.verificationStatus === 'needs_review'),
      ...remedies.filter(r => r.verificationStatus === 'needs_review'),
    ].length,
    disputed: [
      ...remedies.filter(r => r.verificationStatus === 'disputed'),
    ].length,
  };
};

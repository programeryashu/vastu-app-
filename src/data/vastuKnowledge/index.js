// ============================================================
// VASTU COMPASS — Knowledge Database Index
// Central export for all Vastu knowledge data
// ============================================================

export * from './directions';
export * from './spaces';
export * from './placementRules';
export * from './remedies';

import { getDirectionById } from './directions';
import { getSpaceById } from './spaces';
import { placementRules, getRule, getAssessmentColor, getAssessmentLabel } from './placementRules';
import { getRemediesBySpaceAndDirection } from './remedies';

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

// ============================================================
// VASTU COMPASS — Placement Rules System
// Space × Direction relationships with assessments
// ============================================================

export const placementRules = [
  // ── MAIN ENTRANCE ──
  { id: 'rule-entrance-east', spaceId: 'entrance', directionId: 'east', assessment: 'preferred', explanation: 'East-facing main entrance is traditionally considered the most auspicious, associated with health, vitality, and positive energy flow from morning sunlight.', alternativeDirections: ['north'], sourceNotes: 'Consistently recommended across classical texts and modern practitioners.' },
  { id: 'rule-entrance-north', spaceId: 'entrance', directionId: 'north', assessment: 'preferred', explanation: 'North-facing entrance is traditionally considered favorable for financial prosperity and opportunities. Associated with Kubera, the deity of wealth.', alternativeDirections: ['east'], sourceNotes: 'Widely recommended in Vastu traditions for prosperity.' },
  { id: 'rule-entrance-ne', spaceId: 'entrance', directionId: 'northeast', assessment: 'acceptable', explanation: 'North-East entrance is considered acceptable by some traditions. This direction is sacred, so the entrance should be kept clean and peaceful.', alternativeDirections: ['east', 'north'], sourceNotes: 'Acceptable in some traditions, may vary.' },
  { id: 'rule-entrance-west', spaceId: 'entrance', directionId: 'west', assessment: 'less_preferred', explanation: 'West-facing entrance is traditionally less preferred but not strongly discouraged. Good lighting and ventilation are recommended.', alternativeDirections: ['east', 'north'], sourceNotes: 'Less preferred but acceptable with proper maintenance.' },
  { id: 'rule-entrance-south', spaceId: 'entrance', directionId: 'south', assessment: 'discouraged', explanation: 'South-facing main entrance is traditionally discouraged across most Vastu traditions as it may affect prosperity and positive energy flow.', alternativeDirections: ['east', 'north'], sourceNotes: 'Commonly discouraged, though remedies exist.' },
  { id: 'rule-entrance-southwest', spaceId: 'entrance', directionId: 'southwest', assessment: 'discouraged', explanation: 'South-West facing main entrance is strongly discouraged across almost all Vastu traditions. This direction is associated with heaviness and stability, not suitable for entrances.', alternativeDirections: ['east', 'north'], sourceNotes: 'Strongly discouraged in most traditions.' },
  { id: 'rule-entrance-se', spaceId: 'entrance', directionId: 'southeast', assessment: 'less_preferred', explanation: 'South-East entrance is traditionally less preferred due to fire element association. May cause heated energy at the entrance.', alternativeDirections: ['east', 'north'], sourceNotes: 'Less preferred, varies between traditions.' },
  { id: 'rule-entrance-nw', spaceId: 'entrance', directionId: 'northwest', assessment: 'acceptable', explanation: 'North-West entrance is considered acceptable. Associated with movement and guests, suitable for homes with frequent visitors.', alternativeDirections: ['east', 'north'], sourceNotes: 'Generally acceptable for guest-friendly homes.' },

  // ── KITCHEN ──
  { id: 'rule-kitchen-se', spaceId: 'kitchen', directionId: 'southeast', assessment: 'preferred', explanation: 'South-East kitchen is traditionally considered most auspicious due to the fire element association with Agni. This is the most universally recommended direction for kitchens.', alternativeDirections: ['northwest'], sourceNotes: 'Strongly recommended across all traditions.' },
  { id: 'rule-kitchen-nw', spaceId: 'kitchen', directionId: 'northwest', assessment: 'acceptable', explanation: 'North-West kitchen is traditionally considered acceptable. The air element helps dissipate cooking smoke and odors effectively.', alternativeDirections: ['southeast'], sourceNotes: 'Widely accepted as an alternative.' },
  { id: 'rule-kitchen-e', spaceId: 'kitchen', directionId: 'east', assessment: 'less_preferred', explanation: 'East kitchen is traditionally less preferred. Some traditions allow it with proper remedies and facing East while cooking.', alternativeDirections: ['southeast', 'northwest'], sourceNotes: 'Less preferred, varies between traditions.' },
  { id: 'rule-kitchen-s', spaceId: 'kitchen', directionId: 'south', assessment: 'less_preferred', explanation: 'South kitchen is traditionally less preferred. May cause ventilation challenges and fire element conflicts.', alternativeDirections: ['southeast', 'northwest'], sourceNotes: 'Less preferred, requires proper ventilation.' },
  { id: 'rule-kitchen-w', spaceId: 'kitchen', directionId: 'west', assessment: 'less_preferred', explanation: 'West kitchen is traditionally less preferred. Afternoon heat may affect cooking comfort. Good lighting needed.', alternativeDirections: ['southeast', 'northwest'], sourceNotes: 'Less preferred, manageable with proper setup.' },
  { id: 'rule-kitchen-n', spaceId: 'kitchen', directionId: 'north', assessment: 'discouraged', explanation: 'North kitchen is traditionally discouraged as it may affect prosperity. The water element of North conflicts with the fire element of cooking.', alternativeDirections: ['southeast', 'northwest'], sourceNotes: 'Commonly discouraged across traditions.' },
  { id: 'rule-kitchen-ne', spaceId: 'kitchen', directionId: 'northeast', assessment: 'discouraged', explanation: 'North-East kitchen is traditionally strongly discouraged across almost all Vastu traditions. The fire element of cooking conflicts with the sacred water element of this direction.', alternativeDirections: ['southeast', 'northwest'], sourceNotes: 'Strongly discouraged in most traditions.' },
  { id: 'rule-kitchen-sw', spaceId: 'kitchen', directionId: 'southwest', assessment: 'discouraged', explanation: 'South-West kitchen is traditionally discouraged. The earth element of this direction may affect health and nutrition according to some traditions.', alternativeDirections: ['southeast', 'northwest'], sourceNotes: 'Commonly discouraged, varies between traditions.' },

  // ── BEDROOM ──
  { id: 'rule-bedroom-sw', spaceId: 'bedroom', directionId: 'southwest', assessment: 'preferred', explanation: 'South-West bedroom is traditionally considered ideal for rest and stable relationships. The earth element provides grounding energy for sleep.', alternativeDirections: ['south'], sourceNotes: 'Widely recommended for master bedrooms.' },
  { id: 'rule-bedroom-s', spaceId: 'bedroom', directionId: 'south', assessment: 'acceptable', explanation: 'South bedroom is traditionally considered acceptable. Some traditions recommend sleeping with head pointing South for restful sleep.', alternativeDirections: ['southwest'], sourceNotes: 'Generally acceptable across traditions.' },
  { id: 'rule-bedroom-n', spaceId: 'bedroom', directionId: 'north', assessment: 'less_preferred', explanation: 'North bedroom is traditionally less preferred. May receive less natural light and warmth. Some traditions allow it with proper remedies.', alternativeDirections: ['southwest', 'south'], sourceNotes: 'Less preferred, varies between traditions.' },
  { id: 'rule-bedroom-e', spaceId: 'bedroom', directionId: 'east', assessment: 'less_preferred', explanation: 'East bedroom is traditionally less preferred. Early morning sunlight may disturb sleep. Some traditions allow it for children.', alternativeDirections: ['southwest', 'south'], sourceNotes: 'Less preferred, acceptable for some occupants.' },
  { id: 'rule-bedroom-w', spaceId: 'bedroom', directionId: 'west', assessment: 'less_preferred', explanation: 'West bedroom is traditionally less preferred. Afternoon heat may affect comfort. Good ventilation recommended.', alternativeDirections: ['southwest', 'south'], sourceNotes: 'Less preferred, manageable with proper setup.' },
  { id: 'rule-bedroom-ne', spaceId: 'bedroom', directionId: 'northeast', assessment: 'discouraged', explanation: 'North-East bedroom is traditionally discouraged as this direction is considered sacred for spiritual activities. May cause restlessness.', alternativeDirections: ['southwest', 'south'], sourceNotes: 'Commonly discouraged across traditions.' },
  { id: 'rule-bedroom-se', spaceId: 'bedroom', directionId: 'southeast', assessment: 'discouraged', explanation: 'South-East bedroom is traditionally discouraged. The fire element may cause restlessness and affect sleep quality.', alternativeDirections: ['southwest', 'south'], sourceNotes: 'Commonly discouraged, varies between traditions.' },
  { id: 'rule-bedroom-nw', spaceId: 'bedroom', directionId: 'northwest', assessment: 'less_preferred', explanation: 'North-West bedroom is traditionally less preferred. The air element may cause instability. Some traditions allow it for guests.', alternativeDirections: ['southwest', 'south'], sourceNotes: 'Less preferred, acceptable for guest rooms.' },

  // ── POOJA ROOM ──
  { id: 'rule-pooja-ne', spaceId: 'pooja', directionId: 'northeast', assessment: 'preferred', explanation: 'North-East Pooja room is traditionally considered most sacred due to the divine energy association. This is the most universally recommended direction.', alternativeDirections: ['east'], sourceNotes: 'Universally recommended across all traditions.' },
  { id: 'rule-pooja-e', spaceId: 'pooja', directionId: 'east', assessment: 'acceptable', explanation: 'East Pooja room is traditionally considered acceptable. The Sun deity association supports spiritual practices.', alternativeDirections: ['northeast'], sourceNotes: 'Widely accepted as an alternative.' },
  { id: 'rule-pooja-n', spaceId: 'pooja', directionId: 'north', assessment: 'acceptable', explanation: 'North Pooja room is considered acceptable by some traditions. The prosperity association may support spiritual growth.', alternativeDirections: ['northeast', 'east'], sourceNotes: 'Acceptable in some traditions.' },
  { id: 'rule-pooja-w', spaceId: 'pooja', directionId: 'west', assessment: 'less_preferred', explanation: 'West Pooja room is traditionally less preferred. Some traditions allow it with specific arrangements.', alternativeDirections: ['northeast', 'east'], sourceNotes: 'Less preferred, varies between traditions.' },
  { id: 'rule-pooja-se', spaceId: 'pooja', directionId: 'southeast', assessment: 'discouraged', explanation: 'South-East Pooja room is traditionally discouraged. The fire element conflicts with the sacred nature of prayer spaces.', alternativeDirections: ['northeast', 'east'], sourceNotes: 'Commonly discouraged across traditions.' },
  { id: 'rule-pooja-sw', spaceId: 'pooja', directionId: 'southwest', assessment: 'discouraged', explanation: 'South-West Pooja room is traditionally discouraged. The earth element may block spiritual energy according to some traditions.', alternativeDirections: ['northeast', 'east'], sourceNotes: 'Commonly discouraged, varies between traditions.' },
  { id: 'rule-pooja-s', spaceId: 'pooja', directionId: 'south', assessment: 'discouraged', explanation: 'South Pooja room is traditionally discouraged. Some traditions consider it inauspicious for prayer spaces.', alternativeDirections: ['northeast', 'east'], sourceNotes: 'Commonly discouraged.' },
  { id: 'rule-pooja-nw', spaceId: 'pooja', directionId: 'northwest', assessment: 'less_preferred', explanation: 'North-West Pooja room is traditionally less preferred. The air element may disturb the peaceful atmosphere needed.', alternativeDirections: ['northeast', 'east'], sourceNotes: 'Less preferred, varies between traditions.' },

  // ── BATHROOM ──
  { id: 'rule-bathroom-nw', spaceId: 'bathroom', directionId: 'northwest', assessment: 'preferred', explanation: 'North-West bathroom is traditionally considered most suitable. The air element helps dissipate moisture and negative energy effectively.', alternativeDirections: ['west'], sourceNotes: 'Consistently recommended across traditions.' },
  { id: 'rule-bathroom-w', spaceId: 'bathroom', directionId: 'west', assessment: 'acceptable', explanation: 'West bathroom is traditionally considered acceptable. Good ventilation helps manage moisture in this direction.', alternativeDirections: ['northwest'], sourceNotes: 'Generally acceptable across traditions.' },
  { id: 'rule-bathroom-s', spaceId: 'bathroom', directionId: 'south', assessment: 'less_preferred', explanation: 'South bathroom is traditionally less preferred. May have ventilation challenges. Some traditions allow it with proper exhaust.', alternativeDirections: ['northwest', 'west'], sourceNotes: 'Less preferred, manageable with proper ventilation.' },
  { id: 'rule-bathroom-e', spaceId: 'bathroom', directionId: 'east', assessment: 'less_preferred', explanation: 'East bathroom is traditionally less preferred. May affect the positive energy associated with this direction.', alternativeDirections: ['northwest', 'west'], sourceNotes: 'Less preferred, varies between traditions.' },
  { id: 'rule-bathroom-n', spaceId: 'bathroom', directionId: 'north', assessment: 'less_preferred', explanation: 'North bathroom is traditionally less preferred. May affect prosperity according to some traditions.', alternativeDirections: ['northwest', 'west'], sourceNotes: 'Less preferred, varies between traditions.' },
  { id: 'rule-bathroom-ne', spaceId: 'bathroom', directionId: 'northeast', assessment: 'discouraged', explanation: 'North-East bathroom is traditionally strongly discouraged. This sacred direction should not contain waste removal facilities.', alternativeDirections: ['northwest', 'west'], sourceNotes: 'Strongly discouraged across most traditions.' },
  { id: 'rule-bathroom-se', spaceId: 'bathroom', directionId: 'southeast', assessment: 'discouraged', explanation: 'South-East bathroom is traditionally discouraged. The fire-water element conflict may cause issues.', alternativeDirections: ['northwest', 'west'], sourceNotes: 'Commonly discouraged.' },
  { id: 'rule-bathroom-sw', spaceId: 'bathroom', directionId: 'southwest', assessment: 'discouraged', explanation: 'South-West bathroom is traditionally discouraged. May cause dampness issues and affect stability.', alternativeDirections: ['northwest', 'west'], sourceNotes: 'Commonly discouraged.' },

  // ── TOILET ──
  { id: 'rule-toilet-nw', spaceId: 'toilet', directionId: 'northwest', assessment: 'preferred', explanation: 'North-West toilet is traditionally preferred. The air element helps remove waste energy effectively.', alternativeDirections: ['west'], sourceNotes: 'Consistently recommended.' },
  { id: 'rule-toilet-w', spaceId: 'toilet', directionId: 'west', assessment: 'acceptable', explanation: 'West toilet is traditionally acceptable. Good ventilation is recommended.', alternativeDirections: ['northwest'], sourceNotes: 'Generally acceptable.' },
  { id: 'rule-toilet-ne', spaceId: 'toilet', directionId: 'northeast', assessment: 'discouraged', explanation: 'North-East toilet is traditionally strongly discouraged. This sacred direction should not contain waste facilities.', alternativeDirections: ['northwest', 'west'], sourceNotes: 'Strongly discouraged.' },
  { id: 'rule-toilet-sw', spaceId: 'toilet', directionId: 'southwest', assessment: 'discouraged', explanation: 'South-West toilet is traditionally discouraged. May affect stability and cause dampness.', alternativeDirections: ['northwest', 'west'], sourceNotes: 'Commonly discouraged.' },

  // ── LIVING ROOM ──
  { id: 'rule-living-n', spaceId: 'living', directionId: 'north', assessment: 'preferred', explanation: 'North living room is traditionally preferred. Associated with positive energy and social harmony.', alternativeDirections: ['east'], sourceNotes: 'Consistently recommended.' },
  { id: 'rule-living-e', spaceId: 'living', directionId: 'east', assessment: 'acceptable', explanation: 'East living room is traditionally acceptable. Associated with health and vitality.', alternativeDirections: ['north'], sourceNotes: 'Generally acceptable.' },
  { id: 'rule-living-sw', spaceId: 'living', directionId: 'southwest', assessment: 'less_preferred', explanation: 'South-West living room is traditionally less preferred. May feel heavy. Some traditions allow it with proper lighting.', alternativeDirections: ['north', 'east'], sourceNotes: 'Less preferred, varies between traditions.' },

  // ── STUDY ROOM ──
  { id: 'rule-study-e', spaceId: 'study', directionId: 'east', assessment: 'preferred', explanation: 'East study room is traditionally preferred. Morning sunlight enhances concentration and learning.', alternativeDirections: ['northeast'], sourceNotes: 'Consistently recommended for study.' },
  { id: 'rule-study-ne', spaceId: 'study', directionId: 'northeast', assessment: 'acceptable', explanation: 'North-East study room is traditionally acceptable. Sacred energy may enhance spiritual learning.', alternativeDirections: ['east'], sourceNotes: 'Generally acceptable.' },
  { id: 'rule-study-n', spaceId: 'study', directionId: 'north', assessment: 'acceptable', explanation: 'North study room is traditionally acceptable. Some traditions recommend it for focused work.', alternativeDirections: ['east'], sourceNotes: 'Acceptable in some traditions.' },
  { id: 'rule-study-sw', spaceId: 'study', directionId: 'southwest', assessment: 'discouraged', explanation: 'South-West study room is traditionally discouraged. May affect concentration and academic success.', alternativeDirections: ['east', 'northeast'], sourceNotes: 'Commonly discouraged.' },

  // ── OFFICE / WORKSPACE ──
  { id: 'rule-office-w', spaceId: 'office', directionId: 'west', assessment: 'preferred', explanation: 'West office is traditionally preferred. Associated with growth and career success.', alternativeDirections: ['southwest'], sourceNotes: 'Commonly recommended for offices.' },
  { id: 'rule-office-sw', spaceId: 'office', directionId: 'southwest', assessment: 'acceptable', explanation: 'South-West office is traditionally acceptable. Provides stability for business operations.', alternativeDirections: ['west'], sourceNotes: 'Generally acceptable.' },
  { id: 'rule-office-n', spaceId: 'office', directionId: 'north', assessment: 'acceptable', explanation: 'North office is traditionally acceptable. Associated with prosperity and opportunities.', alternativeDirections: ['west'], sourceNotes: 'Acceptable in some traditions.' },
  { id: 'rule-office-ne', spaceId: 'office', directionId: 'northeast', assessment: 'discouraged', explanation: 'North-East office is traditionally discouraged. This sacred direction is not recommended for commercial activities.', alternativeDirections: ['west', 'southwest'], sourceNotes: 'Commonly discouraged.' },

  // ── LOCKER / SAFE ──
  { id: 'rule-locker-sw', spaceId: 'locker', directionId: 'southwest', assessment: 'preferred', explanation: 'South-West locker is traditionally preferred. The earth element provides security for valuables.', alternativeDirections: ['south'], sourceNotes: 'Commonly recommended for lockers.' },
  { id: 'rule-locker-s', spaceId: 'locker', directionId: 'south', assessment: 'acceptable', explanation: 'South locker is traditionally acceptable. Provides stability for financial security.', alternativeDirections: ['southwest'], sourceNotes: 'Generally acceptable.' },
  { id: 'rule-locker-ne', spaceId: 'locker', directionId: 'northeast', assessment: 'discouraged', explanation: 'North-East locker is traditionally discouraged. This sacred direction should not contain material storage.', alternativeDirections: ['southwest', 'south'], sourceNotes: 'Commonly discouraged.' },

  // ── STAIRCASE ──
  { id: 'rule-staircase-s', spaceId: 'staircase', directionId: 'south', assessment: 'preferred', explanation: 'South staircase is traditionally preferred. Provides stability and grounding.', alternativeDirections: ['west'], sourceNotes: 'Consistently recommended.' },
  { id: 'rule-staircase-w', spaceId: 'staircase', directionId: 'west', assessment: 'acceptable', explanation: 'West staircase is traditionally acceptable. Provides growth energy.', alternativeDirections: ['south'], sourceNotes: 'Generally acceptable.' },
  { id: 'rule-staircase-ne', spaceId: 'staircase', directionId: 'northeast', assessment: 'discouraged', explanation: 'North-East staircase is traditionally strongly discouraged. This sacred direction should not contain stairs.', alternativeDirections: ['south', 'west'], sourceNotes: 'Strongly discouraged.' },

  // ── WATER TANK ──
  { id: 'rule-watertank-ne', spaceId: 'watertank', directionId: 'northeast', assessment: 'preferred', explanation: 'North-East water tank is traditionally preferred. The water element aligns with this direction.', alternativeDirections: ['east'], sourceNotes: 'Consistently recommended.' },
  { id: 'rule-watertank-e', spaceId: 'watertank', directionId: 'east', assessment: 'acceptable', explanation: 'East water tank is traditionally acceptable. Supports health and vitality.', alternativeDirections: ['northeast'], sourceNotes: 'Generally acceptable.' },
  { id: 'rule-watertank-sw', spaceId: 'watertank', directionId: 'southwest', assessment: 'discouraged', explanation: 'South-West water tank is traditionally discouraged. May cause instability and dampness.', alternativeDirections: ['northeast', 'east'], sourceNotes: 'Commonly discouraged.' },
  { id: 'rule-watertank-se', spaceId: 'watertank', directionId: 'southeast', assessment: 'discouraged', explanation: 'South-East water tank is traditionally discouraged. Fire-water element conflict.', alternativeDirections: ['northeast', 'east'], sourceNotes: 'Commonly discouraged.' },

  // ── GARDEN ──
  { id: 'rule-garden-n', spaceId: 'garden', directionId: 'north', assessment: 'preferred', explanation: 'North garden is traditionally preferred. Supports growth and prosperity.', alternativeDirections: ['east'], sourceNotes: 'Consistently recommended.' },
  { id: 'rule-garden-e', spaceId: 'garden', directionId: 'east', assessment: 'acceptable', explanation: 'East garden is traditionally acceptable. Supports health and vitality.', alternativeDirections: ['north'], sourceNotes: 'Generally acceptable.' },
  { id: 'rule-garden-sw', spaceId: 'garden', directionId: 'southwest', assessment: 'discouraged', explanation: 'South-West garden is traditionally discouraged. Heavy planting may affect stability.', alternativeDirections: ['north', 'east'], sourceNotes: 'Commonly discouraged.' },
];

// ── Helper Functions ──
export const getRulesBySpace = (spaceId) => {
  return placementRules.filter(r => r.spaceId === spaceId);
};

export const getRule = (spaceId, directionId) => {
  return placementRules.find(r => r.spaceId === spaceId && r.directionId === directionId);
};

export const getAssessmentColor = (assessment) => {
  const colors = {
    preferred: '#4A7C59',
    acceptable: '#C9893E',
    less_preferred: '#D4855A',
    discouraged: '#B54A4A',
  };
  return colors[assessment] || '#7A6F63';
};

export const getAssessmentLabel = (assessment) => {
  const labels = {
    preferred: 'Traditionally Preferred',
    acceptable: 'Traditionally Acceptable',
    less_preferred: 'Traditionally Less Preferred',
    discouraged: 'Traditionally Discouraged',
  };
  return labels[assessment] || 'Unknown';
};

export const getAssessmentIcon = (assessment) => {
  const icons = {
    preferred: 'checkmark-circle',
    acceptable: 'checkmark-circle',
    less_preferred: 'alert-circle',
    discouraged: 'close-circle',
  };
  return icons[assessment] || 'help-circle';
};

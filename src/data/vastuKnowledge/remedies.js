// ============================================================
// VASTU COMPASS — Remedies Database (Audited)
// Honest verification with proper source tracking
// ============================================================

export const remedies = [
  // ═══════════════════════════════════════════════════════════
  // 🍳 KITCHEN REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Kitchen in South-East (Preferred)
  { id: 'kitchen-se-1', spaceId: 'kitchen', directionId: 'southeast', issue: 'Kitchen in preferred direction', type: 'practical', title: 'Maintain cleanliness and good ventilation', description: 'Keep the kitchen clean, well-ventilated, and organized. This is practical advice that supports health regardless of Vastu considerations.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice, not Vastu-specific.' },
  
  // Kitchen in North-West (Acceptable)
  { id: 'kitchen-nw-1', spaceId: 'kitchen', directionId: 'northwest', issue: 'Kitchen in acceptable direction', type: 'practical', title: 'Ensure proper ventilation and lighting', description: 'North-West kitchens are traditionally considered acceptable. Maintain good ventilation to manage cooking smoke and odors.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'North-West kitchen acceptance is commonly repeated across traditions.' },
  
  // Kitchen in North-East (Discouraged)
  { id: 'kitchen-ne-1', spaceId: 'kitchen', directionId: 'northeast', issue: 'Kitchen in traditionally discouraged direction', type: 'practical', title: 'Keep the kitchen exceptionally clean and well-ventilated', description: 'Maintaining cleanliness and good ventilation is practical advice that helps in any kitchen placement.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'kitchen-ne-2', spaceId: 'kitchen', directionId: 'northeast', issue: 'Kitchen in traditionally discouraged direction', type: 'placement', title: 'Position the stove away from the North-East corner', description: 'Some practitioners suggest positioning the cooking stove in the South-East section of the kitchen if space allows.', priority: 2, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly repeated by modern practitioners, but specific source unclear.' },
  { id: 'kitchen-ne-3', spaceId: 'kitchen', directionId: 'northeast', issue: 'Kitchen in traditionally discouraged direction', type: 'structural', title: 'Relocate the kitchen to South-East during renovation', description: 'If a major renovation is planned, traditionally it is recommended to relocate the kitchen to the South-East direction.', priority: 3, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'South-East kitchen recommendation is widely agreed.' },
  { id: 'kitchen-ne-4', spaceId: 'kitchen', directionId: 'northeast', issue: 'Kitchen in traditionally discouraged direction', type: 'traditional', title: 'Place a Vastu pyramid or crystal', description: 'Some Vastu practitioners recommend placing a Vastu pyramid or clear quartz crystal. These are modern practices without classical basis.', priority: 4, difficulty: 'easy', cost: 'low', renovation: false, verificationStatus: 'disputed', verificationNote: 'Modern practice without classical text support. Disputed among practitioners.' },
  
  // Kitchen in South-West (Discouraged)
  { id: 'kitchen-sw-1', spaceId: 'kitchen', directionId: 'southwest', issue: 'Kitchen in traditionally discouraged direction', type: 'practical', title: 'Maintain excellent cleanliness and ventilation', description: 'Keep the kitchen exceptionally clean with proper ventilation and exhaust systems.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'kitchen-sw-2', spaceId: 'kitchen', directionId: 'southwest', issue: 'Kitchen in traditionally discouraged direction', type: 'placement', title: 'Position the stove facing East', description: 'Some traditions suggest facing East while cooking. This is a common recommendation across multiple Vastu traditions.', priority: 2, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly repeated, specific classical source unclear.' },
  { id: 'kitchen-sw-3', spaceId: 'kitchen', directionId: 'southwest', issue: 'Kitchen in traditionally discouraged direction', type: 'structural', title: 'Relocate the kitchen during renovation', description: 'If renovation is possible, relocate the kitchen to the South-East direction.', priority: 3, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'South-East kitchen is widely recommended.' },
  
  // Kitchen in North (Discouraged)
  { id: 'kitchen-n-1', spaceId: 'kitchen', directionId: 'north', issue: 'Kitchen in traditionally discouraged direction', type: 'practical', title: 'Keep the kitchen clean and well-lit', description: 'Maintain proper cleanliness and lighting in the kitchen.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  
  // Kitchen in East (Acceptable)
  { id: 'kitchen-e-1', spaceId: 'kitchen', directionId: 'east', issue: 'Kitchen in acceptable direction', type: 'practical', title: 'Maximize natural light and ventilation', description: 'East kitchens benefit from morning sunlight. Keep windows open to allow natural light and fresh air.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  
  // Kitchen in South (Less Preferred)
  { id: 'kitchen-s-1', spaceId: 'kitchen', directionId: 'south', issue: 'Kitchen in less preferred direction', type: 'practical', title: 'Ensure proper ventilation and exhaust', description: 'Install good exhaust systems and maintain proper air circulation.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },

  // ═══════════════════════════════════════════════════════════
  // 🛏️ BEDROOM REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Bedroom in South-West (Preferred)
  { id: 'bedroom-sw-1', spaceId: 'bedroom', directionId: 'southwest', issue: 'Bedroom in preferred direction', type: 'practical', title: 'Keep the bedroom clutter-free and peaceful', description: 'Maintain a calm, clutter-free environment with proper ventilation and soft lighting for restful sleep.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice for better sleep.' },
  
  // Bedroom in South (Acceptable)
  { id: 'bedroom-s-1', spaceId: 'bedroom', directionId: 'south', issue: 'Bedroom in acceptable direction', type: 'practical', title: 'Position the bed with head pointing South', description: 'Some traditions recommend sleeping with the head pointing South. This is a common recommendation.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly repeated across traditions.' },
  
  // Bedroom in North-East (Discouraged)
  { id: 'bedroom-ne-1', spaceId: 'bedroom', directionId: 'northeast', issue: 'Bedroom in traditionally discouraged direction', type: 'practical', title: 'Keep the bedroom exceptionally clean and ventilated', description: 'Maintain a clean, clutter-free, and well-ventilated bedroom.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'bedroom-ne-2', spaceId: 'bedroom', directionId: 'northeast', issue: 'Bedroom in traditionally discouraged direction', type: 'placement', title: 'Position the bed with head pointing South', description: 'Some traditions suggest sleeping with the head pointing South.', priority: 2, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly repeated.' },
  { id: 'bedroom-ne-3', spaceId: 'bedroom', directionId: 'northeast', issue: 'Bedroom in traditionally discouraged direction', type: 'structural', title: 'Convert to study or prayer room', description: 'If renovation is practical, consider converting the North-East room into a study or prayer room.', priority: 3, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly suggested by practitioners.' },
  
  // Bedroom in North (Less Preferred)
  { id: 'bedroom-n-1', spaceId: 'bedroom', directionId: 'north', issue: 'Bedroom in less preferred direction', type: 'practical', title: 'Ensure proper ventilation and light control', description: 'Use warm lighting and ensure proper ventilation for comfortable sleep.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  
  // Bedroom in East (Less Preferred)
  { id: 'bedroom-e-1', spaceId: 'bedroom', directionId: 'east', issue: 'Bedroom in less preferred direction', type: 'practical', title: 'Use curtains to manage morning light', description: 'Use appropriate curtains to manage light levels for comfortable sleep.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  
  // Bedroom in West (Less Preferred)
  { id: 'bedroom-w-1', spaceId: 'bedroom', directionId: 'west', issue: 'Bedroom in less preferred direction', type: 'practical', title: 'Manage afternoon heat and light', description: 'Use proper curtains and ensure good ventilation.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  
  // Bedroom in South-East (Discouraged)
  { id: 'bedroom-se-1', spaceId: 'bedroom', directionId: 'southeast', issue: 'Bedroom in traditionally discouraged direction', type: 'practical', title: 'Keep the bedroom cool and peaceful', description: 'Keep the room cool with good ventilation. Use calming colors and soft lighting.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'bedroom-se-2', spaceId: 'bedroom', directionId: 'southeast', issue: 'Bedroom in traditionally discouraged direction', type: 'placement', title: 'Position the bed away from the South-East corner', description: 'Place the bed in the North-West or South-West section of the room.', priority: 2, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly suggested by practitioners.' },
  
  // Bedroom in North-West (Less Preferred)
  { id: 'bedroom-nw-1', spaceId: 'bedroom', directionId: 'northwest', issue: 'Bedroom in less preferred direction', type: 'practical', title: 'Create a calm and stable environment', description: 'Create a stable, calm environment with minimal drafts. Use solid furniture and warm colors.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },

  // ═══════════════════════════════════════════════════════════
  // 🚿 BATHROOM REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Bathroom in North-West (Preferred)
  { id: 'bathroom-nw-1', spaceId: 'bathroom', directionId: 'northwest', issue: 'Bathroom in preferred direction', type: 'practical', title: 'Maintain excellent hygiene and ventilation', description: 'Keep the bathroom clean, dry, and well-ventilated. Use exhaust fans to remove moisture.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  
  // Bathroom in North-East (Discouraged)
  { id: 'bathroom-ne-1', spaceId: 'bathroom', directionId: 'northeast', issue: 'Bathroom in traditionally discouraged direction', type: 'practical', title: 'Keep the bathroom door closed and well-maintained', description: 'Keeping the bathroom door closed when not in use and maintaining cleanliness helps.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'bathroom-ne-2', spaceId: 'bathroom', directionId: 'northeast', issue: 'Bathroom in traditionally discouraged direction', type: 'structural', title: 'Relocate the bathroom during renovation', description: 'If renovation is planned, consider relocating to the North-West direction.', priority: 2, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'North-West bathroom is commonly recommended.' },
  
  // Bathroom in South-West (Discouraged)
  { id: 'bathroom-sw-1', spaceId: 'bathroom', directionId: 'southwest', issue: 'Bathroom in traditionally discouraged direction', type: 'practical', title: 'Ensure proper drainage and ventilation', description: 'Ensure excellent drainage, ventilation, and regular maintenance.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },

  // ═══════════════════════════════════════════════════════════
  // 🚪 MAIN ENTRANCE REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Entrance in South (Discouraged)
  { id: 'entrance-s-1', spaceId: 'entrance', directionId: 'south', issue: 'Entrance in traditionally discouraged direction', type: 'practical', title: 'Ensure the entrance is well-lit and clean', description: 'Keep the main entrance area well-lit, clean, and free from obstructions.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'entrance-s-2', spaceId: 'entrance', directionId: 'south', issue: 'Entrance in traditionally discouraged direction', type: 'structural', title: 'Create an alternative entrance on East or North', description: 'If renovation is practical, consider creating an additional entrance on the East or North side.', priority: 2, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'East/North entrances are widely recommended.' },
  
  // Entrance in South-West (Discouraged)
  { id: 'entrance-sw-1', spaceId: 'entrance', directionId: 'southwest', issue: 'Entrance in traditionally discouraged direction', type: 'practical', title: 'Keep the entrance area extremely well-maintained', description: 'Keep the area exceptionally clean, well-lit, and welcoming.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'entrance-sw-2', spaceId: 'entrance', directionId: 'southwest', issue: 'Entrance in traditionally discouraged direction', type: 'structural', title: 'Consider alternative entrance during renovation', description: 'If major renovation is planned, consider creating an alternative entrance on the East or North side.', priority: 2, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'East/North entrances are widely recommended.' },

  // ═══════════════════════════════════════════════════════════
  // 🛕 POOJA ROOM REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Pooja in South-East (Discouraged)
  { id: 'pooja-se-1', spaceId: 'pooja', directionId: 'southeast', issue: 'Pooja room in traditionally discouraged direction', type: 'practical', title: 'Keep the prayer space clean and well-lit', description: 'Maintain a clean, well-lit, and peaceful prayer space.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'pooja-se-2', spaceId: 'pooja', directionId: 'southeast', issue: 'Pooja room in traditionally discouraged direction', type: 'structural', title: 'Relocate the prayer space to North-East', description: 'If renovation is practical, consider relocating to the North-East direction.', priority: 2, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'North-East prayer room is universally recommended.' },
  { id: 'pooja-se-3', spaceId: 'pooja', directionId: 'southeast', issue: 'Pooja room in traditionally discouraged direction', type: 'traditional', title: 'Use a portable prayer altar in the North-East', description: 'Some practitioners suggest placing a small portable prayer altar in the North-East corner of the home.', priority: 3, difficulty: 'easy', cost: 'low', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly suggested by practitioners.' },

  // ═══════════════════════════════════════════════════════════
  // 📚 STUDY ROOM REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Study in South-West (Discouraged)
  { id: 'study-sw-1', spaceId: 'study', directionId: 'southwest', issue: 'Study room in traditionally discouraged direction', type: 'practical', title: 'Ensure proper lighting and ventilation', description: 'Good lighting and ventilation are essential for concentration.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'study-sw-2', spaceId: 'study', directionId: 'southwest', issue: 'Study room in traditionally discouraged direction', type: 'placement', title: 'Position the desk facing East or North', description: 'Some traditions suggest facing East or North while studying.', priority: 2, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly repeated.' },
  { id: 'study-sw-3', spaceId: 'study', directionId: 'southwest', issue: 'Study room in traditionally discouraged direction', type: 'structural', title: 'Relocate the study to East or North-East', description: 'If renovation is practical, consider relocating to the East or North-East direction.', priority: 3, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'East study areas are commonly recommended.' },

  // ═══════════════════════════════════════════════════════════
  // 💼 OFFICE/WORKSPACE REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Office in North-East (Discouraged)
  { id: 'office-ne-1', spaceId: 'office', directionId: 'northeast', issue: 'Office in traditionally discouraged direction', type: 'practical', title: 'Maintain a clean and organized workspace', description: 'A clean, organized workspace promotes productivity regardless of direction.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'office-ne-2', spaceId: 'office', directionId: 'northeast', issue: 'Office in traditionally discouraged direction', type: 'placement', title: 'Position your desk facing South or West', description: 'Some practitioners suggest facing South or West while working.', priority: 2, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly repeated by practitioners.' },
  { id: 'office-ne-3', spaceId: 'office', directionId: 'northeast', issue: 'Office in traditionally discouraged direction', type: 'structural', title: 'Relocate the workspace to West or South-West', description: 'If renovation is practical, consider relocating to the West or South-West direction.', priority: 3, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'West/South-West offices are commonly recommended.' },

  // ═══════════════════════════════════════════════════════════
  // 💰 LOCKER/SAFE REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Locker in North-East (Discouraged)
  { id: 'locker-ne-1', spaceId: 'locker', directionId: 'northeast', issue: 'Locker in traditionally discouraged direction', type: 'practical', title: 'Ensure the locker is well-maintained and secure', description: 'A well-maintained, properly functioning locker ensures the safety of valuables.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'locker-ne-2', spaceId: 'locker', directionId: 'northeast', issue: 'Locker in traditionally discouraged direction', type: 'placement', title: 'Position the locker facing South or West', description: 'Some traditions suggest the locker door should open towards South or West.', priority: 2, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly repeated.' },
  { id: 'locker-ne-3', spaceId: 'locker', directionId: 'northeast', issue: 'Locker in traditionally discouraged direction', type: 'structural', title: 'Relocate the locker to South-West', description: 'If practical, relocate to the South-West direction.', priority: 3, difficulty: 'moderate', cost: 'low', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'South-West locker is commonly recommended.' },

  // ═══════════════════════════════════════════════════════════
  // 🪜 STAIRCASE REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Staircase in North-East (Discouraged)
  { id: 'staircase-ne-1', spaceId: 'staircase', directionId: 'northeast', issue: 'Staircase in traditionally discouraged direction', type: 'practical', title: 'Keep the staircase well-lit and clean', description: 'Keep the area well-lit, clean, and free from clutter.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'staircase-ne-2', spaceId: 'staircase', directionId: 'northeast', issue: 'Staircase in traditionally discouraged direction', type: 'structural', title: 'Relocate during renovation', description: 'If major renovation is planned, consider relocating to the South or West direction.', priority: 2, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'South/West staircases are commonly recommended.' },

  // ═══════════════════════════════════════════════════════════
  // 🚰 WATER TANK REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Water Tank in South-West (Discouraged)
  { id: 'watertank-sw-1', spaceId: 'watertank', directionId: 'southwest', issue: 'Water tank in traditionally discouraged direction', type: 'practical', title: 'Ensure the tank is clean and well-maintained', description: 'Keep the tank clean, properly sealed, and well-maintained.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
  { id: 'watertank-sw-2', spaceId: 'watertank', directionId: 'southwest', issue: 'Water tank in traditionally discouraged direction', type: 'structural', title: 'Relocate to North-East during renovation', description: 'If renovation is possible, consider relocating to the North-East direction.', priority: 2, difficulty: 'hard', cost: 'high', renovation: true, verificationStatus: 'commonly_repeated', verificationNote: 'North-East water tank is commonly recommended.' },

  // ═══════════════════════════════════════════════════════════
  // 🌱 GARDEN REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Garden in South-West (Discouraged)
  { id: 'garden-sw-1', spaceId: 'garden', directionId: 'southwest', issue: 'Garden in traditionally discouraged direction', type: 'practical', title: 'Avoid water features and heavy planting', description: 'Avoid water features and heavy planting. Use hardy, drought-resistant plants.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'commonly_repeated', verificationNote: 'Commonly repeated.' },

  // ═══════════════════════════════════════════════════════════
  // 🛋️ LIVING ROOM REMEDIES
  // ═══════════════════════════════════════════════════════════
  
  // Living Room in South-West (Less Preferred)
  { id: 'living-sw-1', spaceId: 'living', directionId: 'southwest', issue: 'Living room in less preferred direction', type: 'practical', title: 'Maximize light and openness', description: 'Maximize light with large windows, use light colors, and keep the space open and airy.', priority: 1, difficulty: 'easy', cost: 'free', renovation: false, verificationStatus: 'verified', verificationNote: 'Practical advice.' },
];

// ── Helper Functions ──
export const getRemediesBySpaceAndDirection = (spaceId, directionId) => {
  return remedies
    .filter(r => r.spaceId === spaceId && r.directionId === directionId)
    .sort((a, b) => a.priority - b.priority);
};

export const searchRemedies = (query) => {
  const q = query.toLowerCase();
  return remedies.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    r.issue.toLowerCase().includes(q)
  );
};

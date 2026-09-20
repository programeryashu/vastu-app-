// ============================================================
// VASTU COMPASS — Directions Database (Audited)
// Honest verification with proper source tracking
// ============================================================

export const vastuDirections = [
  {
    id: 'north',
    direction: 'North',
    shortName: 'N',
    degreeRange: '337.5° - 22.5°',
    min: 337.5,
    max: 360,
    wraparound: true,
    wrapMax: 22.5,
    traditionalName: 'Uttara',
    element: 'Water',
    elementNote: 'Some traditions associate North with different elements. Water is the most commonly cited.',
    deity: 'Kubera',
    icon: '⬆️',
    color: '#3498db',
    association: 'Wealth, prosperity, and opportunities',
    
    explanation: 'According to traditional Vastu principles, the North direction is commonly associated with Kubera, the deity of wealth. This association is found in classical texts like Manasara and Mayamatam. Multiple practitioner traditions consistently recommend the North for spaces that welcome positive energy and growth.',
    
    commonlyRecommended: [
      'Living room — for social gatherings and family time',
      'Reception area — for welcoming guests and opportunities',
      'Windows and openings — to allow positive energy flow',
    ],
    
    commonlyDiscouraged: [
      'Heavy storage or weight — may obstruct energy flow',
      'Toilet or bathroom — may affect prosperity',
      'Kitchen — fire element conflicts with water element',
    ],
    
    variesByTradition: [
      'Some traditions consider North suitable for bedrooms for young adults',
      'Some practitioners recommend North for meditation spaces',
      'Water storage in North varies between traditions',
    ],
    
    sourceIds: ['src-manasara', 'src-mayamatam', 'src-community'],
    verificationStatus: 'verified',
    verificationNote: 'North-Kubera association and prosperity guidance is consistently found across multiple classical texts and practitioner traditions.',
  },
  {
    id: 'northeast',
    direction: 'North-East',
    shortName: 'NE',
    degreeRange: '22.5° - 67.5°',
    min: 22.5,
    max: 67.5,
    traditionalName: 'Ishanya',
    element: 'Water',
    elementNote: 'Water element is commonly associated with North-East across traditions.',
    deity: 'Shiva',
    icon: '↗️',
    color: '#9b59b6',
    association: 'Spirituality, divine energy, and sacred spaces',
    
    explanation: 'According to traditional Vastu principles, the North-East is commonly considered the most sacred direction. It is associated with the water element and Lord Shiva. This direction is believed to receive the first rays of morning sunlight, making it auspicious for spiritual practices. Classical texts universally recommend this direction for prayer rooms.',
    
    commonlyRecommended: [
      'Pooja room or prayer space — most recommended direction',
      'Meditation room — for spiritual practices',
      'Water features — holy water storage',
    ],
    
    commonlyDiscouraged: [
      'Kitchen — fire element conflicts with sacred water element',
      'Toilet or bathroom — considered disrespectful to sacred space',
      'Heavy storage — may block divine energy',
      'Bedroom — may cause restlessness',
      'Staircase — considered inappropriate for sacred direction',
    ],
    
    variesByTradition: [
      'Some traditions allow bedrooms in NE for spiritual practitioners',
      'Some practitioners consider NE suitable for children\'s rooms',
    ],
    
    sourceIds: ['src-manasara', 'src-mayamatam', 'src-vishwakarma', 'src-community'],
    verificationStatus: 'verified',
    verificationNote: 'North-East as most sacred direction and prayer room placement is universally recommended across all Vastu traditions.',
  },
  {
    id: 'east',
    direction: 'East',
    shortName: 'E',
    degreeRange: '67.5° - 112.5°',
    min: 67.5,
    max: 112.5,
    traditionalName: 'Purva',
    element: 'Water',
    elementNote: 'CONFLICTING: Some traditions say Water, others say Air. This is a known area of disagreement between Vastu schools.',
    deity: 'Sun',
    icon: '➡️',
    color: '#f39c12',
    association: 'Health, vitality, and positive energy',
    
    explanation: 'According to traditional Vastu principles, the East is commonly associated with the Sun deity and is believed to bring health, vitality, and positive energy. Classical texts recommend East-facing entrances for the flow of morning sunlight and positive energy.',
    
    commonlyRecommended: [
      'Main entrance — for health and vitality',
      'Living room — for positive social energy',
      'Study room — for concentration and learning',
      'Children\'s room — for growth and development',
    ],
    
    commonlyDiscouraged: [
      'Toilet or bathroom — may affect health',
      'Heavy storage — may block morning energy',
    ],
    
    variesByTradition: [
      'Element association: Some traditions say Water, others say Air — this is a known conflict',
      'Some practitioners recommend East for bedrooms',
      'Kitchen in East varies between traditions',
    ],
    
    sourceIds: ['src-manasara', 'src-mayamatam', 'src-conflicting-element', 'src-community'],
    verificationStatus: 'verified',
    verificationNote: 'East-Sun association and entrance recommendation is widely agreed. Element association (Water vs Air) is a known area of conflict.',
  },
  {
    id: 'southeast',
    direction: 'South-East',
    shortName: 'SE',
    degreeRange: '112.5° - 157.5°',
    min: 112.5,
    max: 157.5,
    traditionalName: 'Agneya',
    element: 'Fire',
    elementNote: 'Fire element association is consistently agreed across traditions.',
    deity: 'Agni',
    icon: '↘️',
    color: '#e74c3c',
    association: 'Fire element, cooking, and energy',
    
    explanation: 'According to traditional Vastu principles, the South-East is commonly associated with the fire element and Agni, the fire deity. Classical Vastu texts strongly recommend this direction for kitchens. This is one of the most consistently agreed-upon recommendations across Vastu traditions.',
    
    commonlyRecommended: [
      'Kitchen — most recommended direction for cooking',
      'Electrical appliances — generator, inverter',
      'Fireplace — for warmth and energy',
    ],
    
    commonlyDiscouraged: [
      'Bedroom — fire energy may cause restlessness',
      'Pooja room — fire element conflicts with sacred space',
      'Water storage — fire-water conflict',
    ],
    
    variesByTradition: [
      'Some traditions allow bedrooms in SE for young adults',
      'Some practitioners allow water purifiers in SE kitchens',
    ],
    
    sourceIds: ['src-manasara', 'src-mayamatam', 'src-vishwakarma', 'src-community'],
    verificationStatus: 'verified',
    verificationNote: 'SE-Fire-Agni association and kitchen recommendation is one of the most consistently agreed-upon across all Vastu traditions.',
  },
  {
    id: 'south',
    direction: 'South',
    shortName: 'S',
    degreeRange: '157.5° - 202.5°',
    min: 157.5,
    max: 202.5,
    traditionalName: 'Dakshina',
    element: 'Earth',
    elementNote: 'Earth element is commonly associated, but some traditions differ.',
    deity: 'Yama',
    icon: '⬇️',
    color: '#2c3e50',
    association: 'Stability, rest, and grounding',
    
    explanation: 'According to traditional Vastu principles, the South is commonly associated with the earth element and is believed to provide stability and grounding. Classical texts recommend the South for spaces that require rest and heavy items. However, guidance varies significantly regarding main entrances.',
    
    commonlyRecommended: [
      'Bedroom — for rest and stability',
      'Storage room — for heavy items',
      'Compound wall — higher on South side',
    ],
    
    commonlyDiscouraged: [
      'Main entrance — traditionally discouraged',
      'Water features — may cause instability',
    ],
    
    variesByTradition: [
      'Some traditions recommend South for master bedrooms',
      'Some practitioners consider South entrances acceptable with remedies',
      'Guidance on South entrances varies significantly between schools',
      'Children\'s room in South varies between traditions',
    ],
    
    sourceIds: ['src-mayamatam', 'src-community', 'src-conflicting-element'],
    verificationStatus: 'needs_review',
    verificationNote: 'South entrance guidance varies significantly between traditions. Some strongly discourage, others allow with remedies.',
  },
  {
    id: 'southwest',
    direction: 'South-West',
    shortName: 'SW',
    degreeRange: '202.5° - 247.5°',
    min: 202.5,
    max: 247.5,
    traditionalName: 'Nairutya',
    element: 'Earth',
    elementNote: 'Earth element association is commonly agreed.',
    deity: 'Nairutya',
    icon: '↙️',
    color: '#7f8c8d',
    association: 'Stability, heavy items, and grounding',
    
    explanation: 'According to traditional Vastu principles, the South-West is commonly associated with the earth element and is recommended for heavy, stable items. Classical texts and practitioners generally agree that this direction is suitable for master bedrooms and heavy storage.',
    
    commonlyRecommended: [
      'Master bedroom — for stability in relationships',
      'Heavy storage — for grounding energy',
      'Underground tank — for water storage',
    ],
    
    commonlyDiscouraged: [
      'Main entrance — strongly discouraged across traditions',
      'Children\'s room — may affect growth',
      'Pooja room — considered inappropriate',
      'Water features — may cause instability',
    ],
    
    variesByTradition: [
      'Some traditions specifically recommend SW for master bedrooms',
      'Some practitioners allow water tanks in SW with remedies',
    ],
    
    sourceIds: ['src-manasara', 'src-mayamatam', 'src-community'],
    verificationStatus: 'verified',
    verificationNote: 'SW-Earth association and heavy items recommendation is widely agreed. Master bedroom recommendation is commonly accepted.',
  },
  {
    id: 'west',
    direction: 'West',
    shortName: 'W',
    degreeRange: '247.5° - 292.5°',
    min: 247.5,
    max: 292.5,
    traditionalName: 'Paschima',
    element: 'Air',
    elementNote: 'CONFLICTING: Some traditions say Air, others say Water. This is a known area of disagreement.',
    deity: 'Varuna',
    icon: '⬅️',
    color: '#1abc9c',
    association: 'Growth, nourishment, and social activities',
    
    explanation: 'According to traditional Vastu principles, the West is commonly associated with growth, nourishment, and social activities. Classical texts recommend the West for children\'s rooms and dining areas. However, element association varies between traditions.',
    
    commonlyRecommended: [
      'Children\'s room — for growth and development',
      'Dining room — for nourishment and family time',
      'Study room — for learning',
    ],
    
    commonlyDiscouraged: [
      'Main entrance — traditionally less preferred',
      'Water storage — may cause dampness',
      'Pooja room — considered less auspicious',
    ],
    
    variesByTradition: [
      'Element association: Some traditions say Air, others say Water — this is a known conflict',
      'Some practitioners consider West suitable for offices',
      'Kitchen in West varies between traditions',
    ],
    
    sourceIds: ['src-mayamatam', 'src-conflicting-element', 'src-community'],
    verificationStatus: 'needs_review',
    verificationNote: 'West room recommendations are generally consistent, but element association (Air vs Water) is a known area of conflict.',
  },
  {
    id: 'northwest',
    direction: 'North-West',
    shortName: 'NW',
    degreeRange: '292.5° - 337.5°',
    min: 292.5,
    max: 337.5,
    traditionalName: 'Vayavya',
    element: 'Air',
    elementNote: 'Air element association is commonly agreed.',
    deity: 'Vayu',
    icon: '↖️',
    color: '#16a085',
    association: 'Movement, guests, and transient activities',
    
    explanation: 'According to traditional Vastu principles, the North-West is commonly associated with the air element and movement. Classical texts recommend this direction for guest rooms, garages, and spaces associated with temporary or transient activities.',
    
    commonlyRecommended: [
      'Garage — for parking and vehicles',
      'Guest bedroom — for temporary stays',
      'Toilet — for waste removal',
    ],
    
    commonlyDiscouraged: [
      'Master bedroom — may cause instability',
      'Pooja room — considered inappropriate',
      'Kitchen — fire-air conflict',
    ],
    
    variesByTradition: [
      'Some traditions allow NW kitchens with specific remedies',
      'Some practitioners consider NW suitable for offices',
    ],
    
    sourceIds: ['src-mayamatam', 'src-community'],
    verificationStatus: 'verified',
    verificationNote: 'NW-Vayu-Air association and guest/temporary space recommendation is widely agreed.',
  },
];

// ── Helper Functions ──
export const getDirectionById = (id) => {
  return vastuDirections.find(d => d.id === id);
};

export const getDirectionByRange = (degree) => {
  const normalizedDegree = ((degree % 360) + 360) % 360;
  for (const dir of vastuDirections) {
    if (dir.wraparound) {
      if (normalizedDegree >= dir.min || normalizedDegree < dir.wrapMax) return dir;
    } else {
      if (normalizedDegree >= dir.min && normalizedDegree < dir.max) return dir;
    }
  }
  return vastuDirections[0];
};

export const searchDirections = (query) => {
  const q = query.toLowerCase();
  return vastuDirections.filter(d =>
    d.direction.toLowerCase().includes(q) ||
    d.shortName.toLowerCase().includes(q) ||
    d.traditionalName.toLowerCase().includes(q) ||
    d.element.toLowerCase().includes(q) ||
    d.deity.toLowerCase().includes(q) ||
    d.association.toLowerCase().includes(q)
  );
};

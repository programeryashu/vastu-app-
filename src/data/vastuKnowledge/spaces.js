// ============================================================
// VASTU COMPASS — Comprehensive Spaces Database
// Detailed guidance for all room/object categories
// ============================================================

export const spaces = [
  {
    id: 'entrance',
    name: 'Main Entrance',
    icon: '🚪',
    category: 'structure',
    description: 'The main entry point of the home. According to traditional Vastu principles, the entrance direction significantly influences the energy flow into the home. Multiple sources consistently recommend East or North-facing entrances.',
    
    preferredDirection: 'East',
    alternativeDirection: 'North',
    lessPreferred: ['West'],
    discouraged: ['South-West', 'South'],
    
    detailedExplanation: 'Classical Vastu texts and modern practitioners generally agree that East-facing main entrances are most auspicious, followed by North-facing. East entrances are believed to allow morning sunlight and positive energy. North entrances are associated with prosperity. South-West and South entrances are traditionally discouraged across most Vastu traditions, though some practitioners offer remedies.',
    
    variesByTradition: 'Guidance on South entrances varies significantly. Some traditions strongly discourage them, while others suggest remedies like creating an alternative entrance.',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: '🛏️',
    category: 'room',
    description: 'A room for rest and sleep. Traditional Vastu guidance recommends specific directions based on the occupant and purpose. South-West is commonly recommended for master bedrooms.',
    
    preferredDirection: 'South-West',
    alternativeDirection: 'South',
    lessPreferred: ['North', 'West'],
    discouraged: ['North-East'],
    
    detailedExplanation: 'According to traditional Vastu principles, bedrooms in the South-West direction are believed to promote restful sleep and stable relationships. South bedrooms are considered acceptable alternatives. North-East bedrooms are traditionally discouraged as this direction is considered sacred for spiritual activities.',
    
    variesByTradition: 'Some traditions recommend South bedrooms for rest, while others prefer South-West. Guidance for children\'s bedrooms varies between schools.',
  },
  {
    id: 'master_bedroom',
    name: 'Master Bedroom',
    icon: '🛏️',
    category: 'room',
    description: 'The primary bedroom for the head of the household. According to traditional Vastu principles, specific directions are recommended for stability and harmony.',
    
    preferredDirection: 'South-West',
    alternativeDirection: 'South',
    lessPreferred: ['West'],
    discouraged: ['North-East'],
    
    detailedExplanation: 'Classical Vastu texts recommend the South-West for master bedrooms to ensure stability in relationships and overall well-being. This direction is associated with the earth element, providing grounding energy.',
    
    variesByTradition: 'Some traditions allow master bedrooms in the South with specific remedies. South-West is the most consistently recommended direction.',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: '🍳',
    category: 'room',
    description: 'The cooking area of the home. Traditional Vastu guidance associates the kitchen with the fire element and strongly recommends the South-East direction.',
    
    preferredDirection: 'South-East',
    alternativeDirection: 'North-West',
    lessPreferred: ['East', 'South'],
    discouraged: ['North-East', 'South-West'],
    
    detailedExplanation: 'Classical Vastu texts strongly recommend South-East for kitchens due to the fire element association with Agni. North-West is considered an acceptable alternative. North-East kitchens are traditionally discouraged across almost all Vastu traditions.',
    
    variesByTradition: 'South-East is the most universally recommended direction. North-West is widely accepted as an alternative. Other directions vary.',
  },
  {
    id: 'pooja',
    name: 'Pooja Room',
    icon: '🛕',
    category: 'room',
    description: 'A prayer or meditation space. According to traditional Vastu principles, this is considered one of the most sacred areas of the home.',
    
    preferredDirection: 'North-East',
    alternativeDirection: 'East',
    lessPreferred: ['North'],
    discouraged: ['South-East', 'South-West'],
    
    detailedExplanation: 'Classical Vastu texts universally recommend the North-East for prayer rooms due to its association with divine energy. East is considered an acceptable alternative. South-East and South-West are traditionally discouraged due to fire and earth element conflicts.',
    
    variesByTradition: 'North-East is universally recommended. Some traditions allow North for prayer spaces with specific arrangements.',
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    icon: '🚿',
    category: 'room',
    description: 'A bathing area. Traditional Vastu guidance provides specific recommendations for bathroom placement to minimize negative effects.',
    
    preferredDirection: 'North-West',
    alternativeDirection: 'West',
    lessPreferred: ['South'],
    discouraged: ['North-East'],
    
    detailedExplanation: 'According to traditional Vastu principles, North-West is the preferred direction for bathrooms as it is associated with the air element, helping to dissipate moisture. West is considered an acceptable alternative. North-East bathrooms are traditionally discouraged.',
    
    variesByTradition: 'North-West and West are consistently recommended. Some traditions allow South bathrooms with remedies.',
  },
  {
    id: 'toilet',
    name: 'Toilet',
    icon: '🚽',
    category: 'room',
    description: 'A toilet facility. According to traditional Vastu principles, specific directions are recommended to maintain positive energy flow.',
    
    preferredDirection: 'North-West',
    alternativeDirection: 'West',
    lessPreferred: ['South'],
    discouraged: ['North-East', 'South-West'],
    
    detailedExplanation: 'Traditional Vastu guidance recommends the North-West for toilets due to the air element association. This direction is believed to help remove waste energy. North-East toilets are strongly discouraged.',
    
    variesByTradition: 'North-West is the most commonly recommended direction across traditions.',
  },
  {
    id: 'living',
    name: 'Living Room',
    icon: '🛋️',
    category: 'room',
    description: 'A common area for family gatherings. Traditional Vastu guidance recommends directions that promote social harmony and positive energy.',
    
    preferredDirection: 'North',
    alternativeDirection: 'East',
    lessPreferred: ['South-West'],
    discouraged: [],
    
    detailedExplanation: 'According to traditional Vastu principles, North-facing living rooms are believed to bring positive energy and social harmony. East-facing living rooms are considered favorable for health and vitality.',
    
    variesByTradition: 'North and East are consistently recommended. Some traditions also accept South-West for living rooms.',
  },
  {
    id: 'study',
    name: 'Study Room',
    icon: '📚',
    category: 'room',
    description: 'A workspace for learning and concentration. According to traditional Vastu principles, specific directions enhance focus and academic success.',
    
    preferredDirection: 'East',
    alternativeDirection: 'North-East',
    lessPreferred: ['North'],
    discouraged: ['South-West'],
    
    detailedExplanation: 'Traditional Vastu guidance recommends East for study areas to enhance concentration and learning. North-East is considered an acceptable alternative. South-West study areas are traditionally discouraged.',
    
    variesByTradition: 'East is the most commonly recommended direction. Some traditions also recommend North for study areas.',
  },
  {
    id: 'office',
    name: 'Office / Workspace',
    icon: '💼',
    category: 'room',
    description: 'A professional workspace. Traditional Vastu guidance recommends directions that promote career growth and business success.',
    
    preferredDirection: 'West',
    alternativeDirection: 'South-West',
    lessPreferred: ['North'],
    discouraged: ['North-East'],
    
    detailedExplanation: 'According to traditional Vastu principles, West-facing offices are believed to promote career growth. South-West is considered suitable for stability. North-East offices are traditionally discouraged.',
    
    variesByTradition: 'West and South-West are commonly recommended. Some traditions also accept North offices.',
  },
  {
    id: 'locker',
    name: 'Locker / Safe',
    icon: '💰',
    category: 'object',
    description: 'A secure storage for valuables. According to traditional Vastu principles, specific directions ensure financial security.',
    
    preferredDirection: 'South-West',
    alternativeDirection: 'South',
    lessPreferred: ['West'],
    discouraged: ['North-East'],
    
    detailedExplanation: 'Traditional Vastu guidance recommends the South-West for lockers to ensure financial security. South is considered an acceptable alternative. North-East lockers are traditionally discouraged.',
    
    variesByTradition: 'South-West is the most commonly recommended direction. Some traditions also accept South.',
  },
  {
    id: 'staircase',
    name: 'Staircase',
    icon: '🪜',
    category: 'structure',
    description: 'Internal or external stairs. Traditional Vastu guidance provides recommendations for staircase placement and direction.',
    
    preferredDirection: 'South',
    alternativeDirection: 'West',
    lessPreferred: ['East'],
    discouraged: ['North-East'],
    
    detailedExplanation: 'According to traditional Vastu principles, South or West staircases are preferred. The number of steps should ideally be odd. North-East staircases are traditionally discouraged.',
    
    variesByTradition: 'South and West are consistently recommended. Some traditions also accept East.',
  },
  {
    id: 'watertank',
    name: 'Water Tank',
    icon: '🚰',
    category: 'object',
    description: 'Water storage facility. According to traditional Vastu principles, water-related elements have specific recommended directions.',
    
    preferredDirection: 'North-East',
    alternativeDirection: 'East',
    lessPreferred: ['North'],
    discouraged: ['South-West', 'South-East'],
    
    detailedExplanation: 'Traditional Vastu guidance recommends the North-East for water tanks due to the water element association. East is considered an acceptable alternative. South-West and South-East are traditionally discouraged.',
    
    variesByTradition: 'North-East is the most commonly recommended direction across traditions.',
  },
  {
    id: 'garden',
    name: 'Garden',
    icon: '🌱',
    category: 'area',
    description: 'Outdoor green space. Traditional Vastu guidance recommends directions that promote growth and positive energy.',
    
    preferredDirection: 'North',
    alternativeDirection: 'East',
    lessPreferred: ['South'],
    discouraged: ['South-West'],
    
    detailedExplanation: 'According to traditional Vastu principles, North and East gardens are believed to bring positive energy and growth. South-West gardens are traditionally discouraged.',
    
    variesByTradition: 'North and East are consistently recommended. Some traditions also accept West.',
  },
];

// ── Helper Functions ──
export const getSpaceById = (id) => {
  return spaces.find(s => s.id === id);
};

export const searchSpaces = (query) => {
  const q = query.toLowerCase();
  return spaces.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  );
};

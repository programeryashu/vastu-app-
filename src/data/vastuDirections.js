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
    deity: 'Kubera',
    icon: '⬆️',
    color: '#3498db',
    recommendedFor: [
      'Financial growth',
      'New opportunities',
      'Wealth accumulation',
      'Business prosperity',
      'Living room',
      'Reception area',
      'Water features'
    ],
    avoid: [
      'Heavy storage',
      'Toilet',
      'Kitchen',
      'Underground water tank'
    ],
    description: 'According to traditional Vastu principles, the North is commonly associated with the water element and the deity Kubera. This direction is traditionally believed to bring prosperity, wealth, and new opportunities.',
    details: {
      favorable: 'The North direction is considered highly auspicious for financial growth and career opportunities in traditional Vastu guidance.',
      unfavorable: 'Placing heavy objects or toilets in the North is traditionally discouraged.',
      tip: 'Keep the North area clean, well-lit, and clutter-free to invite positive energy.'
    }
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
    deity: 'Shiva',
    icon: '↗️',
    color: '#9b59b6',
    recommendedFor: [
      'Pooja room',
      'Meditation',
      'Spiritual activities',
      'Prayer space'
    ],
    avoid: [
      'Kitchen',
      'Toilet',
      'Heavy storage',
      'Bedroom'
    ],
    description: 'According to traditional Vastu principles, the North-East is commonly associated with the water element and the deity Shiva. This direction is traditionally considered the most sacred direction.',
    details: {
      favorable: 'The North-East is considered the most sacred direction in traditional Vastu guidance.',
      unfavorable: 'Placing kitchens, toilets, or heavy storage in the North-East is traditionally discouraged.',
      tip: 'Keep this area clean, open, and well-lit with a small water feature or prayer area.'
    }
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
    deity: 'Sun',
    icon: '➡️',
    color: '#f39c12',
    recommendedFor: [
      'Main entrance',
      'Living room',
      'Bathroom',
      'Windows',
      'Study room',
      'Children\'s room'
    ],
    avoid: [
      'Toilet',
      'Heavy storage',
      'Staircase'
    ],
    description: 'According to traditional Vastu principles, the East is commonly associated with the water element and the Sun deity. This direction is traditionally believed to bring health and vitality.',
    details: {
      favorable: 'The East direction is considered auspicious for main entrances and health.',
      unfavorable: 'Placing toilets or heavy storage in the East is traditionally discouraged.',
      tip: 'Allow maximum morning sunlight into East-facing areas.'
    }
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
    deity: 'Agni',
    icon: '↘️',
    color: '#e74c3c',
    recommendedFor: [
      'Kitchen',
      'Electrical appliances',
      'Fireplace',
      'Generator'
    ],
    avoid: [
      'Bedroom',
      'Pooja room',
      'Water storage',
      'Underground tank'
    ],
    description: 'According to traditional Vastu principles, the South-East is commonly associated with the fire element and the deity Agni. This direction is traditionally recommended for kitchens.',
    details: {
      favorable: 'The South-East is considered ideal for kitchens and fire-related activities.',
      unfavorable: 'Placing bedrooms, prayer rooms, or water storage in the South-East is traditionally discouraged.',
      tip: 'Place your kitchen and electrical appliances in the South-East corner.'
    }
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
    deity: 'Yama',
    icon: '⬇️',
    color: '#2c3e50',
    recommendedFor: [
      'Bedroom',
      'Living room',
      'Study room',
      'Heavy items',
      'Storage room'
    ],
    avoid: [
      'Main entrance',
      'Water features',
      'Children\'s room'
    ],
    description: 'According to traditional Vastu principles, the South is commonly associated with the earth element and the deity Yama.',
    details: {
      favorable: 'The South direction is considered suitable for bedrooms and study rooms.',
      unfavorable: 'Placing main entrances or water features in the South is traditionally discouraged.',
      tip: 'Keep the South area relatively heavy with furniture or storage.'
    }
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
    deity: 'Nairutya',
    icon: '↙️',
    color: '#7f8c8d',
    recommendedFor: [
      'Master bedroom',
      'Heavy storage',
      'Underground tank'
    ],
    avoid: [
      'Main entrance',
      'Children\'s room',
      'Pooja room',
      'Water features'
    ],
    description: 'According to traditional Vastu principles, the South-West is commonly associated with the earth element. This direction is traditionally recommended for master bedrooms.',
    details: {
      favorable: 'The South-West is considered ideal for master bedrooms and heavy storage.',
      unfavorable: 'Placing main entrances or water features in the South-West is traditionally discouraged.',
      tip: 'Keep this area heavy with furniture and place the master bedroom here.'
    }
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
    deity: 'Varuna',
    icon: '⬅️',
    color: '#1abc9c',
    recommendedFor: [
      'Children\'s room',
      'Dining room',
      'Study room',
      'Garage'
    ],
    avoid: [
      'Main entrance',
      'Water storage',
      'Underground tank'
    ],
    description: 'According to traditional Vastu principles, the West is commonly associated with the air element and the deity Varuna.',
    details: {
      favorable: 'The West direction is considered suitable for children\'s rooms and dining areas.',
      unfavorable: 'Placing main entrances or water storage in the West is traditionally discouraged.',
      tip: 'Place children\'s rooms and dining areas in the West.'
    }
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
    deity: 'Vayu',
    icon: '↖️',
    color: '#16a085',
    recommendedFor: [
      'Garage',
      'Guest bedroom',
      'Toilet',
      'Parking'
    ],
    avoid: [
      'Master bedroom',
      'Pooja room',
      'Kitchen',
      'Water storage'
    ],
    description: 'According to traditional Vastu principles, the North-West is commonly associated with the air element and the deity Vayu.',
    details: {
      favorable: 'The North-West direction is considered suitable for guest rooms and garages.',
      unfavorable: 'Placing master bedrooms, prayer rooms, or kitchens in the North-West is traditionally discouraged.',
      tip: 'Use this area for guest rooms, garages, or parking.'
    }
  }
];

export const getDirectionById = (id) => {
  return vastuDirections.find(dir => dir.id === id);
};

export const getDirectionByRange = (degree) => {
  const normalizedDegree = ((degree % 360) + 360) % 360;
  
  for (const dir of vastuDirections) {
    if (dir.wraparound) {
      if (normalizedDegree >= dir.min || normalizedDegree < dir.wrapMax) {
        return dir;
      }
    } else {
      if (normalizedDegree >= dir.min && normalizedDegree < dir.max) {
        return dir;
      }
    }
  }
  
  return vastuDirections[0];
};

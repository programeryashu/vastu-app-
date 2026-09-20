// ============================================================
// VASTU COMPASS — Source Management System
// Honest tracking of what's verified vs commonly repeated
// ============================================================

export const sources = [
  // ═══════════════════════════════════════════════════════════
  // VERIFIED SOURCES (Identifiable classical texts)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'src-manasara',
    title: 'Manasara (मानसार)',
    author: 'Traditional Sanskrit text',
    type: 'classical_text',
    publication: 'Ancient Indian architectural treatise',
    url: null,
    license: 'Public domain classical text',
    reliabilityNotes: 'One of the foundational texts of Vastu Shastra. Covers architecture and spatial arrangement. Interpretations vary between translators.',
    verificationStatus: 'verified',
  },
  {
    id: 'src-mayamatam',
    title: 'Mayamatam (मयमतम्)',
    author: 'Traditional Sanskrit text',
    type: 'classical_text',
    publication: 'South Indian architectural treatise',
    url: null,
    license: 'Public domain classical text',
    reliabilityNotes: 'Important Vastu text from South Indian tradition. May differ from North Indian interpretations.',
    verificationStatus: 'verified',
  },
  {
    id: 'src-vishwakarma',
    title: 'Vishwakarma Vastu Shastra',
    author: 'Traditional text attributed to Vishwakarma',
    type: 'classical_text',
    publication: 'Traditional Vastu treatise',
    url: null,
    license: 'Public domain classical text',
    reliabilityNotes: 'Widely referenced in Vastu practice. Multiple versions exist.',
    verificationStatus: 'verified',
  },
  {
    id: 'src-samrangana',
    title: 'Samrangana Sutradhara',
    author: 'King Bhoja (11th century)',
    type: 'classical_text',
    publication: 'Encyclopedic work on architecture',
    url: null,
    license: 'Public domain classical text',
    reliabilityNotes: 'Historical text covering various aspects of architecture including Vastu principles.',
    verificationStatus: 'verified',
  },

  // ═══════════════════════════════════════════════════════════
  // COMMONLY REPEATED (Modern practitioners, widely shared)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'src-modern-practitioners',
    title: 'Modern Vastu Practitioner Guidance',
    author: 'Various contemporary practitioners',
    type: 'practitioner',
    publication: 'Contemporary Vastu advisory',
    url: null,
    license: 'Varies by practitioner',
    reliabilityNotes: 'Modern interpretations widely shared online. Quality varies significantly. Many practitioners agree on core principles but differ on specifics.',
    verificationStatus: 'commonly_repeated',
  },
  {
    id: 'src-community',
    title: 'Community Vastu Knowledge',
    author: 'Cultural community traditions',
    type: 'community',
    publication: 'Regional and family traditions',
    url: null,
    license: 'Cultural knowledge',
    reliabilityNotes: 'Practical knowledge passed through families. May reflect regional variations. Generally consistent with classical texts on major principles.',
    verificationStatus: 'commonly_repeated',
  },

  // ═══════════════════════════════════════════════════════════
  // DISPUTED / CONFLICTING
  // ═══════════════════════════════════════════════════════════
  {
    id: 'src-conflicting-element',
    title: 'Element Association Conflicts',
    author: 'Various traditions',
    type: 'conflict',
    publication: 'Multiple sources with different associations',
    url: null,
    license: 'N/A',
    reliabilityNotes: 'Different Vastu traditions associate different elements with the same direction. For example: East is associated with Water in some traditions and Air in others. West is associated with Air in some and Water in others.',
    verificationStatus: 'disputed',
  },
];

export const getSourceById = (id) => {
  return sources.find(s => s.id === id);
};

export const getSourcesByVerification = (status) => {
  return sources.filter(s => s.verificationStatus === status);
};

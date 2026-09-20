/**
 * Vastu Compass — Database Service
 * 
 * Uses the exported JSON data from SQLite.
 * Works on web and native without WebAssembly.
 */

import vastuData from '../data/vastuEntries.json';

const { entries: ALL_ENTRIES, stats: DB_STATS } = vastuData;

/**
 * Search entries by keyword
 */
export async function searchEntries(query) {
  if (!query || !query.trim()) return ALL_ENTRIES.slice(0, 50);
  
  const searchTerm = query.toLowerCase();
  return ALL_ENTRIES.filter(entry => {
    return (
      (entry.issue_topic && entry.issue_topic.toLowerCase().includes(searchTerm)) ||
      (entry.description && entry.description.toLowerCase().includes(searchTerm)) ||
      (entry.recommendation && entry.recommendation.toLowerCase().includes(searchTerm)) ||
      (entry.remedy && entry.remedy.toLowerCase().includes(searchTerm)) ||
      (entry.subcategory && entry.subcategory.toLowerCase().includes(searchTerm)) ||
      (entry.category && entry.category.toLowerCase().includes(searchTerm))
    );
  });
}

/**
 * Get entries by direction
 */
export async function getEntriesByDirection(direction) {
  const dir = direction.toLowerCase();
  return ALL_ENTRIES.filter(entry => {
    if (!entry.directions) return false;
    const dirs = typeof entry.directions === 'string' ? JSON.parse(entry.directions) : entry.directions;
    return dirs.some(d => d.toLowerCase().includes(dir));
  });
}

/**
 * Get entries by category
 */
export async function getEntriesByCategory(category) {
  return ALL_ENTRIES.filter(entry => entry.category === category);
}

/**
 * Get entries with remedies
 */
export async function getEntriesWithRemedies() {
  return ALL_ENTRIES.filter(entry => entry.remedy && entry.remedy !== 'NULL');
}

/**
 * Get all categories with counts
 */
export async function getCategories() {
  const categoryMap = {};
  ALL_ENTRIES.forEach(entry => {
    if (entry.category) {
      categoryMap[entry.category] = (categoryMap[entry.category] || 0) + 1;
    }
  });
  return Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get database stats
 */
export async function getStats() {
  return DB_STATS;
}

/**
 * Get entry by ID
 */
export async function getEntryById(id) {
  return ALL_ENTRIES.find(entry => entry.id === id) || null;
}

/**
 * Get all entries (limited)
 */
export async function getAllEntries(limit = 50) {
  return ALL_ENTRIES.slice(0, limit);
}
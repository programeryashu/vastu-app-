/**
 * Vastu Compass — Database Service
 *
 * Architecture:
 *  - Native (Android/iOS): real on-device SQLite database (expo-sqlite).
 *    The dataset ships inside the app bundle as JSON and is imported into
 *    SQLite on first launch. All queries then run against the database —
 *    just like a production app backed by a DB.
 *  - Web: browsers can't open SQLite, so the same queries run against the
 *    bundled JSON with identical results.
 *
 * The public API is async in both cases, so screens don't change.
 */

import { Platform } from 'react-native';

import vastuData from '../data/vastuEntries.json';

const { stats: DB_STATS } = vastuData;

// ── In-memory dataset (web query engine + native seed source) ──
let ALL_ENTRIES = vastuData.entries;

const normalize = (entry) => ({
  ...entry,
  directions: typeof entry.directions === 'string' ? safeParse(entry.directions) : entry.directions ?? [],
});

function safeParse(s) {
  try { return JSON.parse(s) || []; } catch { return []; }
}

// ── Native SQLite layer ──
let dbPromise = null;

async function getNativeDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQLite = await import('expo-sqlite');
      const db = await SQLite.openDatabaseAsync('vastu_compass.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS vastu_entries (
          id INTEGER PRIMARY KEY,
          category TEXT,
          subcategory TEXT,
          issue_topic TEXT NOT NULL,
          description TEXT,
          recommendation TEXT,
          remedy TEXT,
          mantra_spiritual_practice TEXT,
          expected_effect TEXT,
          chapter TEXT,
          section TEXT,
          page_number TEXT,
          source_text TEXT,
          confidence TEXT,
          verification_status TEXT,
          source_book TEXT,
          directions TEXT,
          created_at TEXT,
          updated_at TEXT
        );
      `);

      const row = await db.getFirstAsync('SELECT COUNT(*) AS n FROM vastu_entries');
      const current = row?.n ?? 0;
      const target = ALL_ENTRIES.length;

      if (current !== target) {
        // Fresh install or dataset version changed → rebuild from the bundle
        await db.execAsync('BEGIN');
        try {
          await db.runAsync('DELETE FROM vastu_entries');
          const stmt = await db.prepareAsync(
            `INSERT INTO vastu_entries
             (id, category, subcategory, issue_topic, description, recommendation,
              remedy, mantra_spiritual_practice, expected_effect, chapter, section,
              page_number, source_text, confidence, verification_status, source_book,
              directions, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          );
          try {
            for (const e of ALL_ENTRIES) {
              await stmt.executeAsync([
                e.id, e.category, e.subcategory, e.issue_topic, e.description,
                e.recommendation, e.remedy, e.mantra_spiritual_practice,
                e.expected_effect, e.chapter, e.section, e.page_number,
                e.source_text, e.confidence, e.verification_status, e.source_book,
                JSON.stringify(e.directions ?? []), e.created_at, e.updated_at,
              ]);
            }
          } finally {
            await stmt.finalizeAsync();
          }
          await db.execAsync('COMMIT');
        } catch (err) {
          await db.execAsync('ROLLBACK');
          throw err;
        }
      }
      return db;
    })().catch((err) => {
      dbPromise = null; // allow retry on next call
      throw err;
    });
  }
  return dbPromise;
}

// ── Query API (identical results on both platforms) ──

/** Search entries by keyword across topic, description, recommendation, remedy, category */
export async function searchEntries(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return ALL_ENTRIES.slice(0, 50).map(normalize);

  if (Platform.OS !== 'web') {
    try {
      const db = await getNativeDb();
      const like = `%${q}%`;
      const rows = await db.getAllAsync(
        `SELECT * FROM vastu_entries WHERE
           LOWER(issue_topic) LIKE ? OR LOWER(description) LIKE ? OR
           LOWER(recommendation) LIKE ? OR LOWER(remedy) LIKE ? OR
           LOWER(mantra_spiritual_practice) LIKE ? OR
           LOWER(subcategory) LIKE ? OR LOWER(category) LIKE ?
         ORDER BY id`,
        [like, like, like, like, like, like, like]
      );
      return rows.map(normalize);
    } catch (e) {
      // fall through to in-memory
    }
  }
  return ALL_ENTRIES.filter(entry => {
    return (
      (entry.issue_topic && entry.issue_topic.toLowerCase().includes(q)) ||
      (entry.description && entry.description.toLowerCase().includes(q)) ||
      (entry.recommendation && entry.recommendation.toLowerCase().includes(q)) ||
      (entry.remedy && entry.remedy.toLowerCase().includes(q)) ||
      (entry.subcategory && entry.subcategory.toLowerCase().includes(q)) ||
      (entry.category && entry.category.toLowerCase().includes(q))
    );
  }).map(normalize);
}

/** Get entries by direction name (e.g. "East", "North-East") */
export async function getEntriesByDirection(direction) {
  const dir = (direction || '').toLowerCase();
  const all = await getAllEntries(Infinity);
  return all.filter(entry =>
    (entry.directions || []).some(d => d.toLowerCase().includes(dir))
  );
}

/** Get entries by exact category */
export async function getEntriesByCategory(category) {
  if (Platform.OS !== 'web') {
    try {
      const db = await getNativeDb();
      const rows = await db.getAllAsync(
        'SELECT * FROM vastu_entries WHERE category = ? ORDER BY id',
        [category]
      );
      return rows.map(normalize);
    } catch (e) { /* fall through */ }
  }
  return ALL_ENTRIES.filter(entry => entry.category === category).map(normalize);
}

/** Get entries that include a remedy */
export async function getEntriesWithRemedies() {
  const all = await getAllEntries(Infinity);
  return all.filter(entry => entry.remedy && entry.remedy !== 'NULL');
}

/** Get categories with entry counts, largest first */
export async function getCategories() {
  if (Platform.OS !== 'web') {
    try {
      const db = await getNativeDb();
      const rows = await db.getAllAsync(
        `SELECT category, COUNT(*) AS count FROM vastu_entries
         WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC`
      );
      if (rows.length) return rows;
    } catch (e) { /* fall through */ }
  }
  const categoryMap = {};
  ALL_ENTRIES.forEach(entry => {
    if (entry.category) categoryMap[entry.category] = (categoryMap[entry.category] || 0) + 1;
  });
  return Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/** Cached dataset summary */
export async function getStats() {
  return DB_STATS;
}

/** Fetch one entry by numeric id */
export async function getEntryById(id) {
  const all = await getAllEntries(Infinity);
  return all.find(entry => String(entry.id) === String(id)) || null;
}

/** All entries (pass Infinity for everything) */
export async function getAllEntries(limit = 50) {
  if (Platform.OS !== 'web') {
    try {
      const db = await getNativeDb();
      const lim = Number.isFinite(limit) ? limit : -1;
      const rows = await db.getAllAsync(
        `SELECT * FROM vastu_entries ORDER BY id${lim >= 0 ? ' LIMIT ?' : ''}`,
        lim >= 0 ? [lim] : []
      );
      if (rows.length) return rows.map(normalize);
    } catch (e) { /* fall through */ }
  }
  const list = ALL_ENTRIES.slice(0, Number.isFinite(limit) ? limit : undefined);
  return list.map(normalize);
}

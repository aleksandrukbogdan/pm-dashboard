import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

// Create database client
// In production: uses Turso cloud
// In development: can use local SQLite file if TURSO_DATABASE_URL not set
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/dashboard.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Initialize database tables
 * Must be called before using the database
 */
export async function initDatabase() {
  try {
    // Create snapshots table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_start TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        summary TEXT NOT NULL,
        charts TEXT NOT NULL,
        projects TEXT NOT NULL
      )
    `);

    // Create project_history table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS project_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_key TEXT NOT NULL,
        week_start TEXT NOT NULL,
        status TEXT,
        status_changed_at TEXT,
        previous_status TEXT,
        snapshot TEXT NOT NULL,
        UNIQUE(project_key, week_start)
      )
    `);

    // Create indexes
    await db.execute('CREATE INDEX IF NOT EXISTS idx_snapshots_week ON snapshots(week_start)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_history_project ON project_history(project_key)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_history_week ON project_history(week_start)');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export default db;

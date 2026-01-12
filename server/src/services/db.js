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

    // Create users table for authentication
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');

    // Create activity_logs table for tracking user actions
    await db.execute(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        user_name TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_logs_user ON activity_logs(user_id)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at)');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export default db;

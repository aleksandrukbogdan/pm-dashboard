import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../../data/dashboard.db');

// Initialize database
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  -- Weekly snapshots: full dashboard data for a specific week
  CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    summary TEXT NOT NULL,
    charts TEXT NOT NULL,
    projects TEXT NOT NULL
  );

  -- Project history: track changes per project per week
  CREATE TABLE IF NOT EXISTS project_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_key TEXT NOT NULL,
    week_start TEXT NOT NULL,
    status TEXT,
    status_changed_at TEXT,
    previous_status TEXT,
    snapshot TEXT NOT NULL,
    UNIQUE(project_key, week_start)
  );

  -- Create indexes for faster queries
  CREATE INDEX IF NOT EXISTS idx_snapshots_week ON snapshots(week_start);
  CREATE INDEX IF NOT EXISTS idx_history_project ON project_history(project_key);
  CREATE INDEX IF NOT EXISTS idx_history_week ON project_history(week_start);
`);

console.log('Database initialized at:', dbPath);

export default db;

/**
 * Migration script: Local SQLite → Turso
 * 
 * This script migrates all existing data from local SQLite database
 * to Turso cloud database.
 * 
 * Usage:
 * 1. Set environment variables:
 *    - TURSO_DATABASE_URL
 *    - TURSO_AUTH_TOKEN
 * 2. Run: node migrate-to-turso.js
 */

import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    console.log('\nPlease set them in .env file or as environment variables:');
    console.log('  TURSO_DATABASE_URL=libsql://your-db.turso.io');
    console.log('  TURSO_AUTH_TOKEN=your-token');
    process.exit(1);
}

// Source: local SQLite
const localDbPath = path.join(__dirname, 'data/dashboard.db');
console.log(`📂 Local database path: ${localDbPath}`);

let localDb;
try {
    localDb = new Database(localDbPath, { readonly: true });
} catch (error) {
    console.error(`❌ Cannot open local database: ${error.message}`);
    process.exit(1);
}

// Target: Turso
const tursoDb = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
    console.log('🚀 Starting migration to Turso...\n');

    try {
        // Test Turso connection
        await tursoDb.execute('SELECT 1');
        console.log('✅ Connected to Turso\n');
    } catch (error) {
        console.error('❌ Cannot connect to Turso:', error.message);
        process.exit(1);
    }

    // Create tables in Turso
    console.log('📋 Creating tables...');

    await tursoDb.execute(`
        CREATE TABLE IF NOT EXISTS snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week_start TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            summary TEXT NOT NULL,
            charts TEXT NOT NULL,
            projects TEXT NOT NULL
        )
    `);

    await tursoDb.execute(`
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

    await tursoDb.execute('CREATE INDEX IF NOT EXISTS idx_snapshots_week ON snapshots(week_start)');
    await tursoDb.execute('CREATE INDEX IF NOT EXISTS idx_history_project ON project_history(project_key)');
    await tursoDb.execute('CREATE INDEX IF NOT EXISTS idx_history_week ON project_history(week_start)');

    console.log('✅ Tables created\n');

    // Migrate snapshots
    const snapshots = localDb.prepare('SELECT * FROM snapshots').all();
    console.log(`📸 Migrating ${snapshots.length} snapshots...`);

    let snapshotCount = 0;
    for (const s of snapshots) {
        try {
            await tursoDb.execute({
                sql: 'INSERT OR REPLACE INTO snapshots (week_start, created_at, summary, charts, projects) VALUES (?, ?, ?, ?, ?)',
                args: [s.week_start, s.created_at, s.summary, s.charts, s.projects]
            });
            snapshotCount++;
            process.stdout.write(`\r   Progress: ${snapshotCount}/${snapshots.length}`);
        } catch (error) {
            console.error(`\n❌ Error migrating snapshot ${s.week_start}:`, error.message);
        }
    }
    console.log(`\n✅ Migrated ${snapshotCount} snapshots\n`);

    // Migrate project_history
    const history = localDb.prepare('SELECT * FROM project_history').all();
    console.log(`📚 Migrating ${history.length} project history records...`);

    let historyCount = 0;
    for (const h of history) {
        try {
            await tursoDb.execute({
                sql: 'INSERT OR REPLACE INTO project_history (project_key, week_start, status, status_changed_at, previous_status, snapshot) VALUES (?, ?, ?, ?, ?, ?)',
                args: [h.project_key, h.week_start, h.status, h.status_changed_at, h.previous_status, h.snapshot]
            });
            historyCount++;
            if (historyCount % 10 === 0) {
                process.stdout.write(`\r   Progress: ${historyCount}/${history.length}`);
            }
        } catch (error) {
            console.error(`\n❌ Error migrating history for ${h.project_key}:`, error.message);
        }
    }
    console.log(`\n✅ Migrated ${historyCount} project history records\n`);

    // Verify migration
    console.log('🔍 Verifying migration...');
    const { rows: snapshotCheck } = await tursoDb.execute('SELECT COUNT(*) as count FROM snapshots');
    const { rows: historyCheck } = await tursoDb.execute('SELECT COUNT(*) as count FROM project_history');

    console.log(`   Snapshots in Turso: ${snapshotCheck[0].count}`);
    console.log(`   History records in Turso: ${historyCheck[0].count}`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the application with Turso database');
    console.log('2. Deploy to Railway');
    console.log('3. Deploy frontend to Vercel');

    localDb.close();
    process.exit(0);
}

migrate().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});

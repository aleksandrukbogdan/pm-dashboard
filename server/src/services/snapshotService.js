import db from './db.js';
import { getDashboardData } from './dashboardService.js';

/**
 * Get today's date as key for snapshot
 */
function getDateKey(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // Format as YYYY-MM-DD using local date
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
}

/**
 * Format date for display: "10.12.2024"
 */
function formatDateDisplay(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

/**
 * Create a snapshot of the current dashboard data
 */
export async function createSnapshot(spreadsheetId) {
    const dateKey = getDateKey();

    // Get current dashboard data
    const data = await getDashboardData(spreadsheetId);

    // Check if snapshot already exists for today
    const existing = db.prepare('SELECT id FROM snapshots WHERE week_start = ?').get(dateKey);

    if (existing) {
        // Update existing snapshot
        const stmt = db.prepare(`
      UPDATE snapshots 
      SET summary = ?, charts = ?, projects = ?, created_at = CURRENT_TIMESTAMP
      WHERE week_start = ?
    `);
        stmt.run(
            JSON.stringify(data.summary),
            JSON.stringify(data.charts),
            JSON.stringify(data.projects),
            dateKey
        );
    } else {
        // Insert new snapshot
        const stmt = db.prepare(`
      INSERT INTO snapshots (week_start, summary, charts, projects)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(
            dateKey,
            JSON.stringify(data.summary),
            JSON.stringify(data.charts),
            JSON.stringify(data.projects)
        );
    }

    // Update project history
    await updateProjectHistory(data.projects, dateKey);

    console.log(`Snapshot created for date: ${dateKey}`);
    return { success: true, weekStart: dateKey, display: formatDateDisplay(dateKey) };
}

/**
 * Update project history and detect status changes
 */
async function updateProjectHistory(projects, weekStart) {
    const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO project_history 
    (project_key, week_start, status, status_changed_at, previous_status, snapshot)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    // Get previous day's data for comparison
    const prevDateKey = getPreviousDateKey(weekStart);
    const previousHistoryMap = new Map();

    const prevRecords = db.prepare(
        'SELECT project_key, status FROM project_history WHERE week_start = ?'
    ).all(prevDateKey);

    prevRecords.forEach(r => previousHistoryMap.set(r.project_key, r.status));

    // Process each project
    for (const project of projects) {
        const projectKey = `${project.name}|${project.direction}`;
        const currentStatus = project.status || '';
        const previousStatus = previousHistoryMap.get(projectKey) || null;

        // Detect status change
        let statusChangedAt = null;
        if (previousStatus !== null && previousStatus !== currentStatus) {
            statusChangedAt = new Date().toISOString();
        } else if (previousStatus === null) {
            // New project
            statusChangedAt = new Date().toISOString();
        } else {
            // Status unchanged - get previous statusChangedAt
            const prevHistory = db.prepare(
                'SELECT status_changed_at FROM project_history WHERE project_key = ? ORDER BY week_start DESC LIMIT 1'
            ).get(projectKey);
            statusChangedAt = prevHistory?.status_changed_at || new Date().toISOString();
        }

        insertStmt.run(
            projectKey,
            weekStart,
            currentStatus,
            statusChangedAt,
            previousStatus,
            JSON.stringify(project)
        );
    }
}

function getPreviousDateKey(dateKey) {
    const date = new Date(dateKey);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
}

/**
 * Get snapshot for a specific week
 */
export function getSnapshot(weekStart) {
    const row = db.prepare('SELECT * FROM snapshots WHERE week_start = ?').get(weekStart);

    if (!row) {
        return null;
    }

    return {
        weekStart: row.week_start,
        createdAt: row.created_at,
        display: formatDateDisplay(row.week_start),
        summary: JSON.parse(row.summary),
        charts: JSON.parse(row.charts),
        projects: JSON.parse(row.projects)
    };
}

/**
 * Get list of all available snapshots (dates)
 */
export function getAvailableWeeks() {
    const rows = db.prepare(
        'SELECT week_start, created_at FROM snapshots ORDER BY week_start DESC'
    ).all();

    const currentDateKey = getDateKey();

    return rows.map(row => ({
        weekStart: row.week_start,
        display: formatDateDisplay(row.week_start),
        createdAt: row.created_at,
        isCurrent: row.week_start === currentDateKey
    }));
}

/**
 * Get project history (all snapshots for a project)
 */
export function getProjectHistory(projectKey) {
    const rows = db.prepare(`
    SELECT week_start, status, status_changed_at, previous_status, snapshot
    FROM project_history 
    WHERE project_key = ?
    ORDER BY week_start DESC
  `).all(projectKey);

    return rows.map(row => ({
        weekStart: row.week_start,
        display: formatDateDisplay(row.week_start),
        status: row.status,
        statusChangedAt: row.status_changed_at,
        previousStatus: row.previous_status,
        snapshot: JSON.parse(row.snapshot)
    }));
}

/**
 * Calculate how long a project has been on its current status (in days)
 */
export function calculateStatusDuration(projectKey) {
    const history = db.prepare(`
    SELECT status_changed_at FROM project_history 
    WHERE project_key = ?
    ORDER BY week_start DESC
    LIMIT 1
  `).get(projectKey);

    if (!history?.status_changed_at) {
        return null;
    }

    const changedAt = new Date(history.status_changed_at);
    const now = new Date();
    const diffMs = now - changedAt;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Get status durations for multiple projects
 */
export function getStatusDurations(projectKeys) {
    const durations = {};

    for (const key of projectKeys) {
        durations[key] = calculateStatusDuration(key);
    }

    return durations;
}

/**
 * Delete a snapshot for a specific week
 */
export function deleteSnapshot(weekStart) {
    // Delete from snapshots table
    const result = db.prepare('DELETE FROM snapshots WHERE week_start = ?').run(weekStart);

    // Also delete related project history
    db.prepare('DELETE FROM project_history WHERE week_start = ?').run(weekStart);

    console.log(`Deleted snapshot for week: ${weekStart}`);
    return { success: result.changes > 0, weekStart };
}

export { getDateKey, formatDateDisplay };


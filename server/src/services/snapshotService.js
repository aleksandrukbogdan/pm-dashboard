import db from './db.js';
import { getDashboardData } from './dashboardService.js';

/**
 * Get the start of the week (Monday) for a given date
 */
function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    // Format as YYYY-MM-DD using local date (not UTC!)
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(monday.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
}

/**
 * Format week for display: "Неделя 49 (02.12 - 08.12.2024)"
 */
function formatWeekDisplay(weekStart) {
    // Parse as local date to avoid timezone shifts
    const [year, month, day] = weekStart.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day + 6);

    const weekNumber = getWeekNumber(start);
    const startStr = formatDateRu(start);
    const endStr = formatDateRu(end);

    return `Неделя ${weekNumber} (${startStr} - ${endStr})`;
}

function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function formatDateRu(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

/**
 * Create a snapshot of the current dashboard data
 */
export async function createSnapshot(spreadsheetId) {
    const weekStart = getWeekStart();

    // Get current dashboard data
    const data = await getDashboardData(spreadsheetId);

    // Check if snapshot already exists for this week
    const existing = db.prepare('SELECT id FROM snapshots WHERE week_start = ?').get(weekStart);

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
            weekStart
        );
    } else {
        // Insert new snapshot
        const stmt = db.prepare(`
      INSERT INTO snapshots (week_start, summary, charts, projects)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(
            weekStart,
            JSON.stringify(data.summary),
            JSON.stringify(data.charts),
            JSON.stringify(data.projects)
        );
    }

    // Update project history
    await updateProjectHistory(data.projects, weekStart);

    console.log(`Snapshot created for week: ${weekStart}`);
    return { success: true, weekStart, display: formatWeekDisplay(weekStart) };
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

    // Get previous week data for comparison
    const prevWeekStart = getPreviousWeekStart(weekStart);
    const previousHistoryMap = new Map();

    const prevRecords = db.prepare(
        'SELECT project_key, status FROM project_history WHERE week_start = ?'
    ).all(prevWeekStart);

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

function getPreviousWeekStart(weekStart) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() - 7);
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
        display: formatWeekDisplay(row.week_start),
        summary: JSON.parse(row.summary),
        charts: JSON.parse(row.charts),
        projects: JSON.parse(row.projects)
    };
}

/**
 * Get list of all available weeks
 */
export function getAvailableWeeks() {
    const rows = db.prepare(
        'SELECT week_start, created_at FROM snapshots ORDER BY week_start DESC'
    ).all();

    const currentWeekStart = getWeekStart();

    return rows.map(row => ({
        weekStart: row.week_start,
        display: formatWeekDisplay(row.week_start),
        createdAt: row.created_at,
        isCurrent: row.week_start === currentWeekStart
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
        display: formatWeekDisplay(row.week_start),
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

export { getWeekStart, formatWeekDisplay };


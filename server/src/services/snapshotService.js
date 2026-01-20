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
    const { rows: existingRows } = await db.execute({
        sql: 'SELECT id FROM snapshots WHERE week_start = ?',
        args: [dateKey]
    });
    const existing = existingRows[0];

    if (existing) {
        // Update existing snapshot
        await db.execute({
            sql: `UPDATE snapshots 
                  SET summary = ?, charts = ?, projects = ?, created_at = CURRENT_TIMESTAMP
                  WHERE week_start = ?`,
            args: [
                JSON.stringify(data.summary),
                JSON.stringify(data.charts),
                JSON.stringify(data.projects),
                dateKey
            ]
        });
    } else {
        // Insert new snapshot
        await db.execute({
            sql: `INSERT INTO snapshots (week_start, summary, charts, projects)
                  VALUES (?, ?, ?, ?)`,
            args: [
                dateKey,
                JSON.stringify(data.summary),
                JSON.stringify(data.charts),
                JSON.stringify(data.projects)
            ]
        });
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
    // Get the LAST available snapshot's data for comparison (not just previous day)
    const { rows: lastSnapshotRows } = await db.execute({
        sql: `SELECT week_start FROM project_history 
              WHERE week_start < ? 
              ORDER BY week_start DESC LIMIT 1`,
        args: [weekStart]
    });

    const lastAvailableWeekStart = lastSnapshotRows[0]?.week_start;
    const previousHistoryMap = new Map();

    if (lastAvailableWeekStart) {
        const { rows: prevRecords } = await db.execute({
            sql: 'SELECT project_key, status, status_changed_at FROM project_history WHERE week_start = ?',
            args: [lastAvailableWeekStart]
        });
        prevRecords.forEach(r => previousHistoryMap.set(r.project_key, {
            status: r.status,
            statusChangedAt: r.status_changed_at
        }));
    }

    // Process each project
    for (const project of projects) {
        const projectKey = `${project.name}|${project.direction}`;
        const currentStatus = project.status || '';
        const previousData = previousHistoryMap.get(projectKey);
        const previousStatus = previousData?.status || null;

        // Detect status change
        let statusChangedAt = null;
        if (previousStatus !== null && previousStatus !== currentStatus) {
            // Status actually changed - set new date
            statusChangedAt = new Date().toISOString();
        } else if (previousStatus === null) {
            // New project - but check if we have any history at all for this project
            const { rows: prevHistoryRows } = await db.execute({
                sql: 'SELECT status_changed_at FROM project_history WHERE project_key = ? ORDER BY week_start DESC LIMIT 1',
                args: [projectKey]
            });
            const prevHistory = prevHistoryRows[0];
            statusChangedAt = prevHistory?.status_changed_at || new Date().toISOString();
        } else {
            // Status unchanged - preserve previous statusChangedAt
            statusChangedAt = previousData?.statusChangedAt || new Date().toISOString();
        }

        await db.execute({
            sql: `INSERT OR REPLACE INTO project_history 
                  (project_key, week_start, status, status_changed_at, previous_status, snapshot)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [
                projectKey,
                weekStart,
                currentStatus,
                statusChangedAt,
                previousStatus,
                JSON.stringify(project)
            ]
        });
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
export async function getSnapshot(weekStart) {
    const { rows } = await db.execute({
        sql: 'SELECT * FROM snapshots WHERE week_start = ?',
        args: [weekStart]
    });
    const row = rows[0];

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
export async function getAvailableWeeks() {
    const { rows } = await db.execute(
        'SELECT week_start, created_at FROM snapshots ORDER BY week_start DESC'
    );

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
export async function getProjectHistory(projectKey) {
    const { rows } = await db.execute({
        sql: `SELECT week_start, status, status_changed_at, previous_status, snapshot
              FROM project_history 
              WHERE project_key = ?
              ORDER BY week_start DESC`,
        args: [projectKey]
    });

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
export async function calculateStatusDuration(projectKey) {
    const { rows } = await db.execute({
        sql: `SELECT status_changed_at FROM project_history 
              WHERE project_key = ?
              ORDER BY week_start DESC
              LIMIT 1`,
        args: [projectKey]
    });
    const history = rows[0];

    if (!history?.status_changed_at) {
        return null;
    }

    const changedAt = new Date(history.status_changed_at);
    const now = new Date();

    // Calculate calendar days difference (not full 24-hour periods)
    // This means: changed yesterday = 1 day, changed 2 days ago = 2 days, etc.
    const changedAtDate = new Date(changedAt.getFullYear(), changedAt.getMonth(), changedAt.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = nowDate - changedAtDate;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Get status durations for multiple projects - OPTIMIZED
 * Uses a single SQL query instead of N separate queries
 */
export async function getStatusDurations(projectKeys) {
    if (!projectKeys || projectKeys.length === 0) {
        return {};
    }


    // Build query with placeholders for all keys
    const placeholders = projectKeys.map(() => '?').join(', ');

    // Get latest status_changed_at for each project in a single query
    // Using subquery to get the latest record per project_key
    const { rows } = await db.execute({
        sql: `SELECT project_key, status_changed_at 
              FROM project_history 
              WHERE project_key IN (${placeholders})
              AND week_start = (
                  SELECT MAX(week_start) 
                  FROM project_history ph2 
                  WHERE ph2.project_key = project_history.project_key
              )`,
        args: projectKeys
    });


    // Calculate durations for each project
    const durations = {};
    const now = new Date();
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Initialize all keys with null
    projectKeys.forEach(key => {
        durations[key] = null;
    });

    // Fill in actual durations from query results
    rows.forEach(row => {
        if (row.status_changed_at) {
            const changedAt = new Date(row.status_changed_at);
            const changedAtDate = new Date(changedAt.getFullYear(), changedAt.getMonth(), changedAt.getDate());
            const diffMs = nowDate - changedAtDate;
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            durations[row.project_key] = diffDays;
        }
    });


    return durations;
}

/**
 * Delete a snapshot for a specific week
 */
export async function deleteSnapshot(weekStart) {
    // Delete from snapshots table
    const result = await db.execute({
        sql: 'DELETE FROM snapshots WHERE week_start = ?',
        args: [weekStart]
    });

    // Also delete related project history
    await db.execute({
        sql: 'DELETE FROM project_history WHERE week_start = ?',
        args: [weekStart]
    });

    console.log(`Deleted snapshot for week: ${weekStart}`);
    return { success: result.rowsAffected > 0, weekStart };
}

export { getDateKey, formatDateDisplay };

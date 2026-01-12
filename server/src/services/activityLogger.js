import db from './db.js';

/**
 * Log user activity to database
 * @param {Object} params - Log parameters
 * @param {number} params.userId - User ID
 * @param {string} params.username - Username
 * @param {string} params.userName - Display name
 * @param {string} params.action - Action performed (e.g., 'login', 'view_dashboard', 'create_snapshot')
 * @param {string} [params.details] - Additional details about the action
 * @param {string} [params.ipAddress] - IP address of the user
 */
export async function logActivity({ userId, username, userName, action, details = null, ipAddress = null }) {
    try {
        await db.execute({
            sql: `INSERT INTO activity_logs (user_id, username, user_name, action, details, ip_address) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            args: [userId, username, userName, action, details, ipAddress]
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - logging should not break the app
    }
}

/**
 * Get activity logs with optional filters
 * @param {Object} [options] - Query options
 * @param {number} [options.limit=100] - Max number of logs to return
 * @param {number} [options.userId] - Filter by user ID
 * @param {string} [options.action] - Filter by action type
 * @param {string} [options.since] - Get logs since this date (ISO string)
 */
export async function getActivityLogs({ limit = 100, userId, action, since } = {}) {
    let sql = 'SELECT * FROM activity_logs WHERE 1=1';
    const args = [];

    if (userId) {
        sql += ' AND user_id = ?';
        args.push(userId);
    }

    if (action) {
        sql += ' AND action = ?';
        args.push(action);
    }

    if (since) {
        sql += ' AND created_at >= ?';
        args.push(since);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    args.push(limit);

    const result = await db.execute({ sql, args });
    return result.rows;
}

/**
 * Get activity summary (counts by action type)
 */
export async function getActivitySummary() {
    const result = await db.execute(`
    SELECT action, COUNT(*) as count 
    FROM activity_logs 
    GROUP BY action 
    ORDER BY count DESC
  `);
    return result.rows;
}

export default { logActivity, getActivityLogs, getActivitySummary };

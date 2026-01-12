import express from 'express';
import { getActivityLogs, getActivitySummary } from '../services/activityLogger.js';

const router = express.Router();

/**
 * GET /api/logs
 * Get activity logs (admin only for now, but can add role check later)
 */
router.get('/', async (req, res) => {
    try {
        const { limit, userId, action, since } = req.query;

        const logs = await getActivityLogs({
            limit: limit ? parseInt(limit) : 100,
            userId: userId ? parseInt(userId) : undefined,
            action,
            since
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

/**
 * GET /api/logs/summary
 * Get activity summary by action type
 */
router.get('/summary', async (req, res) => {
    try {
        const summary = await getActivitySummary();
        res.json(summary);
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

export default router;

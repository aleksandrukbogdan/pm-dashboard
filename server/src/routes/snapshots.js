import express from 'express';
import {
    createSnapshot,
    getSnapshot,
    getAvailableWeeks,
    getProjectHistory,
    getStatusDurations,
    deleteSnapshot
} from '../services/snapshotService.js';
import { createImmediateSnapshot, SPREADSHEET_ID } from '../services/scheduler.js';

const router = express.Router();

/**
 * GET /api/snapshots/weeks
 * Get list of all available weeks with snapshots
 */
router.get('/weeks', (req, res) => {
    try {
        const weeks = getAvailableWeeks();
        res.json(weeks);
    } catch (error) {
        console.error('Error getting weeks:', error);
        res.status(500).json({ error: 'Failed to get available weeks' });
    }
});

/**
 * GET /api/snapshots/:weekStart
 * Get snapshot data for a specific week
 */
router.get('/:weekStart', (req, res) => {
    try {
        const { weekStart } = req.params;
        const snapshot = getSnapshot(weekStart);

        if (!snapshot) {
            return res.status(404).json({ error: 'Snapshot not found for this week' });
        }

        res.json(snapshot);
    } catch (error) {
        console.error('Error getting snapshot:', error);
        res.status(500).json({ error: 'Failed to get snapshot' });
    }
});

/**
 * POST /api/snapshots/create
 * Create a new snapshot for the current week
 */
router.post('/create', async (req, res) => {
    try {
        const result = await createImmediateSnapshot();
        res.json(result);
    } catch (error) {
        console.error('Error creating snapshot:', error);
        res.status(500).json({ error: 'Failed to create snapshot' });
    }
});

/**
 * GET /api/snapshots/projects/:projectKey/history
 * Get history for a specific project
 */
router.get('/projects/:projectKey/history', (req, res) => {
    try {
        const { projectKey } = req.params;
        const history = getProjectHistory(decodeURIComponent(projectKey));
        res.json(history);
    } catch (error) {
        console.error('Error getting project history:', error);
        res.status(500).json({ error: 'Failed to get project history' });
    }
});

/**
 * POST /api/snapshots/status-durations
 * Get status durations for multiple projects
 */
router.post('/status-durations', (req, res) => {
    try {
        const { projectKeys } = req.body;

        if (!Array.isArray(projectKeys)) {
            return res.status(400).json({ error: 'projectKeys must be an array' });
        }

        const durations = getStatusDurations(projectKeys);
        res.json(durations);
    } catch (error) {
        console.error('Error getting status durations:', error);
        res.status(500).json({ error: 'Failed to get status durations' });
    }
});

/**
 * DELETE /api/snapshots/:weekStart
 * Delete a snapshot for a specific week
 */
router.delete('/:weekStart', (req, res) => {
    try {
        const { weekStart } = req.params;
        const result = deleteSnapshot(weekStart);

        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Snapshot not found' });
        }
    } catch (error) {
        console.error('Error deleting snapshot:', error);
        res.status(500).json({ error: 'Failed to delete snapshot' });
    }
});

export default router;


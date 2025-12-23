import { Router } from 'express';
import { getDashboardData, invalidateDashboardCache } from '../services/dashboardService.js';

const router = Router();

// Get aggregated dashboard data
router.get('/:spreadsheetId', async (req, res) => {
    try {
        const { spreadsheetId } = req.params;
        const data = await getDashboardData(spreadsheetId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Force refresh data (invalidate cache)
router.post('/:spreadsheetId/refresh', async (req, res) => {
    try {
        const { spreadsheetId } = req.params;
        invalidateDashboardCache(spreadsheetId);
        const data = await getDashboardData(spreadsheetId, true);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

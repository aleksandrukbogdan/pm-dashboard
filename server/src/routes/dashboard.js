import { Router } from 'express';
import { getDashboardData } from '../services/dashboardService.js';

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

export default router;

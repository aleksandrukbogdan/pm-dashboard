import cron from 'node-cron';
import { createSnapshot } from './snapshotService.js';

// Default spreadsheet ID (can be configured via env)
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wqIvBBVGWFAlqYD42yYLm859h6uCWGBnCkUq5rv0ZeQ';

/**
 * Initialize the scheduler for daily snapshots
 * Runs every day at 00:00
 */
export function initScheduler() {
    // Schedule: At 00:00 every day
    cron.schedule('0 0 * * *', async () => {
        console.log('Daily snapshot scheduled task running...');
        try {
            const result = await createSnapshot(SPREADSHEET_ID);
            console.log(`Daily snapshot completed: ${result.display}`);
        } catch (error) {
            console.error('Daily snapshot failed:', error);
        }
    });

    console.log('Scheduler initialized: Daily snapshots every day at 00:00');
}

/**
 * Create an immediate snapshot (for manual trigger)
 */
export async function createImmediateSnapshot() {
    console.log('Creating immediate snapshot...');
    try {
        const result = await createSnapshot(SPREADSHEET_ID);
        console.log(`Immediate snapshot completed: ${result.display}`);
        return result;
    } catch (error) {
        console.error('Immediate snapshot failed:', error);
        throw error;
    }
}

export { SPREADSHEET_ID };

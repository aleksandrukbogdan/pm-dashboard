import cron from 'node-cron';
import { createSnapshot } from './snapshotService.js';

// Default spreadsheet ID (can be configured via env)
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1wqIvBBVGWFAlqYD42yYLm859h6uCWGBnCkUq5rv0ZeQ';

/**
 * Initialize the scheduler for weekly snapshots
 * Runs every Monday at 00:00
 */
export function initScheduler() {
    // Schedule: At 00:00 on Monday
    cron.schedule('0 0 * * 1', async () => {
        console.log('Weekly snapshot scheduled task running...');
        try {
            const result = await createSnapshot(SPREADSHEET_ID);
            console.log(`Weekly snapshot completed: ${result.display}`);
        } catch (error) {
            console.error('Weekly snapshot failed:', error);
        }
    });

    console.log('Scheduler initialized: Weekly snapshots every Monday at 00:00');
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

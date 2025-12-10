import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sheetsRoutes from './routes/sheets.js';
import dashboardRoutes from './routes/dashboard.js';
import snapshotsRoutes from './routes/snapshots.js';
import { initScheduler } from './services/scheduler.js';
import { initDatabase } from './services/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sheets', sheetsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/snapshots', snapshotsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and start server
async function start() {
  try {
    // Initialize database tables
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);

      // Initialize the daily snapshot scheduler
      initScheduler();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

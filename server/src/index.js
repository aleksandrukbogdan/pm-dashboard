import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sheetsRoutes from './routes/sheets.js';
import dashboardRoutes from './routes/dashboard.js';
import snapshotsRoutes from './routes/snapshots.js';
import authRoutes from './routes/auth.js';
import logsRoutes from './routes/logs.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import activityLogger from './middleware/activityLogger.js';
import { initScheduler } from './services/scheduler.js';
import { initDatabase } from './services/db.js';
import { seedUsers } from './services/seedUsers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
}

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected API Routes with activity logging
app.use('/api/sheets', authMiddleware, activityLogger('view_sheets'), sheetsRoutes);
app.use('/api/dashboard', authMiddleware, activityLogger('view_dashboard'), dashboardRoutes);
app.use('/api/snapshots', authMiddleware, activityLogger('view_snapshots'), snapshotsRoutes);
app.use('/api/logs', authMiddleware, logsRoutes);

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Initialize database and start server
async function start() {
  try {
    // Initialize database tables
    await initDatabase();

    // Seed default users
    await seedUsers();

    // Check if we need to create an initial snapshot
    const db = (await import('./services/db.js')).default;
    const { rows } = await db.execute('SELECT COUNT(*) as count FROM project_history');
    const historyCount = rows[0]?.count || 0;

    if (historyCount === 0) {
      console.log('No project history found. Creating initial snapshot...');
      const { createImmediateSnapshot } = await import('./services/scheduler.js');
      try {
        await createImmediateSnapshot();
        console.log('Initial snapshot created successfully');
      } catch (error) {
        console.error('Failed to create initial snapshot:', error);
      }
    }

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


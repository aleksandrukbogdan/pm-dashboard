import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sheetsRoutes from './routes/sheets.js';
import dashboardRoutes from './routes/dashboard.js';
import snapshotsRoutes from './routes/snapshots.js';
import { initScheduler } from './services/scheduler.js';
import { initDatabase } from './services/db.js';

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

// API Routes
app.use('/api/sheets', sheetsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/snapshots', snapshotsRoutes);

// Health check
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

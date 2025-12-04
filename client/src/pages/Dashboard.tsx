import { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import { DashboardService, DashboardData } from '../services/DashboardService';
import ProjectsOverview from '../components/dashboard/ProjectsOverview';
import Deadlines from '../components/dashboard/Deadlines';
import Finances from '../components/dashboard/Finances';
import StatusChart from '../components/dashboard/StatusChart';
import TeamGrid from '../components/dashboard/TeamGrid';

interface DashboardProps {
  spreadsheetId: string;
}

export default function Dashboard({ spreadsheetId }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await DashboardService.getDashboardData(spreadsheetId);
        setData(dashboardData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    if (spreadsheetId) {
      fetchData();
    }
  }, [spreadsheetId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
          НИР↔ЦЕНТР
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Placeholder for date picker/filters */}
          <Typography variant="body2" color="text.secondary">29.03.2025</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Top Row: Projects & Deadlines */}
        <Grid item xs={12} md={6}>
          <ProjectsOverview
            totalProjects={data.summary.totalProjects}
            byDirection={data.charts.byDirection}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction="column" sx={{ height: '100%' }}>
            <Grid item xs={6}>
              <Deadlines stats={data.charts.deadlines} />
            </Grid>
            <Grid item xs={6}>
              <Finances totalBudget={data.summary.totalBudget} />
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom Row: Status & Team */}
        <Grid item xs={12} md={6}>
          <StatusChart byStatus={data.charts.byStatus} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TeamGrid teamRoles={data.charts.teamRoles} />
        </Grid>
      </Grid>
    </Box>
  );
}

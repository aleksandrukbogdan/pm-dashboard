import { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { DashboardService, DashboardData } from '../services/DashboardService';
import ProjectsOverview from '../components/dashboard/ProjectsOverview';
import Deadlines from '../components/dashboard/Deadlines';
import Finances from '../components/dashboard/Finances';
import StatusChart from '../components/dashboard/StatusChart';
import TeamGrid from '../components/dashboard/TeamGrid';
import ProjectRegistry from '../components/dashboard/ProjectRegistry';

interface DashboardProps {
  spreadsheetId: string;
}

export default function Dashboard({ spreadsheetId }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);

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

  // Filter projects based on selected direction
  const filteredProjects = useMemo(() => {
    if (!data) return [];
    if (!selectedDirection) return data.projects;
    return data.projects.filter(p => p.direction === selectedDirection);
  }, [data, selectedDirection]);

  // Recalculate stats based on filtered projects
  const filteredStats = useMemo(() => {
    if (!data) return null;

    const projects = filteredProjects;

    // Calculate byStatus from filtered projects
    const byStatus: Record<string, number> = {};
    projects.forEach(p => {
      const status = p.status?.trim() || 'Unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // Calculate teamRoles from filtered projects
    const teamRoles: Record<string, number> = {};
    const seenMembers = new Set<string>();
    projects.forEach(p => {
      p.team?.forEach((member: any) => {
        if (member.name && member.role) {
          const key = `${member.name}|${member.role}`;
          if (!seenMembers.has(key)) {
            teamRoles[member.role] = (teamRoles[member.role] || 0) + 1;
            seenMembers.add(key);
          }
        }
      });
    });

    // Calculate deadlines from filtered projects
    const deadlines = {
      onTrack: 0,
      overdueSmall: 0,
      overdueLarge: 0,
      completed: 0
    };

    projects.forEach(p => {
      const status = calculateDeadlineStatus(p.endDate, p.status);
      if (status === 'Completed') deadlines.completed++;
      else if (status === 'On Track') deadlines.onTrack++;
      else if (status === 'Overdue < 2 weeks') deadlines.overdueSmall++;
      else if (status === 'Overdue > 2 weeks') deadlines.overdueLarge++;
    });

    // Calculate total budget from filtered projects
    let totalBudget = 0;
    projects.forEach(p => {
      const costStr = p.totalCost || p.financials?.cost;
      if (costStr && !costStr.includes('http') && !costStr.match(/\d{2}\.\d{2}/)) {
        const cleanStr = costStr.replace(/р\./g, '').replace(/[^0-9,.-]/g, '').replace(',', '.');
        const val = parseFloat(cleanStr);
        if (!isNaN(val)) totalBudget += val;
      }
    });

    // Calculate byType from filtered projects
    const byType = { internal: 0, commercial: 0, free: 0 };
    projects.forEach(p => {
      const type = p.type?.toLowerCase().trim() || '';
      if (type.includes('внутренний')) byType.internal++;
      else if (type.includes('коммерческий')) byType.commercial++;
      else if (type.includes('безоплатный') || type.includes('бесплатный')) byType.free++;
    });

    // Calculate byCompany from filtered projects
    const byCompany = { ite29: 0, nir: 0 };
    projects.forEach(p => {
      const hasIte29 = p.team?.some((m: any) => {
        const emp = m.employment?.toLowerCase() || '';
        return emp.includes('итэ') || emp.includes('it-') || emp.includes('элемент');
      });
      const hasNir = p.team?.some((m: any) => {
        const emp = m.employment?.toLowerCase() || '';
        return emp.includes('нир');
      });
      if (hasIte29) byCompany.ite29++;
      if (hasNir) byCompany.nir++;
    });

    return {
      byStatus,
      teamRoles,
      deadlines,
      totalBudget,
      byType,
      byCompany,
      totalProjects: projects.length,
      totalTeamMembers: seenMembers.size
    };
  }, [filteredProjects, data]);

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

  if (!data || !filteredStats) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            НИР↔ЦЕНТР
          </Typography>
          {selectedDirection && (
            <Chip
              label={`Фильтр: ${selectedDirection}`}
              onDelete={() => setSelectedDirection(null)}
              color="primary"
              size="small"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">29.03.2025</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Top Row: Projects & Deadlines */}
        <Grid item xs={12} md={6}>
          <ProjectsOverview
            totalProjects={selectedDirection ? filteredStats.totalProjects : data.summary.totalProjects}
            byDirection={data.charts.byDirection}
            byType={selectedDirection ? filteredStats.byType : data.charts.byType}
            byCompany={selectedDirection ? filteredStats.byCompany : data.charts.byCompany}
            selectedDirection={selectedDirection}
            onDirectionClick={setSelectedDirection}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Deadlines stats={filteredStats.deadlines} />
            </Grid>
            <Grid item xs={12}>
              <Finances totalBudget={filteredStats.totalBudget} />
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom Row: Status & Team */}
        <Grid item xs={12} md={6}>
          <StatusChart byStatus={filteredStats.byStatus} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TeamGrid teamRoles={filteredStats.teamRoles} />
        </Grid>

        {/* Project Registry */}
        <Grid item xs={12}>
          <ProjectRegistry projects={filteredProjects} />
        </Grid>
      </Grid>
    </Box>
  );
}

// Helper function to calculate deadline status
function calculateDeadlineStatus(endDateStr: string, status: string): string {
  if (!endDateStr || endDateStr === '-') return 'No Deadline';

  const parts = endDateStr.split('.');
  if (parts.length !== 3) return 'Invalid Date';

  const endDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  if (isNaN(endDate.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffTime = now.getTime() - endDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const statusLower = status?.toLowerCase() || '';
  if (statusLower.includes('завершен') || statusLower.includes('на поддержке') || statusLower.includes('готов')) {
    return 'Completed';
  }

  if (diffDays <= 0) {
    return 'On Track';
  } else if (diffDays <= 14) {
    return 'Overdue < 2 weeks';
  } else {
    return 'Overdue > 2 weeks';
  }
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Grid, CircularProgress, Alert, Chip } from '@mui/material';
import { DashboardService, DashboardData } from '../services/DashboardService';
import ProjectsOverview from '../components/dashboard/ProjectsOverview';
import Deadlines from '../components/dashboard/Deadlines';
import Finances from '../components/dashboard/Finances';
import StatusChart from '../components/dashboard/StatusChart';
import TeamGrid from '../components/dashboard/TeamGrid';
import ProjectRegistry from '../components/dashboard/ProjectRegistry';
import { OrganizationFilter } from '../App';

interface DashboardProps {
  spreadsheetId: string;
  organizationFilter: OrganizationFilter;
  showCompleted: boolean;
  selectedWeek: string | null;
  refreshTrigger?: number;
}

export default function Dashboard({ spreadsheetId, organizationFilter, showCompleted, selectedWeek, refreshTrigger }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDeadlineStatus, setSelectedDeadlineStatus] = useState<string | null>(null);
  const [statusDurations, setStatusDurations] = useState<Record<string, number | null>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      let dashboardData: DashboardData;

      if (selectedWeek) {
        // Fetch snapshot data for selected week
        const snapshot = await DashboardService.getSnapshotData(selectedWeek);
        dashboardData = {
          summary: snapshot.summary,
          charts: snapshot.charts,
          projects: snapshot.projects
        };
      } else {
        // Fetch live data
        dashboardData = await DashboardService.getDashboardData(spreadsheetId);
      }

      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId, selectedWeek]);

  useEffect(() => {
    if (spreadsheetId) {
      fetchData();
    }
  }, [spreadsheetId, selectedWeek, refreshTrigger, fetchData]);

  // Filter projects based on selected direction, organization filter, and completed status
  const filteredProjects = useMemo(() => {
    if (!data) return [];

    let projects = data.projects;

    // Filter by direction if selected
    if (selectedDirection) {
      projects = projects.filter(p => p.direction === selectedDirection);
    }

    // Filter by status if selected (case-insensitive)
    if (selectedStatus) {
      const lowerSelectedStatus = selectedStatus.toLowerCase().trim();
      projects = projects.filter(p => (p.status?.toLowerCase().trim() || '') === lowerSelectedStatus);
    }

    // Filter by deadline status if selected
    if (selectedDeadlineStatus) {
      projects = projects.filter(p => {
        const deadlineStatus = calculateDeadlineStatus(p.endDate, p.status);
        return deadlineStatus === selectedDeadlineStatus;
      });
    }

    // Filter by organization based on executor (Компания исполнитель)
    if (organizationFilter !== 'all') {
      projects = projects.filter(p => {
        const executor = (p.executor || '').toLowerCase();
        if (organizationFilter === 'nir') {
          return executor.includes('нир');
        } else if (organizationFilter === 'ite29') {
          return executor.includes('итэ') || executor.includes('it-') || executor.includes('элемент') || executor.includes('ите-29');
        }
        return true;
      });
    }

    // Filter completed projects
    if (!showCompleted) {
      projects = projects.filter(p => {
        const status = p.status?.toLowerCase() || '';
        return !status.includes('завершен') && !status.includes('на поддержке') && !status.includes('готов');
      });
    }

    return projects;
  }, [data, selectedDirection, selectedStatus, selectedDeadlineStatus, organizationFilter, showCompleted]);

  // Fetch status durations for filtered projects
  useEffect(() => {
    const fetchDurations = async () => {
      if (!filteredProjects || filteredProjects.length === 0) {
        setStatusDurations({});
        return;
      }

      try {
        const projectKeys = filteredProjects.map((p: any) => `${p.name}|${p.direction}`);
        const durations = await DashboardService.getStatusDurations(projectKeys);
        setStatusDurations(durations);
      } catch (err) {
        console.error('Failed to fetch status durations:', err);
        setStatusDurations({});
      }
    };

    fetchDurations();
  }, [filteredProjects]);

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

    // Calculate teamRoles and collect team members from filtered projects
    const teamRoles: Record<string, number> = {};
    const teamMembers: { name: string; role: string }[] = [];
    const seenMembers = new Set<string>();
    projects.forEach(p => {
      p.team?.forEach((member: any) => {
        if (member.name && member.role) {
          const key = `${member.name}|${member.role}`;
          if (!seenMembers.has(key)) {
            teamRoles[member.role] = (teamRoles[member.role] || 0) + 1;
            teamMembers.push({ name: member.name, role: member.role });
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

    // Calculate total budget and financial breakdown from filtered projects
    const parseCost = (costStr: string) => {
      if (!costStr) return 0;
      if (costStr.includes('http') || costStr.match(/\d{2}\.\d{2}/)) return 0;
      const cleanStr = costStr.replace(/р\./g, '').replace(/[^0-9,.-]/g, '').replace(',', '.');
      const val = parseFloat(cleanStr);
      return isNaN(val) ? 0 : val;
    };

    const financialBreakdown = { total: 0, inWork: 0, receivable: 0, paid: 0 };
    projects.forEach(p => {
      const costStr = p.totalCost || p.financials?.cost;
      const cost = parseCost(costStr);
      const paymentStatus = (p.paymentStatus || '').toLowerCase().trim();

      financialBreakdown.total += cost;

      if (paymentStatus.includes('оплачено')) {
        financialBreakdown.paid += cost;
      } else if (paymentStatus.includes('счет выставлен')) {
        financialBreakdown.receivable += cost;
      } else {
        financialBreakdown.inWork += cost;
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

    // Calculate byCompany from filtered projects based on executor (Компания исполнитель)
    const byCompany = { ite29: 0, nir: 0 };
    projects.forEach(p => {
      const executor = (p.executor || '').toLowerCase();
      const isIte29 = executor.includes('итэ') || executor.includes('it-') || executor.includes('элемент') || executor.includes('ите-29');
      const isNir = executor.includes('нир');
      if (isIte29) byCompany.ite29++;
      if (isNir) byCompany.nir++;
    });

    // Calculate byDirection from filtered projects, but keep all original directions
    // This ensures directions with 0 projects after filtering are shown dimmed, not removed
    const byDirection: Record<string, number> = {};

    // First, get all original directions from unfiltered data
    const originalDirections = Object.keys(data?.charts?.byDirection || {});
    originalDirections.forEach(dir => {
      byDirection[dir] = 0; // Initialize all with 0
    });

    // Then count from filtered projects
    projects.forEach(p => {
      const dir = p.direction || 'Другое';
      byDirection[dir] = (byDirection[dir] || 0) + 1;
    });

    return {
      byStatus,
      byDirection,
      teamRoles,
      teamMembers,
      deadlines,
      totalBudget: financialBreakdown.total,
      financialBreakdown,
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

      {/* Filter indicators */}
      {(selectedDirection || selectedStatus || selectedDeadlineStatus) && (
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {selectedDirection && (
            <Chip
              label={`Направление: ${selectedDirection}`}
              onDelete={() => setSelectedDirection(null)}
              color="primary"
              size="small"
            />
          )}
          {selectedStatus && (
            <Chip
              label={`Статус: ${selectedStatus}`}
              onDelete={() => setSelectedStatus(null)}
              color="secondary"
              size="small"
            />
          )}
          {selectedDeadlineStatus && (
            <Chip
              label={`Срок: ${deadlineStatusToLabel(selectedDeadlineStatus)}`}
              onDelete={() => setSelectedDeadlineStatus(null)}
              color="warning"
              size="small"
            />
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Top Row: Projects & Deadlines */}
        <Grid item xs={12} md={6}>
          <ProjectsOverview
            totalProjects={filteredStats.totalProjects}
            byDirection={filteredStats.byDirection}
            byType={filteredStats.byType}
            byCompany={filteredStats.byCompany}
            selectedDirection={selectedDirection}
            onDirectionClick={setSelectedDirection}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Deadlines
                stats={filteredStats.deadlines}
                selectedDeadlineStatus={selectedDeadlineStatus}
                onDeadlineClick={setSelectedDeadlineStatus}
              />
            </Grid>
            <Grid item xs={12}>
              <Finances totalBudget={filteredStats.totalBudget} financialBreakdown={filteredStats.financialBreakdown} projects={filteredProjects} />
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom Row: Status & Team */}
        <Grid item xs={12} md={6}>
          <StatusChart
            byStatus={filteredStats.byStatus}
            showCompleted={showCompleted}
            projects={filteredProjects}
            selectedStatus={selectedStatus}
            onStatusClick={setSelectedStatus}
            statusDurations={statusDurations}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TeamGrid teamRoles={filteredStats.teamRoles} teamMembers={filteredStats.teamMembers} />
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

// Helper function to convert internal deadline status to display label
function deadlineStatusToLabel(status: string): string {
  switch (status) {
    case 'On Track': return 'В сроках';
    case 'Overdue < 2 weeks': return 'Просрочка менее 2 недель';
    case 'Overdue > 2 weeks': return 'Просрочка более 2 недель';
    case 'Completed': return 'Завершен';
    default: return status;
  }
}

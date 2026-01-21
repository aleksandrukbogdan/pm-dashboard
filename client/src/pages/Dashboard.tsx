import { useState, useEffect, useMemo, useCallback, useDeferredValue, startTransition } from 'react';
import { Box, Grid, CircularProgress, Alert, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardService, DashboardData, ComparisonData } from '../services/DashboardService';
import ProjectsOverview from '../components/dashboard/ProjectsOverview';
import Deadlines from '../components/dashboard/Deadlines';
import Finances from '../components/dashboard/Finances';

import ProjectDistributionChart from '../components/dashboard/ProjectDistributionChart';
import TeamGrid from '../components/dashboard/TeamGrid';
import ProjectRegistry from '../components/dashboard/ProjectRegistry';
import { OrganizationFilter, ComparisonMode } from '../App';

interface DashboardProps {
  spreadsheetId: string;
  organizationFilter: OrganizationFilter;
  showCompleted: boolean;
  selectedWeek: string | null;
  refreshTrigger?: number;
  comparisonMode: ComparisonMode;
}

export default function Dashboard({ spreadsheetId, organizationFilter, showCompleted, selectedWeek, refreshTrigger, comparisonMode }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedDeadlineStatus, setSelectedDeadlineStatus] = useState<string | null>(null);
  const [statusDurations, setStatusDurations] = useState<Record<string, number | null>>({});
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);


  // Use deferred values for heavy filter computations - keeps UI responsive
  const deferredDirection = useDeferredValue(selectedDirection);
  const deferredStatus = useDeferredValue(selectedStatus);
  const deferredPhase = useDeferredValue(selectedPhase);
  const deferredDeadlineStatus = useDeferredValue(selectedDeadlineStatus);

  // Wrapped filter handlers with startTransition for smooth animations
  const handleDirectionChange = useCallback((direction: string | null) => {
    startTransition(() => setSelectedDirection(direction));
  }, []);

  const handleStatusChange = useCallback((status: string | null) => {
    startTransition(() => setSelectedStatus(status));
  }, []);

  const handlePhaseChange = useCallback((phase: string | null) => {
    startTransition(() => setSelectedPhase(phase));
  }, []);

  const handleDeadlineStatusChange = useCallback((status: string | null) => {
    startTransition(() => setSelectedDeadlineStatus(status));
  }, []);

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

  // Fetch comparison data when mode changes
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    const fetchComparison = async () => {
      if (comparisonMode === 'none' || selectedWeek) {
        setComparisonData(null);
        return;
      }

      // Don't clear previous data - show loading indicator instead
      setComparisonLoading(true);

      try {
        const data = await DashboardService.getComparisonData(comparisonMode);
        setComparisonData(data);
      } catch (err) {
        console.error('Failed to fetch comparison data:', err);
        setComparisonData(null);
      } finally {
        setComparisonLoading(false);
      }
    };

    fetchComparison();
  }, [comparisonMode, selectedWeek]);

  // Filter projects based on DEFERRED filter values for better performance
  const filteredProjects = useMemo(() => {
    if (!data) return [];

    let projects = data.projects;

    // Filter by direction if selected (using deferred value)
    if (deferredDirection) {
      projects = projects.filter(p => p.direction === deferredDirection);
    }

    // Filter by status if selected (case-insensitive, using deferred value)
    if (deferredStatus) {
      const lowerSelectedStatus = deferredStatus.toLowerCase().trim();
      projects = projects.filter(p => (p.status?.toLowerCase().trim() || '') === lowerSelectedStatus);
    }

    // Filter by phase if selected (case-insensitive, using deferred value)
    if (deferredPhase) {
      const lowerSelectedPhase = deferredPhase.toLowerCase().trim();
      projects = projects.filter(p => (p.phase?.toLowerCase().trim() || '') === lowerSelectedPhase);
    }

    // Filter by deadline status if selected (using deferred value)
    if (deferredDeadlineStatus) {
      projects = projects.filter(p => {
        const deadlineStatus = calculateDeadlineStatus(p.endDate, p.status);
        return deadlineStatus === deferredDeadlineStatus;
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
  }, [data, deferredDirection, deferredStatus, deferredPhase, deferredDeadlineStatus, organizationFilter, showCompleted]);

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

    // Calculate byPhase from filtered projects
    const byPhase: Record<string, number> = {};
    projects.forEach(p => {
      const phase = p.phase?.trim() || 'Unknown';
      byPhase[phase] = (byPhase[phase] || 0) + 1;
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

    // Phases configuration for financial breakdown
    const ACTIVE_PHASES = ['реализация', 'пилот', 'завершающий этап', 'постпроектная работа', 'готово'];
    const POTENTIAL_PHASES = ['не начат', 'предпроектная подготовка', 'коммерческий этап'];
    const EXCLUDED_PHASES = ['отмена', 'пауза', 'на поддержке'];

    const financialBreakdown = {
      total: 0,
      inWork: 0,
      receivable: 0,
      paid: 0,
      potential: 0,
      regularMoney: data?.summary?.financialBreakdown?.regularMoney ?? 0
    };
    projects.forEach(p => {
      const costStr = p.totalCost || p.financials?.cost;
      const cost = parseCost(costStr);
      const paymentStatus = (p.paymentStatus || '').toLowerCase().trim();
      const phase = (p.phase || '').toLowerCase().trim();

      // Check if excluded phase
      if (EXCLUDED_PHASES.some(ph => phase.includes(ph))) {
        return;
      }

      // Check if potential phase
      if (POTENTIAL_PHASES.some(ph => phase.includes(ph))) {
        financialBreakdown.potential += cost;
        return;
      }

      // Only count active phases for main money (or empty phase for backwards compatibility)
      const isActivePhase = phase === '' || ACTIVE_PHASES.some(ph => phase.includes(ph));
      if (!isActivePhase) {
        return;
      }

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
      byPhase,
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
    <Box sx={{ flexGrow: 1, position: 'relative' }}>

      {/* Comparison loading indicator - Material 3 style */}
      <AnimatePresence mode="wait">
        {comparisonLoading && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              mass: 0.8
            }}
            style={{ marginBottom: 12 }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: '12px',
                backgroundColor: 'rgba(103, 80, 164, 0.08)',
                border: '1px solid rgba(103, 80, 164, 0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <CircularProgress
                size={16}
                thickness={3}
                sx={{
                  color: 'primary.main',
                }}
              />
              <Box
                component="span"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'primary.main',
                  letterSpacing: '0.01em',
                }}
              >
                Загрузка сравнения
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter indicators with smooth layout animation */}
      <motion.div layout transition={{ duration: 0.2, ease: 'easeOut' }}>
        <AnimatePresence mode="popLayout">
          {(selectedDirection || selectedStatus || selectedPhase || selectedDeadlineStatus) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ overflow: 'hidden', marginBottom: 12 }}
            >
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', py: 0.5 }}>
                <AnimatePresence mode="popLayout">
                  {selectedDirection && (
                    <motion.div
                      key="direction"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Chip
                        label={`Направление: ${selectedDirection}`}
                        onDelete={() => handleDirectionChange(null)}
                        color="warning"
                        size="small"
                      />
                    </motion.div>
                  )}
                  {selectedStatus && (
                    <motion.div
                      key="status"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Chip
                        label={`этап: ${selectedStatus}`}
                        onDelete={() => handleStatusChange(null)}
                        color="warning"
                        size="small"
                      />
                    </motion.div>
                  )}
                  {selectedPhase && (
                    <motion.div
                      key="phase"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Chip
                        label={`Фаза: ${selectedPhase}`}
                        onDelete={() => handlePhaseChange(null)}
                        color="warning"
                        size="small"
                      />
                    </motion.div>
                  )}
                  {selectedDeadlineStatus && (
                    <motion.div
                      key="deadline"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Chip
                        label={`Срок: ${deadlineStatusToLabel(selectedDeadlineStatus)}`}
                        onDelete={() => handleDeadlineStatusChange(null)}
                        color="warning"
                        size="small"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Grid container spacing={3}>
        {/* Top Row: Projects & Deadlines */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <ProjectsOverview
            totalProjects={filteredStats.totalProjects}
            byDirection={filteredStats.byDirection}
            byType={filteredStats.byType}
            byCompany={filteredStats.byCompany}
            selectedDirection={selectedDirection}
            onDirectionClick={handleDirectionChange}
            changes={comparisonData?.available ? comparisonData.changes?.projects : undefined}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            <Grid item xs={12}>
              <Deadlines
                stats={filteredStats.deadlines}
                selectedDeadlineStatus={selectedDeadlineStatus}
                onDeadlineClick={handleDeadlineStatusChange}
                changes={comparisonData?.available ? comparisonData.changes?.deadlines : undefined}
              />
            </Grid>
            <Grid item xs={12}>
              <Finances
                totalBudget={filteredStats.totalBudget}
                financialBreakdown={filteredStats.financialBreakdown}
                projects={filteredProjects}
                changes={comparisonData?.available ? comparisonData.changes?.finances : undefined}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Mid Row: Phases & Team */}
        <Grid item xs={12} md={6}>
          <ProjectDistributionChart
            byStatus={filteredStats.byStatus}
            byPhase={filteredStats.byPhase}
            showCompleted={showCompleted}
            projects={filteredProjects}
            selectedStatus={selectedStatus}
            selectedPhase={selectedPhase}
            onStatusClick={handleStatusChange}
            onPhaseClick={handlePhaseChange}
            statusDurations={statusDurations}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TeamGrid teamRoles={filteredStats.teamRoles} teamMembers={filteredStats.teamMembers} />
        </Grid>

        {/* Project Registry */}
        <Grid item xs={12}>
          <ProjectRegistry projects={filteredProjects} showFlatList={!!selectedDeadlineStatus} />
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

  const statusLower = status?.toLowerCase() || '';

  // Completed projects
  if (statusLower.includes('завершен') || statusLower.includes('на поддержке') || statusLower.includes('готов')) {
    return 'Completed';
  }

  // Exclude Pilot and Pause statuses from deadline calculations
  if (statusLower.includes('пилот') || statusLower.includes('пауза')) {
    return 'Excluded';
  }

  const now = new Date();
  const diffTime = now.getTime() - endDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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

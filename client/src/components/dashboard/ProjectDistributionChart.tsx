import { useState, useEffect } from 'react';
import { Paper, Typography, Box, ToggleButton, ToggleButtonGroup, Tooltip, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- Configuration ---

const PHASE_COLORS: Record<string, string> = {
    'Не начат': '#d4d4d4',           // Gray
    'Предпроектная подготовка': '#A78BFA', // Light purple
    'Коммерческий этап': '#FFB74D',   // Orange
    'Реализация': '#9982FF',         // Purple
    'Пилот': '#FF94DB',              // Pink
    'Завершающий этап': '#00A8F0',   // Blue/Indigo
    'Постпроектная работа': '#4FC3F7', // Light Blue
    'Готово': '#05CD99',             // Green
    'На поддержке': '#6FD439',       // Teal
    'Пауза': '#e6c258',              // Yellow
    'Отмена': '#ff5252'              // Red
};

const STATUS_COLORS: Record<string, string> = {
    'Не начат': '#d4d4d4',           // Gray
    'пауза': '#e6c258',               // Yellow
    'Пауза': '#e6c258',               // Yellow
    'Исследование': '#A78BFA',        // Light purple
    'В разработке менее 50%': '#DCD4FF',  // Light purple
    'В разработке более 50%': '#9982FF',  // Purple
    'Завершающий этап разработки': '#00A8F0', // Blue/Indigo
    'Пилот': '#FF94DB',               // Pink
    'Готов': '#05CD99',               // Green
    'На поддержке': '#6FD439'         // Teal
};

// Short labels for X-axis
const PHASE_LABELS: Record<string, string> = {
    'Не начат': 'Не начат',
    'Предпроектная подготовка': 'Предпроект',
    'Коммерческий этап': 'Коммерция',
    'Реализация': 'Реализация',
    'Пилот': 'Пилот',
    'Завершающий этап': 'Завершение',
    'Постпроектная работа': 'Постпроект',
    'Готово': 'Готово',
    'На поддержке': 'На\nподдержке',
    'Пауза': 'Пауза',
    'Отмена': 'Отмена'
};

const STATUS_LABELS: Record<string, string> = {
    'Не начат': 'Не начат',
    'пауза': 'Пауза',
    'Пауза': 'Пауза',
    'Исследование': 'Исследо-\nвание',
    'В разработке менее 50%': 'Меньше\n50%',
    'В разработке более 50%': 'Больше\n50%',
    'Завершающий этап разработки': 'Завершаю-\nщий этап',
    'Пилот': 'Пилот',
    'Готов': 'Завершен',
    'На поддержке': 'На\nподдержке'
};

// --- Types ---

interface Project {
    name: string;
    status: string;
    phase?: string;
    direction?: string;
    duration?: number | null; // For display in tooltip
}

interface ProjectDistributionChartProps {
    byStatus: Record<string, number>;
    byPhase: Record<string, number>;
    showCompleted?: boolean;
    projects?: Project[];
    selectedStatus?: string | null;
    selectedPhase?: string | null;
    onStatusClick?: (status: string | null) => void;
    onPhaseClick?: (phase: string | null) => void;
    statusDurations?: Record<string, number | null>;
}

type ViewMode = 'phase' | 'status';
type MetricMode = 'count' | 'time';

// --- Component ---

export default function ProjectDistributionChart({
    byStatus,
    byPhase,
    showCompleted = true,
    projects = [],
    selectedStatus,
    selectedPhase,
    onStatusClick,
    onPhaseClick,
    statusDurations = {}
}: ProjectDistributionChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('phase');
    const [metricMode, setMetricMode] = useState<MetricMode>('count');
    const [prevSelectedPhase, setPrevSelectedPhase] = useState<string | null>(null);

    // Auto-switch logic for drill-down
    useEffect(() => {
        // If a phase is selected and we were not already in a drill-down state (or just switched phases)
        if (selectedPhase && selectedPhase !== prevSelectedPhase) {
            setViewMode('status');
        } else if (!selectedPhase && prevSelectedPhase) {
            // If phase deselected, go back to phase view
            setViewMode('phase');
            // Also clear status selection if we go back up?
            if (selectedStatus && onStatusClick) {
                onStatusClick(null);
            }
        }
        setPrevSelectedPhase(selectedPhase || null);
    }, [selectedPhase, prevSelectedPhase, selectedStatus, onStatusClick]);

    // Handle View Mode Toggle
    const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
        if (newMode !== null) {
            setViewMode(newMode);
        }
    };

    // Handle Metric Mode Toggle
    const handleMetricModeChange = (_: React.MouseEvent<HTMLElement>, newMode: MetricMode | null) => {
        if (newMode !== null) {
            setMetricMode(newMode);
        }
    };

    // Handle Back Button
    const handleBackClick = () => {
        if (selectedPhase && onPhaseClick) {
            onPhaseClick(null); // Clear phase filter
            // Logic in useEffect will handle switching back to 'phase' view
        } else {
            setViewMode('phase'); // Just switch view if no filter active
        }
    };

    // --- Data Preparation ---

    const allPhases = [
        'Не начат', 'Предпроектная подготовка', 'Коммерческий этап', 'Реализация',
        'Пилот', 'Завершающий этап', 'Постпроектная работа', 'Готово',
        'На поддержке', 'Пауза', 'Отмена'
    ];

    const allStatuses = [
        'Не начат', 'пауза', 'Исследование', 'В разработке менее 50%',
        'В разработке более 50%', 'Завершающий этап разработки', 'Пилот',
        'Готов', 'На поддержке'
    ];

    const completedPhases = ['Готово', 'На поддержке', 'Отмена'];
    const completedStatuses = ['Готов', 'На поддержке'];

    // Determine current items to show
    const isPhaseView = viewMode === 'phase';

    // Filter items based on showCompleted
    const orderedItems = isPhaseView
        ? (showCompleted ? allPhases : allPhases.filter(s => !completedPhases.includes(s)))
        : (showCompleted ? allStatuses : allStatuses.filter(s => !completedStatuses.includes(s)));

    // Helper: Sum values case-insensitive
    const sumValues = (source: Record<string, number>, keyName: string): number => {
        const lowerName = keyName.toLowerCase().trim();
        let total = 0;
        Object.entries(source).forEach(([key, value]) => {
            if (key.toLowerCase().trim() === lowerName) total += value;
        });
        return total;
    };

    // Helper: Get projects for tooltip/time calc
    const getProjectsForItem = (itemName: string): Project[] => {
        const lowerItem = itemName.toLowerCase().trim();
        return projects.filter(p => {
            const val = isPhaseView ? p.phase : p.status;
            return (val?.toLowerCase().trim() || '') === lowerItem;
        }).map(p => ({
            ...p,
            duration: statusDurations[`${p.name}|${p.direction}`] ?? null
        }));
    };

    // Calculate chart data
    const chartData = orderedItems.map(item => {
        if (metricMode === 'count') {
            return isPhaseView ? sumValues(byPhase, item) : sumValues(byStatus, item);
        } else {
            // Time mode (only relevant for Status usually, but implementation can support both if needed)
            // Currently statusDurations are typically for Status. 
            // If in Phase view, time might not make sense unless we have Phase Durations.
            // For now, let's assume 'time' mode works decently for Status, and maybe 0 for Phase if no data.
            const projs = getProjectsForItem(item);
            return projs.reduce((sum, p) => sum + (p.duration || 0), 0);
        }
    });

    const colors = orderedItems.map(item => isPhaseView ? (PHASE_COLORS[item] || '#03a9f4') : (STATUS_COLORS[item] || '#03a9f4'));
    const labels = isPhaseView ? PHASE_LABELS : STATUS_LABELS;

    const currentSelection = isPhaseView ? selectedPhase : selectedStatus;
    const onBarClick = isPhaseView ? onPhaseClick : onStatusClick;


    return (
        <Paper sx={{
            p: 2.5,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 300,
            transition: 'height 0.1s ease-out',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Back button only if drilled down */}
                    {!!selectedPhase && !isPhaseView && (
                        <IconButton
                            size="small"
                            onClick={handleBackClick}
                            color="primary"
                            sx={{
                                bgcolor: 'action.hover',
                                mr: 1,
                                '&:hover': { bgcolor: 'action.selected' }
                            }}
                        >
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                    )}

                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                        {isPhaseView ? 'Проекты по фазам' : (selectedPhase ? `Проекты по статусам (${selectedPhase})` : 'Проекты по статусам')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Metric Toggle (only show for Status view for now, or if meaningful) */}
                    {!isPhaseView && (
                        <ToggleButtonGroup
                            value={metricMode}
                            exclusive
                            onChange={handleMetricModeChange}
                            size="small"
                        >
                            <ToggleButton value="count">К-во</ToggleButton>
                            <ToggleButton value="time">Время</ToggleButton>
                        </ToggleButtonGroup>
                    )}

                    {/* View Toggle */}
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleViewModeChange}
                        size="small"
                    >
                        <ToggleButton value="phase">Фазы</ToggleButton>
                        <ToggleButton value="status">Статусы</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>

            <Box sx={{ width: '100%', flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`chart-${viewMode}-${metricMode}-${orderedItems.length}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'flex-end',
                            flex: 1,
                            width: '100%',
                            paddingLeft: 8,
                            paddingRight: 8,
                            paddingBottom: '8px',
                            minHeight: 100,
                        }}
                    >
                        {orderedItems.map((item, index) => {
                            const value = chartData[index];
                            const maxValue = Math.max(...chartData, 1);
                            const barHeight = `${(value / maxValue) * 100}%`;
                            const color = colors[index];
                            // If something selected, dim others. If nothing selected, all bright.
                            const isSelected = !currentSelection || currentSelection === item;

                            return (
                                <motion.div
                                    key={item}
                                    variants={{
                                        hidden: { opacity: 0, y: 20, scale: 0.9 },
                                        visible: { opacity: 1, y: 0, scale: 1 }
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    onClick={() => {
                                        const newItem = currentSelection === item ? null : item;
                                        if (onBarClick) onBarClick(newItem);
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        opacity: isSelected ? 1 : 0.4,
                                        transition: 'opacity 0.3s ease',
                                        height: '100%',
                                        flex: 1,
                                    }}
                                    whileHover={{ y: -4, opacity: 1 }}
                                >
                                    <Tooltip
                                        title={(() => {
                                            const projectsInItem = getProjectsForItem(item);
                                            if (projectsInItem.length === 0) return item;

                                            return (
                                                <Box sx={{ p: 0.5 }}>
                                                    <Typography variant="caption" fontWeight="bold" display="block">
                                                        {item}
                                                    </Typography>
                                                    {projectsInItem.map((proj, i) => (
                                                        <Typography key={i} variant="caption" display="block">
                                                            • {proj.name}
                                                            {!isPhaseView && metricMode === 'time' && proj.duration !== null
                                                                ? ` — ${proj.duration} дн.`
                                                                : ''}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            );
                                        })()}
                                        arrow
                                        placement="top"
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '100%' }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                                sx={{ mb: 0.5, color: 'text.primary', fontSize: '0.75rem' }}
                                            >
                                                {value > 0 ? value : ''}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    width: '60%',
                                                    maxWidth: 40,
                                                    height: barHeight,
                                                    minHeight: 4,
                                                    background: `linear-gradient(180deg, ${color} 0%, ${color}CC 100%)`,
                                                    borderRadius: '8px 8px 4px 4px',
                                                    transition: 'height 0.3s ease-out, box-shadow 0.2s ease',
                                                    boxShadow: isSelected ? `0 4px 16px ${color}40` : 'none',
                                                }}
                                            />
                                        </Box>
                                    </Tooltip>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* X-axis labels */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    px: 1,
                    mt: 1,
                    borderTop: '1px solid #e0e0e0',
                    pt: 1
                }}>
                    {orderedItems.map((item) => (
                        <Typography
                            key={item}
                            variant="caption"
                            sx={{
                                width: '100%',
                                textAlign: 'center',
                                fontSize: '0.65rem',
                                lineHeight: 1.2,
                                whiteSpace: 'pre-wrap',
                                color: 'text.secondary',
                                wordBreak: 'break-word',
                                px: 0.5
                            }}
                        >
                            {labels[item] || item}
                        </Typography>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}

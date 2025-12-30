import { useState } from 'react';
import { Paper, Typography, Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Status colors matching reference design
const STATUS_COLORS: Record<string, string> = {
    'Не начат': '#d4d4d4',           // Gray
    'пауза': '#e6c258',               // Yellow
    'Пауза': '#e6c258',               // Yellow (case variation)  
    'Исследование': '#A78BFA',        // Light purple for research
    'В разработке менее 50%': '#DCD4FF',  // Light purple
    'В разработке более 50%': '#9982FF',  // Purple
    'Завершающий этап разработки': '#00A8F0', // Blue/Indigo
    'Пилот': '#FF94DB',               // Pink
    'Готов': '#05CD99',               // Green
    'На поддержке': '#6FD439'         // Teal
};

// Short labels for X-axis
const SHORT_LABELS: Record<string, string> = {
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

interface Project {
    name: string;
    status: string;
    direction?: string;
}

interface StatusChartProps {
    byStatus: Record<string, number>;
    showCompleted?: boolean;
    projects?: Project[];
    selectedStatus?: string | null;
    onStatusClick?: (status: string | null) => void;
    statusDurations?: Record<string, number | null>;
}

type ViewMode = 'count' | 'time';

export default function StatusChart({
    byStatus,
    showCompleted = true,
    projects = [],
    selectedStatus,
    onStatusClick,
    statusDurations = {}
}: StatusChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('count');

    // Sort or order statuses logically if needed
    const allStatuses = [
        'Не начат',
        'пауза',
        'Исследование',
        'В разработке менее 50%',
        'В разработке более 50%',
        'Завершающий этап разработки',
        'Пилот',
        'Готов',
        'На поддержке'
    ];

    // Filter out completed statuses if showCompleted is false
    const completedStatuses = ['Готов', 'На поддержке'];
    const orderedStatuses = showCompleted
        ? allStatuses
        : allStatuses.filter(s => !completedStatuses.includes(s));

    // Helper function to sum values for all matching status keys (case-insensitive)
    const sumMatchingStatuses = (statusName: string): number => {
        const lowerName = statusName.toLowerCase().trim();
        let total = 0;
        Object.entries(byStatus).forEach(([key, value]) => {
            if (key.toLowerCase().trim() === lowerName) {
                total += value;
            }
        });
        return total;
    };

    // Get data using case-insensitive lookup that sums all variants
    const data = orderedStatuses.map(status => sumMatchingStatuses(status));
    const colors = orderedStatuses.map(status => STATUS_COLORS[status] || '#03a9f4');

    // Get projects for a specific status (case-insensitive match)
    const getProjectsForStatus = (status: string): { name: string; duration: number | null }[] => {
        const lowerStatus = status.toLowerCase().trim();
        return projects
            .filter(p => (p.status?.toLowerCase().trim() || '') === lowerStatus)
            .map(p => {
                const projectKey = `${p.name}|${p.direction}`;
                return {
                    name: p.name,
                    duration: statusDurations[projectKey] ?? null
                };
            });
    };

    // Calculate time sum for each status
    const timeData = orderedStatuses.map(status => {
        const projectsInStatus = getProjectsForStatus(status);
        return projectsInStatus.reduce((sum, p) => sum + (p.duration || 0), 0);
    });

    const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
        if (newMode !== null) {
            setViewMode(newMode);
        }
    };

    return (
        <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 300, transition: 'height 0.1s ease-out' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                    Проекты по статусам
                </Typography>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    size="small"
                >
                    <ToggleButton value="count">Количество</ToggleButton>
                    <ToggleButton value="time">Время на одном статусе</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ width: '100%', flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {/* Custom bar chart with labels and tooltips */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`bars-${orderedStatuses.length}-${viewMode}`}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'flex-end',
                            flex: 1,
                            width: '100%',
                            paddingLeft: 8,
                            paddingRight: 8,
                            paddingBottom: '8px', // Space for X-axis baseline
                            minHeight: 100, // Ensure some minimum height
                        }}
                    >
                        {orderedStatuses.map((status, index) => {
                            const value = viewMode === 'count' ? data[index] : timeData[index];
                            const maxValue = viewMode === 'count'
                                ? Math.max(...data, 1)
                                : Math.max(...timeData, 1);
                            const barHeight = `${(value / maxValue) * 100}%`;
                            const color = colors[index];
                            const isSelected = !selectedStatus || selectedStatus === status;

                            return (
                                <motion.div
                                    key={status}
                                    variants={{
                                        hidden: { opacity: 0, y: 20, scale: 0.9 },
                                        visible: { opacity: 1, y: 0, scale: 1 }
                                    }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    onClick={() => {
                                        const newStatus = selectedStatus === status ? null : status;
                                        if (onStatusClick) {
                                            onStatusClick(newStatus);
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        opacity: isSelected ? 1 : 0.4,
                                        transition: 'opacity 0.3s ease',
                                        height: '100%',
                                    }}
                                    whileHover={{ y: -4, opacity: 1 }}
                                >
                                    <Tooltip
                                        title={(() => {
                                            const projectsInStatus = getProjectsForStatus(status);
                                            if (projectsInStatus.length === 0) return status;

                                            return (
                                                <Box sx={{ p: 0.5 }}>
                                                    <Typography variant="caption" fontWeight="bold" display="block">
                                                        {status}
                                                    </Typography>
                                                    {projectsInStatus.map((proj, i) => (
                                                        <Typography key={i} variant="caption" display="block">
                                                            • {proj.name}{viewMode === 'time' && proj.duration !== null ? ` — ${proj.duration} дн.` : ''}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            );
                                        })()}
                                        arrow
                                        placement="top"
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                            {/* Value label above bar */}
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                                sx={{ mb: 0.5, color: 'text.primary' }}
                                            >
                                                {value}
                                            </Typography>
                                            {/* Bar with gradient */}
                                            <Box
                                                sx={{
                                                    width: 44,
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
                    {orderedStatuses.map((status) => (
                        <Typography
                            key={status}
                            variant="caption"
                            sx={{
                                width: 50,
                                textAlign: 'center',
                                fontSize: '0.65rem',
                                lineHeight: 1.2,
                                whiteSpace: 'pre-line',
                                color: 'text.secondary'
                            }}
                        >
                            {SHORT_LABELS[status] || status}
                        </Typography>
                    ))}
                </Box>


            </Box>
        </Paper >
    );
}

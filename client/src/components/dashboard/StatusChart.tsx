import { useState } from 'react';
import { Paper, Typography, Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';

// Status colors matching reference design
const STATUS_COLORS: Record<string, string> = {
    'Не начат': '#d4d4d4',           // Gray
    'пауза': '#e6c258',               // Yellow
    'Пауза': '#e6c258',               // Yellow (case variation)  
    'Пилот': '#FF94DB',               // Purple
    'В разработке менее 50%': '#DCD4FF',  // Yellow
    'В разработке более 50%': '#9982FF',  // Yellow
    'Завершающий этап разработки': '#00A8F0', // Blue/Indigo
    'Готов': '#05CD99',               // Green
    'На поддержке': '#6FD439'         // Teal
};

// Short labels for X-axis
const SHORT_LABELS: Record<string, string> = {
    'Не начат': 'Не начат',
    'пауза': 'Пауза',
    'Пауза': 'Пауза',
    'Пилот': 'Пилот',
    'В разработке менее 50%': 'Меньше\n50%',
    'В разработке более 50%': 'Больше\n50%',
    'Завершающий этап разработки': 'Завершаю\nщий этап',
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
}

type ViewMode = 'count' | 'time';

export default function StatusChart({
    byStatus,
    showCompleted = true,
    projects = [],
    selectedStatus,
    onStatusClick
}: StatusChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('count');

    // Sort or order statuses logically if needed
    const allStatuses = [
        'Не начат',
        'пауза',
        'Пилот',
        'В разработке менее 50%',
        'В разработке более 50%',
        'Завершающий этап разработки',
        'Готов',
        'На поддержке'
    ];

    // Filter out completed statuses if showCompleted is false
    const completedStatuses = ['Готов', 'На поддержке'];
    const orderedStatuses = showCompleted
        ? allStatuses
        : allStatuses.filter(s => !completedStatuses.includes(s));

    // Helper function to find actual status key from byStatus (case-insensitive)
    const findActualStatusKey = (statusName: string): string | undefined => {
        const lowerName = statusName.toLowerCase().trim();
        return Object.keys(byStatus).find(key => key.toLowerCase().trim() === lowerName);
    };

    // Get data using case-insensitive lookup
    const data = orderedStatuses.map(status => {
        const actualKey = findActualStatusKey(status);
        return actualKey ? (byStatus[actualKey] || 0) : 0;
    });
    const colors = orderedStatuses.map(status => STATUS_COLORS[status] || '#03a9f4');

    // Placeholder time data (in days) - stub for future implementation
    const timeData = orderedStatuses.map(() => Math.floor(Math.random() * 30) + 5);

    const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
        if (newMode !== null) {
            setViewMode(newMode);
        }
    };

    // Get projects for a specific status (case-insensitive match)
    const getProjectsForStatus = (status: string): string[] => {
        const lowerStatus = status.toLowerCase().trim();
        return projects
            .filter(p => (p.status?.toLowerCase().trim() || '') === lowerStatus)
            .map(p => p.name);
    };

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                    Проекты по статусам
                </Typography>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    size="small"
                    sx={{
                        '& .MuiToggleButton-root': {
                            textTransform: 'none',
                            px: 2,
                            py: 0.5,
                            fontSize: '0.75rem',
                        },
                        '& .Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            }
                        }
                    }}
                >
                    <ToggleButton value="count">Количество</ToggleButton>
                    <ToggleButton value="time">Время на одном статусе</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ width: '100%', height: 280, position: 'relative' }}>
                {/* Custom bar chart with labels and tooltips */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'flex-end',
                    height: 200,
                    px: 1
                }}>
                    {orderedStatuses.map((status, index) => {
                        const value = viewMode === 'count' ? data[index] : timeData[index];
                        const maxValue = viewMode === 'count'
                            ? Math.max(...data, 1)
                            : Math.max(...timeData, 1);
                        const barHeight = (value / maxValue) * 160;
                        const color = colors[index];
                        const projectNames = getProjectsForStatus(status);
                        const isSelected = !selectedStatus || selectedStatus === status;

                        return (
                            <Box
                                key={status}
                                onClick={() => {
                                    const newStatus = selectedStatus === status ? null : status;
                                    if (onStatusClick) {
                                        onStatusClick(newStatus);
                                    }
                                }}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    opacity: isSelected ? 1 : 0.4,
                                    transition: 'opacity 0.2s, transform 0.2s',
                                    '&:hover': {
                                        opacity: 1,
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                <Tooltip
                                    title={projectNames.length > 0 ? (
                                        <Box sx={{ p: 0.5 }}>
                                            <Typography variant="caption" fontWeight="bold" display="block">
                                                {status}
                                            </Typography>
                                            {projectNames.map((name, i) => (
                                                <Typography key={i} variant="caption" display="block">
                                                    • {name}
                                                </Typography>
                                            ))}
                                        </Box>
                                    ) : status}
                                    arrow
                                    placement="top"
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {/* Value label above bar */}
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            sx={{ mb: 0.5, color: 'text.primary' }}
                                        >
                                            {value}
                                        </Typography>
                                        {/* Bar */}
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: barHeight,
                                                minHeight: 4,
                                                bgcolor: color,
                                                borderRadius: '4px 4px 0 0',
                                                transition: 'height 0.3s ease'
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Box>
                        );
                    })}
                </Box>

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

                {/* Time mode indicator */}
                {viewMode === 'time' && (
                    <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        pb: 1
                    }}>
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                            (заглушка — данные не реальные)
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

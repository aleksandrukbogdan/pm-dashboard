import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

// M3 Tonal color palette for directions
const DIRECTION_COLORS = [
    '#6366F1', // Web - Indigo-500
    '#8B5CF6', // Mobile - Violet-500  
    '#A855F7', // Design - Purple-500
    '#EC4899', // Разработка ПО - Pink-500
    '#14B8A6', // Промышленный дизайн - Teal-500
    '#F59E0B', // ML - Amber-500
];

// Dimmed versions of colors (with alpha)
const DIRECTION_COLORS_DIMMED = [
    '#6366F140',
    '#8B5CF640',
    '#A855F740',
    '#EC489940',
    '#14B8A640',
    '#F59E0B40',
];

interface ProjectsOverviewProps {
    totalProjects: number;
    byDirection: Record<string, number>;
    byType?: { internal: number; commercial: number; free: number };
    byCompany?: { ite29: number; nir: number };
    selectedDirection?: string | null;
    onDirectionClick?: (direction: string | null) => void;
}

export default function ProjectsOverview({
    totalProjects,
    byDirection,
    byType,
    byCompany,
    selectedDirection,
    onDirectionClick
}: ProjectsOverviewProps) {
    const directions = Object.keys(byDirection);

    // Create data with proper colors based on selection and value
    const data = Object.entries(byDirection).map(([label, value], id) => {
        const isSelected = !selectedDirection || selectedDirection === label;
        const hasProjects = value > 0;
        // Dim if not selected OR if has 0 projects
        const shouldDim = !isSelected || !hasProjects;
        return {
            id,
            value,
            label,
            color: shouldDim
                ? DIRECTION_COLORS_DIMMED[id % DIRECTION_COLORS_DIMMED.length]
                : DIRECTION_COLORS[id % DIRECTION_COLORS.length],
        };
    });

    const handleChartClick = (_event: any, itemIdentifier: any) => {
        if (itemIdentifier && itemIdentifier.dataIndex !== undefined) {
            const clickedDirection = directions[itemIdentifier.dataIndex];
            onDirectionClick?.(selectedDirection === clickedDirection ? null : clickedDirection);
        }
    };

    const handleLabelClick = (direction: string) => {
        onDirectionClick?.(selectedDirection === direction ? null : direction);
    };

    const handleCenterClick = () => {
        onDirectionClick?.(null);
    };

    return (
        <Paper sx={{ p: 2.5, height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Проекты
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ position: 'relative', width: 150, height: 150, cursor: 'pointer' }}>
                    <PieChart
                        series={[
                            {
                                data,
                                innerRadius: 55,
                                outerRadius: 72,
                                paddingAngle: 3,
                                cornerRadius: 6,
                                cx: 70,
                                cy: 70,
                            },
                        ]}
                        width={150}
                        height={150}
                        slotProps={{ legend: { hidden: true } }}
                        onItemClick={handleChartClick}
                        sx={{
                            cursor: 'pointer',
                            '& .MuiPieArc-root': {
                                cursor: 'pointer',
                                transition: 'opacity 0.2s ease',
                                '&:hover': {
                                    opacity: 0.8,
                                },
                            }
                        }}
                    />
                    <Box
                        onClick={handleCenterClick}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            '&:hover': { opacity: 0.8 }
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold">
                            {totalProjects}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {selectedDirection ? 'Фильтр' : 'Всего'}
                        </Typography>
                    </Box>
                </Box>

                <List dense sx={{ flex: 1, ml: 2 }}>
                    <ListItem disablePadding>
                        <ListItemText
                            primary={<Typography variant="caption" color="text.secondary">Направление</Typography>}
                        />
                        <Typography variant="caption" color="text.secondary">Кол-во проектов</Typography>
                    </ListItem>
                    {Object.entries(byDirection).map(([direction, count], index) => {
                        const isSelected = !selectedDirection || selectedDirection === direction;
                        const hasProjects = count > 0;
                        // Dim if not selected OR if has 0 projects
                        const shouldDim = !isSelected || !hasProjects;
                        const colorIndex = index % DIRECTION_COLORS.length;

                        return (
                            <ListItem
                                key={direction}
                                disablePadding
                                sx={{
                                    py: 0.5,
                                    cursor: 'pointer',
                                    borderRadius: 1,
                                    px: 0.5,
                                    bgcolor: selectedDirection === direction ? 'action.selected' : 'transparent',
                                    opacity: shouldDim ? 0.4 : 1,
                                    transition: 'opacity 0.2s, background-color 0.2s',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                        opacity: 1
                                    }
                                }}
                                onClick={() => handleLabelClick(direction)}
                            >
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: shouldDim
                                            ? DIRECTION_COLORS_DIMMED[colorIndex]
                                            : DIRECTION_COLORS[colorIndex],
                                        mr: 1,
                                        transition: 'background-color 0.2s'
                                    }}
                                />
                                <ListItemText primary={direction} primaryTypographyProps={{ variant: 'body2' }} />
                                <Typography variant="body2" fontWeight="bold">{count}</Typography>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Footer stats */}
            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', gap: 2, borderTop: '1px solid #eee' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">Проекты ИТЭ-29 / НИР</Typography>
                    <Typography variant="h6" fontWeight="bold">{byCompany?.ite29 || 0} / {byCompany?.nir || 0}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Внутренние</Typography>
                    <Typography variant="h6" fontWeight="bold">{byType?.internal || 0}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Коммерческие</Typography>
                    <Typography variant="h6" fontWeight="bold">{byType?.commercial || 0}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Безоплатные</Typography>
                    <Typography variant="h6" fontWeight="bold">{byType?.free || 0}</Typography>
                </Box>
            </Box>
        </Paper>
    );
}

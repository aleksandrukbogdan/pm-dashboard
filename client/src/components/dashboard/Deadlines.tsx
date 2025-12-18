import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

interface DeadlinesProps {
    stats: {
        onTrack: number;
        overdueSmall: number;
        overdueLarge: number;
        completed: number;
    };
    selectedDeadlineStatus?: string | null;
    onDeadlineClick?: (status: string | null) => void;
}

export default function Deadlines({ stats, selectedDeadlineStatus, onDeadlineClick }: DeadlinesProps) {
    // M3 tonal colors
    const data = [
        { id: 0, value: stats.onTrack, label: 'В сроках', color: '#22C55E', statusKey: 'On Track' },
        { id: 1, value: stats.overdueSmall, label: 'Просрочка менее 2 недель', color: '#F59E0B', statusKey: 'Overdue < 2 weeks' },
        { id: 2, value: stats.overdueLarge, label: 'Просрочка более 2 недель', color: '#EF4444', statusKey: 'Overdue > 2 weeks' },
    ];

    const handleItemClick = (statusKey: string) => {
        if (onDeadlineClick) {
            // Toggle: if same status clicked, deselect
            onDeadlineClick(selectedDeadlineStatus === statusKey ? null : statusKey);
        }
    };

    const handlePieClick = (_event: any, itemIdentifier: any) => {
        if (itemIdentifier && typeof itemIdentifier.dataIndex === 'number') {
            const clickedItem = data[itemIdentifier.dataIndex];
            if (clickedItem) {
                handleItemClick(clickedItem.statusKey);
            }
        }
    };

    return (
        <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Сроки выполнения
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 150, height: 150, cursor: onDeadlineClick ? 'pointer' : 'default' }}>
                    <PieChart
                        series={[
                            {
                                data: data.map(item => ({
                                    ...item,
                                    color: (!selectedDeadlineStatus || selectedDeadlineStatus === item.statusKey)
                                        ? item.color
                                        : `${item.color}40`, // Dim non-selected
                                })),
                                innerRadius: 48,
                                outerRadius: 68,
                                paddingAngle: 3,
                                cornerRadius: 6,
                                cx: 70,
                                cy: 70,
                            },
                        ]}
                        width={150}
                        height={150}
                        slotProps={{ legend: { hidden: true } }}
                        onItemClick={handlePieClick}
                        sx={{
                            '& .MuiPieArc-root': {
                                transition: 'opacity 0.2s ease',
                                '&:hover': {
                                    opacity: 0.8,
                                },
                            }
                        }}
                    />
                </Box>

                <List dense sx={{ flex: 1, ml: 2 }}>
                    <ListItem disablePadding>
                        <ListItemText
                            primary={<Typography variant="caption" color="text.secondary">Статус</Typography>}
                        />
                        <Typography variant="caption" color="text.secondary">Кол-во проектов</Typography>
                    </ListItem>
                    {data.map((item) => {
                        const isSelected = !selectedDeadlineStatus || selectedDeadlineStatus === item.statusKey;
                        const isActive = selectedDeadlineStatus === item.statusKey;

                        return (
                            <ListItem
                                key={item.label}
                                disablePadding
                                sx={{
                                    py: 0.5,
                                    cursor: onDeadlineClick ? 'pointer' : 'default',
                                    opacity: isSelected ? 1 : 0.4,
                                    bgcolor: isActive ? 'action.selected' : 'transparent',
                                    borderRadius: 1,
                                    px: 0.5,
                                    mx: -0.5,
                                    transition: 'all 0.2s ease',
                                    '&:hover': onDeadlineClick ? {
                                        bgcolor: 'action.hover',
                                        opacity: 1,
                                    } : {},
                                }}
                                onClick={() => handleItemClick(item.statusKey)}
                            >
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, mr: 1 }} />
                                <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
                                <Typography variant="body2" fontWeight="bold">{item.value}</Typography>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Paper>
    );
}

import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

interface DeadlinesProps {
    stats: {
        onTrack: number;
        overdueSmall: number;
        overdueLarge: number;
        completed: number;
    };
}

export default function Deadlines({ stats }: DeadlinesProps) {
    const data = [
        { id: 0, value: stats.onTrack, label: 'В сроках', color: '#4caf50' },
        { id: 1, value: stats.overdueSmall, label: 'Просрочка менее 2 недель', color: '#ff9800' },
        { id: 2, value: stats.overdueLarge, label: 'Просрочка более 2 недель', color: '#f44336' },
    ];

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Сроки выполнения
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 150, height: 150 }}>
                    <PieChart
                        series={[
                            {
                                data,
                                innerRadius: 50,
                                outerRadius: 70,
                                paddingAngle: 2,
                                cornerRadius: 4,
                                cx: 70,
                                cy: 70,
                            },
                        ]}
                        width={150}
                        height={150}
                        slotProps={{ legend: { hidden: true } }}
                    />
                </Box>

                <List dense sx={{ flex: 1, ml: 2 }}>
                    <ListItem disablePadding>
                        <ListItemText
                            primary={<Typography variant="caption" color="text.secondary">Статус</Typography>}
                        />
                        <Typography variant="caption" color="text.secondary">Кол-во проектов</Typography>
                    </ListItem>
                    {data.map((item) => (
                        <ListItem key={item.label} disablePadding sx={{ py: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, mr: 1 }} />
                            <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
                            <Typography variant="body2" fontWeight="bold">{item.value}</Typography>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Paper>
    );
}

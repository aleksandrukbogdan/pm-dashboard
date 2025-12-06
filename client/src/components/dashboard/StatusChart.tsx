import { Paper, Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

interface StatusChartProps {
    byStatus: Record<string, number>;
    showCompleted?: boolean;
}

export default function StatusChart({ byStatus, showCompleted = true }: StatusChartProps) {
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

    const xLabels = orderedStatuses;
    const data = orderedStatuses.map(status => byStatus[status] || 0);

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                    Проекты по статусам
                </Typography>
            </Box>

            <Box sx={{ width: '100%', height: 300 }}>
                <BarChart
                    xAxis={[{
                        scaleType: 'band',
                        data: xLabels,
                        tickLabelStyle: {
                            angle: 0,
                            textAnchor: 'middle',
                            fontSize: 10,
                        }
                    }]}
                    series={[{ data, color: '#03a9f4', label: 'Количество' }]}
                    height={280}
                    slotProps={{ legend: { hidden: true } }}
                />
            </Box>
        </Paper>
    );
}

import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

interface ProjectsOverviewProps {
    totalProjects: number;
    byDirection: Record<string, number>;
}

export default function ProjectsOverview({ totalProjects, byDirection }: ProjectsOverviewProps) {
    const data = Object.entries(byDirection).map(([label, value], id) => ({
        id,
        value,
        label,
    }));

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Проекты
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ position: 'relative', width: 150, height: 150 }}>
                    <PieChart
                        series={[
                            {
                                data,
                                innerRadius: 60,
                                outerRadius: 75,
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
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold">
                            {totalProjects}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Всего
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
                    {Object.entries(byDirection).map(([direction, count]) => (
                        <ListItem key={direction} disablePadding sx={{ py: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mr: 1 }} />
                            <ListItemText primary={direction} primaryTypographyProps={{ variant: 'body2' }} />
                            <Typography variant="body2" fontWeight="bold">{count}</Typography>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Footer stats placeholder */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #eee' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">Проекты ИТЭ-29 / НИР</Typography>
                    <Typography variant="h6" fontWeight="bold">20 / 17</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Внутренние</Typography>
                    <Typography variant="h6" fontWeight="bold">22</Typography>
                </Box>
            </Box>
        </Paper>
    );
}

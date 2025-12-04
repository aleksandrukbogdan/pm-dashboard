import { Paper, Typography, Grid, Box } from '@mui/material';

interface TeamGridProps {
    teamRoles: Record<string, number>;
}

export default function TeamGrid({ teamRoles }: TeamGridProps) {
    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Команда, чел. →
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
                {Object.entries(teamRoles).map(([role, count]) => (
                    <Grid item xs={6} key={role}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', pb: 1 }}>
                            <Typography variant="body2" color="text.primary">
                                {role}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {count}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
}

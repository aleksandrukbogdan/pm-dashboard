import { Paper, Typography, Grid, Box, Tooltip } from '@mui/material';

interface TeamMember {
    name: string;
    role: string;
}

interface TeamGridProps {
    teamRoles: Record<string, number>;
    teamMembers?: TeamMember[];
}

export default function TeamGrid({ teamRoles, teamMembers = [] }: TeamGridProps) {
    // Group team members by role for tooltips
    const membersByRole: Record<string, string[]> = {};
    teamMembers.forEach(member => {
        if (member.role && member.name) {
            if (!membersByRole[member.role]) {
                membersByRole[member.role] = [];
            }
            if (!membersByRole[member.role].includes(member.name)) {
                membersByRole[member.role].push(member.name);
            }
        }
    });

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Команда, чел. →
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
                {Object.entries(teamRoles).map(([role, count]) => {
                    const members = membersByRole[role] || [];

                    return (
                        <Grid item xs={6} key={role}>
                            <Tooltip
                                title={
                                    <Box sx={{ p: 0.5 }}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                                            {role}:
                                        </Typography>
                                        {members.map((name: string, idx: number) => (
                                            <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
                                                • {name}
                                            </Typography>
                                        ))}
                                        {members.length === 0 && (
                                            <Typography variant="caption">Нет данных</Typography>
                                        )}
                                    </Box>
                                }
                                arrow
                                placement="top"
                            >
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    borderBottom: '1px solid #f0f0f0',
                                    py: 1,
                                    px: 1,
                                    mx: -1,
                                    cursor: 'pointer',
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(237, 141, 72, 0.12)',
                                        transform: 'scale(1.02)',
                                    }
                                }}>
                                    <Typography variant="body2" color="text.primary">
                                        {role}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {count}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        </Grid>
                    );
                })}
            </Grid>
        </Paper>
    );
}

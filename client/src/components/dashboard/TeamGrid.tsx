import { Paper, Typography, Grid, Box, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

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

    const roleEntries = Object.entries(teamRoles);

    return (
        <Paper sx={{ p: 2, height: '100%', minHeight: 300, transition: 'height 0.15s ease-out' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Команда, чел. →
            </Typography>

            <motion.div layout transition={{ duration: 0.15, ease: 'easeOut' }}>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <AnimatePresence mode="popLayout">
                        {roleEntries.map(([role, count], index) => {
                            const members = membersByRole[role] || [];

                            return (
                                <Grid item xs={6} key={role}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.1, delay: index * 0.02 }}
                                    >
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
                                                alignItems: 'center',
                                                py: 0.75,
                                                px: 1.25,
                                                cursor: 'pointer',
                                                borderRadius: 2,
                                                bgcolor: 'rgba(103, 80, 164, 0.04)',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(237, 141, 72, 0.12)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                                }
                                            }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.primary"
                                                    sx={{
                                                        fontSize: '0.875rem',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        mr: 1
                                                    }}
                                                >
                                                    {role}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        px: 1,
                                                        py: 0.25,
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        minWidth: 24,
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {count}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </AnimatePresence>
                </Grid>
            </motion.div>
        </Paper>
    );
}

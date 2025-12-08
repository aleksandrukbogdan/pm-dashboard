import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress,
    Chip,
    Paper,
    Divider,
    Stack,
} from '@mui/material';
import {
    ArrowForward as ArrowIcon,
    FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { DashboardService, ProjectHistoryEntry } from '../../services/DashboardService';

interface ProjectHistoryDialogProps {
    open: boolean;
    onClose: () => void;
    projectKey: string;
    projectName: string;
}

export default function ProjectHistoryDialog({
    open,
    onClose,
    projectKey,
    projectName,
}: ProjectHistoryDialogProps) {
    const [history, setHistory] = useState<ProjectHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && projectKey) {
            fetchHistory();
        }
    }, [open, projectKey]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await DashboardService.getProjectHistory(projectKey);
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch project history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'primary' | 'secondary' => {
        const s = status?.toLowerCase() || '';
        if (s.includes('готов') || s.includes('завершен')) return 'success';
        if (s.includes('разработк')) return 'primary';
        if (s.includes('тестиров')) return 'warning';
        if (s.includes('аналитик')) return 'info';
        return 'secondary';
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box>
                    <Typography variant="h6">История изменений</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {projectName}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : history.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                            История изменений пока недоступна.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Данные начнут собираться после создания первого снимка.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {history.map((entry, index) => (
                            <Paper key={entry.weekStart} elevation={1} sx={{ p: 2, position: 'relative' }}>
                                {/* Timeline connector */}
                                {index < history.length - 1 && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            left: 20,
                                            top: 52,
                                            bottom: -16,
                                            width: 2,
                                            bgcolor: 'divider',
                                        }}
                                    />
                                )}

                                {/* Header */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <DotIcon sx={{ color: `${getStatusColor(entry.status)}.main`, fontSize: 12 }} />
                                    <Box>
                                        <Typography variant="subtitle2">{entry.display}</Typography>
                                        {entry.statusChangedAt && (
                                            <Typography variant="caption" color="text.secondary">
                                                Изменено: {formatDate(entry.statusChangedAt)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* Status */}
                                <Box sx={{ ml: 4 }}>
                                    <Chip
                                        label={entry.status || 'Без статуса'}
                                        color={getStatusColor(entry.status)}
                                        size="small"
                                    />

                                    {/* Status change indicator */}
                                    {entry.previousStatus && entry.previousStatus !== entry.status && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            <Chip
                                                label={entry.previousStatus}
                                                size="small"
                                                variant="outlined"
                                                sx={{ textDecoration: 'line-through', opacity: 0.7 }}
                                            />
                                            <ArrowIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Chip
                                                label={entry.status}
                                                size="small"
                                                color={getStatusColor(entry.status)}
                                            />
                                        </Box>
                                    )}

                                    {/* Key fields from snapshot */}
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        {entry.snapshot.team?.length > 0 && (
                                            <Typography variant="caption" color="text.secondary">
                                                Команда: {entry.snapshot.team.length} чел.
                                            </Typography>
                                        )}
                                        {entry.snapshot.endDate && (
                                            <Typography variant="caption" color="text.secondary">
                                                Дедлайн: {entry.snapshot.endDate}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog>
    );
}

import { useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    PhotoCamera as SnapshotIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { DashboardService, WeekInfo } from '../../services/DashboardService';

// Password for snapshot creation
const SNAPSHOT_PASSWORD = 'nir2024';

interface WeekPickerProps {
    selectedWeek: string | null;
    onWeekChange: (weekStart: string | null) => void;
    onDataRefresh?: () => void;
    compact?: boolean;
}

export default function WeekPicker({ selectedWeek, onWeekChange, onDataRefresh, compact = false }: WeekPickerProps) {
    const [weeks, setWeeks] = useState<WeekInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [deleteWeek, setDeleteWeek] = useState<string | null>(null);

    const fetchWeeks = async () => {
        try {
            setLoading(true);
            const availableWeeks = await DashboardService.getAvailableWeeks();
            setWeeks(availableWeeks);
        } catch (error) {
            console.error('Failed to fetch weeks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeeks();
    }, []);

    const handleCreateSnapshotClick = () => {
        setPassword('');
        setPasswordError(false);
        setPasswordDialogOpen(true);
    };

    const handleCreateSnapshot = async () => {
        if (password !== SNAPSHOT_PASSWORD) {
            setPasswordError(true);
            return;
        }

        setPasswordDialogOpen(false);

        try {
            setCreating(true);
            await DashboardService.createSnapshot();
            await fetchWeeks();
            onDataRefresh?.();
        } catch (error) {
            console.error('Failed to create snapshot:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteClick = (weekStart: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteWeek(weekStart);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteWeek) return;

        try {
            await DashboardService.deleteSnapshot(deleteWeek);
            if (selectedWeek === deleteWeek) {
                onWeekChange(null);
            }
            await fetchWeeks();
        } catch (error) {
            console.error('Failed to delete snapshot:', error);
        } finally {
            setDeleteWeek(null);
        }
    };

    const handleWeekChange = (value: string) => {
        if (value === 'live') {
            onWeekChange(null);
        } else {
            onWeekChange(value);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: compact ? 200 : 260 }}>
                    <InputLabel id="week-picker-label">Период данных</InputLabel>
                    <Select
                        labelId="week-picker-label"
                        value={selectedWeek || 'live'}
                        label="Период данных"
                        onChange={(e) => handleWeekChange(e.target.value)}
                        disabled={loading}
                        sx={{
                            backgroundColor: 'rgba(91, 95, 227, 0.04)',
                            borderRadius: 2,
                            '& fieldset': {
                                borderColor: 'rgba(91, 95, 227, 0.2)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(91, 95, 227, 0.4)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#2B3674',
                            },
                        }}
                    >
                        <MenuItem value="live">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: 'success.main',
                                        animation: 'pulse 2s infinite',
                                        '@keyframes pulse': {
                                            '0%': { opacity: 1 },
                                            '50%': { opacity: 0.4 },
                                            '100%': { opacity: 1 },
                                        },
                                    }}
                                />
                                Актуальные данные
                            </Box>
                        </MenuItem>

                        {weeks.length > 0 && <MenuItem divider disabled />}

                        {weeks.map((week) => (
                            <MenuItem key={week.weekStart} value={week.weekStart}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {week.isCurrent && (
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontSize: 10,
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    px: 0.5,
                                                    py: 0.25,
                                                    borderRadius: 0.5,
                                                }}
                                            >
                                                ТЕКУЩАЯ
                                            </Box>
                                        )}
                                        {week.display}
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleDeleteClick(week.weekStart, e)}
                                        sx={{
                                            ml: 1,
                                            p: 0.5,
                                            color: 'error.main',
                                            '&:hover': { bgcolor: 'error.light', color: 'error.dark' }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Tooltip title="Обновить список">
                    <IconButton
                        size="small"
                        onClick={fetchWeeks}
                        disabled={loading}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Сохранить снимок текущих данных">
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={creating ? <CircularProgress size={16} /> : <SnapshotIcon />}
                        onClick={handleCreateSnapshotClick}
                        disabled={creating}
                        sx={{
                            borderColor: 'rgba(91, 95, 227, 0.3)',
                            color: '#2B3674',
                            '&:hover': {
                                borderColor: '#2B3674',
                                backgroundColor: 'rgba(91, 95, 227, 0.08)',
                            },
                        }}
                    >
                        {creating ? '...' : 'Снимок'}
                    </Button>
                </Tooltip>
            </Box>

            {/* Password Dialog */}
            <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
                <DialogTitle>Создание снимка</DialogTitle>
                <DialogContent>
                    {passwordError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Неверный пароль
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Пароль"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleCreateSnapshot();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleCreateSnapshot} variant="contained">
                        Создать снимок
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteWeek} onClose={() => setDeleteWeek(null)}>
                <DialogTitle>Удалить снимок?</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        Снимок будет удалён без возможности восстановления.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteWeek(null)}>Отмена</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

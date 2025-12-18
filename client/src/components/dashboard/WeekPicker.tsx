import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    CircularProgress,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Button,
    Popover,
    Typography,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    alpha,
} from '@mui/material';
import {
    PhotoCamera as SnapshotIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    CalendarMonth as CalendarIcon,
    FiberManualRecord as DotIcon,
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

// Group snapshots by week
interface WeekGroup {
    weekLabel: string;
    weekStart: string;
    days: WeekInfo[];
    isCurrent: boolean;
}

function groupByWeek(weeks: WeekInfo[]): WeekGroup[] {
    const groups: Map<string, WeekGroup> = new Map();

    weeks.forEach(week => {
        // Parse the date from weekStart (format: YYYY-MM-DD)
        const date = new Date(week.weekStart);
        const dayOfWeek = date.getDay();
        // Get Monday of that week
        const monday = new Date(date);
        monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const weekKey = monday.toISOString().split('T')[0];

        // Format week label
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const weekLabel = `${monday.getDate()}.${String(monday.getMonth() + 1).padStart(2, '0')} — ${sunday.getDate()}.${String(sunday.getMonth() + 1).padStart(2, '0')}`;

        if (!groups.has(weekKey)) {
            groups.set(weekKey, {
                weekLabel,
                weekStart: weekKey,
                days: [],
                isCurrent: false,
            });
        }
        groups.get(weekKey)!.days.push(week);
        if (week.isCurrent) {
            groups.get(weekKey)!.isCurrent = true;
        }
    });

    // Sort days within each group and sort groups by date (newest first)
    const result = Array.from(groups.values());
    result.forEach(group => {
        group.days.sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
    });
    result.sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());

    return result;
}

function formatDayLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return `${days[date.getDay()]} ${date.getDate()}`;
}

export default function WeekPicker({ selectedWeek, onWeekChange, onDataRefresh, compact = false }: WeekPickerProps) {
    const [weeks, setWeeks] = useState<WeekInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [deleteWeek, setDeleteWeek] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [expandedWeek, setExpandedWeek] = useState<string | false>(false);

    const weekGroups = useMemo(() => groupByWeek(weeks), [weeks]);

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

    // Expand the week containing selected day
    useEffect(() => {
        if (selectedWeek) {
            const group = weekGroups.find(g => g.days.some(d => d.weekStart === selectedWeek));
            if (group) {
                setExpandedWeek(group.weekStart);
            }
        }
    }, [selectedWeek, weekGroups]);

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

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const handleLiveData = () => {
        onWeekChange(null);
        handlePopoverClose();
    };

    const handleDaySelect = (weekStart: string) => {
        onWeekChange(weekStart);
        handlePopoverClose();
    };

    const open = Boolean(anchorEl);

    // Get display text for button
    const getButtonLabel = () => {
        if (!selectedWeek) {
            return 'Актуальные данные';
        }
        const week = weeks.find(w => w.weekStart === selectedWeek);
        return week?.display || selectedWeek;
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Period Button */}
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                        !selectedWeek ? (
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
                        ) : (
                            <CalendarIcon fontSize="small" />
                        )
                    }
                    onClick={handlePopoverOpen}
                    disabled={loading}
                    sx={{
                        borderColor: 'rgba(237, 141, 72, 0.3)',
                        color: '#2B3674',
                        borderRadius: 3,
                        px: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                            borderColor: '#ED8D48',
                            backgroundColor: 'rgba(237, 141, 72, 0.04)',
                        },
                    }}
                >
                    {compact ? '' : getButtonLabel()}
                </Button>

                {/* Popover with M3-style week picker */}
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 1,
                                borderRadius: 2,
                                minWidth: 320,
                                maxHeight: 400,
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(43, 54, 116, 0.15)',
                            },
                        },
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Период данных
                        </Typography>

                        {/* Live data option */}
                        <Chip
                            icon={
                                <DotIcon
                                    sx={{
                                        fontSize: 10,
                                        color: 'success.main',
                                        animation: 'pulse 2s infinite',
                                    }}
                                />
                            }
                            label="Актуальные данные"
                            onClick={handleLiveData}
                            sx={{
                                mb: 2,
                                width: '100%',
                                justifyContent: 'flex-start',
                                borderRadius: 3,
                                py: 2.5,
                                bgcolor: !selectedWeek ? alpha('#ED8D48', 0.15) : alpha('#2B3674', 0.05),
                                border: !selectedWeek ? '2px solid #ED8D48' : '2px solid transparent',
                                '&:hover': {
                                    bgcolor: alpha('#ED8D48', 0.1),
                                },
                                '& .MuiChip-label': {
                                    fontWeight: 500,
                                },
                            }}
                        />

                        {/* Week accordions */}
                        {weekGroups.length > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Снимки по неделям
                            </Typography>
                        )}

                        <Box sx={{ maxHeight: 250, overflow: 'auto' }}>
                            {weekGroups.map((group) => (
                                <Accordion
                                    key={group.weekStart}
                                    expanded={expandedWeek === group.weekStart}
                                    onChange={(_, isExpanded) => setExpandedWeek(isExpanded ? group.weekStart : false)}
                                    disableGutters
                                    elevation={0}
                                    sx={{
                                        '&:before': { display: 'none' },
                                        bgcolor: 'transparent',
                                        border: '1px solid',
                                        borderColor: alpha('#2B3674', 0.1),
                                        borderRadius: '16px !important',
                                        mb: 1,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            minHeight: 48,
                                            px: 2,
                                            '& .MuiAccordionSummary-content': {
                                                my: 1,
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {group.isCurrent && (
                                                <Chip
                                                    label="Текущая"
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.65rem',
                                                        bgcolor: '#ED8D48',
                                                        color: 'white',
                                                    }}
                                                />
                                            )}
                                            <Typography variant="body2" fontWeight={500}>
                                                {group.weekLabel}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ({group.days.length})
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {group.days.map((day) => (
                                                <Chip
                                                    key={day.weekStart}
                                                    label={formatDayLabel(day.weekStart)}
                                                    size="small"
                                                    onClick={() => handleDaySelect(day.weekStart)}
                                                    onDelete={(e) => handleDeleteClick(day.weekStart, e)}
                                                    deleteIcon={
                                                        <DeleteIcon
                                                            sx={{
                                                                fontSize: 14,
                                                                '&:hover': { color: 'error.main' },
                                                            }}
                                                        />
                                                    }
                                                    sx={{
                                                        borderRadius: 2,
                                                        bgcolor: selectedWeek === day.weekStart
                                                            ? '#ED8D48'
                                                            : alpha('#2B3674', 0.08),
                                                        color: selectedWeek === day.weekStart
                                                            ? 'white'
                                                            : '#2B3674',
                                                        fontWeight: 500,
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            bgcolor: selectedWeek === day.weekStart
                                                                ? '#D97D3A'
                                                                : alpha('#ED8D48', 0.15),
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </Box>
                </Popover>

                <Tooltip title="Обновить список">
                    <IconButton
                        size="small"
                        onClick={fetchWeeks}
                        disabled={loading}
                        sx={{
                            color: '#ED8D48',
                            '&:hover': {
                                backgroundColor: 'rgba(237, 141, 72, 0.1)',
                            },
                        }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Сохранить снимок">
                    <IconButton
                        size="small"
                        onClick={handleCreateSnapshotClick}
                        disabled={creating}
                        sx={{
                            backgroundColor: 'rgba(237, 141, 72, 0.1)',
                            color: '#ED8D48',
                            '&:hover': {
                                backgroundColor: 'rgba(237, 141, 72, 0.2)',
                            },
                        }}
                    >
                        {creating ? <CircularProgress size={18} color="inherit" /> : <SnapshotIcon fontSize="small" />}
                    </IconButton>
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

import { useState } from 'react';
import { Paper, Typography, Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Phase colors
const PHASE_COLORS: Record<string, string> = {
    'Не начат': '#d4d4d4',           // Gray
    'Предпроектная подготовка': '#A78BFA', // Light purple
    'Коммерческий этап': '#FFB74D',   // Orange
    'Реализация': '#9982FF',         // Purple
    'Пилот': '#FF94DB',              // Pink
    'Завершающий этап': '#00A8F0',   // Blue/Indigo
    'Постпроектная работа': '#4FC3F7', // Light Blue
    'Готово': '#05CD99',             // Green
    'На поддержке': '#6FD439',       // Teal
    'Пауза': '#e6c258',              // Yellow
    'Отмена': '#ff5252'              // Red
};

// Short labels for X-axis
const SHORT_LABELS: Record<string, string> = {
    'Не начат': 'Не начат',
    'Предпроектная подготовка': 'Предпроект',
    'Коммерческий этап': 'Коммерция',
    'Реализация': 'Реализация',
    'Пилот': 'Пилот',
    'Завершающий этап': 'Завершение',
    'Постпроектная работа': 'Постпроект',
    'Готово': 'Готово',
    'На поддержке': 'На\nподдержке',
    'Пауза': 'Пауза',
    'Отмена': 'Отмена'
};

interface Project {
    name: string;
    phase?: string; // Changed from status to phase
    direction?: string;
}

interface PhasesChartProps {
    byPhase: Record<string, number>;
    showCompleted?: boolean;
    projects?: Project[];
    selectedPhase?: string | null;
    onPhaseClick?: (phase: string | null) => void;
}

type ViewMode = 'count'; // Only count mode for now

export default function PhasesChart({
    byPhase,
    showCompleted = true,
    projects = [],
    selectedPhase,
    onPhaseClick
}: PhasesChartProps) {
    const [viewMode] = useState<ViewMode>('count');

    // Logical order of phases
    const allPhases = [
        'Не начат',
        'Предпроектная подготовка',
        'Коммерческий этап',
        'Реализация',
        'Пилот',
        'Завершающий этап',
        'Постпроектная работа',
        'Готово',
        'На поддержке',
        'Пауза',
        'Отмена'
    ];

    // Filter out completed statuses if showCompleted is false
    // 'Готово' and 'На поддержке' and 'Отмена' considered "final" in some contexts, but usually 'Готово' and 'На поддержке' are main completed ones.
    const completedPhases = ['Готово', 'На поддержке', 'Отмена'];
    const orderedPhases = showCompleted
        ? allPhases
        : allPhases.filter(s => !completedPhases.includes(s));

    // Helper function to sum values for all matching phase keys (case-insensitive)
    const sumMatchingPhases = (phaseName: string): number => {
        const lowerName = phaseName.toLowerCase().trim();
        let total = 0;
        Object.entries(byPhase).forEach(([key, value]) => {
            if (key.toLowerCase().trim() === lowerName) {
                total += value;
            }
        });
        return total;
    };

    // Get data using case-insensitive lookup
    const data = orderedPhases.map(phase => sumMatchingPhases(phase));
    const colors = orderedPhases.map(phase => PHASE_COLORS[phase] || '#03a9f4');

    // Get projects for a specific phase (case-insensitive match)
    const getProjectsForPhase = (phase: string): { name: string }[] => {
        const lowerPhase = phase.toLowerCase().trim();
        return projects
            .filter(p => (p.phase?.toLowerCase().trim() || '') === lowerPhase)
            .map(p => ({
                name: p.name
            }));
    };

    return (
        <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 300, transition: 'height 0.1s ease-out' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                    Проекты по фазам
                </Typography>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    size="small"
                    disabled // Disabled since we only have count
                >
                    <ToggleButton value="count">Количество</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ width: '100%', flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {/* Custom bar chart with labels and tooltips */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`bars-${orderedPhases.length}-${viewMode}`}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'flex-end',
                            flex: 1,
                            width: '100%',
                            paddingLeft: 8,
                            paddingRight: 8,
                            paddingBottom: '8px', // Space for X-axis baseline
                            minHeight: 100, // Ensure some minimum height
                        }}
                    >
                        {orderedPhases.map((phase, index) => {
                            const value = data[index];
                            const maxValue = Math.max(...data, 1);
                            const barHeight = `${(value / maxValue) * 100}%`;
                            const color = colors[index];
                            const isSelected = !selectedPhase || selectedPhase === phase;

                            return (
                                <motion.div
                                    key={phase}
                                    variants={{
                                        hidden: { opacity: 0, y: 20, scale: 0.9 },
                                        visible: { opacity: 1, y: 0, scale: 1 }
                                    }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    onClick={() => {
                                        const newPhase = selectedPhase === phase ? null : phase;
                                        if (onPhaseClick) {
                                            onPhaseClick(newPhase);
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        opacity: isSelected ? 1 : 0.4,
                                        transition: 'opacity 0.3s ease',
                                        height: '100%',
                                    }}
                                    whileHover={{ y: -4, opacity: 1 }}
                                >
                                    <Tooltip
                                        title={(() => {
                                            const projectsInPhase = getProjectsForPhase(phase);
                                            if (projectsInPhase.length === 0) return phase;

                                            return (
                                                <Box sx={{ p: 0.5 }}>
                                                    <Typography variant="caption" fontWeight="bold" display="block">
                                                        {phase}
                                                    </Typography>
                                                    {projectsInPhase.map((proj, i) => (
                                                        <Typography key={i} variant="caption" display="block">
                                                            • {proj.name}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            );
                                        })()}
                                        arrow
                                        placement="top"
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                            {/* Value label above bar */}
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                                sx={{ mb: 0.5, color: 'text.primary' }}
                                            >
                                                {value}
                                            </Typography>
                                            {/* Bar with gradient */}
                                            <Box
                                                sx={{
                                                    width: 44,
                                                    height: barHeight,
                                                    minHeight: 4,
                                                    background: `linear-gradient(180deg, ${color} 0%, ${color}CC 100%)`,
                                                    borderRadius: '8px 8px 4px 4px',
                                                    transition: 'height 0.3s ease-out, box-shadow 0.2s ease',
                                                    boxShadow: isSelected ? `0 4px 16px ${color}40` : 'none',
                                                }}
                                            />
                                        </Box>
                                    </Tooltip>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* X-axis labels */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    px: 1,
                    mt: 1,
                    borderTop: '1px solid #e0e0e0',
                    pt: 1
                }}>
                    {orderedPhases.map((phase) => (
                        <Typography
                            key={phase}
                            variant="caption"
                            sx={{
                                width: 50,
                                textAlign: 'center',
                                fontSize: '0.65rem',
                                lineHeight: 1.2,
                                whiteSpace: 'pre-line',
                                color: 'text.secondary'
                            }}
                        >
                            {SHORT_LABELS[phase] || phase}
                        </Typography>
                    ))}
                </Box>


            </Box>
        </Paper >
    );
}

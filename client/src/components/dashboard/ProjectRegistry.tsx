import { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Link,
    Tooltip,
    Chip,
    alpha,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    FolderOpen as FolderIcon,
} from '@mui/icons-material';

// Status colors for project stages
const STATUS_COLORS: Record<string, string> = {
    'Не начат': '#9e9e9e',
    'пауза': '#e6c258',
    'Пауза': '#e6c258',
    'Исследование': '#A78BFA',
    'Пилот': '#FF94DB',
    'В разработке менее 50%': '#DCD4FF',
    'В разработке более 50%': '#9982FF',
    'Завершающий этап разработки': '#00A8F0',
    'Готов': '#05CD99',
    'На поддержке': '#6FD439',
};

// Get status color with fallback
function getStatusColor(status: string): string {
    if (!status) return '#9e9e9e';

    // Try exact match first
    if (STATUS_COLORS[status]) return STATUS_COLORS[status];

    // Try case-insensitive match
    const statusLower = status.toLowerCase();
    for (const [key, color] of Object.entries(STATUS_COLORS)) {
        if (key.toLowerCase() === statusLower) return color;
    }

    // Partial match for common patterns
    if (statusLower.includes('менее 50') || statusLower.includes('<50') || statusLower.includes('< 50')) {
        return STATUS_COLORS['В разработке менее 50%'];
    }
    if (statusLower.includes('более 50') || statusLower.includes('>50') || statusLower.includes('> 50')) {
        return STATUS_COLORS['В разработке более 50%'];
    }
    if (statusLower.includes('завершающий')) {
        return STATUS_COLORS['Завершающий этап разработки'];
    }
    if (statusLower.includes('пауза')) {
        return STATUS_COLORS['Пауза'];
    }
    if (statusLower.includes('готов') || statusLower.includes('завершен')) {
        return STATUS_COLORS['Готов'];
    }
    if (statusLower.includes('поддержк')) {
        return STATUS_COLORS['На поддержке'];
    }
    if (statusLower.includes('пилот')) {
        return STATUS_COLORS['Пилот'];
    }
    if (statusLower.includes('исследование')) {
        return STATUS_COLORS['Исследование'];
    }

    return '#9e9e9e'; // Default gray
}

// Status chip component
function StatusChip({ status }: { status: string }) {
    if (!status || status === '-') return <span>-</span>;

    const color = getStatusColor(status);

    return (
        <Chip
            label={status}
            size="small"
            sx={{
                backgroundColor: alpha(color, 0.15),
                color: color,
                border: `1px solid ${alpha(color, 0.3)}`,
                fontWeight: 500,
                fontSize: '0.7rem',
                height: 22,
                borderRadius: 2,
                '& .MuiChip-label': {
                    px: 1,
                },
            }}
        />
    );
}

interface TeamMember {
    name: string;
    role: string;
    employment: string;
}

interface Project {
    name: string;
    direction: string;
    status: string;
    startDate: string;
    endDate: string;
    type: string;
    customer: string;
    customerContacts: string;
    goal: string;
    expectedResult: string;
    stack: string;
    projectLink: string;
    resultLink: string;
    comment: string;
    team: TeamMember[];
    financials: {
        cost: string;
        kp: string;
    };
}

interface ProjectRegistryProps {
    projects: Project[];
    showFlatList?: boolean;
}

// Helper function to calculate deadline status
function calculateDeadlineStatus(endDateStr: string, status: string): string {
    if (!endDateStr || endDateStr === '-') return 'No Deadline';

    const parts = endDateStr.split('.');
    if (parts.length !== 3) return 'Invalid Date';

    const endDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    if (isNaN(endDate.getTime())) return 'Invalid Date';

    const now = new Date();
    const diffTime = now.getTime() - endDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('завершен') || statusLower.includes('на поддержке') || statusLower.includes('готов')) {
        return 'Completed';
    }

    if (diffDays <= 0) {
        return 'On Track';
    } else if (diffDays <= 14) {
        return 'Overdue < 2 weeks';
    } else {
        return 'Overdue > 2 weeks';
    }
}

function isProjectOverdue(project: Project): boolean {
    const deadlineStatus = calculateDeadlineStatus(project.endDate, project.status);
    return deadlineStatus === 'Overdue < 2 weeks' || deadlineStatus === 'Overdue > 2 weeks';
}

// Helper to render a link or text
function renderLink(url: string, label?: string) {
    if (!url) return '-';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return (
            <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    color: '#ED8D48',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                        textDecoration: 'underline',
                    }
                }}
            >
                {label || 'Ссылка'}
            </Link>
        );
    }
    return url || '-';
}

// Format team members as a readable string
function formatTeamMembers(team: TeamMember[], field: 'name' | 'role' | 'employment'): React.ReactNode {
    if (!team || team.length === 0) return '-';
    const values = team.map(m => m[field] || '-');
    if (values.every(v => v === '-' || v === '')) return '-';
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {values.map((val, idx) => (
                <Typography key={idx} variant="caption" sx={{ whiteSpace: 'nowrap' }}>{val || '-'}</Typography>
            ))}
        </Box>
    );
}

// Direction card colors - matched from ProjectsOverview
const DIRECTION_COLORS: Record<string, string> = {
    'Web': '#6366F1',              // Indigo-500
    'Mobile': '#8B5CF6',           // Violet-500
    'Design': '#A855F7',           // Purple-500
    'Разработка ПО': '#EC4899',    // Pink-500
    'Промышленный дизайн': '#14B8A6', // Teal-500
    'ML': '#F59E0B',               // Amber-500
    'Поддержка': '#F43F5E',        // Rose-500 (red)
};

function DirectionAccordion({ direction, projects }: { direction: string, projects: Project[] }) {
    const [expanded, setExpanded] = useState(false);

    const dirColor = DIRECTION_COLORS[direction] || '#ED8D48';

    const columnHeaders = [
        { label: 'Проект', minWidth: 180 },
        { label: 'Статус', minWidth: 140 },
        { label: 'Даты', minWidth: 100 },
        { label: 'Тип', minWidth: 100 },
        { label: 'Заказчик', minWidth: 120 },
        { label: 'Цель', minWidth: 180 },
        { label: 'Стек', minWidth: 120 },
        { label: 'Ссылки', minWidth: 100 },
        { label: 'Команда', minWidth: 150 },
        { label: 'Роль', minWidth: 120 },
    ];

    return (
        <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            disableGutters
            elevation={0}
            sx={{
                '&:before': { display: 'none' },
                bgcolor: 'transparent',
                border: '1px solid',
                borderColor: alpha(dirColor, 0.2),
                borderRadius: '16px !important',
                mb: 1.5,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: alpha(dirColor, 0.4),
                    boxShadow: `0 4px 20px ${alpha(dirColor, 0.15)}`,
                },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: dirColor }} />}
                sx={{
                    minHeight: 56,
                    px: 2.5,
                    bgcolor: alpha(dirColor, 0.04),
                    '&:hover': {
                        bgcolor: alpha(dirColor, 0.08),
                    },
                    '& .MuiAccordionSummary-content': {
                        my: 1.5,
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 3,
                            bgcolor: alpha(dirColor, 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FolderIcon sx={{ color: dirColor, fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            {direction}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {projects.length} проект{projects.length === 1 ? '' : projects.length < 5 ? 'а' : 'ов'}
                        </Typography>
                    </Box>
                    <Chip
                        label={projects.length}
                        size="small"
                        sx={{
                            bgcolor: dirColor,
                            color: 'white',
                            fontWeight: 600,
                            minWidth: 32,
                        }}
                    />
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
                <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                {columnHeaders.map((col) => (
                                    <TableCell
                                        key={col.label}
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            color: 'text.secondary',
                                            bgcolor: '#FAFAFF',
                                            minWidth: col.minWidth,
                                            whiteSpace: 'nowrap',
                                            borderBottom: `1px solid ${alpha(dirColor, 0.1)}`,
                                        }}
                                    >
                                        {col.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.map((project, idx) => (
                                <TableRow
                                    key={`${project.name}-${idx}`}
                                    sx={{
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: alpha(dirColor, 0.04),
                                        },
                                        '&:last-child td': {
                                            borderBottom: 0,
                                        },
                                    }}
                                >
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Tooltip title={project.goal || project.name} placement="top">
                                            <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 180 }}>
                                                {project.name || '-'}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell><StatusChip status={project.status} /></TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {project.startDate || '-'} → {project.endDate || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">{project.type || '-'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                                            {project.customer || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            maxWidth: 180,
                                        }}>
                                            {project.goal || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                                            {project.stack || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {project.projectLink && renderLink(project.projectLink, '📁')}
                                            {project.resultLink && renderLink(project.resultLink, '📊')}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {formatTeamMembers(project.team, 'name')}
                                    </TableCell>
                                    <TableCell>
                                        {formatTeamMembers(project.team, 'role')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AccordionDetails>
        </Accordion>
    );
}

export default function ProjectRegistry({ projects, showFlatList = false }: ProjectRegistryProps) {
    const [showOverdue, setShowOverdue] = useState(true);

    // Filter projects based on overdue checkbox
    const filteredProjects = showOverdue
        ? projects
        : projects.filter(p => !isProjectOverdue(p));

    // Group projects by direction
    const groupedProjects = filteredProjects.reduce((acc, project) => {
        const dir = project.direction || 'Другое';
        if (!acc[dir]) {
            acc[dir] = [];
        }
        acc[dir].push(project);
        return acc;
    }, {} as Record<string, Project[]>);

    // Sort directions by project count (descending)
    const sortedDirections = Object.entries(groupedProjects)
        .sort((a, b) => b[1].length - a[1].length);

    return (
        <Paper
            sx={{
                width: '100%',
                overflow: 'hidden',
                mt: 4,
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(250,250,255,0.95) 100%)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                        Реестр проектов
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {filteredProjects.length} проектов в {sortedDirections.length} направлениях
                    </Typography>
                </Box>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={showOverdue}
                            onChange={(e) => setShowOverdue(e.target.checked)}
                            sx={{
                                color: alpha('#ED8D48', 0.4),
                                '&.Mui-checked': {
                                    color: '#ED8D48',
                                },
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Просроченные проекты
                        </Typography>
                    }
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {showFlatList ? (
                    /* Flat list view when deadline filter is active */
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 180 }}>Проект</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 100 }}>Направление</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 140 }}>Статус</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 100 }}>Даты</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 100 }}>Тип</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 120 }}>Заказчик</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 180 }}>Цель</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 120 }}>Стек</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 100 }}>Ссылки</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 150 }}>Команда</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', bgcolor: '#FAFAFF', minWidth: 120 }}>Роль</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredProjects.map((project, idx) => {
                                    const dirColor = DIRECTION_COLORS[project.direction] || '#ED8D48';
                                    return (
                                        <TableRow
                                            key={`${project.name}-${idx}`}
                                            sx={{
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    bgcolor: alpha(dirColor, 0.04),
                                                },
                                            }}
                                        >
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Tooltip title={project.goal || project.name} placement="top">
                                                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 180 }}>
                                                        {project.name || '-'}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={project.direction || 'Другое'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(dirColor, 0.12),
                                                        color: dirColor,
                                                        fontWeight: 500,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell><StatusChip status={project.status} /></TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {project.startDate || '-'} → {project.endDate || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">{project.type || '-'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                                                    {project.customer || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    maxWidth: 180,
                                                }}>
                                                    {project.goal || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                                                    {project.stack || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    {project.projectLink && renderLink(project.projectLink, '📁')}
                                                    {project.resultLink && renderLink(project.resultLink, '📊')}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {formatTeamMembers(project.team, 'name')}
                                            </TableCell>
                                            <TableCell>
                                                {formatTeamMembers(project.team, 'role')}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    /* Grouped view by directions */
                    sortedDirections.map(([direction, dirProjects]) => (
                        <DirectionAccordion
                            key={direction}
                            direction={direction}
                            projects={dirProjects}
                        />
                    ))
                )}
            </Box>
        </Paper>
    );
}

import { useState } from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Collapse,
    IconButton,
    Checkbox,
    FormControlLabel,
    Link,
    Tooltip,
    Chip,
    alpha,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Status colors for project stages
const STATUS_COLORS: Record<string, string> = {
    'Не начат': '#9e9e9e',
    'пауза': '#e6c258',
    'Пауза': '#e6c258',
    'Пилот': '#FF94DB',
    'В разработке менее 50%': '#9982FF',
    'В разработке более 50%': '#7B61FF',
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
                border: `1px solid ${color}`,
                fontWeight: 500,
                fontSize: '0.75rem',
                height: 24,
                '& .MuiChip-label': {
                    px: 1.5,
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
            <Link href={url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>
                {label || 'Ссылка'}
            </Link>
        );
    }
    return url || '-';
}

// Format team members as a readable string
function formatTeamMembers(team: TeamMember[], field: 'name' | 'role' | 'employment'): string {
    if (!team || team.length === 0) return '-';
    return team.map(m => m[field] || '').filter(Boolean).join(', ') || '-';
}

function Row({ direction, projects }: { direction: string, projects: Project[] }) {
    const [open, setOpen] = useState(true);

    const columnHeaders = [
        { label: 'Наименование', minWidth: 200 },
        { label: 'Начало', minWidth: 100 },
        { label: 'Завершение', minWidth: 100 },
        { label: 'Тип проекта', minWidth: 120 },
        { label: 'Этап проекта', minWidth: 150 },
        { label: 'Заказчик', minWidth: 150 },
        { label: 'Контакты заказчика', minWidth: 180 },
        { label: 'Цель проекта', minWidth: 200 },
        { label: 'Ожидаемый результат', minWidth: 200 },
        { label: 'Стек', minWidth: 150 },
        { label: 'Ссылка на проект', minWidth: 120 },
        { label: 'Ссылка на результат', minWidth: 120 },
        { label: 'Расчет стоимости', minWidth: 120 },
        { label: 'КП', minWidth: 100 },
        { label: 'Команда ФИО', minWidth: 200 },
        { label: 'Роль в проекте', minWidth: 150 },
        { label: 'Трудоустройство', minWidth: 150 },
        { label: 'Комментарий', minWidth: 200 },
    ];

    const totalWidth = columnHeaders.reduce((sum, col) => sum + col.minWidth, 0);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: '#f5f5f5' }}>
                <TableCell colSpan={columnHeaders.length} component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                        <Typography variant="subtitle1" fontWeight="bold" component="div" sx={{ ml: 1 }}>
                            {direction} ({projects.length})
                        </Typography>
                    </Box>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columnHeaders.length}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, overflowX: 'auto' }}>
                            <Table size="small" aria-label="projects" sx={{ minWidth: totalWidth }}>
                                <TableHead>
                                    <TableRow>
                                        {columnHeaders.map((col) => (
                                            <TableCell
                                                key={col.label}
                                                sx={{ fontWeight: 'bold', minWidth: col.minWidth, whiteSpace: 'nowrap' }}
                                            >
                                                {col.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.map((project, idx) => (
                                        <TableRow key={`${project.name}-${idx}`}>
                                            <TableCell component="th" scope="row" sx={{ minWidth: 200 }}>
                                                <Tooltip title={project.name} arrow>
                                                    <span>{project.name || '-'}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 100 }}>{project.startDate || '-'}</TableCell>
                                            <TableCell sx={{ minWidth: 100 }}>{project.endDate || '-'}</TableCell>
                                            <TableCell sx={{ minWidth: 120 }}>{project.type || '-'}</TableCell>
                                            <TableCell sx={{ minWidth: 150 }}><StatusChip status={project.status} /></TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>{project.customer || '-'}</TableCell>
                                            <TableCell sx={{ minWidth: 180 }}>{project.customerContacts || '-'}</TableCell>
                                            <TableCell sx={{ minWidth: 200, maxWidth: 300 }}>{project.goal || '-'}</TableCell>
                                            <TableCell sx={{ minWidth: 200, maxWidth: 300 }}>{project.expectedResult || '-'}</TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>{project.stack || '-'}</TableCell>
                                            <TableCell sx={{ minWidth: 120 }}>{renderLink(project.projectLink)}</TableCell>
                                            <TableCell sx={{ minWidth: 120 }}>{renderLink(project.resultLink)}</TableCell>
                                            <TableCell sx={{ minWidth: 120 }}>{renderLink(project.financials?.cost)}</TableCell>
                                            <TableCell sx={{ minWidth: 100 }}>{renderLink(project.financials?.kp)}</TableCell>
                                            <TableCell sx={{ minWidth: 200 }}>{formatTeamMembers(project.team, 'name')}</TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>{formatTeamMembers(project.team, 'role')}</TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>{formatTeamMembers(project.team, 'employment')}</TableCell>
                                            <TableCell sx={{ minWidth: 200 }}>{project.comment || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function ProjectRegistry({ projects }: ProjectRegistryProps) {
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

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 4, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                    Реестр проектов
                </Typography>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={showOverdue}
                            onChange={(e) => setShowOverdue(e.target.checked)}
                            sx={{
                                color: alpha('#5B5FE3', 0.4),
                                '&.Mui-checked': {
                                    color: '#5B5FE3',
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
            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader aria-label="collapsible table">
                    <TableBody>
                        {Object.entries(groupedProjects).map(([direction, dirProjects]) => (
                            <Row key={direction} direction={direction} projects={dirProjects} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

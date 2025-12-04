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
    IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface Project {
    name: string;
    direction: string;
    status: string;
    startDate: string;
    endDate: string;
    customer: string;
    customerContacts: string;
    goal: string;
}

interface ProjectRegistryProps {
    projects: Project[];
}

function Row({ direction, projects }: { direction: string, projects: Project[] }) {
    const [open, setOpen] = useState(true);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, bgcolor: '#f5f5f5' }}>
                <TableCell colSpan={8} component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                        <Typography variant="subtitle1" fontWeight="bold" component="div" sx={{ ml: 1 }}>
                            {direction}
                        </Typography>
                    </Box>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Наименование</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Начало</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Завершение</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Этап проекта</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Заказчик</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Контакты заказчика</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Цель проекта</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.map((project) => (
                                        <TableRow key={project.name}>
                                            <TableCell component="th" scope="row">{project.name}</TableCell>
                                            <TableCell>{project.startDate}</TableCell>
                                            <TableCell>{project.endDate}</TableCell>
                                            <TableCell>{project.status}</TableCell>
                                            <TableCell>{project.customer}</TableCell>
                                            <TableCell>{project.customerContacts}</TableCell>
                                            <TableCell sx={{ maxWidth: 300 }}>{project.goal}</TableCell>
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
    // Group projects by direction
    const groupedProjects = projects.reduce((acc, project) => {
        const dir = project.direction || 'Other';
        if (!acc[dir]) {
            acc[dir] = [];
        }
        acc[dir].push(project);
        return acc;
    }, {} as Record<string, Project[]>);

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 4, p: 2 }}>
            <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                Реестр проектов
            </Typography>
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

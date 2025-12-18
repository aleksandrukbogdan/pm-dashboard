import { Typography, Paper, Grid, Box, Tooltip } from '@mui/material';
import ChangeIndicator from './ChangeIndicator';

interface Project {
    name: string;
    totalCost?: string;
    paymentStatus?: string;
    financials?: {
        cost?: string;
    };
}

interface FinancesProps {
    totalBudget: number;
    financialBreakdown?: {
        total: number;
        inWork: number;
        receivable: number;
        paid: number;
    };
    projects?: Project[];
    changes?: {
        total: number;
        inWork: number;
        receivable: number;
        paid: number;
    };
}

// Parse cost string to number
function parseCost(costStr: string | undefined): number {
    if (!costStr) return 0;
    if (costStr.includes('http') || costStr.match(/\d{2}\.\d{2}/)) return 0;
    const cleanStr = costStr.replace(/р\./g, '').replace(/[^0-9,.-]/g, '').replace(',', '.');
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
}

// Format number as thousands with Russian locale (no decimals)
function formatAmount(value: number): string {
    const inThousands = Math.round(value / 1000);
    return inThousands.toLocaleString('ru-RU');
}

// Format cost for tooltip (in rubles, not thousands, no decimals)
function formatCostRub(value: number): string {
    return Math.round(value).toLocaleString('ru-RU') + ' ₽';
}

// Get payment status category
function getPaymentCategory(paymentStatus: string | undefined): 'inWork' | 'receivable' | 'paid' {
    const status = (paymentStatus || '').toLowerCase().trim();
    if (status.includes('оплачено')) return 'paid';
    if (status.includes('счет выставлен')) return 'receivable';
    return 'inWork';
}

// Tooltip content component
function ProjectsList({ projects, category }: { projects: Project[]; category: 'inWork' | 'receivable' | 'paid' | 'total' }) {
    // Filter by category and exclude projects with 0 cost
    const filteredProjects = (category === 'total'
        ? projects
        : projects.filter(p => getPaymentCategory(p.paymentStatus) === category)
    ).filter(p => {
        const cost = parseCost(p.totalCost || p.financials?.cost);
        return cost > 0;
    });

    if (filteredProjects.length === 0) {
        return (
            <Typography variant="body2" sx={{ p: 1, color: 'text.secondary' }}>
                Нет проектов
            </Typography>
        );
    }

    return (
        <Box sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
            {filteredProjects.map((project, idx) => {
                const cost = parseCost(project.totalCost || project.financials?.cost);
                return (
                    <Box key={idx} sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2,
                        py: 0.5,
                        borderBottom: idx < filteredProjects.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                        <Typography variant="body2" sx={{
                            flex: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 250
                        }}>
                            {project.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {formatCostRub(cost)}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}

export default function Finances({ totalBudget, financialBreakdown, projects = [], changes }: FinancesProps) {
    const total = financialBreakdown?.total ?? totalBudget;
    const inWork = financialBreakdown?.inWork ?? 0;
    const receivable = financialBreakdown?.receivable ?? 0;
    const paid = financialBreakdown?.paid ?? 0;

    const tooltipProps = {
        arrow: true,
        placement: 'bottom' as const,
        componentsProps: {
            tooltip: {
                sx: {
                    bgcolor: 'rgba(43, 54, 116, 0.95)',
                    backdropFilter: 'blur(10px)',
                    '& .MuiTooltip-arrow': {
                        color: 'rgba(43, 54, 116, 0.95)',
                    },
                    maxWidth: 400,
                    minWidth: 280,
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(43, 54, 116, 0.2)',
                }
            }
        }
    };

    return (
        <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Финансы, тыс. ₽
            </Typography>

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={6} lg={3}>
                    <Tooltip
                        title={<ProjectsList projects={projects} category="total" />}
                        {...tooltipProps}
                    >
                        <Box sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, height: '100%' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', minHeight: 32, lineHeight: 1.3 }}>
                                Стоимость проектов
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="h5" fontWeight="bold" color="primary.dark">
                                    {formatAmount(total)}
                                </Typography>
                                {changes?.total !== undefined && changes.total !== 0 && (
                                    <ChangeIndicator change={changes.total} size="small" format="currency" />
                                )}
                            </Box>
                        </Box>
                    </Tooltip>
                </Grid>
                <Grid item xs={6} lg={3}>
                    <Tooltip
                        title={<ProjectsList projects={projects} category="inWork" />}
                        {...tooltipProps}
                    >
                        <Box sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, height: '100%' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', minHeight: 32, lineHeight: 1.3 }}>
                                В работе
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="h5" fontWeight="bold" color="warning.main">
                                    {formatAmount(inWork)}
                                </Typography>
                                {changes?.inWork !== undefined && changes.inWork !== 0 && (
                                    <ChangeIndicator change={changes.inWork} size="small" format="currency" />
                                )}
                            </Box>
                        </Box>
                    </Tooltip>
                </Grid>
                <Grid item xs={6} lg={3}>
                    <Tooltip
                        title={<ProjectsList projects={projects} category="receivable" />}
                        {...tooltipProps}
                    >
                        <Box sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, height: '100%' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', minHeight: 32, lineHeight: 1.3 }}>
                                Деб. задолженность
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="h5" fontWeight="bold" color="#14B8A6">
                                    {formatAmount(receivable)}
                                </Typography>
                                {changes?.receivable !== undefined && changes.receivable !== 0 && (
                                    <ChangeIndicator change={changes.receivable} size="small" format="currency" />
                                )}
                            </Box>
                        </Box>
                    </Tooltip>
                </Grid>
                <Grid item xs={6} lg={3}>
                    <Tooltip
                        title={<ProjectsList projects={projects} category="paid" />}
                        {...tooltipProps}
                    >
                        <Box sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, height: '100%' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', minHeight: 32, lineHeight: 1.3 }}>
                                Оплачено
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                    {formatAmount(paid)}
                                </Typography>
                                {changes?.paid !== undefined && changes.paid !== 0 && (
                                    <ChangeIndicator change={changes.paid} size="small" format="currency" />
                                )}
                            </Box>
                        </Box>
                    </Tooltip>
                </Grid>
            </Grid>
        </Paper>
    );
}

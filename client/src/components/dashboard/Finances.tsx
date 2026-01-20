import { Typography, Paper, Grid, Box, Tooltip } from '@mui/material';
import ChangeIndicator from './ChangeIndicator';

interface Project {
    name: string;
    totalCost?: string;
    paymentStatus?: string;
    phase?: string;
    direction?: string;
    monthlyPayment?: string;
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
        potential: number;
        regularMoney: number;
    };
    projects?: Project[];
    changes?: {
        total: number;
        inWork: number;
        receivable: number;
        paid: number;
        potential: number;
        regularMoney: number;
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

// Format number with Russian locale (no decimals)
function formatAmount(value: number): string {
    return Math.round(value).toLocaleString('ru-RU');
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

// Phases configuration for filtering
const POTENTIAL_PHASES = ['не начат', 'предпроектная подготовка', 'коммерческий этап'];

// Tooltip content component - TeamGrid style with bullet list
function ProjectsList({ projects, category }: { projects: Project[]; category: 'inWork' | 'receivable' | 'paid' | 'total' | 'potential' | 'regularMoney' }) {
    let filteredProjects: Project[] = [];

    if (category === 'total') {
        // All projects with cost > 0 (excluding support projects)
        filteredProjects = projects.filter(p => {
            const cost = parseCost(p.totalCost || p.financials?.cost);
            return cost > 0 && p.direction !== 'Поддержка';
        });
    } else if (category === 'potential') {
        // Projects in early phases
        filteredProjects = projects.filter(p => {
            const phase = (p.phase || '').toLowerCase().trim();
            const isPotential = POTENTIAL_PHASES.some(ph => phase.includes(ph));
            const cost = parseCost(p.totalCost || p.financials?.cost);
            return isPotential && cost > 0;
        });
    } else if (category === 'regularMoney') {
        // Support projects with monthly payment
        filteredProjects = projects.filter(p => {
            const isSupport = p.direction === 'Поддержка';
            const monthlyPayment = parseCost(p.monthlyPayment || '');
            return isSupport && monthlyPayment > 0;
        });
    } else {
        // inWork, receivable, paid - filter by payment status
        filteredProjects = projects.filter(p => {
            const cost = parseCost(p.totalCost || p.financials?.cost);
            return cost > 0 && getPaymentCategory(p.paymentStatus) === category && p.direction !== 'Поддержка';
        });
    }

    if (filteredProjects.length === 0) {
        return <Typography variant="caption">Нет данных</Typography>;
    }

    return (
        <Box sx={{ p: 0.5, maxHeight: 300, overflow: 'auto' }}>
            <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                {category === 'potential' ? 'Потенциальные проекты:' :
                    category === 'regularMoney' ? 'Проекты на поддержке:' :
                        category === 'total' ? 'Все проекты:' :
                            category === 'inWork' ? 'В работе:' :
                                category === 'receivable' ? 'Дебиторская задолженность:' : 'Оплачено:'}
            </Typography>
            {filteredProjects.map((project, idx) => {
                const cost = category === 'regularMoney'
                    ? parseCost(project.monthlyPayment || '')
                    : parseCost(project.totalCost || project.financials?.cost);
                return (
                    <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
                        • {project.name} — {formatCostRub(cost)}
                    </Typography>
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
    const potential = financialBreakdown?.potential ?? 0;
    const regularMoney = financialBreakdown?.regularMoney ?? 0;

    const tooltipProps = {
        arrow: true,
        placement: 'top' as const,
    };

    return (
        <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Финансы, ₽
            </Typography>

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={6} lg={4}>
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
                <Grid item xs={6} lg={4}>
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
                <Grid item xs={6} lg={4}>
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
                <Grid item xs={6} lg={4}>
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
                <Grid item xs={6} lg={4}>
                    <Tooltip
                        title={<ProjectsList projects={projects} category="potential" />}
                        {...tooltipProps}
                    >
                        <Box sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, height: '100%' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', minHeight: 32, lineHeight: 1.3 }}>
                                Потенциальные
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="h5" fontWeight="bold" color="#8B5CF6">
                                    {formatAmount(potential)}
                                </Typography>
                                {changes?.potential !== undefined && changes.potential !== 0 && (
                                    <ChangeIndicator change={changes.potential} size="small" format="currency" />
                                )}
                            </Box>
                        </Box>
                    </Tooltip>
                </Grid>
                <Grid item xs={6} lg={4}>
                    <Tooltip
                        title={<ProjectsList projects={projects} category="regularMoney" />}
                        {...tooltipProps}
                    >
                        <Box sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, height: '100%' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', minHeight: 32, lineHeight: 1.3 }}>
                                Регулярные
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="h5" fontWeight="bold" color="#3B82F6">
                                    {formatAmount(regularMoney)}
                                </Typography>
                                {changes?.regularMoney !== undefined && changes.regularMoney !== 0 && (
                                    <ChangeIndicator change={changes.regularMoney} size="small" format="currency" />
                                )}
                            </Box>
                        </Box>
                    </Tooltip>
                </Grid>
            </Grid>
        </Paper>
    );
}

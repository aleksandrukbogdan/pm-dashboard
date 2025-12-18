import { getSnapshot } from './snapshotService.js';

/**
 * Get date key for N days ago
 */
function getDateKeyForDaysAgo(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
}

/**
 * Calculate comparison data between current and historical snapshot
 */
export async function getComparisonData(currentData, comparisonType) {
    // Determine which date to compare against
    const daysAgo = comparisonType === 'previousDay' ? 1 : 7;
    const compareDate = getDateKeyForDaysAgo(daysAgo);

    // Get historical snapshot
    const historicalSnapshot = await getSnapshot(compareDate);

    if (!historicalSnapshot) {
        return {
            available: false,
            comparisonType,
            comparisonDate: compareDate,
            message: `No snapshot available for ${compareDate}`
        };
    }

    // Calculate project changes
    const currentProjects = currentData.projects || [];
    const historicalProjects = historicalSnapshot.projects || [];

    // Build maps for quick lookup
    const currentProjectMap = new Map();
    currentProjects.forEach(p => {
        const key = `${p.name}|${p.direction}`;
        currentProjectMap.set(key, p);
    });

    const historicalProjectMap = new Map();
    historicalProjects.forEach(p => {
        const key = `${p.name}|${p.direction}`;
        historicalProjectMap.set(key, p);
    });

    // Calculate byDirection changes
    const currentByDirection = {};
    const historicalByDirection = {};

    currentProjects.forEach(p => {
        const dir = p.direction || 'Другое';
        currentByDirection[dir] = (currentByDirection[dir] || 0) + 1;
    });

    historicalProjects.forEach(p => {
        const dir = p.direction || 'Другое';
        historicalByDirection[dir] = (historicalByDirection[dir] || 0) + 1;
    });

    const directionChanges = {};
    const allDirections = new Set([...Object.keys(currentByDirection), ...Object.keys(historicalByDirection)]);
    allDirections.forEach(dir => {
        const current = currentByDirection[dir] || 0;
        const historical = historicalByDirection[dir] || 0;
        directionChanges[dir] = current - historical;
    });

    // Calculate financial changes
    const parseCost = (costStr) => {
        if (!costStr) return 0;
        if (costStr.includes('http') || costStr.match(/\d{2}\.\d{2}/)) return 0;
        const cleanStr = costStr.replace(/р\./g, '').replace(/[^0-9,.-]/g, '').replace(',', '.');
        const val = parseFloat(cleanStr);
        return isNaN(val) ? 0 : val;
    };

    const calculateFinancials = (projects) => {
        const breakdown = { total: 0, inWork: 0, receivable: 0, paid: 0 };
        projects.forEach(p => {
            const cost = parseCost(p.totalCost || p.financials?.cost);
            const paymentStatus = (p.paymentStatus || '').toLowerCase().trim();
            breakdown.total += cost;
            if (paymentStatus.includes('оплачено')) {
                breakdown.paid += cost;
            } else if (paymentStatus.includes('счет выставлен')) {
                breakdown.receivable += cost;
            } else {
                breakdown.inWork += cost;
            }
        });
        return breakdown;
    };

    const currentFinancials = calculateFinancials(currentProjects);
    const historicalFinancials = calculateFinancials(historicalProjects);

    // Calculate deadline changes
    const calculateDeadlineStatus = (endDateStr, status) => {
        if (!endDateStr || endDateStr === '-') return 'No Deadline';
        const parts = endDateStr.split('.');
        if (parts.length !== 3) return 'Invalid Date';
        const endDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (isNaN(endDate.getTime())) return 'Invalid Date';

        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('завершен') || statusLower.includes('на поддержке') || statusLower.includes('готов')) {
            return 'Completed';
        }
        if (statusLower.includes('пилот') || statusLower.includes('пауза')) {
            return 'Excluded';
        }

        const now = new Date();
        const diffTime = now.getTime() - endDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 'On Track';
        else if (diffDays <= 14) return 'Overdue < 2 weeks';
        else return 'Overdue > 2 weeks';
    };

    const calculateDeadlines = (projects) => {
        const deadlines = { onTrack: 0, overdueSmall: 0, overdueLarge: 0, completed: 0 };
        projects.forEach(p => {
            const status = calculateDeadlineStatus(p.endDate, p.status);
            if (status === 'Completed') deadlines.completed++;
            else if (status === 'On Track') deadlines.onTrack++;
            else if (status === 'Overdue < 2 weeks') deadlines.overdueSmall++;
            else if (status === 'Overdue > 2 weeks') deadlines.overdueLarge++;
        });
        return deadlines;
    };

    const currentDeadlines = calculateDeadlines(currentProjects);
    const historicalDeadlines = calculateDeadlines(historicalProjects);

    // Calculate byType changes
    const calculateByType = (projects) => {
        const byType = { internal: 0, commercial: 0, free: 0 };
        projects.forEach(p => {
            const type = (p.type || '').toLowerCase().trim();
            if (type.includes('внутренний')) byType.internal++;
            else if (type.includes('коммерческий')) byType.commercial++;
            else if (type.includes('безоплатный') || type.includes('бесплатный')) byType.free++;
        });
        return byType;
    };

    const currentByType = calculateByType(currentProjects);
    const historicalByType = calculateByType(historicalProjects);

    // Calculate byCompany changes
    const calculateByCompany = (projects) => {
        const byCompany = { ite29: 0, nir: 0 };
        projects.forEach(p => {
            const executor = (p.executor || '').toLowerCase();
            const isIte29 = executor.includes('итэ') || executor.includes('it-') || executor.includes('элемент') || executor.includes('ите-29');
            const isNir = executor.includes('нир');
            if (isIte29) byCompany.ite29++;
            if (isNir) byCompany.nir++;
        });
        return byCompany;
    };

    const currentByCompany = calculateByCompany(currentProjects);
    const historicalByCompany = calculateByCompany(historicalProjects);

    return {
        available: true,
        comparisonType,
        comparisonDate: compareDate,
        changes: {
            projects: {
                total: currentProjects.length - historicalProjects.length,
                byDirection: directionChanges,
                byType: {
                    internal: currentByType.internal - historicalByType.internal,
                    commercial: currentByType.commercial - historicalByType.commercial,
                    free: currentByType.free - historicalByType.free
                },
                byCompany: {
                    ite29: currentByCompany.ite29 - historicalByCompany.ite29,
                    nir: currentByCompany.nir - historicalByCompany.nir
                }
            },
            finances: {
                total: currentFinancials.total - historicalFinancials.total,
                inWork: currentFinancials.inWork - historicalFinancials.inWork,
                receivable: currentFinancials.receivable - historicalFinancials.receivable,
                paid: currentFinancials.paid - historicalFinancials.paid
            },
            deadlines: {
                onTrack: currentDeadlines.onTrack - historicalDeadlines.onTrack,
                overdueSmall: currentDeadlines.overdueSmall - historicalDeadlines.overdueSmall,
                overdueLarge: currentDeadlines.overdueLarge - historicalDeadlines.overdueLarge,
                completed: currentDeadlines.completed - historicalDeadlines.completed
            }
        }
    };
}

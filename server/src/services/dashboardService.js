import { getSheetDataAsObjects } from './googleSheets.js';

const SHEET_MAPPINGS = [
  { name: 'Проекты WEB', direction: 'Web', headerRowIndex: 1 },
  { name: 'Проекты mobile', direction: 'Mobile', headerRowIndex: 0 },
  { name: 'Design (графический)', direction: 'Design', headerRowIndex: 0 },
  { name: 'Проекты разработка ПО', direction: 'Разработка ПО', headerRowIndex: 0 },
  { name: 'Проекты пром дизайн', direction: 'Промышленный дизайн', headerRowIndex: 0 },
  { name: 'Проекты ML', direction: 'ML', headerRowIndex: 0 },
];

// Helper function to normalize name:
// - Replace ё with е (Алёна = Алена)
// - Take only first 2 words (Surname + FirstName)
function normalizeName(name) {
  const normalized = name.trim().replace(/ё/g, 'е').replace(/Ё/g, 'Е');
  const parts = normalized.split(/\s+/);
  return parts.slice(0, 2).join(' ');
}

export async function getDashboardData(spreadsheetId) {
  try {
    const allProjects = [];

    // Fetch data from all sheets
    for (const mapping of SHEET_MAPPINGS) {
      const rows = await getSheetDataAsObjects(spreadsheetId, mapping.name, mapping.headerRowIndex);

      let lastProject = null;

      // Normalize rows with fill-down logic
      const normalizedRows = rows.map(row => {
        // Find dynamic status column (any column starting with _этап_проекта)
        const statusKey = Object.keys(row).find(k => k.startsWith('_этап_проекта'));
        const status = statusKey ? (row[statusKey] || '').trim() : '';

        const name = row['наименование_проекта'];

        // If name exists, update lastProject. If not, use lastProject's details (except team/unique fields)
        if (name) {
          lastProject = {
            name: name,
            direction: mapping.direction,
            type: row['тип_проекта'] || '',
            startDate: row['начало_проекта'] || '',
            endDate: row['завершение_проекта'] || '',
            status: status,
            customer: row['_заказчик'] || '',
            customerContacts: row['_контакты_заказчика'] || '',
            executor: row['_компания_исполнитель'] || '',
            totalCost: row['итоговая_стоимость'] || row['_итоговая_стоимость'] || '',
            paymentStatus: row['оплата_проекта'] || '',
            goal: row['_цель_проекта'] || '',
            expectedResult: row['_ожидаемый_результат'] || row['ожидаемый_результат'] || row['ожидаемый_продукт,_потребность_которую_закрываем'] || row['_ожидаемый_продукт,_потребность_которую_закрываем'] || '',
            stack: row['стек'] || row['_стек'] || '',
            projectLink: row['ссылка_на_проект'] || row['_ссылка_на_проект'] || row['ссылка_на_макет'] || row['_ссылка_на_макет'] || '',
            resultLink: row['ссылка_на_результат'] || row['_ссылка_на_результат'] || row['ссылка_на_готовый_результат'] || row['_ссылка_на_готовый_результат'] || '',
            comment: row['комментарий'] || row['_комментарий'] || '',
            financials: {
              cost: row['расчет_стоимости_услуг'] || '',
              kp: row['_кп'] || ''
            }
          };
        }

        // If we have a current project context (either from this row or filled down)
        if (lastProject) {
          return {
            ...lastProject,
            // Always take team info from current row
            teamMemberName: row['команда_фио'] || '',
            teamMemberRole: row['роль_в_проекте'] || '',
            teamMemberEmployment: row['трудоустройство'] || row['_трудоустройство'] || '',
          };
        }
        return null;
      }).filter(p => p); // Filter out rows before first project

      allProjects.push(...normalizedRows);
    }

    // Group by project name AND direction (to handle same-name projects in different directions)
    const groupedProjects = {};

    allProjects.forEach(p => {
      const key = `${p.name}|${p.direction}`;

      if (!groupedProjects[key]) {
        groupedProjects[key] = {
          name: p.name,
          direction: p.direction,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          customer: p.customer,
          customerContacts: p.customerContacts,
          goal: p.goal,
          expectedResult: p.expectedResult,
          stack: p.stack,
          projectLink: p.projectLink,
          resultLink: p.resultLink,
          comment: p.comment,
          team: [],
          financials: p.financials,
          totalCost: p.totalCost,
          paymentStatus: p.paymentStatus,
          type: p.type,
          executor: p.executor
        };
      }

      // Add team members if exist and not duplicate
      // Split comma-separated names and normalize
      if (p.teamMemberName) {
        const names = p.teamMemberName.split(',').map(n => n.trim()).filter(n => n);
        names.forEach(fullName => {
          const normalizedName = normalizeName(fullName);

          const exists = groupedProjects[key].team.some(m => m.name === normalizedName);
          if (!exists && normalizedName) {
            groupedProjects[key].team.push({
              name: normalizedName,
              role: p.teamMemberRole,
              employment: p.teamMemberEmployment || p.executor
            });
          }
        });
      }
    });

    const projects = Object.values(groupedProjects);

    // Calculate stats
    // Count unique team members (normalized names)
    const allNormalizedNames = new Set();
    allProjects.forEach(p => {
      if (p.teamMemberName) {
        const names = p.teamMemberName.split(',').map(n => n.trim()).filter(n => n);
        names.forEach(fullName => {
          const normalized = normalizeName(fullName);
          if (normalized) allNormalizedNames.add(normalized);
        });
      }
    });

    const financialBreakdown = calculateFinancialBreakdown(projects);

    const summary = {
      totalProjects: projects.length,
      totalTeamMembers: allNormalizedNames.size,
      totalBudget: financialBreakdown.total,
      financialBreakdown: financialBreakdown
    };

    const charts = {
      byDirection: calculateByDirection(projects),
      deadlines: calculateDeadlines(projects),
      byStatus: calculateByStatus(projects),
      teamRoles: calculateTeamRoles(allProjects),
      byType: calculateByType(projects),
      byCompany: calculateByCompany(allProjects)
    };

    return { summary, charts, projects };
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    throw error;
  }
}

function parseCost(costStr) {
  if (!costStr) return 0;
  if (costStr.includes('http') || costStr.match(/\d{2}\.\d{2}/)) {
    return 0;
  }
  const cleanStr = costStr.replace(/р\./g, '').replace(/[^0-9,.-]/g, '').replace(',', '.');
  const val = parseFloat(cleanStr);
  return isNaN(val) ? 0 : val;
}

function calculateTotalBudget(projects) {
  return projects.reduce((sum, p) => {
    const costStr = p.totalCost || p.financials.cost;
    return sum + parseCost(costStr);
  }, 0);
}

/**
 * Calculate financial breakdown by payment status
 * - inWork: "Счет не выставлен" or empty/dash
 * - receivable: "Счет выставлен"
 * - paid: "Оплачено"
 */
function calculateFinancialBreakdown(projects) {
  const breakdown = {
    total: 0,
    inWork: 0,
    receivable: 0,
    paid: 0
  };

  projects.forEach(p => {
    const costStr = p.totalCost || p.financials?.cost;
    const cost = parseCost(costStr);
    const paymentStatus = (p.paymentStatus || '').toLowerCase().trim();

    breakdown.total += cost;

    if (paymentStatus.includes('оплачено')) {
      breakdown.paid += cost;
    } else if (paymentStatus.includes('счет выставлен')) {
      breakdown.receivable += cost;
    } else {
      // "Счет не выставлен", empty, dash, or any other value -> in work
      breakdown.inWork += cost;
    }
  });

  return breakdown;
}

function calculateByDirection(projects) {
  const stats = {};
  projects.forEach(p => {
    const dir = p.direction || 'Other';
    stats[dir] = (stats[dir] || 0) + 1;
  });
  return stats;
}

function calculateDeadlines(projects) {
  const stats = {
    onTrack: 0,
    overdueSmall: 0,
    overdueLarge: 0,
    completed: 0
  };

  projects.forEach(p => {
    const status = calculateDeadlineStatus(p.endDate, p.status);
    if (status === 'Completed') stats.completed++;
    else if (status === 'On Track') stats.onTrack++;
    else if (status === 'Overdue < 2 weeks') stats.overdueSmall++;
    else if (status === 'Overdue > 2 weeks') stats.overdueLarge++;
  });

  return stats;
}

function calculateDeadlineStatus(endDateStr, status) {
  if (!endDateStr) return 'No Deadline';

  const parseDate = (str) => {
    const parts = str.split('.');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null;
  };

  const endDate = parseDate(endDateStr);
  if (!endDate) return 'Invalid Date';

  const now = new Date();
  const diffTime = now - endDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (status?.toLowerCase().includes('завершен') || status?.toLowerCase().includes('на поддержке') || status?.toLowerCase().includes('готов')) {
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

function calculateByStatus(projects) {
  const stats = {};
  projects.forEach(p => {
    const status = p.status?.trim() || 'Unknown';
    stats[status] = (stats[status] || 0) + 1;
  });
  return stats;
}

function calculateTeamRoles(allRows) {
  const stats = {};
  const seenMembers = new Set();

  allRows.forEach(row => {
    if (row.teamMemberName && row.teamMemberRole) {
      const role = row.teamMemberRole.trim();

      // Split comma-separated names (e.g., "Ткаченко Олеся, Алимов Дамир")
      const names = row.teamMemberName.split(',').map(n => n.trim()).filter(n => n);

      names.forEach(fullName => {
        const normalizedName = normalizeName(fullName);
        const memberKey = `${normalizedName}|${role}`;

        if (!seenMembers.has(memberKey) && normalizedName) {
          stats[role] = (stats[role] || 0) + 1;
          seenMembers.add(memberKey);
        }
      });
    }
  });
  return stats;
}

function calculateByType(projects) {
  const stats = {
    internal: 0,
    commercial: 0,
    free: 0
  };

  projects.forEach(p => {
    const type = p.type?.toLowerCase().trim() || '';
    if (type.includes('внутренний')) {
      stats.internal++;
    } else if (type.includes('коммерческий')) {
      stats.commercial++;
    } else if (type.includes('безоплатный') || type.includes('бесплатный')) {
      stats.free++;
    }
  });

  return stats;
}

function calculateByCompany(allProjects) {
  const stats = {
    ite29: 0,
    nir: 0
  };

  const projectCompanies = {};

  allProjects.forEach(row => {
    if (row.name && row.executor) {
      const company = row.executor.toLowerCase().trim();
      const key = `${row.name}|${row.direction}`;

      if (!projectCompanies[key]) {
        projectCompanies[key] = new Set();
      }

      if (company.includes('итэ') || company.includes('it-') || company.includes('элемент') || company.includes('ите-29')) {
        projectCompanies[key].add('ite29');
      } else if (company.includes('нир')) {
        projectCompanies[key].add('nir');
      }
    }
  });

  Object.values(projectCompanies).forEach(companies => {
    if (companies.has('ite29')) stats.ite29++;
    if (companies.has('nir')) stats.nir++;
  });

  return stats;
}

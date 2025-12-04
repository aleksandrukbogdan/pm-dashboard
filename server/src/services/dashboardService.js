import { getSheetDataAsObjects } from './googleSheets.js';

const SHEET_MAPPINGS = [
  { name: 'Проекты WEB', direction: 'Web', headerRowIndex: 1 },
  { name: 'Проекты mobile', direction: 'Mobile', headerRowIndex: 0 },
  { name: 'Design (графичесикй)', direction: 'Design', headerRowIndex: 0 },
  { name: 'Проекты разработка ПО', direction: 'Разработка ПО', headerRowIndex: 0 },
  { name: 'Проекты пром дизайн', direction: 'Промышленный дизайн', headerRowIndex: 0 },
];

export async function getDashboardData(spreadsheetId) {
  try {
    const allProjects = [];

    // Fetch data from all sheets
    for (const mapping of SHEET_MAPPINGS) {
      const rows = await getSheetDataAsObjects(spreadsheetId, mapping.name, mapping.headerRowIndex);

      let lastProject = null;

      // Normalize rows with fill-down logic
      const normalizedRows = rows.map(row => {
        // Find dynamic status column (starts with _этап_проекта_на_)
        const statusKey = Object.keys(row).find(k => k.startsWith('_этап_проекта_на_'));
        const status = statusKey ? row[statusKey] : '';

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
            totalCost: row['итоговая_стоимость'] || '',
            goal: row['_цель_проекта'] || '',
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
          team: [],
          financials: p.financials,
          totalCost: p.totalCost,
          type: p.type
        };
      }

      // Add team member if exists and not duplicate
      if (p.teamMemberName) {
        const exists = groupedProjects[key].team.some(m => m.name === p.teamMemberName);
        if (!exists) {
          groupedProjects[key].team.push({
            name: p.teamMemberName,
            role: p.teamMemberRole,
            employment: p.executor
          });
        }
      }
    });

    const projects = Object.values(groupedProjects);

    // Calculate stats
    const summary = {
      totalProjects: projects.length,
      totalTeamMembers: new Set(allProjects.map(p => p.teamMemberName).filter(Boolean)).size,
      totalBudget: calculateTotalBudget(projects)
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

function calculateTotalBudget(projects) {
  return projects.reduce((sum, p) => {
    const costStr = p.totalCost || p.financials.cost;
    if (!costStr) return sum;

    if (costStr.includes('http') || costStr.match(/\d{2}\.\d{2}/)) {
      return sum;
    }

    const cleanStr = costStr.replace(/р\./g, '').replace(/[^0-9,.-]/g, '').replace(',', '.');
    const val = parseFloat(cleanStr);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
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
      const memberKey = `${row.teamMemberName}|${row.teamMemberRole}`;

      if (!seenMembers.has(memberKey)) {
        const role = row.teamMemberRole.trim();
        stats[role] = (stats[role] || 0) + 1;
        seenMembers.add(memberKey);
      }
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

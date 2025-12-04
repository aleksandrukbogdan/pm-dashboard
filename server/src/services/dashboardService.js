import { getSheetDataAsObjects } from './googleSheets.js';

const SHEET_NAME = 'Проекты разработки';

/**
 * Parse date string in format DD.MM.YYYY
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
}

/**
 * Calculate project status based on deadlines and status field
 */
function calculateDeadlineStatus(endDateStr, status) {
  if (!endDateStr) return 'No Deadline';
  
  const endDate = parseDate(endDateStr);
  if (!endDate) return 'Invalid Date';
  
  const now = new Date();
  const diffTime = now - endDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (status?.toLowerCase().includes('завершен') || status?.toLowerCase().includes('на поддержке')) {
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

/**
 * Get aggregated dashboard data
 */
export async function getDashboardData(spreadsheetId) {
  try {
    const rawData = await getSheetDataAsObjects(spreadsheetId, SHEET_NAME);
    
    // Group by project name
    const projectsMap = new Map();
    
    rawData.forEach(row => {
      const projectName = row['наименование_проекта'];
      if (!projectName) return; // Skip empty rows or rows without project name

      if (!projectsMap.has(projectName)) {
        projectsMap.set(projectName, {
          name: projectName,
          direction: row['направление'] || 'Other',
          status: row['_этап_проекта_на_18.09.25'] || 'Unknown',
          startDate: row['начало_проекта'],
          endDate: row['завершение_проекта'],
          customer: row['_заказчик'],
          team: [],
          financials: {
            cost: row['расчет_стоимости_услуг'] || '',
            kp: row['кп'] || ''
          }
        });
      }
      
      // Add team member
      if (row['команда_фио']) {
        projectsMap.get(projectName).team.push({
          name: row['команда_фио'],
          role: row['роль_в_проекте'] || 'Member',
          employment: row['трудоустройство']
        });
      }
    });

    const projects = Array.from(projectsMap.values());

    // 1. All Projects Stats
    const totalProjects = projects.length;
    const byDirection = projects.reduce((acc, proj) => {
      const dir = proj.direction || 'Unspecified';
      acc[dir] = (acc[dir] || 0) + 1;
      return acc;
    }, {});

    // 2. Deadlines Stats
    const deadlines = {
      onTrack: 0,
      overdueSmall: 0,
      overdueLarge: 0,
      completed: 0
    };

    projects.forEach(proj => {
      const status = calculateDeadlineStatus(proj.endDate, proj.status);
      if (status === 'On Track') deadlines.onTrack++;
      else if (status === 'Overdue < 2 weeks') deadlines.overdueSmall++;
      else if (status === 'Overdue > 2 weeks') deadlines.overdueLarge++;
      else if (status === 'Completed') deadlines.completed++;
    });

    // 3. Projects by Status
    const byStatus = projects.reduce((acc, proj) => {
      const status = proj.status.trim() || 'Not Started';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // 4. Team Stats
    const teamRoles = {};
    const uniqueMembers = new Set();
    
    projects.forEach(proj => {
      proj.team.forEach(member => {
        uniqueMembers.add(member.name);
        const role = member.role || 'Other';
        teamRoles[role] = (teamRoles[role] || 0) + 1;
      });
    });

    // 5. Finances (Mock/Placeholder logic for now as data is sparse)
    // We will try to parse 'расчет_стоимости_услуг' if it looks like a number, otherwise 0
    let totalBudget = 0;
    projects.forEach(proj => {
      // Very basic parsing, can be improved based on real data format
      const costStr = proj.financials.cost.replace(/[^\d,]/g, '').replace(',', '.');
      const cost = parseFloat(costStr);
      if (!isNaN(cost)) {
        totalBudget += cost;
      }
    });

    return {
      summary: {
        totalProjects,
        totalTeamMembers: uniqueMembers.size,
        totalBudget
      },
      charts: {
        byDirection,
        deadlines,
        byStatus,
        teamRoles
      },
      projects // Return full list for the "All Projects" table
    };

  } catch (error) {
    console.error('Error in getDashboardData:', error);
    throw error;
  }
}

import { getDashboardData } from './src/services/dashboardService.js';

async function main() {
    try {
        const SPREADSHEET_ID = '1wqIvBBVGWFAlqYD42yYLm859h6uCWGBnCkUq5rv0ZeQ';
        console.log('Fetching dashboard data...');
        const data = await getDashboardData(SPREADSHEET_ID);

        console.log('\n=== Summary ===');
        console.log('Total Projects:', data.summary.totalProjects);
        console.log('Total Team Members:', data.summary.totalTeamMembers);
        console.log('Total Budget:', data.summary.totalBudget);

        console.log('\n=== By Direction ===');
        console.log(JSON.stringify(data.charts.byDirection, null, 2));

        console.log('\n=== By Type ===');
        console.log(JSON.stringify(data.charts.byType, null, 2));

        console.log('\n=== By Company ===');
        console.log(JSON.stringify(data.charts.byCompany, null, 2));

        console.log('\n=== Projects List ===');
        data.projects.forEach(p => {
            console.log(`- ${p.name} (${p.direction})`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main();

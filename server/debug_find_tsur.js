import { getSheetDataAsObjects } from './src/services/googleSheets.js';

const SHEET_MAPPINGS = [
    { name: 'Проекты WEB', direction: 'Web', headerRowIndex: 1 },
    { name: 'Проекты mobile', direction: 'Mobile', headerRowIndex: 0 },
    { name: 'Design (графичесикй)', direction: 'Design', headerRowIndex: 0 },
    { name: 'Проекты разработка ПО', direction: 'Разработка ПО', headerRowIndex: 0 },
    { name: 'Проекты пром дизайн', direction: 'Промышленный дизайн', headerRowIndex: 0 },
];

async function main() {
    try {
        const SPREADSHEET_ID = '1wqIvBBVGWFAlqYD42yYLm859h6uCWGBnCkUq5rv0ZeQ';

        for (const mapping of SHEET_MAPPINGS) {
            console.log(`\n=== ${mapping.name} (${mapping.direction}) ===`);
            const rows = await getSheetDataAsObjects(SPREADSHEET_ID, mapping.name, mapping.headerRowIndex);

            const tsurProjects = rows.filter(r => r['наименование_проекта']?.includes('ЦУР'));

            if (tsurProjects.length > 0) {
                console.log('Found ЦУР projects:', tsurProjects.length);
                tsurProjects.forEach(p => {
                    console.log('  -', p['наименование_проекта']);
                });
            } else {
                console.log('No ЦУР projects found');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();

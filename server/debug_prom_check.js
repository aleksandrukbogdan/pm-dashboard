import { getSheetDataAsObjects } from './src/services/googleSheets.js';

async function main() {
    try {
        const SPREADSHEET_ID = '1wqIvBBVGWFAlqYD42yYLm859h6uCWGBnCkUq5rv0ZeQ';

        console.log('=== Проекты пром дизайн ===');
        const rows = await getSheetDataAsObjects(SPREADSHEET_ID, 'Проекты пром дизайн', 0);

        console.log(`Total rows: ${rows.length}`);

        rows.forEach((row, idx) => {
            console.log(`\nRow ${idx}:`);
            console.log('  Name:', row['наименование_проекта']);
            console.log('  Type:', row['тип_проекта']);
            console.log('  Team:', row['команда_фио']);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main();

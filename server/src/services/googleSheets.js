import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account credentials
const credentialsPath = path.join(__dirname, '../../../nir-center-dashboard-31d551f58f41.json');
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Get spreadsheet metadata
 */
export async function getSpreadsheetInfo(spreadsheetId) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    return {
      title: response.data.properties.title,
      sheets: response.data.sheets.map(sheet => ({
        id: sheet.properties.sheetId,
        title: sheet.properties.title,
        rowCount: sheet.properties.gridProperties.rowCount,
        columnCount: sheet.properties.gridProperties.columnCount,
      })),
    };
  } catch (error) {
    console.error('Error fetching spreadsheet info:', error.message);
    throw error;
  }
}

/**
 * Get data from a specific range
 */
export async function getSheetData(spreadsheetId, range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    
    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error.message);
    throw error;
  }
}

/**
 * Get all data from a sheet and convert to objects
 */
export async function getSheetDataAsObjects(spreadsheetId, sheetName) {
  try {
    const data = await getSheetData(spreadsheetId, sheetName);
    
    if (data.length < 2) {
      return [];
    }
    
    const headers = data[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const rows = data.slice(1);
    
    return rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  } catch (error) {
    console.error('Error converting sheet data:', error.message);
    throw error;
  }
}

/**
 * Get aggregated statistics from sheet data
 */
export async function getSheetStats(spreadsheetId, sheetName) {
  try {
    const data = await getSheetDataAsObjects(spreadsheetId, sheetName);
    
    if (data.length === 0) {
      return { total: 0, columns: [] };
    }
    
    const columns = Object.keys(data[0]);
    const stats = {
      total: data.length,
      columns: columns.map(col => ({
        name: col,
        uniqueValues: [...new Set(data.map(row => row[col]).filter(Boolean))].length,
        emptyCount: data.filter(row => !row[col]).length,
      })),
    };
    
    return stats;
  } catch (error) {
    console.error('Error calculating stats:', error.message);
    throw error;
  }
}





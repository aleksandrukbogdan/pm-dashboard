import { Router } from 'express';
import {
  getSpreadsheetInfo,
  getSheetData,
  getSheetDataAsObjects,
  getSheetStats,
} from '../services/googleSheets.js';

const router = Router();

// Get spreadsheet info
router.get('/info/:spreadsheetId', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const info = await getSpreadsheetInfo(spreadsheetId);
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get raw data from a range
router.get('/data/:spreadsheetId', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { range } = req.query;
    
    if (!range) {
      return res.status(400).json({ error: 'Range parameter is required' });
    }
    
    const data = await getSheetData(spreadsheetId, range);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get data as objects (with headers as keys)
router.get('/objects/:spreadsheetId/:sheetName', async (req, res) => {
  try {
    const { spreadsheetId, sheetName } = req.params;
    const data = await getSheetDataAsObjects(spreadsheetId, sheetName);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics from a sheet
router.get('/stats/:spreadsheetId/:sheetName', async (req, res) => {
  try {
    const { spreadsheetId, sheetName } = req.params;
    const stats = await getSheetStats(spreadsheetId, sheetName);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





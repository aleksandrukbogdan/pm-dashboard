import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import DataExplorer from './pages/DataExplorer';
import Settings from './pages/Settings';


const SPREADSHEET_ID = '1wqIvBBVGWFAlqYD42yYLm859h6uCWGBnCkUq5rv0ZeQ';

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header onAIToggle={() => { }} aiOpen={false} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          overflowX: 'hidden'
        }}
      >
        <Routes>
          <Route
            path="/"
            element={<Dashboard spreadsheetId={SPREADSHEET_ID} />}
          />
          <Route
            path="/data"
            element={<DataExplorer spreadsheetId={SPREADSHEET_ID} />}
          />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;


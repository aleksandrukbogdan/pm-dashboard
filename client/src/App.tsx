import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import DataExplorer from './pages/DataExplorer';
import Settings from './pages/Settings';
import AIAssistant from './components/ai/AIAssistant';

const DRAWER_WIDTH = 240;
const SPREADSHEET_ID = '1wqIvBBVGWFAlqYD42yYLm859h6uCWGBnCkUq5rv0ZeQ';

function App() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar drawerWidth={DRAWER_WIDTH} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${DRAWER_WIDTH}px`,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header onAIToggle={() => setAiOpen(!aiOpen)} aiOpen={aiOpen} />
        
        <Box
          sx={{
            flex: 1,
            p: 3,
            transition: 'margin 0.3s ease',
            mr: aiOpen ? '380px' : 0,
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

      <AIAssistant open={aiOpen} onClose={() => setAiOpen(false)} />
    </Box>
  );
}

export default App;


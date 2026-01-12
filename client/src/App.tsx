import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import DataExplorer from './pages/DataExplorer';
import Settings from './pages/Settings';
import Login from './pages/Login';


const SPREADSHEET_ID = '1wqIvBBVGWFAlqYD42yYLm859h6uCWGBnCkUq5rv0ZeQ';

export type OrganizationFilter = 'all' | 'nir' | 'ite29';
export type ComparisonMode = 'none' | 'previousDay' | 'weekAgo';

function AppContent() {
  const [aiOpen, setAiOpen] = useState(false);
  const [organizationFilter, setOrganizationFilter] = useState<OrganizationFilter>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('none');

  const handleDataRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header
        onAIToggle={() => setAiOpen(!aiOpen)}
        aiOpen={aiOpen}
        organizationFilter={organizationFilter}
        onOrganizationFilterChange={setOrganizationFilter}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        selectedWeek={selectedWeek}
        onSelectedWeekChange={setSelectedWeek}
        onDataRefresh={handleDataRefresh}
        comparisonMode={comparisonMode}
        onComparisonModeChange={setComparisonMode}
      />

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
            element={
              <Dashboard
                spreadsheetId={SPREADSHEET_ID}
                organizationFilter={organizationFilter}
                showCompleted={showCompleted}
                selectedWeek={selectedWeek}
                refreshTrigger={refreshTrigger}
                comparisonMode={comparisonMode}
              />
            }
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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AppContent />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;



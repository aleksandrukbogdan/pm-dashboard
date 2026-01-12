import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { OrganizationFilter, ComparisonMode } from '../../App';
import WeekPicker from '../dashboard/WeekPicker';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onAIToggle: () => void;
  aiOpen: boolean;
  organizationFilter: OrganizationFilter;
  onOrganizationFilterChange: (filter: OrganizationFilter) => void;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
  selectedWeek: string | null;
  onSelectedWeekChange: (week: string | null) => void;
  onDataRefresh?: () => void;
  comparisonMode: ComparisonMode;
  onComparisonModeChange: (mode: ComparisonMode) => void;
}

export default function Header({
  onAIToggle,
  aiOpen,
  organizationFilter,
  onOrganizationFilterChange,
  showCompleted,
  onShowCompletedChange,
  selectedWeek,
  onSelectedWeekChange,
  onDataRefresh,
  comparisonMode,
  onComparisonModeChange,
}: HeaderProps) {
  const { user, logout } = useAuth();

  const handleOrganizationChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: OrganizationFilter | null,
  ) => {
    if (newFilter !== null) {
      onOrganizationFilterChange(newFilter);
    }
  };

  const handleComparisonChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ComparisonMode | null,
  ) => {
    if (newMode !== null) {
      onComparisonModeChange(newMode);
    }
  };

  return (
    <Box
      component="header"
      sx={{
        minHeight: 72,
        px: { xs: 1.5, sm: 2, md: 3 },
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        borderBottom: '1px solid',
        borderColor: alpha('#ED8D48', 0.08),
        background: alpha('#FFFFFF', 0.8),
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left section: Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <img
          src="/logo.svg"
          alt="НИР-ЦЕНТР"
          style={{ height: 24 }}
        />
      </Box>

      {/* Spacer to push filters to the right - hidden on small screens */}
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />

      {/* Right section: Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2, md: 4 }, flexWrap: 'wrap' }}>
        {/* Completed checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              size="small"
              sx={{
                color: alpha('#ED8D48', 0.4),
                '&.Mui-checked': {
                  color: '#ED8D48',
                },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
              Отображать завершённые
            </Typography>
          }
          sx={{ mr: 0 }}
        />

        {/* Organization toggle buttons */}
        <ToggleButtonGroup
          value={organizationFilter}
          exclusive
          onChange={handleOrganizationChange}
          aria-label="organization filter"
          size="small"
        >
          <ToggleButton value="all">Все</ToggleButton>
          <ToggleButton value="nir">НИР</ToggleButton>
          <ToggleButton value="ite29">ИТЭ-29</ToggleButton>
        </ToggleButtonGroup>

        {/* Comparison mode toggle - hide when viewing historical data */}
        {!selectedWeek && (
          <ToggleButtonGroup
            value={comparisonMode}
            exclusive
            onChange={handleComparisonChange}
            aria-label="comparison mode"
            size="small"
          >
            <ToggleButton value="none">Сравн: Выкл</ToggleButton>
            <ToggleButton value="previousDay">Вчера</ToggleButton>
            <ToggleButton value="weekAgo">Неделя</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      {/* Right section: Week picker + AI button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1 } }}>
        {/* Week picker */}
        <WeekPicker
          selectedWeek={selectedWeek}
          onWeekChange={onSelectedWeekChange}
          onDataRefresh={onDataRefresh}
          compact
        />

        {/* AI Assistant Button */}
        <Tooltip title={aiOpen ? 'Закрыть AI помощника' : 'AI Помощник'}>
          <motion.div
            animate={{
              scale: aiOpen ? 1.05 : 1,
            }}
          >
            <IconButton
              onClick={onAIToggle}
              size="small"
              sx={{
                background: aiOpen
                  ? 'linear-gradient(135deg, #ED8D48 0%, #F5A86F 100%)'
                  : alpha('#ED8D48', 0.1),
                color: aiOpen ? '#FFF' : '#ED8D48',
                boxShadow: aiOpen ? '0 4px 12px rgba(237, 141, 72, 0.35)' : 'none',
                '&:hover': {
                  background: aiOpen
                    ? 'linear-gradient(135deg, #D97D3A 0%, #ED8D48 100%)'
                    : alpha('#ED8D48', 0.15),
                },
              }}
            >
              <AIIcon fontSize="small" />
            </IconButton>
          </motion.div>
        </Tooltip>

        {/* User info and logout */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={user.name}
              size="small"
              sx={{
                bgcolor: alpha('#ED8D48', 0.1),
                color: '#ED8D48',
                fontWeight: 500,
                display: { xs: 'none', sm: 'flex' }
              }}
            />
            <Tooltip title="Выйти">
              <IconButton
                onClick={logout}
                size="small"
                sx={{
                  color: alpha('#ED8D48', 0.7),
                  '&:hover': {
                    color: '#ED8D48',
                    bgcolor: alpha('#ED8D48', 0.1),
                  },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
}


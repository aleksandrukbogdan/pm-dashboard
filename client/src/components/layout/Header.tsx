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
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { OrganizationFilter } from '../../App';
import WeekPicker from '../dashboard/WeekPicker';

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
}: HeaderProps) {
  const handleOrganizationChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: OrganizationFilter | null,
  ) => {
    if (newFilter !== null) {
      onOrganizationFilterChange(newFilter);
    }
  };

  return (
    <Box
      component="header"
      sx={{
        height: 72,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: alpha('#2B3674', 0.08),
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

      {/* Spacer to push filters to the right */}
      <Box sx={{ flex: 1 }} />

      {/* Right section: Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Completed checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              sx={{
                color: alpha('#ED8D48', 0.4),
                '&.Mui-checked': {
                  color: '#ED8D48',
                },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Отображать завершённые
            </Typography>
          }
        />

        {/* Organization toggle buttons */}
        <ToggleButtonGroup
          value={organizationFilter}
          exclusive
          onChange={handleOrganizationChange}
          aria-label="organization filter"
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.5,
              border: '1px solid',
              borderColor: alpha('#ED8D48', 0.3),
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'none',
              '&.Mui-selected': {
                backgroundColor: '#ED8D48',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#D97D3A',
                },
              },
              '&:hover': {
                backgroundColor: alpha('#ED8D48', 0.08),
              },
            },
          }}
        >
          <ToggleButton value="all">Все</ToggleButton>
          <ToggleButton value="nir">НИР</ToggleButton>
          <ToggleButton value="ite29">ИТЭ-29</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Right section: Week picker + AI button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 3 }}>
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
              sx={{
                background: aiOpen
                  ? 'linear-gradient(135deg, #2B3674 0%, #7C5CBF 100%)'
                  : alpha('#2B3674', 0.1),
                color: aiOpen ? '#FFF' : '#2B3674',
                '&:hover': {
                  background: aiOpen
                    ? 'linear-gradient(135deg, #4A4ED2 0%, #6B4BAE 100%)'
                    : alpha('#2B3674', 0.15),
                },
              }}
            >
              <AIIcon />
            </IconButton>
          </motion.div>
        </Tooltip>
      </Box>
    </Box>
  );
}


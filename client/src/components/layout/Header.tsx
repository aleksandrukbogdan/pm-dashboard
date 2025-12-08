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
        borderColor: alpha('#5B5FE3', 0.08),
        background: alpha('#FFFFFF', 0.8),
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left section: Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #5B5FE3 0%, #7C5CBF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          НИР↔ЦЕНТР
        </Typography>
      </Box>

      {/* Center section: Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {/* Completed checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              sx={{
                color: alpha('#5B5FE3', 0.4),
                '&.Mui-checked': {
                  color: '#5B5FE3',
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
              borderColor: alpha('#5B5FE3', 0.2),
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'none',
              '&.Mui-selected': {
                backgroundColor: '#5B5FE3',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#4A4ED2',
                },
              },
              '&:hover': {
                backgroundColor: alpha('#5B5FE3', 0.08),
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                  ? 'linear-gradient(135deg, #5B5FE3 0%, #7C5CBF 100%)'
                  : alpha('#5B5FE3', 0.1),
                color: aiOpen ? '#FFF' : '#5B5FE3',
                '&:hover': {
                  background: aiOpen
                    ? 'linear-gradient(135deg, #4A4ED2 0%, #6B4BAE 100%)'
                    : alpha('#5B5FE3', 0.15),
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


import {
  Box,
  IconButton,
  Typography,
  Badge,
  Tooltip,
  alpha,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AutoAwesome as AIIcon,
  LightMode as LightIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface HeaderProps {
  onAIToggle: () => void;
  aiOpen: boolean;
}

export default function Header({ onAIToggle, aiOpen }: HeaderProps) {
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
      {/* Search */}
      <Box sx={{ flex: 1, maxWidth: 400 }}>
        <TextField
          placeholder="Поиск по дашборду..."
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#5B5FE3', 0.04),
              borderRadius: 3,
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: alpha('#5B5FE3', 0.2),
              },
              '&.Mui-focused fieldset': {
                borderColor: '#5B5FE3',
              },
            },
          }}
        />
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Date indicator */}
        <Box
          sx={{
            px: 2,
            py: 0.75,
            borderRadius: 2,
            background: alpha('#5B5FE3', 0.06),
            mr: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </Typography>
        </Box>

        <Tooltip title="Светлая тема">
          <IconButton
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#5B5FE3', 0.08),
              },
            }}
          >
            <LightIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Уведомления">
          <IconButton
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#5B5FE3', 0.08),
              },
            }}
          >
            <Badge
              badgeContent={3}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: 18,
                  minWidth: 18,
                },
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

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
                ml: 1,
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





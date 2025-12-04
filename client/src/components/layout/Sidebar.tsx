import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TableChart as DataIcon,
  Settings as SettingsIcon,
  AutoAwesome as LogoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface SidebarProps {
  drawerWidth: number;
}

const menuItems = [
  { path: '/', label: 'Дашборд', icon: <DashboardIcon /> },
  { path: '/data', label: 'Данные', icon: <DataIcon /> },
  { path: '/settings', label: 'Настройки', icon: <SettingsIcon /> },
];

export default function Sidebar({ drawerWidth }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F7FF 100%)',
          borderRight: '1px solid',
          borderColor: alpha('#5B5FE3', 0.08),
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #5B5FE3 0%, #7C5CBF 100%)',
              boxShadow: '0 4px 14px rgba(91, 95, 227, 0.35)',
            }}
          >
            <LogoIcon sx={{ fontSize: 20 }} />
          </Avatar>
        </motion.div>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #5B5FE3 0%, #7C5CBF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            PM Dashboard
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Аналитика
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.5 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 1 }}>
        <Typography
          variant="overline"
          sx={{
            px: 2,
            py: 0.5,
            display: 'block',
            color: 'text.secondary',
            fontSize: '0.65rem',
            letterSpacing: 1.2,
          }}
        >
          Навигация
        </Typography>
        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItemButton
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1,
                    '&.Mui-selected': {
                      background: alpha('#5B5FE3', 0.1),
                      '& .MuiListItemIcon-root': {
                        color: '#5B5FE3',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#5B5FE3',
                        fontWeight: 600,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? '#5B5FE3' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                  {isActive && (
                    <Box
                      sx={{
                        width: 3,
                        height: 20,
                        borderRadius: 2,
                        background: 'linear-gradient(180deg, #5B5FE3 0%, #7C5CBF 100%)',
                      }}
                    />
                  )}
                </ListItemButton>
              </motion.div>
            );
          })}
        </List>
      </Box>

      {/* User section */}
      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: alpha('#5B5FE3', 0.04),
            border: '1px solid',
            borderColor: alpha('#5B5FE3', 0.1),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                fontSize: '0.75rem',
              }}
            >
              PM
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                Product Manager
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Онлайн
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}


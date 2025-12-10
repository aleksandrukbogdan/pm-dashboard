import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  alpha,
  TextField,
  Avatar,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const settingSections = [
  {
    title: 'Внешний вид',
    items: [
      {
        icon: <DarkModeIcon />,
        label: 'Тёмная тема',
        description: 'Включить тёмный режим интерфейса',
        type: 'switch',
        defaultValue: false,
      },
      {
        icon: <LanguageIcon />,
        label: 'Язык',
        description: 'Русский',
        type: 'text',
      },
    ],
  },
  {
    title: 'Уведомления',
    items: [
      {
        icon: <NotificationsIcon />,
        label: 'Push-уведомления',
        description: 'Получать уведомления об обновлениях данных',
        type: 'switch',
        defaultValue: true,
      },
    ],
  },
  {
    title: 'Данные',
    items: [
      {
        icon: <StorageIcon />,
        label: 'Автообновление',
        description: 'Автоматически обновлять данные каждые 5 минут',
        type: 'switch',
        defaultValue: true,
      },
      {
        icon: <SecurityIcon />,
        label: 'Кэширование',
        description: 'Сохранять данные локально для быстрого доступа',
        type: 'switch',
        defaultValue: true,
      },
    ],
  },
];

export default function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Настройки ⚙️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление настройками приложения
        </Typography>
      </Box>

      {/* Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, #2B3674 0%, #7C5CBF 100%)',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              PM
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                Product Manager
              </Typography>
              <Typography variant="body2" color="text.secondary">
                pm@company.com
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Редактировать профиль
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    borderColor: alpha('#2B3674', 0.3),
                    color: '#2B3674',
                  }}
                >
                  Сменить пароль
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
        >
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {section.title}
                </Typography>
              </Box>
              <Divider />
              <List sx={{ py: 0 }}>
                {section.items.map((item, itemIndex) => (
                  <ListItem
                    key={item.label}
                    sx={{
                      py: 2,
                      borderBottom:
                        itemIndex < section.items.length - 1
                          ? '1px solid'
                          : 'none',
                      borderColor: alpha('#000', 0.06),
                    }}
                  >
                    <Box
                      sx={{
                        mr: 2,
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: alpha('#2B3674', 0.08),
                        color: '#2B3674',
                        display: 'flex',
                      }}
                    >
                      {item.icon}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={500}>
                          {item.label}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      {item.type === 'switch' ? (
                        <Switch
                          defaultChecked={item.defaultValue}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#2B3674',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                            {
                              backgroundColor: '#2B3674',
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          →
                        </Typography>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* API Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Конфигурация API
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Настройки подключения к внешним сервисам
            </Typography>
            <TextField
              fullWidth
              label="API Endpoint"
              defaultValue="http://localhost:3001/api"
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="OpenAI API Key (для AI помощника)"
              placeholder="sk-..."
              type="password"
              size="small"
            />
            <Button
              variant="contained"
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Сохранить настройки
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Info */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InfoIcon sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                PM Dashboard v1.0.0
              </Typography>
              <Typography variant="caption" color="text.secondary">
                © 2024 • Material Design 3 • React + TypeScript
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}





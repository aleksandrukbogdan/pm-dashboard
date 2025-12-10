import {
  Card,
  CardContent,
  Box,
  Typography,
  alpha,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from '@mui/material';
import {
  TableChart as SheetIcon,
  Update as UpdateIcon,
  CloudDone as SyncIcon,
  Description as DocIcon,
} from '@mui/icons-material';

interface Sheet {
  id: number;
  title: string;
  rowCount: number;
  columnCount: number;
}

interface RecentActivityProps {
  sheets: Sheet[];
}

const defaultActivities = [
  {
    id: 1,
    icon: <SyncIcon />,
    title: 'Подключите таблицу',
    subtitle: 'Для начала работы',
    time: 'Сейчас',
    color: '#2B3674',
  },
  {
    id: 2,
    icon: <DocIcon />,
    title: 'Загрузите данные',
    subtitle: 'Вставьте ID таблицы',
    time: '—',
    color: '#7C5CBF',
  },
  {
    id: 3,
    icon: <UpdateIcon />,
    title: 'Анализируйте',
    subtitle: 'Используйте AI помощника',
    time: '—',
    color: '#10B981',
  },
];

export default function RecentActivity({ sheets }: RecentActivityProps) {
  const activities =
    sheets.length > 0
      ? sheets.slice(0, 5).map((sheet, index) => ({
        id: sheet.id,
        icon: <SheetIcon />,
        title: sheet.title,
        subtitle: `${sheet.rowCount} строк • ${sheet.columnCount} колонок`,
        time: 'Загружено',
        color: index % 2 === 0 ? '#2B3674' : '#7C5CBF',
      }))
      : defaultActivities;

  return (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {sheets.length > 0 ? 'Листы таблицы' : 'Начало работы'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sheets.length > 0
              ? 'Доступные листы данных'
              : 'Следуйте инструкциям'}
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {activities.map((activity, index) => (
            <ListItem
              key={activity.id}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom:
                  index < activities.length - 1
                    ? '1px solid'
                    : 'none',
                borderColor: alpha('#000', 0.06),
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: alpha(activity.color, 0.1),
                    color: activity.color,
                  }}
                >
                  {activity.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    {activity.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {activity.subtitle}
                  </Typography>
                }
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: alpha(activity.color, 0.08),
                  color: activity.color,
                  fontWeight: 500,
                }}
              >
                {activity.time}
              </Typography>
            </ListItem>
          ))}
        </List>

        {sheets.length === 0 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha('#2B3674', 0.05)} 0%, ${alpha('#7C5CBF', 0.05)} 100%)`,
              border: '1px dashed',
              borderColor: alpha('#2B3674', 0.2),
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              💡 Подсказка: ID таблицы находится в URL после /d/
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}





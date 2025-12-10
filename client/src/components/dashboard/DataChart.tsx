import { Card, CardContent, Box, Typography, alpha, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useState } from 'react';

export default function DataChart() {
  const [period, setPeriod] = useState('week');

  // Demo data for visualization
  const data = [
    { label: 'Пн', value: 65 },
    { label: 'Вт', value: 78 },
    { label: 'Ср', value: 52 },
    { label: 'Чт', value: 91 },
    { label: 'Пт', value: 84 },
    { label: 'Сб', value: 43 },
    { label: 'Вс', value: 67 },
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Активность
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Динамика данных за период
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, value) => value && setPeriod(value)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 2,
                py: 0.5,
                borderRadius: 2,
                border: 'none',
                fontSize: '0.8rem',
                textTransform: 'none',
                '&.Mui-selected': {
                  backgroundColor: alpha('#ED8D48', 0.1),
                  color: '#ED8D48',
                  '&:hover': {
                    backgroundColor: alpha('#ED8D48', 0.15),
                  },
                },
              },
            }}
          >
            <ToggleButton value="week">Неделя</ToggleButton>
            <ToggleButton value="month">Месяц</ToggleButton>
            <ToggleButton value="year">Год</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Simple Bar Chart */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
            height: 'calc(100% - 100px)',
            pt: 4,
            pb: 2,
          }}
        >
          {data.map((item, index) => (
            <Box
              key={item.label}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 48,
                  height: `${(item.value / maxValue) * 200}px`,
                  minHeight: 20,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${alpha('#2B3674', 0.8)} 0%, ${alpha('#7C5CBF', 0.6)} 100%)`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    background: `linear-gradient(180deg, #2B3674 0%, #7C5CBF 100%)`,
                    transform: 'scaleY(1.05)',
                    transformOrigin: 'bottom',
                  },
                  '&:hover::after': {
                    content: `"${item.value}"`,
                    position: 'absolute',
                    top: -28,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1C1B1F',
                    color: '#FFF',
                    padding: '4px 8px',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: 1,
                background: 'linear-gradient(135deg, #2B3674 0%, #7C5CBF 100%)',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Записи
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Среднее:
            </Typography>
            <Typography variant="caption" fontWeight={600} color="primary">
              {Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}





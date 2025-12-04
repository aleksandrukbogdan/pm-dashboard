import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  alpha,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as TaskIcon,
  CheckCircle as DoneIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import StatsCard from '../components/dashboard/StatsCard';
import DataChart from '../components/dashboard/DataChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import axios from 'axios';

interface DashboardProps {
  spreadsheetId: string;
}

interface SpreadsheetInfo {
  title: string;
  sheets: Array<{
    id: number;
    title: string;
    rowCount: number;
    columnCount: number;
  }>;
}

export default function Dashboard({ spreadsheetId }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetInfo, setSheetInfo] = useState<SpreadsheetInfo | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/sheets/info/${spreadsheetId}`);
      setSheetInfo(response.data);
    } catch (err) {
      setError('Не удалось загрузить данные таблицы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [spreadsheetId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <motion.div variants={itemVariants}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Дашборд 📊
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {sheetInfo ? sheetInfo.title : 'Загрузка данных...'}
          </Typography>
        </motion.div>
        
        <Tooltip title="Обновить данные">
          <IconButton 
            onClick={loadData}
            disabled={loading}
            sx={{
              backgroundColor: alpha('#5B5FE3', 0.1),
              '&:hover': { backgroundColor: alpha('#5B5FE3', 0.15) },
            }}
          >
            <RefreshIcon sx={{ color: '#5B5FE3' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      {error && (
        <motion.div variants={itemVariants}>
          <Card sx={{ mb: 3, backgroundColor: alpha('#DC4654', 0.05), border: '1px solid', borderColor: alpha('#DC4654', 0.2) }}>
            <CardContent>
              <Typography color="error">{error}</Typography>
              <Typography variant="caption" color="text.secondary">
                Убедитесь, что таблица доступна сервисному аккаунту
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Всего записей"
              value={sheetInfo ? sheetInfo.sheets.reduce((acc, s) => acc + s.rowCount, 0) : '—'}
              change="+12%"
              icon={<TrendingUpIcon />}
              color="#5B5FE3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Листов"
              value={sheetInfo?.sheets.length || '—'}
              change="Активно"
              icon={<TaskIcon />}
              color="#7C5CBF"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Колонок"
              value={sheetInfo ? sheetInfo.sheets.reduce((acc, s) => acc + s.columnCount, 0) : '—'}
              change="Данные"
              icon={<PeopleIcon />}
              color="#10B981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Статус"
              value={sheetInfo ? 'Активно' : loading ? 'Загрузка' : 'Ошибка'}
              change={sheetInfo ? 'Онлайн' : loading ? '...' : 'Офлайн'}
              icon={<DoneIcon />}
              color={sheetInfo ? '#10B981' : loading ? '#F59E0B' : '#DC4654'}
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Charts and Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <motion.div variants={itemVariants}>
            <DataChart />
          </motion.div>
        </Grid>
        <Grid item xs={12} lg={4}>
          <motion.div variants={itemVariants}>
            <RecentActivity sheets={sheetInfo?.sheets || []} />
          </motion.div>
        </Grid>
      </Grid>

      {/* Sheets List */}
      {sheetInfo && sheetInfo.sheets.length > 0 && (
        <motion.div variants={itemVariants}>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Доступные листы
            </Typography>
            <Grid container spacing={2}>
              {sheetInfo.sheets.map((sheet, index) => (
                <Grid item xs={12} sm={6} md={4} key={sheet.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card sx={{ cursor: 'pointer' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {sheet.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`${sheet.rowCount} строк`}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#5B5FE3', 0.1),
                              color: '#5B5FE3',
                            }}
                          />
                          <Chip
                            label={`${sheet.columnCount} колонок`}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#10B981', 0.1),
                              color: '#10B981',
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>
      )}
    </motion.div>
  );
}

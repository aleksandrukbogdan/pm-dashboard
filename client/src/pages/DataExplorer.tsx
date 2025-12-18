import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

interface DataExplorerProps {
  spreadsheetId: string;
}

interface SheetInfo {
  id: number;
  title: string;
  rowCount: number;
  columnCount: number;
}

export default function DataExplorer({ spreadsheetId }: DataExplorerProps) {
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load sheets on mount
  useEffect(() => {
    loadSheets();
  }, [spreadsheetId]);

  // Load data when sheet is selected
  useEffect(() => {
    if (selectedSheet) {
      loadSheetData();
    }
  }, [selectedSheet]);

  const loadSheets = async () => {
    try {
      const response = await axios.get(`/api/sheets/info/${spreadsheetId}`);
      setSheets(response.data.sheets);
      if (response.data.sheets.length > 0) {
        setSelectedSheet(response.data.sheets[0].title);
      }
    } catch (err) {
      setError('Не удалось загрузить список листов');
      console.error(err);
    }
  };

  const loadSheetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `/api/sheets/objects/${spreadsheetId}/${encodeURIComponent(selectedSheet)}`
      );
      setData(response.data);
    } catch (err) {
      setError('Не удалось загрузить данные листа');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Данные 📋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Просмотр и поиск по данным таблицы
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Лист</InputLabel>
              <Select
                value={selectedSheet}
                label="Лист"
                onChange={(e) => setSelectedSheet(e.target.value)}
              >
                {sheets.map((sheet) => (
                  <MenuItem key={sheet.id} value={sheet.title}>
                    {sheet.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Поиск по данным..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }}
                  />
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <Box sx={{ flex: 1 }} />

            <Tooltip title="Обновить данные">
              <IconButton
                onClick={loadSheetData}
                disabled={loading}
                sx={{
                  backgroundColor: alpha('#ED8D48', 0.1),
                  '&:hover': {
                    backgroundColor: alpha('#ED8D48', 0.15),
                  },
                }}
              >
                <RefreshIcon sx={{ color: '#ED8D48' }} />
              </IconButton>
            </Tooltip>

            <Chip
              label={`${filteredData.length} записей`}
              sx={{
                backgroundColor: alpha('#10B981', 0.1),
                color: '#10B981',
                fontWeight: 600,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  height={50}
                  sx={{ mb: 1 }}
                  animation="wave"
                />
              ))}
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : filteredData.length === 0 ? (
            <Box
              sx={{
                p: 6,
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Нет данных для отображения
              </Typography>
              <Typography variant="body2">
                Выберите лист или измените параметры поиска
              </Typography>
            </Box>
          ) : (
            <TableContainer
              sx={{
                maxHeight: 'calc(100vh - 320px)',
                '&::-webkit-scrollbar': {
                  width: 8,
                  height: 8,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha('#2B3674', 0.2),
                  borderRadius: 4,
                },
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          fontWeight: 600,
                          backgroundColor: alpha('#ED8D48', 0.04),
                          borderBottom: '2px solid',
                          borderColor: alpha('#ED8D48', 0.1),
                          textTransform: 'capitalize',
                        }}
                      >
                        {col.replace(/_/g, ' ')}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.slice(0, 100).map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha('#2B3674', 0.02),
                        },
                      }}
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={col}
                          sx={{
                            borderColor: alpha('#000', 0.06),
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row[col] || '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {filteredData.length > 100 && (
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                borderTop: '1px solid',
                borderColor: alpha('#000', 0.06),
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Показано 100 из {filteredData.length} записей
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  alpha,
  Avatar,
  Paper,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Person as PersonIcon,
  TipsAndUpdates as InsightIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
}

const quickPrompts = [
  'Покажи резюме данных',
  'Какие тренды?',
  'Найди аномалии',
  'Топ метрики',
];

export default function AIAssistant({ open, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Привет! Я ваш AI помощник для анализа данных. Я могу помочь с резюмированием, поиском инсайтов и ответами на вопросы о ваших данных. Что бы вы хотели узнать?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          width: 380,
          background: 'linear-gradient(180deg, #FAFAFF 0%, #F5F3FF 100%)',
          borderLeft: '1px solid',
          borderColor: alpha('#5B5FE3', 0.12),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: alpha('#5B5FE3', 0.1),
          background: alpha('#FFFFFF', 0.8),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #5B5FE3 0%, #7C5CBF 100%)',
            }}
          >
            <AIIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              AI Помощник
            </Typography>
            <Typography variant="caption" color="success.main">
              ● Онлайн
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1,
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      background: 'linear-gradient(135deg, #5B5FE3 0%, #7C5CBF 100%)',
                    }}
                  >
                    <AIIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    maxWidth: '85%',
                    borderRadius: 2,
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #5B5FE3 0%, #7C5CBF 100%)'
                        : '#FFFFFF',
                    color: msg.role === 'user' ? '#FFF' : 'text.primary',
                    boxShadow:
                      msg.role === 'assistant'
                        ? '0 2px 8px rgba(0,0,0,0.06)'
                        : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {msg.content}
                  </Typography>
                </Paper>
                {msg.role === 'user' && (
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      background: '#10B981',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* Quick Prompts */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <InsightIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Быстрые запросы
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {quickPrompts.map((prompt) => (
            <Chip
              key={prompt}
              label={prompt}
              size="small"
              onClick={() => handleQuickPrompt(prompt)}
              sx={{
                fontSize: '0.75rem',
                height: 26,
                cursor: 'pointer',
                background: alpha('#5B5FE3', 0.08),
                '&:hover': {
                  background: alpha('#5B5FE3', 0.15),
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: alpha('#5B5FE3', 0.1),
          background: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Задайте вопрос..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: alpha('#5B5FE3', 0.04),
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!input.trim()}
            sx={{
              minWidth: 44,
              px: 0,
              borderRadius: 2,
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </Button>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1, textAlign: 'center' }}
        >
          AI может допускать ошибки. Проверяйте важную информацию.
        </Typography>
      </Box>
    </Drawer>
  );
}

// Mock response generator
function generateMockResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('резюме') || lowerInput.includes('данн')) {
    return '📊 На основе анализа данных:\n\n• Всего записей: 127\n• Активных проектов: 23\n• Средний прогресс: 67%\n• Топ категория: Разработка\n\nХотите узнать подробнее о какой-либо метрике?';
  }

  if (lowerInput.includes('тренд')) {
    return '📈 Обнаруженные тренды:\n\n1. Рост активности на 15% за последний месяц\n2. Увеличение количества завершённых задач\n3. Снижение времени на review\n\nОбщая тенденция: позитивная динамика!';
  }

  if (lowerInput.includes('аномал')) {
    return '🔍 Найденные аномалии:\n\n⚠️ 3 проекта с отставанием от плана\n⚠️ 2 задачи без ответственного\n⚠️ 1 проект без обновлений > 14 дней\n\nРекомендую обратить внимание на эти области.';
  }

  if (lowerInput.includes('топ') || lowerInput.includes('метрик')) {
    return '🏆 Топ метрики:\n\n1. Завершаемость: 89% ↑\n2. Скорость: 4.2 pts/sprint\n3. Качество: 96% без багов\n4. Удовлетворённость: 4.7/5\n\nВсе показатели в зелёной зоне!';
  }

  return 'Интересный вопрос! Для более точного анализа мне нужно больше данных. Попробуйте:\n\n• Загрузить Google таблицу\n• Выбрать конкретный лист\n• Задать более конкретный вопрос\n\nЯ готов помочь с анализом!';
}





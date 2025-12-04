import { Card, CardContent, Box, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: ReactNode;
  color: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  color,
}: StatsCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.5)} 100%)`,
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
                gutterBottom
              >
                {title}
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {value}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mt: 1,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: alpha(color, 0.1),
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ color }}
                >
                  {change}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(color, 0.1),
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}





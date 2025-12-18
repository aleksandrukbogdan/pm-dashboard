import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface ChangeIndicatorProps {
    change: number;
    size?: 'small' | 'medium';
    showValue?: boolean;
    format?: 'number' | 'currency';
}

/**
 * Material3 styled change indicator with animated arrows
 */
export default function ChangeIndicator({
    change,
    size = 'small',
    showValue = true,
    format = 'number'
}: ChangeIndicatorProps) {
    if (change === 0) return null;

    const isPositive = change > 0;
    const iconSize = size === 'small' ? 16 : 20;
    const fontSize = size === 'small' ? '0.75rem' : '0.875rem';

    // Format the change value
    const formatChange = (value: number): string => {
        const absValue = Math.abs(value);
        if (format === 'currency') {
            // For currency, show in thousands
            const inThousands = Math.round(absValue / 1000);
            return inThousands.toLocaleString('ru-RU');
        }
        return absValue.toString();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.25,
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 2,
                        bgcolor: isPositive
                            ? 'rgba(34, 197, 94, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        color: isPositive ? '#22C55E' : '#EF4444',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {isPositive ? (
                        <TrendingUpIcon sx={{ fontSize: iconSize }} />
                    ) : (
                        <TrendingDownIcon sx={{ fontSize: iconSize }} />
                    )}
                    {showValue && (
                        <Typography
                            component="span"
                            sx={{
                                fontSize,
                                fontWeight: 600,
                                lineHeight: 1
                            }}
                        >
                            {isPositive ? '+' : '-'}{formatChange(change)}
                        </Typography>
                    )}
                </Box>
            </motion.div>
        </AnimatePresence>
    );
}

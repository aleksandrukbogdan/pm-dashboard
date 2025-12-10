import { Typography, Paper, Grid } from '@mui/material';

interface FinancesProps {
    totalBudget: number;
}

export default function Finances({ totalBudget }: FinancesProps) {
    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                Финансы, тыс. ₽
            </Typography>

            <Grid container spacing={4} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                        Стоимость проектов
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.dark">
                        {totalBudget.toLocaleString('ru-RU')}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                        Дебиторская задолженность
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.dark">
                        12 000,00
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    );
}

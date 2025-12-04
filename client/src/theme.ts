import { createTheme, alpha } from '@mui/material/styles';

// Material Design 3 inspired theme
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5B5FE3',
      light: '#8B8EFF',
      dark: '#3F43B0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C5CBF',
      light: '#AF8CF2',
      dark: '#4A308D',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC4654',
      light: '#FF7A85',
      dark: '#A51027',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    background: {
      default: '#FAFAFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },
    divider: alpha('#79757F', 0.12),
  },
  typography: {
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    h6: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
    '0 2px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
    '0 4px 12px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.06)',
    '0 6px 16px rgba(0,0,0,0.06), 0 3px 6px rgba(0,0,0,0.06)',
    '0 8px 24px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.06)',
    '0 12px 32px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.06)',
    '0 16px 40px rgba(0,0,0,0.09), 0 8px 16px rgba(0,0,0,0.06)',
    '0 20px 48px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.06)',
    '0 24px 56px rgba(0,0,0,0.11), 0 12px 24px rgba(0,0,0,0.06)',
    '0 28px 64px rgba(0,0,0,0.12), 0 14px 28px rgba(0,0,0,0.06)',
    '0 32px 72px rgba(0,0,0,0.13), 0 16px 32px rgba(0,0,0,0.06)',
    '0 36px 80px rgba(0,0,0,0.14), 0 18px 36px rgba(0,0,0,0.06)',
    '0 40px 88px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.06)',
    '0 44px 96px rgba(0,0,0,0.16), 0 22px 44px rgba(0,0,0,0.06)',
    '0 48px 104px rgba(0,0,0,0.17), 0 24px 48px rgba(0,0,0,0.06)',
    '0 52px 112px rgba(0,0,0,0.18), 0 26px 52px rgba(0,0,0,0.06)',
    '0 56px 120px rgba(0,0,0,0.19), 0 28px 56px rgba(0,0,0,0.06)',
    '0 60px 128px rgba(0,0,0,0.2), 0 30px 60px rgba(0,0,0,0.06)',
    '0 64px 136px rgba(0,0,0,0.21), 0 32px 64px rgba(0,0,0,0.06)',
    '0 68px 144px rgba(0,0,0,0.22), 0 34px 68px rgba(0,0,0,0.06)',
    '0 72px 152px rgba(0,0,0,0.23), 0 36px 72px rgba(0,0,0,0.06)',
    '0 76px 160px rgba(0,0,0,0.24), 0 38px 76px rgba(0,0,0,0.06)',
    '0 80px 168px rgba(0,0,0,0.25), 0 40px 80px rgba(0,0,0,0.06)',
    '0 84px 176px rgba(0,0,0,0.26), 0 42px 84px rgba(0,0,0,0.06)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(91, 95, 227, 0.25)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #5B5FE3 0%, #7C5CBF 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4A4ED2 0%, #6B4BAE 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: alpha('#5B5FE3', 0.1),
          color: '#5B5FE3',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5B5FE3',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha('#5B5FE3', 0.1),
            '&:hover': {
              backgroundColor: alpha('#5B5FE3', 0.15),
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: '#1C1B1F',
          fontSize: '0.8rem',
          padding: '8px 12px',
        },
      },
    },
  },
});





import { createTheme, alpha } from '@mui/material/styles';

// Material Design 3 inspired theme
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2B3674',
      light: '#6B6188',
      dark: '#2E2847',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#ED8D48',
      light: '#F5A86F',
      dark: '#D97D3A',
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
      primary: '#2B3674',
      secondary: '#6B6188',
    },
    divider: alpha('#79757F', 0.12),
    action: {
      active: '#ED8D48',
      hover: alpha('#ED8D48', 0.08),
      selected: alpha('#ED8D48', 0.16),
      focus: alpha('#ED8D48', 0.12),
      disabledBackground: alpha('#2B3674', 0.12),
    },
  },
  typography: {
    fontFamily: '"Onest", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Onest", sans-serif',
      fontWeight: 500,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Onest", sans-serif',
      fontWeight: 500,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Onest", sans-serif',
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h4: {
      fontFamily: '"Onest", sans-serif',
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h5: {
      fontFamily: '"Onest", sans-serif',
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    h6: {
      fontFamily: '"Onest", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontWeight: 400,
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
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
    MuiButtonBase: {
      defaultProps: {
        // Use orange color for ripple effect
        TouchRippleProps: {
          style: {
            color: '#ED8D48',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.9rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(237, 141, 72, 0.25)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #ED8D48 0%, #F5A86F 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #D97D3A 0%, #ED8D48 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: 'none',
          boxShadow: '0 2px 12px rgba(43, 54, 116, 0.06), 0 4px 24px rgba(43, 54, 116, 0.04)',
          background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(247,247,255,0.8) 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(43, 54, 116, 0.12), 0 12px 48px rgba(43, 54, 116, 0.06)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(250,250,255,0.9) 100%)',
          boxShadow: '0 2px 12px rgba(43, 54, 116, 0.06), 0 4px 24px rgba(43, 54, 116, 0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 6px 24px rgba(43, 54, 116, 0.1), 0 8px 32px rgba(43, 54, 116, 0.05)',
          },
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(43, 54, 116, 0.06)',
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#2B3674', 0.06),
          borderRadius: 24,
          padding: 4,
          gap: 4,
          border: 'none',
          '& .MuiToggleButtonGroup-grouped': {
            border: 'none',
            borderRadius: '20px !important',
            margin: 0,
            '&:not(:first-of-type)': {
              borderLeft: 'none',
            },
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: 'none',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '8px 20px',
          color: '#2B3674',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: alpha('#ED8D48', 0.12),
          },
          '&.Mui-selected': {
            backgroundColor: '#ED8D48',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(237, 141, 72, 0.35)',
            '&:hover': {
              backgroundColor: '#D97D3A',
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          color: alpha('#ED8D48', 0.4),
          transition: 'all 0.2s ease',
          '&.Mui-checked': {
            color: '#ED8D48',
          },
          '&:hover': {
            backgroundColor: alpha('#ED8D48', 0.08),
          },
          '& .MuiSvgIcon-root': {
            borderRadius: 4,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: alpha('#2B3674', 0.1),
          color: '#2B3674',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ED8D48',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ED8D48',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#ED8D48',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ED8D48',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ED8D48',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ED8D48',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ED8D48',
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
          borderRadius: 16,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha('#2B3674', 0.1),
            '&:hover': {
              backgroundColor: alpha('#2B3674', 0.15),
            },
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        tooltip: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(43, 54, 116, 0.95) 0%, rgba(30, 35, 70, 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          fontSize: '0.8rem',
          fontWeight: 500,
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(237, 141, 72, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxWidth: 320,
        },
        arrow: {
          color: 'rgba(43, 54, 116, 0.95)',
          '&::before': {
            border: '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
        popper: {
          '&[data-popper-placement*="bottom"] .MuiTooltip-arrow': {
            marginTop: '-0.5em',
          },
          '&[data-popper-placement*="top"] .MuiTooltip-arrow': {
            marginBottom: '-0.5em',
          },
        },
      },
    },
  },
});





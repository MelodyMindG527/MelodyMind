import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  useTheme,
} from '@mui/material';

interface ProgressIndicatorProps {
  type?: 'linear' | 'circular';
  message?: string;
  progress?: number;
  size?: number;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  type = 'circular',
  message = 'Loading...',
  progress,
  size = 40,
  color = 'primary',
}) => {
  const theme = useTheme();

  const getColor = () => {
    switch (color) {
      case 'primary': return theme.palette.primary.main;
      case 'secondary': return theme.palette.secondary.main;
      case 'success': return theme.palette.success.main;
      case 'error': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
      }}
    >
      {type === 'circular' ? (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            size={size}
            thickness={4}
            sx={{
              color: getColor(),
              animation: 'spin 1s linear infinite',
            }}
          />
          {progress !== undefined && (
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                component="div"
                color="text.secondary"
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              >
                {`${Math.round(progress)}%`}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ width: '100%', maxWidth: 300 }}>
          <LinearProgress
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: `${getColor()}20`,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${getColor()} 0%, ${getColor()}dd 100%)`,
              },
            }}
          />
          {progress !== undefined && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block', textAlign: 'center', fontWeight: 600 }}
            >
              {`${Math.round(progress)}%`}
            </Typography>
          )}
        </Box>
      )}
      
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: 200,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default ProgressIndicator;

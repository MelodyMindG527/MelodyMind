import React, { useState } from 'react';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CameraAlt,
  Psychology,
  MusicNote,
  SmartToy,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingActionButtonProps {
  onCameraClick: () => void;
  onTextClick: () => void;
  onVoiceClick: () => void;
  onPlaylistClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onCameraClick,
  onTextClick,
  onVoiceClick,
  onPlaylistClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: <CameraAlt />,
      name: 'Camera Mood',
      onClick: onCameraClick,
      color: '#667eea',
    },
    {
      icon: <Psychology />,
      name: 'Text Mood',
      onClick: onTextClick,
      color: '#34e89e',
    },
    {
      icon: <MusicNote />,
      name: 'Voice Mood',
      onClick: onVoiceClick,
      color: '#f093fb',
    },
    {
      icon: <SmartToy />,
      name: 'Smart Playlist',
      onClick: onPlaylistClick,
      color: '#ff9a9e',
    },
  ];

  if (isMobile) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 16,
          zIndex: 1000,
        }}
      >
        <SpeedDial
          ariaLabel="Mood Detection Actions"
          icon={<SpeedDialIcon />}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          sx={{
            '& .MuiFab-primary': {
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #d946ef 100%)',
              },
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
            },
          }}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
              sx={{
                '& .MuiFab-root': {
                  backgroundColor: action.color,
                  '&:hover': {
                    backgroundColor: action.color,
                    transform: 'scale(1.1)',
                  },
                },
              }}
            />
          ))}
        </SpeedDial>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                mb: 2,
              }}
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.name}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <Fab
                    size="medium"
                    onClick={() => {
                      action.onClick();
                      setOpen(false);
                    }}
                    sx={{
                      background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                      color: 'white',
                      boxShadow: `0 8px 25px ${action.color}40`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${action.color}dd 0%, ${action.color}bb 100%)`,
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {action.icon}
                  </Fab>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Fab
        color="primary"
        onClick={() => setOpen(!open)}
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #d946ef 100%)',
            transform: 'scale(1.1)',
          },
          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {open ? <Close /> : <SpeedDialIcon />}
        </motion.div>
      </Fab>
    </Box>
  );
};

export default FloatingActionButton;

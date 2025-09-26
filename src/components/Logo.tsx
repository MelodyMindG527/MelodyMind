import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { MusicNote, Psychology, Favorite } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true, animated = true }) => {
  const theme = useTheme();
  
  const getSize = () => {
    switch (size) {
      case 'small': return { icon: 24, text: 'h6' };
      case 'large': return { icon: 48, text: 'h3' };
      default: return { icon: 32, text: 'h4' };
    }
  };

  const { icon, text } = getSize();

  const LogoIcon = () => (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: icon * 2,
        height: icon * 2,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          left: -10,
          width: '120%',
          height: '120%',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          borderRadius: '50%',
          animation: animated ? 'float 3s ease-in-out infinite' : 'none',
        }}
      />
      
      {/* Music Note */}
      <MusicNote
        sx={{
          fontSize: icon,
          color: 'white',
          zIndex: 2,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
      />
      
      {/* Heart icon overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: icon * 0.4,
          height: icon * 0.4,
          borderRadius: '50%',
          background: 'rgba(255, 182, 193, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Favorite
          sx={{
            fontSize: icon * 0.25,
            color: '#ff6b9d',
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {animated ? (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
        >
          <LogoIcon />
        </motion.div>
      ) : (
        <LogoIcon />
      )}
      
      {showText && (
        <Box>
          <Typography
            variant={text as any}
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            MelodyMind
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            AI Music Companion
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Logo;

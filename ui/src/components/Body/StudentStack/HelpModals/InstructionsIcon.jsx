import React from 'react';
import { AstroTheme } from '../../../../themes/AstroTheme';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';

export const InstructionsIcon = () => (
  <HelpCenterIcon
    fontSize='medium'
    sx={{
      borderRadius: '20%',
      backgroundColor: 'rgba(0,0,0,0.1)',
      color: AstroTheme.palette.caution.main,
      '&:hover': { filter: 'brightness(1.1)' },
    }}
  />
);

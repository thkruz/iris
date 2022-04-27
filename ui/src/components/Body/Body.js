import { Paper } from '@mui/material';
import React from 'react';
import { StudentStack } from '../'
import { AstroTheme } from '../../themes/AstroTheme';
// Contains the main part of the app

export const Body = () => {
  const theme = AstroTheme;
  const sxBody = {
    backgroundColor: theme.palette.background.paper
  };
  return (
    <Paper sx={sxBody}>
      <StudentStack />
    </Paper>
  );
}
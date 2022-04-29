/* eslint-disable react/prop-types */ // TODO: upgrade to latest eslint tooling

import { Paper } from '@mui/material';
import React from 'react';
import { AstroTheme } from '../../themes/AstroTheme';
// Contains the main part of the app

export const Body = props => {
  const theme = AstroTheme;
  const sxBody = {
    backgroundColor: theme.palette.background.paper,
  };
  return <Paper sx={sxBody}>{props.children}</Paper>;
};

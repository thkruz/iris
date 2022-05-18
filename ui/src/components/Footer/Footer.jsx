import React from 'react';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { AstroTheme } from '../../themes/AstroTheme';
import { Box } from '@mui/material';

export const Footer = () => (
  <Box sx={{ flexGrow: 0, color: 'white', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.8)' }}>
    <Toolbar sx={{ backgroundColor: AstroTheme.palette.tertiary.dark }}>
      <Typography>
        Authors: Askins, Gilmore, Hufstetler, Kruczek, Peters
        <br></br>
        United States Space Force Supra Coders: Blended Software Development Immersion #1
      </Typography>
    </Toolbar>
  </Box>
);

import React from 'react';
import './TeamInfo.css';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { AstroTheme } from '../../../../themes/AstroTheme';

export const TeamInfo = () => {
  //TODO: get server name, team name, team members

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: AstroTheme.palette.secondary.dark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxHeight: '50px',
      }}>
      <Typography paddingLeft='30px' variant='h6' component='div'>
        Server: Server Name
      </Typography>
      <Typography paddingRight='30px' variant='h6' component='div'>
        Team: Team Name
      </Typography>
    </Box>
  );
};

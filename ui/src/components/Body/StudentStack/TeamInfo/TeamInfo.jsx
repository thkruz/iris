import React from 'react';
import './TeamInfo.css';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

export const TeamInfo = () => {
  //TODO: get server name, team name, team members

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: 'primary.dark',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxHeight: '50px',
      }}>
      <Typography paddingLeft='30px' variant='h6' component='div' color='white'>
        Server: Server Name
      </Typography>
      <Typography paddingRight='30px' variant='h6' component='div' color='white'>
        Team: Team Name
      </Typography>
    </Box>
  );
};

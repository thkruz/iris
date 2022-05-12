import React, { useState, useEffect } from 'react';
import './TeamInfo.css';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { AstroTheme } from '../../../../themes/AstroTheme';

export const TeamInfo = () => {
  const [teamInfo, setTeamInfo] = useState({ team: '', members: [] });

  useEffect(() => {
    setTeamInfo(window.sewApp.teamInfo);
  }, [window.sewApp.teamInfo]);

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
        Team: {teamInfo.team}
      </Typography>
    </Box>
  );
};

import React, { useState, useEffect } from 'react';
import './TeamInfo.css';
import { Grid, Typography } from '@mui/material';
import { AstroTheme } from '../../../../themes/AstroTheme';

export const TeamInfo = () => {
  const [teamInfo, setTeamInfo] = useState({ team: '', members: [] });

  useEffect(() => {
    setTeamInfo(window.sewApp.teamInfo);
  }, [window.sewApp.teamInfo]);

  return (
    <Grid
      container
      spacing={1}
      sx={{
        backgroundColor: AstroTheme.palette.tertiary.main,
        color: 'white',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.8)',
        height: '60px',
        alignItems: 'center',
      }}>
      <Grid item xs={4} sx={{ textAlign: 'left' }}>
        <Typography variant='h5' paddingLeft='30px' component='div' sx={{ fontFamily: 'Nasa', paddingLeft: '10px' }}>
          Space Electronic Warfare Sandbox
        </Typography>
      </Grid>
      <Grid item xs={4} sx={{ textAlign: 'center' }}>
        <Typography variant='h6' component='div'>
          Team: {teamInfo.team}
        </Typography>
      </Grid>
      <Grid item xs={4} sx={{ textAlign: 'right' }}>
        <Typography paddingRight='30px' variant='h6' component='div'>
          Server: Server Name
        </Typography>
      </Grid>
    </Grid>
  );
};

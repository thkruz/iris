import React, { useState, useEffect } from 'react';
import './TeamInfo.css';
import { Grid, Typography } from '@mui/material';
import { AstroTheme } from '../../../../themes/AstroTheme';
import { useSewApp } from '../../../../context';
import { useUpdateSewApp } from '../../../../context';

export const TeamInfo = () => {
  const [teamInfo, setTeamInfo] = useState({ team: '', members: [] });
  const sewApp = useSewApp();
  const updateSewApp = useUpdateSewApp();
  let checkForConnection = null;

  useEffect(() => {
    setTeamInfo(sewApp.teamInfo);
  }, [sewApp]);

  useEffect(() => {
    updateSewApp();
    checkForConnection = setInterval(() => {
      updateSewApp();
      if (window.sewApp.teamInfo.server === 'Connected') {
        setTeamInfo(sewApp.teamInfo);
        clearTimeout(checkForConnection);
      }
    }, 1000);
  }, [sewApp]);

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
          Team: {teamInfo?.team || 'None'}
        </Typography>
      </Grid>
      <Grid item xs={4} sx={{ textAlign: 'right' }}>
        <Typography paddingRight='30px' variant='h6' component='div'>
          Server: {teamInfo?.server || 'Disconnected'}
        </Typography>
      </Grid>
    </Grid>
  );
};

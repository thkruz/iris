import React, { useState, useEffect } from 'react';
import './TeamInfo.css';
import { Grid, Typography } from '@mui/material';
import { AstroTheme } from '../../../../themes/AstroTheme';
import { teams } from '../../../../constants';
import { githubCheck } from '../../../../lib/github-check';
import { useSewApp } from '../../../../context/sewAppContext';

export const TeamInfo = () => {
  const sewAppCtx = useSewApp();
  const [servers, setServers] = useState([]);

  useEffect(() => {
    if (!githubCheck()) {
      const { data: _servers } = fetch('data/server');
      setServers(_servers);
    } else {
      fetch('./data/server.json').then(res =>
        res.json().then(data => {
          setServers(data);
        })
      );
    }
  }, []);

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
          Team: {teams[sewAppCtx.user?.team_id - 1].name}
        </Typography>
      </Grid>
      <Grid item xs={4} sx={{ textAlign: 'right' }}>
        <Typography paddingRight='30px' variant='h6' component='div'>
          Server: {servers ? servers[sewAppCtx.user.server_id - 1]?.name : 'Disconnected'}
        </Typography>
      </Grid>
    </Grid>
  );
};

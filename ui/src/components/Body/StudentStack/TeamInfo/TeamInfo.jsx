import React, { useState, useEffect } from 'react';
import './TeamInfo.css';
import { Grid, Typography } from '@mui/material';
import { AstroTheme } from '../../../../themes/AstroTheme';
import { teams } from '../../../../constants';
import { githubCheck } from '../../../../lib/github-check';
import { useSewApp } from '../../../../context/sewAppContext';
import { useLocation } from 'react-router-dom';

export const TeamInfo = () => {
  const sewAppCtx = useSewApp();
  const [servers, setServers] = useState([]);
  const { state } = useLocation();

  useEffect(() => {
    if (!githubCheck()) {
      const { data: _servers } = fetch('data/server');
      setServers(_servers);
    } else {
      fetch('./data/server.json').then((res) =>
        res.json().then((data) => {
          setServers(data);
        })
      );
    }
  }, []);

  return (
    <Grid
      container
      spacing={1}
      pl={4}
      pr={4}
      height={60}
      sx={{
        backgroundColor: AstroTheme.palette.tertiary.main,
        color: 'white',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.8)',
        alignItems: 'center',
      }}>
      {state?.isAuthenticated ? (
        <>
          <Grid item xs={6} textAlign={'left'}>
            <Typography variant='h6'>Team: {teams[sewAppCtx.user?.team_id - 1].name}</Typography>
          </Grid>
          <Grid item xs={6} textAlign={'right'}>
            <Typography variant='h6'>
              Server: {servers ? servers[sewAppCtx.user.server_id - 1]?.name : 'Disconnected'}
            </Typography>
          </Grid>
        </>
      ) : null}
    </Grid>
  );
};

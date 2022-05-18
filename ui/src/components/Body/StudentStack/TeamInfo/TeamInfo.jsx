import React from 'react';
import './TeamInfo.css';
import { Grid, Typography } from '@mui/material';
import { AstroTheme } from '../../../../themes/AstroTheme';
import { useFetch } from '../../../../hooks';
import { useUser } from '../../../../context';
import { teams } from '../../../../constants';

export const TeamInfo = () => {
  const user = useUser();
  const { data: servers } = useFetch('data/server');

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
          Team: {teams[user?.team_id - 1].name}
        </Typography>
      </Grid>
      <Grid item xs={4} sx={{ textAlign: 'right' }}>
        <Typography paddingRight='30px' variant='h6' component='div'>
          Server: {servers ? servers[user.server_id - 1]?.name : 'Disconnected'}
        </Typography>
      </Grid>
    </Grid>
  );
};

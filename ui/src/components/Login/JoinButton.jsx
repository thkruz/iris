import React from 'react';
import { Button, Grid, Typography } from '@mui/material';

export const JoinButton = () => (
  <Grid item xs={12} textAlign={'center'} mt={3}>
    <Button type='submit' size='large' variant='contained' color='tertiary'>
      <Typography color='white' sx={{ fontFamily: 'Nasa' }}>
        Join
      </Typography>
    </Button>
  </Grid>
);

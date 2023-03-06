import React from 'react';
import { RuxButton } from '@astrouxds/react'
import { Grid } from '@mui/material';

export const JoinButton = () => (
  <Grid item xs={12} textAlign={'center'} mt={3}>
    <RuxButton type='submit' size='large'>
        Join
    </RuxButton>
  </Grid>
);

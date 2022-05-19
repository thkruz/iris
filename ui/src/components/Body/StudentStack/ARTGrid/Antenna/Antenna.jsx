import React from 'react';
import { Grid } from '@mui/material';
import { AntennaController } from '../../../../';

export const Antenna = () => {
  return(
    <>
      <Grid item xs={6}>
        <AntennaController unit={1} />
      </Grid>
      <Grid item xs={6}>
        <AntennaController unit={2} />
      </Grid>
    </>
)};
import React from 'react';
import { Grid } from '@mui/material';
import { AntennaController } from './AntennaController';

const Antenna = () => {
  return (
    <Grid container item spacing={1} xs={12}>
      <Grid item xs={6}>
        <AntennaController unit={1} />
      </Grid>
      <Grid item xs={6}>
        <AntennaController unit={2} />
      </Grid>
    </Grid>
  );
};

export default Antenna;

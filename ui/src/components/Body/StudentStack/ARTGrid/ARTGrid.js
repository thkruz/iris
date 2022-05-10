import React from 'react';
import { Grid } from '@mui/material';
import {Receiver, Antenna, Transmitter } from '../../../';

export const ARTGrid = () => (
  <>
    <Grid container item spacing={1} xs={12}>
      <Antenna />
    </Grid>
    <Grid container item spacing={1} xs={12}>
      <Transmitter />
      <Receiver />
    </Grid>
  </>
);

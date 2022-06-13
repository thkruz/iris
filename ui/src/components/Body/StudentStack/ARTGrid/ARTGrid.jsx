import React from 'react';
import { Grid } from '@mui/material';
import { RxCases, Antenna, TxCases } from '../../../';

export const ARTGrid = () => (
  <>
    <Grid container item spacing={2} xs={12}>
      <Antenna />
    </Grid>
    <Grid container item spacing={2} xs={12}>
      <TxCases />
    </Grid>
    <Grid container item spacing={2} xs={12}>
      <RxCases />
    </Grid>
  </>
);

import React from 'react';
import { Grid } from '@mui/material';
import { TxModem } from '../../../../';

export const Transmitter = () => {
  const units = [1, 2, 3, 4];
  return units.map((x, index) => (
    <Grid item xs={6} s={6} md={6} lg={6} xl={3} key={index}>
      <TxModem unit={x} />
    </Grid>
  ));
};

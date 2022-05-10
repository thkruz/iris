import React from 'react';
import { Grid } from '@mui/material';
import { TxModem } from '../../../../';

export const Transmitter = () => {
  const units = [1, 2, 3, 4];
  return units.map((x, index) => (
    <Grid item xs={3} key={index}>
      <TxModem unit={x} />
    </Grid>
  ));
};
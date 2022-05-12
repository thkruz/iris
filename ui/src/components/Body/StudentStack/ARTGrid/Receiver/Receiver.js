import React from 'react';
import { RxModem } from '../../../../';
import { Grid } from '@mui/material';

export const Receiver = () => {
  const units = [1, 2, 3, 4];
  return units.map((x, index) => (
    <Grid key={index} item xs={6}>
      <RxModem unit={x} />
    </Grid>
  ));
}
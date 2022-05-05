import React from 'react';
import { Grid } from '@mui/material';
import { TxModem } from './TxModem/TxModem';

function Transmitter() {
  const units = [1, 2, 3, 4];
  return units.map((x, index) => (
    <Grid key={index} item xs={3}>
      <TxModem unit={x} />
    </Grid>
  ));
}
export default Transmitter;

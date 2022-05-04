import React from 'react';
import { Grid } from '@mui/material';
import { TxModem } from './TxModem/TxModem';


function Transmitter() {
  const units = [1, 2, 3, 4];
  return units.map((x, index) => (
    <Grid key={index} item sx={{ margin: 'auto', padding: '5px' }} xs={12}>
      <TxModem unit={x} />
    </Grid>
  ));
}
export default Transmitter;

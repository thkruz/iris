import React from 'react';
import { tmpRxData } from './tmpRxData.js';
import { RxModem } from './RxModem/RxModem';
import { Grid } from '@mui/material';

//

function Receiver() {
  const units = [1, 2, 3, 4];
  return units.map((x, index) => (
    <Grid key={index} item sx={{ margin: 'auto', padding: '5px' }} xs={12}>
      <RxModem unit={x} tmpRxData={tmpRxData.filter(y => y.unit === x)} />
    </Grid>
  ));
}

export default Receiver;

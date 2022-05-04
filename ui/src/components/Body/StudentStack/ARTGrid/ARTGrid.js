import React from 'react';
import { Grid } from '@mui/material';
import Receiver from './Receiver/Receiver';
import Antenna from './Antenna/Antenna';
import Transmitter from './Transmitter/Transmitter';

// MUI Grid: https://mui.com/material-ui/react-grid/

const ARTGrid = () => {
  return (
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
};

export default ARTGrid;
